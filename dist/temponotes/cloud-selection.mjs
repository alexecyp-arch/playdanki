import {createSelection,validSelectionId} from './selection.mjs?v=bf7bbdb444e2';
// Same private progress rules as game saves; this small document has its own revision.
export function createCloudSelection({auth,db,sdk,uid,storage,onError=()=>{}}){
 const local=createSelection(storage,uid,()=>auth.currentUser?.uid),ref=sdk.doc(db,'users',uid,'progress','note-selection');
 let active=true,current=local.get(),pending=0,queue=Promise.resolve(),ready=false,intent=0;
 const listeners=new Set(),check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('Account changed.');};
 const decode=s=>{try{const id=JSON.parse(s.data().value).id;return id===null||validSelectionId(id)?id:null;}catch{return null;}};
 function apply(id){if(!active||auth.currentUser?.uid!==uid)return;current=id;local.set(id);for(const fn of listeners)fn(id);}
 async function write(id,onlyIfMissing=false){check();await sdk.runTransaction(db,async tx=>{check();const doc=await tx.get(ref);check();if(onlyIfMissing&&doc.exists())return;const revision=doc.exists()?doc.data().revision:0;tx.set(ref,{value:JSON.stringify({id}),version:1,revision:revision+1,updatedAt:sdk.serverTimestamp()});});check();}
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.fromCache||snapshot.metadata?.hasPendingWrites)return;
  if(!ready){ready=true;if(!snapshot.exists()){const legacy=current;if(legacy===null){apply(null);return;}queue=queue.then(()=>write(legacy,true)).then(async()=>{if(pending===0){const s=await sdk.getDoc(ref);check();if(s.exists())apply(decode(s));}}).catch(()=>onError());return;}}
  if(pending===0)apply(snapshot.exists()?decode(snapshot):null);
 },()=>{if(active)onError();});
 return {
  get(){return active&&auth.currentUser?.uid===uid?current:null;},
  set(id){if(!active||auth.currentUser?.uid!==uid||id!==null&&!validSelectionId(id))return;const ticket=++intent;apply(id);pending++;queue=queue.then(()=>write(id)).catch(()=>{if(active)onError();}).finally(async()=>{pending--;if(active&&pending===0&&ticket===intent){try{const s=await sdk.getDoc(ref);check();if(ticket===intent&&pending===0&&s.exists())apply(decode(s));}catch{}}});},
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  dispose(){active=false;stop();listeners.clear();}
 };
}
