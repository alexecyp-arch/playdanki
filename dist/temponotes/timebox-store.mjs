import {decode,change} from './timebox-model.mjs?v=4a4c81938ebe';
// Uses the existing owner-only, revision-checked cloud progress rules.
export function createTimeboxStore({auth,db,sdk,uid,now=Date.now}){
 const ref=sdk.doc(db,'users',uid,'progress','timebox'),listeners=new Set();
 let active=true,ready=false,state={tasks:[]},revision=-1,error='',queue=Promise.resolve();
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const emit=()=>{if(active&&auth.currentUser?.uid===uid)for(const fn of listeners)fn({state,ready,error});};
 check();
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.hasPendingWrites)return;
  try{const nextRevision=snapshot.exists()?snapshot.data().revision:0;if(nextRevision<revision)return;
   if(snapshot.metadata?.fromCache){if(revision<0){state=decode(snapshot.exists()?snapshot.data().value:undefined);emit();}return;}
   state=decode(snapshot.exists()?snapshot.data().value:undefined);revision=nextRevision;ready=true;error='';emit();
  }catch(e){ready=false;error=e.message;emit();}
 },()=>{ready=false;error='COULD NOT SYNC TIMEBOX';emit();});
 return {
  subscribe(fn){listeners.add(fn);fn({state,ready,error});return()=>listeners.delete(fn);},
  act(action){
   const task=queue.then(async()=>{check();if(!ready)throw Error('WAIT FOR CLOUD SYNC');let saved,nextRevision;
    await sdk.runTransaction(db,async tx=>{check();const snapshot=await tx.get(ref);check();const current=decode(snapshot.exists()?snapshot.data().value:undefined);saved=change(current,action,now());nextRevision=(snapshot.exists()?snapshot.data().revision:0)+1;const value=JSON.stringify(saved);if(new TextEncoder().encode(value).length>690000)throw Error('TIMEBOX STORAGE FULL');tx.set(ref,{value,version:1,revision:nextRevision,updatedAt:sdk.serverTimestamp()});});
    check();if(nextRevision>=revision){state=saved;revision=nextRevision;error='';emit();}
   });queue=task.catch(()=>{});return task;
  },
  dispose(){active=false;ready=false;stop();listeners.clear();state={tasks:[]};}
 };
}
