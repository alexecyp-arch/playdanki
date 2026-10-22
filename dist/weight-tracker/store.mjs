import {kilograms} from './model.mjs?v=36ec0dd45cb4';
export function createWeightStore({auth,db,sdk,uid,onChange,onStatus}){
 let active=true,ready=false;
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const ref=sdk.collection(db,'users',uid,'weights');
 const stop=sdk.onSnapshot(sdk.query(ref,sdk.orderBy('recordedAt','asc')),{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid)return;
  ready=!snapshot.metadata.fromCache;
  onChange(snapshot.docs.filter(d=>!d.metadata.hasPendingWrites).map(d=>{const p=d.data();return {id:d.id,kg:p.kg,time:p.recordedAt?.toMillis()};}).filter(p=>Number.isFinite(p.time)));
  onStatus(ready?'':'OFFLINE',ready);
 },()=>{if(active){ready=false;onStatus('RETRY',false);}});
 return {
  async add(value,unit){check();const kg=kilograms(value,unit);if(kg===null)throw Error('WEIGHT');if(!ready)throw Error('OFFLINE');
   await sdk.addDoc(ref,{kg,recordedAt:sdk.serverTimestamp()});check();
  },
  async remove(id){check();if(!ready)throw Error('OFFLINE');if(typeof id!=='string'||!/^[A-Za-z0-9]{20}$/.test(id))throw Error('WEIGHT');await sdk.deleteDoc(sdk.doc(db,'users',uid,'weights',id));check();},
  dispose(){active=false;ready=false;stop();}
 };
}
