export const dayKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function dayStart(time){const d=new Date(time);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();}
export function recentDays(now,count=7){const d=new Date(now);return Array.from({length:count},(_,i)=>dayKey(new Date(d.getFullYear(),d.getMonth(),d.getDate()-i)));}
export function splitTime(start,end){
 const days={};if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return days;
 for(let t=start;t<end;){const d=new Date(t),next=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime(),until=Math.min(next,end);days[dayKey(d)]=(days[dayKey(d)]||0)+until-t;t=until;}
 return days;
}
export function totals(task,now){const days={...task.days};if(task.runningSince!==null)for(const [day,ms]of Object.entries(splitTime(task.runningSince,now)))days[day]=(days[day]||0)+ms;return days;}
export function settle(task,now){return {...task,days:totals(task,now),runningSince:task.runningSince===null?null:Math.max(task.runningSince,now)};}
export function timeFor(task,now,period=false){const days=totals(task,now),count=period==='month'?30:period===true||period==='week'?7:1;return count>1?recentDays(now,count).reduce((sum,key)=>sum+(days[key]||0),0)/count:days[dayKey(new Date(now))]||0;}
export function duration(ms){const s=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function validTask(task){return task&&/^[0-9a-f-]{36}$/i.test(task.id)&&typeof task.name==='string'&&task.name.trim().length>0&&task.name.length<=60&&/^#[0-9a-f]{6}$/i.test(task.color)&&Number.isFinite(task.createdAt)&&task.days&&typeof task.days==='object'&&!Array.isArray(task.days)&&Object.entries(task.days).every(([key,ms])=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&Number.isFinite(ms)&&ms>=0)&&(task.runningSince===null||Number.isFinite(task.runningSince));}
export function decode(value){if(value===undefined)return {tasks:[]};const state=JSON.parse(value);if(!Array.isArray(state.tasks)||state.tasks.length>200||!state.tasks.every(validTask)||new Set(state.tasks.map(t=>t.id)).size!==state.tasks.length)throw Error('COULD NOT LOAD TIMEBOX');return state;}
export function change(state,action,now){
 const tasks=state.tasks.map(t=>({...t,days:{...t.days}})),index=tasks.findIndex(t=>t.id===action.id);
 if(action.type==='create'){
  if(index>=0)return {tasks};if(tasks.length>=200)throw Error('MAXIMUM 200 BOXES');
  const task={id:action.id,name:action.name?.trim(),color:action.color,createdAt:now,days:{},runningSince:null};if(!validTask(task))throw Error('CHECK NAME AND COLOUR');tasks.push(task);
 }else{
  if(index<0)throw Error('BOX WAS REMOVED');const task=tasks[index];
  if(action.type==='move'){
   if(action.beforeId===action.id)return {tasks};
   const [moved]=tasks.splice(index,1),destination=action.beforeId===null?tasks.length:tasks.findIndex(t=>t.id===action.beforeId);
   if(destination<0)throw Error('POSITION CHANGED. TRY AGAIN');tasks.splice(destination,0,moved);
  }
  else if(action.type==='remove')tasks.splice(index,1);
  else if(action.type==='edit'){task.name=action.name?.trim();task.color=action.color;if(!validTask(task))throw Error('CHECK NAME AND COLOUR');}
  else if(action.type==='adjust'){
   if(!Number.isInteger(action.minutes)||action.minutes===0||Math.abs(action.minutes)>1440)throw Error('ENTER 1–1440 MINUTES');
   const today=dayKey(new Date(now));if(action.day!==today)throw Error('DAY CHANGED. TRY AGAIN');
   const adjusted=settle(task,now);adjusted.days[today]=Math.max(0,(adjusted.days[today]||0)+action.minutes*60000);tasks[index]=adjusted;
  }
  else if(action.type==='running'){
   if(action.running&&task.runningSince===null)task.runningSince=now;
   else if(!action.running&&task.runningSince!==null)tasks[index]={...settle(task,now),runningSince:null};
  }else throw Error('INVALID ACTION');
 }
 return {tasks};
}
