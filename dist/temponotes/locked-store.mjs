import {parseEnvelope} from './locked-crypto.mjs?v=3490e0381441';
const chunkSize=600000;
export function createLockedStore({auth,db,sdk,uid}){
 const ref=sdk.doc(db,'users',uid,'progress','locked-notes'),listeners=new Set();let active=true,ready=false,value=null,revision=-1,error='',loadToken=0;
 const partRef=i=>sdk.doc(db,'users',uid,'progress','locked-notes-part-'+i);
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const emit=()=>{if(active&&auth.currentUser?.uid===uid)for(const fn of listeners)fn({value,revision,ready,error});};check();
 function readManifest(raw){const e=JSON.parse(raw);if(e.storage!==2)return null;if(!Number.isInteger(e.parts)||e.parts<1||e.parts>10||typeof e.generation!=='string')throw Error('COULD NOT READ LOCKED NOTES');return e;}
 async function readLarge(){
  return sdk.runTransaction(db,async tx=>{
   check();const root=await tx.get(ref);check();if(!root.exists())return {value:null,revision:0};const row=root.data(),manifest=readManifest(row.value);if(!manifest)return {value:parseEnvelope(row.value),revision:row.revision};
   let ciphertext='';for(let i=0;i<manifest.parts;i++){const snap=await tx.get(partRef(i));check();if(!snap.exists())throw Error('COULD NOT READ LOCKED NOTES');const part=JSON.parse(snap.data().value);if(part.generation!==manifest.generation||typeof part.text!=='string')throw Error('COULD NOT READ LOCKED NOTES');ciphertext+=part.text;}
   return {value:parseEnvelope({...manifest,ciphertext}),revision:row.revision};
  });
 }
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},async snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.fromCache||snapshot.metadata?.hasPendingWrites)return;
  const token=++loadToken;
  try{const next=snapshot.exists()?snapshot.data().revision:0;if(next<revision)return;let result={value:null,revision:next};
   if(snapshot.exists())result=readManifest(snapshot.data().value)?await readLarge():{value:parseEnvelope(snapshot.data().value),revision:next};
   if(!active||token!==loadToken||auth.currentUser?.uid!==uid||result.revision<revision)return;
   value=result.value;revision=result.revision;ready=true;error='';emit();
  }catch{if(active&&token===loadToken){ready=false;error='COULD NOT LOAD LOCKED NOTES';emit();}}
 },()=>{ready=false;error='COULD NOT SYNC LOCKED NOTES';emit();});
 return {uid,
  subscribe(fn){listeners.add(fn);fn({value,revision,ready,error});return()=>listeners.delete(fn);},
  async save(envelope,expected){
   check();if(!ready)throw Error('WAIT FOR CLOUD SYNC');parseEnvelope(envelope);let savedRevision;
   const large=envelope.ciphertext.length>chunkSize,generation=crypto.randomUUID(),parts=large?Math.ceil(envelope.ciphertext.length/chunkSize):0;
   await sdk.runTransaction(db,async tx=>{
    check();const snapshot=await tx.get(ref);check();const actual=snapshot.exists()?snapshot.data().revision:0;if(actual!==expected)throw Error('NOTES CHANGED ON ANOTHER DEVICE. CLOSE AND REOPEN.');
    const old=snapshot.exists()?readManifest(snapshot.data().value):null,previous=[];
    for(let i=0;i<Math.max(parts,old?.parts||0);i++){previous.push(await tx.get(partRef(i)));check();}
    const record=(text,rev)=>({value:text,version:1,revision:rev,updatedAt:sdk.serverTimestamp()});
    for(let i=0;i<parts;i++)tx.set(partRef(i),record(JSON.stringify({generation,text:envelope.ciphertext.slice(i*chunkSize,(i+1)*chunkSize)}),(previous[i].exists()?previous[i].data().revision:0)+1));
    for(let i=parts;i<(old?.parts||0);i++)tx.delete(partRef(i));
    savedRevision=actual+1;const {ciphertext,...header}=envelope;
    tx.set(ref,record(JSON.stringify(large?{...header,storage:2,generation,parts}:envelope),savedRevision));
   });
   check();if(savedRevision>=revision){value=envelope;revision=savedRevision;ready=true;error='';emit();}return savedRevision;
  },
  dispose(){active=false;ready=false;++loadToken;stop();listeners.clear();value=null;}
 };
}
