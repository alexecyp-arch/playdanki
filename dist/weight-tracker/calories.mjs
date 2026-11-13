export const MAX_CALORIES=10000;
const dayMs=86400000;
export function calorieDay(time=Date.now()){
 const d=new Date(time);
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
export function calorieLastDay(now=Date.now()){
 const date=new Date(now);date.setDate(date.getDate()+5);return calorieDay(date);
}
function validCalories(value){return Number.isInteger(value)&&value>=0&&value<=MAX_CALORIES;}
function dayTime(key){
 const time=Date.parse(key+'T00:00:00Z');
 return /^\d{4}-\d{2}-\d{2}$/.test(key)&&Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===key?time:NaN;
}
export function calorieDays(now=Date.now(),offset=0){
 return Array.from({length:7},(_,i)=>{
  const d=new Date(now);d.setDate(d.getDate()-6+i+offset);
  return {key:calorieDay(d),label:i===6&&offset===0?'TODAY':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}).toUpperCase()};
 });
}
export function calorieAverage(days,now=Date.now()){
 const totals=calorieDays(now,-1).map(({key})=>days[key]).filter(validCalories);
 return totals.length?Math.round(totals.reduce((sum,n)=>sum+n,0)/totals.length):null;
}
export function calorieChartData(days,target=null,now=Date.now()){
 const points=Object.entries(days).map(([id,value])=>({id,value,time:dayTime(id)}))
  .filter(p=>Number.isFinite(p.time)&&validCalories(p.value)).sort((a,b)=>a.time-b.time);
 const today=dayTime(calorieDay(now)),last=Math.max(today,points.at(-1)?.time??today);
 const first=Math.min(points[0]?.time??today,last-2*dayMs);
 const values=points.map(p=>p.value);
 if(target!==null)values.push(target);
 const low=values.length?Math.max(0,Math.floor((Math.min(...values)-100)/100)*100):0;
 const high=values.length?Math.ceil((Math.max(...values)+100)/100)*100:500;
 return {points,target,x:[first,last],y:[low,Math.max(high,low+300)]};
}
function decode(value){
 try{
  const data=JSON.parse(value);
  return {days:Object.fromEntries(Object.entries(data.days).filter(([day,n])=>Number.isFinite(dayTime(day))&&validCalories(n))),target:validCalories(data.target)&&data.target>0?data.target:null};
 }catch{return {days:{},target:null};}
}
export function createCalorieStore({auth,db,sdk,uid,onChange,now=Date.now}){
 const ref=sdk.doc(db,'users',uid,'progress','daily-calories');
 let active=true,ready=false,queue=Promise.resolve();
 const check=()=>{if(!active||auth.currentUser?.uid!==uid)throw Error('SIGN IN');};check();
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!active||auth.currentUser?.uid!==uid||snapshot.metadata?.hasPendingWrites)return;
  ready=!snapshot.metadata?.fromCache;
  onChange(decode(snapshot.exists()?snapshot.data().value:undefined),ready);
 },()=>{if(active&&auth.currentUser?.uid===uid){ready=false;onChange(decode(),false);}});
 function update(change){
  const pending=queue.then(async()=>{
   check();if(!ready)throw Error('WAIT FOR CLOUD SYNC');
   await sdk.runTransaction(db,async tx=>{
    check();const snapshot=await tx.get(ref);check();
    const old=snapshot.exists()?snapshot.data():null;
    tx.set(ref,{value:JSON.stringify(change(decode(old?.value))),version:1,revision:(old?.revision??0)+1,updatedAt:sdk.serverTimestamp()});
   });check();
  });
  queue=pending.catch(()=>{});return pending;
 }
 return {
  adjust(amount,day=calorieDay(now())){
   return update(data=>{
    if(!Number.isFinite(dayTime(day))||day>calorieLastDay(now()))throw Error('DATE');
    if(!Number.isInteger(amount)||amount===0||Math.abs(amount)>MAX_CALORIES)throw Error('CALORIES');
    const total=Math.max(0,(data.days[day]??0)+amount);
    if(!validCalories(total))throw Error('CALORIES');
    data.days[day]=total;return data;
   });
  },
  setTarget(input){
   const raw=String(input).trim(),target=raw===''?null:Number(raw);
   return update(data=>{
    if(target!==null&&(!validCalories(target)||target===0))throw Error('TARGET CALORIES');
    return {...data,target};
   });
  },
  dispose(){active=ready=false;stop();}
 };
}
