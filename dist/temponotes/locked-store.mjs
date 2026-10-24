import {parseEnvelope} from './locked-crypto.mjs?v=d9ab61cd07a7';
export function createLockedStore({auth,db,sdk,uid}){
 const ref=sdk.doc(db,'users',uid,'progress','locked-notes'),listeners=new Set();let active=true,ready=false,value=null,revision=-1,error='';
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const emit=()=>{if(active&&auth.currentUser?.uid===uid)for(const fn of listeners)fn({value,revision,ready,error});};check();
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.fromCache||snapshot.metadata?.hasPendingWrites)return;
  try{const next=snapshot.exists()?snapshot.data().revision:0;if(next<revision)return;const data=snapshot.exists()?parseEnvelope(snapshot.data().value):null;value=data;revision=next;ready=true;error='';emit();}catch{ready=false;error='COULD NOT LOAD LOCKED NOTES';emit();}
 },()=>{ready=false;error='COULD NOT SYNC LOCKED NOTES';emit();});
 return {uid,
  subscribe(fn){listeners.add(fn);fn({value,revision,ready,error});return()=>listeners.delete(fn);},
  async save(envelope,expected){check();if(!ready)throw Error('WAIT FOR CLOUD SYNC');parseEnvelope(envelope);let savedRevision;
   await sdk.runTransaction(db,async tx=>{check();const snapshot=await tx.get(ref);check();const actual=snapshot.exists()?snapshot.data().revision:0;if(actual!==expected)throw Error('NOTES CHANGED ON ANOTHER DEVICE. CLOSE AND REOPEN.');savedRevision=actual+1;tx.set(ref,{value:JSON.stringify(envelope),version:1,revision:savedRevision,updatedAt:sdk.serverTimestamp()});});
   check();if(savedRevision>=revision){value=envelope;revision=savedRevision;error='';emit();}return savedRevision;
  },
  dispose(){active=false;ready=false;stop();listeners.clear();value=null;}
 };
}
