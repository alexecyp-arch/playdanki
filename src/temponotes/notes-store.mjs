import {endOfDay,dayDeadline,nextDay,validOrder} from './daily-notes.mjs';
import {validSchedule,localDay,occurrences} from './eternal.mjs';
// Private, account-scoped adapter for the original Temponote interface.
export async function createNotesStore({auth,db,sdk,uid,now=Date.now,signal}){
  const {doc,collection,setDoc,getDoc,serverTimestamp,onSnapshot,runTransaction,deleteDoc}=sdk;
  let disposed=false,offset=0,notes=new Map(),eternal=new Map(),syncError=null,eternalError=null,adjustments={},noteOrder=[];
  const check=()=>{if(disposed||auth.currentUser?.uid!==uid)throw Error('Please sign in again.');};
  const time=()=>now()+offset;
  const reference=id=>doc(db,'users',uid,'temponotes',id);
  const permanent=id=>doc(db,'users',uid,'eternalNotes',id);
  check();
  const orderRef=doc(db,'users',uid,'progress','note-order');
  const readOrder=s=>{try{const ids=JSON.parse(s.data().value).ids;return validOrder(ids)?ids:[];}catch{return [];}};
  const stopOrder=onSnapshot(orderRef,{includeMetadataChanges:true},s=>{if(!disposed&&auth.currentUser?.uid===uid)noteOrder=readOrder(s);},()=>{});
  const firstOrder=getDoc(orderRef).then(s=>{check();noteOrder=readOrder(s);});
  const adjustmentsRef=doc(db,'users',uid,'progress','eternal-note-times');
  const readAdjustments=s=>{try{return s.exists()?JSON.parse(s.data().value):{};}catch{return {};}};
  const stopAdjustments=onSnapshot(adjustmentsRef,{includeMetadataChanges:true},s=>{if(!disposed&&auth.currentUser?.uid===uid)adjustments=readAdjustments(s);},()=>{});
  const firstAdjustments=getDoc(adjustmentsRef).then(s=>{check();adjustments=readAdjustments(s);});
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
  const cancel=()=>{disposed=true;stop();stopEternal();stopAdjustments();stopOrder();notes.clear();eternal.clear();abortReject(Error('Account changed.'));};
  signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();
  try{await Promise.race([Promise.all([first,firstEternal,syncClock,firstAdjustments,firstOrder]),aborted]);check();}catch(error){stop();stopEternal();stopAdjustments();stopOrder();signal?.removeEventListener('abort',cancel);throw error;}
  const cleaning=new Set();
  async function request(url,options={}){
    try{
      check();if(syncError||eternalError)throw syncError||eternalError;
      const method=options.method||'GET',t=time();
      const route=new URL(url,'https://playdanki.com');
      if(route.pathname==='/api/note-order'){
        const {ids}=JSON.parse(options.body||'{}');if(method!=='POST'||!validOrder(ids))throw Error('Invalid note order.');
        await runTransaction(db,async tx=>{check();const state=await tx.get(orderRef);check();tx.set(orderRef,{value:JSON.stringify({ids}),version:1,revision:(state.exists()?state.data().revision:0)+1,updatedAt:serverTimestamp()});});check();noteOrder=[...ids];return Response.json({ok:true});
      }
      if(route.pathname!=='/api/notes'&&route.pathname!=='/api/eternal')throw Error('Invalid request.');
      if(route.pathname==='/api/eternal'){
        if(method==='DELETE'){
          const id=route.searchParams.get('id');if(!validId(id))throw Error('Invalid note.');
          await deleteDoc(permanent(id));check();eternal.delete(id);return Response.json({ok:true});
        }
        const {id,body,days,dismiss,occurrenceId}=JSON.parse(options.body||'{}');
        if(!validId(id))throw Error('Invalid note.');
        if(method==='PATCH'&&days===1){
          const expected='eternal:'+id+':';if(typeof occurrenceId!=='string'||!occurrenceId.startsWith(expected))throw Error('Invalid note.');
          const saved=await runTransaction(db,async tx=>{check();const schedule=await tx.get(permanent(id)),state=await tx.get(adjustmentsRef);check();if(!schedule.exists())throw Error('This note was removed.');const times=readAdjustments(state),note=occurrences([{id,...schedule.data()}],time(),times).find(n=>n.id===occurrenceId);if(!note)throw Error('This note has expired.');const expiresAt=nextDay(note.expiresAt);if(expiresAt>time()+31536000000)throw Error('Maximum duration is one year.');const value=Object.fromEntries(Object.entries(times).filter(([key,until])=>key.slice(-10)>=localDay(new Date(time()))||until>time()));value[occurrenceId]=expiresAt;tx.set(adjustmentsRef,{value:JSON.stringify(value),version:1,revision:(state.exists()?state.data().revision:0)+1,updatedAt:serverTimestamp()});return {value,expiresAt};});check();adjustments=saved.value;return Response.json({id:occurrenceId,expiresAt:saved.expiresAt,serverNow:time()});
        }
        if(method==='PATCH'&&dismiss===true){
          const dismissedOn=localDay(new Date(time()));
          await runTransaction(db,async tx=>{check();const r=permanent(id),s=await tx.get(r),state=await tx.get(adjustmentsRef);check();if(!s.exists())throw Error('This note was removed.');const times=readAdjustments(state);for(const key of Object.keys(times))if(key.startsWith('eternal:'+id+':')&&times[key]>time())times[key]=0;tx.update(r,{dismissedOn});tx.set(adjustmentsRef,{value:JSON.stringify(times),version:1,revision:(state.exists()?state.data().revision:0)+1,updatedAt:serverTimestamp()});adjustments=times;});
          check();const old=eternal.get(id);if(old)eternal.set(id,{...old,dismissedOn});return Response.json({ok:true});
        }
        if(!['POST','PATCH'].includes(method)||!validSchedule(body,days))throw Error('Invalid note or weekdays.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=permanent(id),s=await tx.get(r);check();
          if(method==='POST'&&s.exists())return {id,...s.data()};
          if(method==='PATCH'&&!s.exists())throw Error('This note was removed.');
          const value=s.exists()?{...s.data(),body:body.trim(),days:[...days].sort(),dismissedOn:''}:{body:body.trim(),days:[...days].sort(),createdAt:time(),dismissedOn:''};
          tx.set(r,value);return {id,...value};
        });check();eternal.set(id,saved);return Response.json({ok:true});
      }
      if(method==='GET'){
        // Keep existing active notes, aligning old hour-based deadlines to midnight.
        await Promise.all([...notes.values()].filter(n=>n.expiresAt>t&&n.daily!==true).map(n=>runTransaction(db,async tx=>{check();const r=reference(n.id),s=await tx.get(r);check();if(!s.exists()||s.data().expiresAt<=time())return;const value=s.data(),expiresAt=dayDeadline(value.expiresAt);tx.update(r,{expiresAt,daily:true});}).catch(error=>{throw Error('Could not update note deadlines. Please refresh.');})));check();

        for(const n of notes.values())if(n.expiresAt<=t&&!cleaning.has(n.id)){
          // Like the original, expiry hides immediately; storage cleanup runs on sync.
          cleaning.add(n.id);
          runTransaction(db,async tx=>{check();const r=reference(n.id),s=await tx.get(r);check();if(s.exists()&&s.data().expiresAt<=time())tx.delete(r);})
            .catch(()=>{}).finally(()=>cleaning.delete(n.id));
        }
        notes=new Map([...notes].map(([id,n])=>[id,n.expiresAt>t?{...n,expiresAt:n.daily===true?n.expiresAt:dayDeadline(n.expiresAt),daily:true}:n]));
        return Response.json({noteOrder,notes:[...notes.values()].filter(n=>n.expiresAt>t),eternalNotes:[...eternal.values()],eternalAdjustments:adjustments,serverNow:t});
      }
      if(method==='DELETE'){
        const id=new URL(url,'https://playdanki.com').searchParams.get('id');
        if(!id||!validId(id))throw Error('Invalid note.');
        await deleteDoc(reference(id));check();notes.delete(id);
        return Response.json({ok:true});
      }
      const data=JSON.parse(options.body||'{}'),{id,days}=data;
      if(!validId(id))throw Error('Invalid note.');
      if(method==='POST'){
        const body=typeof data.body==='string'?data.body.trim():'';
        if(!body||body.length>10000)throw Error('Invalid note.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=reference(id),s=await tx.get(r);check();
          if(s.exists())return {id,...s.data()};
          const createdAt=time(),note={body,createdAt,expiresAt:endOfDay(createdAt),daily:true};
          tx.set(r,note);return {id,...note};
        });
        check();notes.set(id,saved);return Response.json({ok:true});
      }
      if(method==='PATCH'){
        if(days!==1)throw Error('Invalid day adjustment.');
        const saved=await runTransaction(db,async tx=>{
          check();const r=reference(id),s=await tx.get(r);check();
          if(!s.exists()||s.data().expiresAt<=time())throw Error('This note has expired.');
          const note=s.data(),expiresAt=nextDay(note.expiresAt);
          if(expiresAt>time()+31536000000)throw Error('Maximum duration is one year.');
          tx.update(r,{expiresAt});return {id,...note,expiresAt};
        });
        check();notes.set(id,saved);
        return Response.json({id,expiresAt:saved.expiresAt,serverNow:time()});
      }
      throw Error('Invalid request.');
    }catch(error){return Response.json({error:error.message||'Could not sync notes.'},{status:400});}
  }
  return {request,dispose(){disposed=true;stop();stopEternal();stopAdjustments();stopOrder();signal?.removeEventListener('abort',cancel);notes.clear();eternal.clear();}};
}
function validId(id){return typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);}
