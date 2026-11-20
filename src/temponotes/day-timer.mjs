export const timerDay=(now=Date.now())=>{const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export function readTimer(raw,now=Date.now()){
 const empty={day:timerDay(now),elapsed:0,started:null};
 if(raw===undefined)return empty;
 const value=typeof raw==='string'?JSON.parse(raw):raw;
 if(!value||typeof value.day!=='string'||!Number.isFinite(value.elapsed)||value.elapsed<0||value.elapsed>172800000||(value.started!==null&&!Number.isFinite(value.started)))throw Error('COULD NOT READ TIMER');
 return value.day===empty.day?{day:value.day,elapsed:value.elapsed,started:value.started}:empty;
}
export function timerElapsed(value,now=Date.now()){
 const state=readTimer(value,now);
 return state.elapsed+(state.started===null?0:Math.max(0,now-state.started));
}
export function changeTimer(value,running,now=Date.now()){
 const state=readTimer(value,now);
 if(running)return state.started===null?{...state,started:now}:state;
 return {...state,elapsed:timerElapsed(state,now),started:null};
}
export function timerText(ms){const s=Math.floor(Math.max(0,ms)/1000);return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');}

// One small document under the existing owner-only progress rules.
export function createDayTimerStore({auth,db,sdk,uid,now=Date.now}){
 const ref=sdk.doc(db,'users',uid,'progress','notes-day-timer'),listeners=new Set();
 let active=true,ready=false,state=readTimer(undefined,now()),revision=-1,error='';
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};
 const emit=()=>{if(active&&auth.currentUser?.uid===uid)for(const fn of listeners)fn({state,ready,error});};check();
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.hasPendingWrites)return;
  try{const next=snapshot.exists()?snapshot.data().revision:0;if(next<revision)return;
   if(snapshot.metadata?.fromCache){if(revision<0){state=readTimer(snapshot.exists()?snapshot.data().value:undefined,now());emit();}return;}
   state=readTimer(snapshot.exists()?snapshot.data().value:undefined,now());revision=next;ready=true;error='';emit();
  }catch{ready=false;error='COULD NOT READ TIMER';emit();}
 },()=>{ready=false;error='COULD NOT SYNC TIMER';emit();});
 return {
  subscribe(fn){listeners.add(fn);fn({state,ready,error});return()=>listeners.delete(fn);},
  async setRunning(running){
   check();if(!ready)throw Error('WAIT FOR CLOUD SYNC');let saved,next;
   await sdk.runTransaction(db,async tx=>{check();const snap=await tx.get(ref);check();saved=changeTimer(snap.exists()?snap.data().value:undefined,running,now());next=(snap.exists()?snap.data().revision:0)+1;tx.set(ref,{value:JSON.stringify(saved),version:1,revision:next,updatedAt:sdk.serverTimestamp()});});
   check();if(next>=revision){state=saved;revision=next;emit();}
  },
  dispose(){active=ready=false;stop();listeners.clear();state=readTimer(undefined,now());}
 };
}
