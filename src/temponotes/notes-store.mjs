// Private, account-scoped adapter for the original Temponote interface.
export async function createNotesStore({auth,db,sdk,uid,now=Date.now}){
  const {doc,collection,setDoc,getDoc,serverTimestamp,onSnapshot,runTransaction,deleteDoc}=sdk;
  let disposed=false,offset=0,notes=new Map(),syncError=null;
  const check=()=>{if(disposed||auth.currentUser?.uid!==uid)throw Error('Please sign in again.');};
  const time=()=>now()+offset;
  const reference=id=>doc(db,'users',uid,'temponotes',id);
  check();
  const clock=doc(db,'users',uid,'temponotesMeta','clock');
  await setDoc(clock,{serverNow:serverTimestamp()});
  const stamp=(await getDoc(clock)).data()?.serverNow;
  check();
  if(!stamp?.toMillis)throw Error('Could not sync the clock. Please refresh.');
  offset=Math.round(stamp.toMillis())-now();
  let firstResolve,firstReject;
  const first=new Promise((resolve,reject)=>{firstResolve=resolve;firstReject=reject;});
  const stop=onSnapshot(collection(db,'users',uid,'temponotes'),snapshot=>{
    if(disposed)return;
    notes=new Map(snapshot.docs.map(d=>[d.id,{id:d.id,...d.data()}]));
    syncError=null;firstResolve();
  },error=>{syncError=error;firstReject(error);});
  try{await first;check();}catch(error){stop();throw error;}
  const cleaning=new Set();
  async function request(url,options={}){
    try{
      check();if(syncError)throw syncError;
      const method=options.method||'GET',t=time();
      if(method==='GET'){
        for(const n of notes.values())if(n.expiresAt<=t&&!cleaning.has(n.id)){
          // Like the original, expiry hides immediately; storage cleanup runs on sync.
          cleaning.add(n.id);
          runTransaction(db,async tx=>{check();const r=reference(n.id),s=await tx.get(r);check();if(s.exists()&&s.data().expiresAt<=time())tx.delete(r);})
            .catch(()=>{}).finally(()=>cleaning.delete(n.id));
        }
        return Response.json({notes:[...notes.values()].filter(n=>n.expiresAt>t),serverNow:t});
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
  return {request,dispose(){disposed=true;stop();notes.clear();}};
}
function validId(id){return typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);}
