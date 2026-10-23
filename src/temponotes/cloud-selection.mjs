import {createSelection,validSelectionId} from './selection.mjs';
// Same private progress rules as game saves; this small document has its own revision.
export function createCloudSelection({auth,db,sdk,uid,storage,onError=()=>{}}){
 const local=createSelection(storage,uid,()=>auth.currentUser?.uid),ref=sdk.doc(db,'users',uid,'progress','note-selection');
 let active=true,current=local.get(),pending=0,queue=Promise.resolve(),ready=false,intent=0,revision=-1,latestSnapshot=null;
 const listeners=new Set(),check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('Account changed.');};
 const decode=s=>{try{const id=JSON.parse(s.data().value).id;return id===null||validSelectionId(id)?id:null;}catch{return null;}};
 function apply(id){if(!active||auth.currentUser?.uid!==uid)return;if(current===id)return;current=id;local.set(id);for(const fn of listeners)fn(id);}
 async function write(id,onlyIfMissing=false){check();let saved;await sdk.runTransaction(db,async tx=>{check();const doc=await tx.get(ref);check();if(onlyIfMissing&&doc.exists()){saved={id:decode(doc),revision:doc.data().revision};return;}const nextRevision=(doc.exists()?doc.data().revision:0)+1;tx.set(ref,{value:JSON.stringify({id}),version:1,revision:nextRevision,updatedAt:sdk.serverTimestamp()});saved={id,revision:nextRevision};});check();revision=Math.max(revision,saved.revision);return saved;}
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.fromCache||snapshot.metadata?.hasPendingWrites)return;
  const received=snapshot.exists()?Number(snapshot.data().revision)||0:0;if(received<revision)return;revision=received;latestSnapshot={id:snapshot.exists()?decode(snapshot):null,revision:received};
  if(!ready){ready=true;if(!snapshot.exists()){const legacy=current;if(legacy===null){apply(null);return;}queue=queue.then(()=>write(legacy,true)).then(saved=>{if(pending===0&&intent===0)apply(latestSnapshot&&latestSnapshot.revision>saved.revision?latestSnapshot.id:saved.id);}).catch(()=>onError());return;}}
  if(pending===0)apply(snapshot.exists()?decode(snapshot):null);
 },()=>{if(active)onError();});
 return {
  get(){return active&&auth.currentUser?.uid===uid?current:null;},
  set(id){if(!active||auth.currentUser?.uid!==uid||id!==null&&!validSelectionId(id))return;const ticket=++intent;pending++;apply(id);let committedRevision=Infinity;queue=queue.then(()=>write(id)).then(saved=>{committedRevision=saved.revision;}).catch(()=>{if(active)onError();}).finally(()=>{pending--;if(active&&pending===0&&ticket===intent&&latestSnapshot&&latestSnapshot.revision>committedRevision)apply(latestSnapshot.id);});},
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  dispose(){active=false;stop();listeners.clear();}
 };
}
