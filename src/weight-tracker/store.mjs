import {heightInMeters,kilograms} from './model.mjs';
export function createWeightStore({auth,db,sdk,uid,onChange,onStatus,onTarget=()=>{}}){
 let active=true,ready=false,targetReady=false;
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const ref=sdk.collection(db,'users',uid,'weights');
 const stop=sdk.onSnapshot(sdk.query(ref,sdk.orderBy('recordedAt','asc')),{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid)return;
  ready=!snapshot.metadata.fromCache;
  onChange(snapshot.docs.filter(d=>!d.metadata.hasPendingWrites).map(d=>{const p=d.data();return {id:d.id,kg:p.kg,time:p.recordedAt?.toMillis()};}).filter(p=>Number.isFinite(p.time)));
  onStatus(ready?'':'OFFLINE',ready);
 },()=>{if(active){ready=false;onStatus('RETRY',false);}});
 const targetRef=sdk.doc(db,'users',uid,'progress','weight-target');
 function readSettings(snapshot){
  const saved=snapshot.exists()?JSON.parse(snapshot.data().value):{};
  return {kg:saved.kg==null?null:kilograms(saved.kg,'KG'),heightM:heightInMeters(saved.heightM)};
 }
 async function saveSettings(changes){
  check();if(!targetReady)throw Error('OFFLINE');
  await sdk.runTransaction(db,async tx=>{
   check();const snapshot=await tx.get(targetRef);check();
   const value=JSON.stringify({...readSettings(snapshot),...changes});
   tx.set(targetRef,{value,version:1,revision:(snapshot.exists()?snapshot.data().revision:0)+1,updatedAt:sdk.serverTimestamp()});
  });
  check();
 }
 const stopTarget=sdk.onSnapshot(targetRef,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.hasPendingWrites)return;
  try{const {kg,heightM}=readSettings(snapshot);targetReady=!snapshot.metadata?.fromCache;onTarget(kg,targetReady,heightM);}
  catch{targetReady=false;onTarget(null,false,null);}
 },()=>{if(active){targetReady=false;onTarget(null,false,null);}});
 return {
  async add(value,unit){check();const kg=kilograms(value,unit);if(kg===null)throw Error('WEIGHT');if(!ready)throw Error('OFFLINE');
   await sdk.addDoc(ref,{kg,recordedAt:sdk.serverTimestamp()});check();
  },
  async remove(id){check();if(!ready)throw Error('OFFLINE');if(typeof id!=='string'||!/^[A-Za-z0-9]{20}$/.test(id))throw Error('WEIGHT');await sdk.deleteDoc(sdk.doc(db,'users',uid,'weights',id));check();},
  async setTarget(value,unit){
   const empty=String(value).trim()==='',kg=empty?null:kilograms(value,unit);
   if(!empty&&kg===null)throw Error('WEIGHT');
   await saveSettings({kg});
  },
  async setHeight(value){
   const empty=String(value).trim()==='',heightM=empty?null:heightInMeters(value);
   if(!empty&&heightM===null)throw Error('HEIGHT');
   await saveSettings({heightM});
   return heightM;
  },
  dispose(){active=false;ready=targetReady=false;stop();stopTarget();}
 };
}
