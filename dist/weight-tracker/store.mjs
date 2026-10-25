import {kilograms} from './model.mjs?v=65f95331763c';
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
 const stopTarget=sdk.onSnapshot(targetRef,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.hasPendingWrites)return;
  try{const data=snapshot.exists()?JSON.parse(snapshot.data().value):{kg:null};if(data.kg!==null&&kilograms(data.kg,'KG')===null)throw Error('TARGET');targetReady=!snapshot.metadata?.fromCache;onTarget(data.kg,targetReady);}
  catch{targetReady=false;onTarget(null,false);}
 },()=>{if(active){targetReady=false;onTarget(null,false);}});
 return {
  async add(value,unit){check();const kg=kilograms(value,unit);if(kg===null)throw Error('WEIGHT');if(!ready)throw Error('OFFLINE');
   await sdk.addDoc(ref,{kg,recordedAt:sdk.serverTimestamp()});check();
  },
  async remove(id){check();if(!ready)throw Error('OFFLINE');if(typeof id!=='string'||!/^[A-Za-z0-9]{20}$/.test(id))throw Error('WEIGHT');await sdk.deleteDoc(sdk.doc(db,'users',uid,'weights',id));check();},
  async setTarget(value,unit){check();if(!targetReady)throw Error('OFFLINE');const kg=String(value).trim()===''?null:kilograms(value,unit);if(kg===null&&String(value).trim()!=='')throw Error('WEIGHT');
   await sdk.runTransaction(db,async tx=>{check();const snapshot=await tx.get(targetRef);check();tx.set(targetRef,{value:JSON.stringify({kg}),version:1,revision:(snapshot.exists()?snapshot.data().revision:0)+1,updatedAt:sdk.serverTimestamp()});});check();
  },
  dispose(){active=false;ready=targetReady=false;stop();stopTarget();}
 };
}
