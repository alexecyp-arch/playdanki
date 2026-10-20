import {validSchedule,localDay} from './eternal.mjs?v=1a33fc67c4ae';
// Private, account-scoped adapter for the original Temponote interface.
export async function createNotesStore({auth,db,sdk,uid,now=Date.now,signal}){
  const {doc,collection,setDoc,getDoc,serverTimestamp,onSnapshot,runTransaction,deleteDoc}=sdk;
  let disposed=false,offset=0,notes=new Map(),eternal=new Map(),syncError=null,eternalError=null;
  const check=()=>{if(disposed||auth.currentUser?.uid!==uid)throw Error('Please sign in again.');};
  const time=()=>now()+offset;
  const reference=id=>doc(db,'users',uid,'temponotes',id);
  const permanent=id=>doc(db,'users',uid,'eternalNotes',id);
  check();
  const clock=doc(db,'users',uid,'temponotesMeta','clock');
  const syncClock=(async()=>{
    await setDoc(clock,{serverNow:serverTimestamp()});
    const stamp=(await getDoc(clock)).data()?.serverNow;
    check();
    if(!stamp?.toMillis)throw Error('Could not sync the clock. Please refresh.');
    offset=Math.round(stamp.toMillis())-now();
  })();
  let firstResolve,firstReject;
  const first=new Promise((resolve,reject)=>{firstResolve=resolve;firstReject=reject;});
  const stop=onSnapshot(collection(db,'users',uid,'temponotes'),{includeMetadataChanges:true},snapshot=>{
    if(disposed||auth.currentUser?.uid!==uid)return;
    notes=new Map(snapshot.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
    syncError=null;if(snapshot.metadata?.fromCache!==true)firstResolve();
  },error=>{syncError=error;firstReject(error);});
  let eternalResolve,eternalReject;
  const firstEternal=new Promise((resolve,reject)=>{eternalResolve=resolve;eternalReject=reject;});
  const stopEternal=onSnapshot(collection(db,'users',uid,'eternalNotes'),{includeMetadataChanges:true},snapshot=>{
    if(disposed||auth.currentUser?.uid!==uid)return;eternal=new Map(snapshot.docs.map(d=>[d.id,{id:d.id,...d.data()}]));eternalError=null;if(snapshot.metadata?.fromCache!==true)eternalResolve();
  },error=>{eternalError=error;eternalReject(error);});
  let abortReject;const aborted=new Promise((resolve,reject)=>{abortReject=reject;});
  const cancel=()=>{disposed=true;stop();stopEternal();notes.clear();eternal.clear();abortReject(Error('Account changed.'));};
  signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();
  try{await Promise.race([Promise.all([first,firstEternal,syncClock]),aborted]);check();}catch(error){stop();stopEternal();signal?.removeEventListener('abort',cancel);throw error;}
  const cleaning=new Set();
  async function request(url,options={}){
    try{
      check();if(syncError||eternalError)throw syncError||eternalError;
      const method=options.method||'GET',t=time();
      const route=new URL(url,'https://playdanki.com');
      if(route.pathname==='/api/eternal'){
        if(method==='DELETE'){
          const id=route.searchParams.get('id');if(!validId(id))throw Error('Invalid note.');
          await deleteDoc(permanent(id));check();eternal.delete(id);return Response.json({ok:true});
        }
        const {id,body,days,dismiss}=JSON.parse(options.body||'{}');
        if(!validId(id))throw Error('Invalid note.');
        if(method==='PATCH'&&dismiss===true){
          const dismissedOn=localDay(new Date(time()));
          await runTransaction(db,async tx=>{check();const r=permanent(id),s=await tx.get(r);check();if(!s.exists())throw Error('This note was removed.');tx.update(r,{dismissedOn});});
          check();const old=eternal.get(id);if(old)eternal.set(id,{...old,dismissedOn});return Response.json({ok:true});
        }
        if(!['POST','PATCH'].includes(method)||!validSchedule(body,days))throw Error('Write a note and choose at least one day.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=permanent(id),s=await tx.get(r);check();
          if(method==='POST'&&s.exists())return {id,...s.data()};
          if(method==='PATCH'&&!s.exists())throw Error('This note was removed.');
          const value=s.exists()?{...s.data(),body:body.trim(),days:[...days].sort(),dismissedOn:''}:{body:body.trim(),days:[...days].sort(),createdAt:time(),dismissedOn:''};
          tx.set(r,value);return {id,...value};
        });check();eternal.set(id,saved);return Response.json({ok:true});
      }
      if(method==='GET'){
        for(const n of notes.values())if(n.expiresAt<=t&&!cleaning.has(n.id)){
          // Like the original, expiry hides immediately; storage cleanup runs on sync.
          cleaning.add(n.id);
          runTransaction(db,async tx=>{check();const r=reference(n.id),s=await tx.get(r);check();if(s.exists()&&s.data().expiresAt<=time())tx.delete(r);})
            .catch(()=>{}).finally(()=>cleaning.delete(n.id));
        }
        return Response.json({notes:[...notes.values()].filter(n=>n.expiresAt>t),eternalNotes:[...eternal.values()],serverNow:t});
      }
      if(method==='DELETE'){
        const id=new URL(url,'https://playdanki.com').searchParams.get('id');
        if(!id||!validId(id))throw Error('Invalid note.');
        await deleteDoc(reference(id));check();notes.delete(id);
        return Response.json({ok:true});
      }
      const data=JSON.parse(options.body||'{}'),{id,minutes}=data;
      if(!validId(id))throw Error('Invalid note.');
      if(method==='POST'){
        const body=typeof data.body==='string'?data.body.trim():'';
        if(!body||body.length>10000||!Number.isInteger(minutes)||minutes<60||minutes>525600||minutes%30)throw Error('Invalid note or duration.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=reference(id),s=await tx.get(r);check();
          if(s.exists())return {id,...s.data()};
          const createdAt=time(),note={body,createdAt,expiresAt:createdAt+minutes*60000};
          tx.set(r,note);return {id,...note};
        });
        check();notes.set(id,saved);return Response.json({ok:true});
      }
      if(method==='PATCH'){
        if(![30,60,360].includes(minutes))throw Error('Invalid duration.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=reference(id),s=await tx.get(r);check();
          if(!s.exists()||s.data().expiresAt<=time())throw Error('This note has expired.');
          const note=s.data(),expiresAt=note.expiresAt+minutes*60000;
          if(expiresAt>time()+31536000000)throw Error('Maximum duration is one year.');
          tx.update(r,{expiresAt});return {id,...note,expiresAt};
        });
        check();notes.set(id,saved);
        return Response.json({id,expiresAt:saved.expiresAt,serverNow:time()});
      }
      throw Error('Invalid request.');
    }catch(error){return Response.json({error:error.message||'Could not sync notes.'},{status:400});}
  }
  return {request,dispose(){disposed=true;stop();stopEternal();signal?.removeEventListener('abort',cancel);notes.clear();eternal.clear();}};
}
function validId(id){return typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);}
