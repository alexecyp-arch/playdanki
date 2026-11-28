import {createSleepStore,sleepDay,sleepLastDay,sleepAverage,formatSleepDuration,formatSleepUpdate} from './sleep.mjs';
import {clearChart,drawSleep} from './chart.mjs';
const sleepDateLabel=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
export function mountSleep({auth,db,sdk}){
 const $=id=>document.getElementById('sleep-'+id);let store=null,days={},ready=false,busy=false,epoch=0,shownDay='';
 let selectedDay=null;
 function controls(){for(const id of ['add','remove','add-minutes','remove-minutes'])$(id).disabled=!ready||busy||!navigator.onLine;$('day-next').disabled=$('date').value>=sleepLastDay();}
 let size='';
 const chartSize=()=>`${$('chart').parentElement.clientWidth}:${window.innerHeight}`;
 function showLastUpdate(time){
  const updated=$('last-updated'),label=formatSleepUpdate(time);
  updated.textContent=label?'LAST UPDATED ON : '+label:'';
  updated.hidden=!label;
  if(label)updated.dateTime=new Date(time).toISOString();
  else updated.removeAttribute('datetime');
 }
 function renderIfResized(){if(size!==chartSize()||shownDay!==sleepDay())scheduleRender();}
 function showSelection(){
  const selected=$('selected');
  const duration=days[selectedDay];
  selected.hidden=duration===undefined;
  selected.textContent=duration===undefined?'':sleepDateLabel.format(Date.parse(selectedDay)).toUpperCase()+' · '+formatSleepDuration(duration);
 }
 function selectDay(day){selectedDay=day;render();}
 function render(){
  const today=sleepDay();
  if(!$('date').value||$('date').value===shownDay)$('date').value=today;
  shownDay=today;$('date').max=sleepLastDay();
  if(!$('panel').hidden){
   const avg=sleepAverage(days);
   $('average').textContent='7-DAY AVERAGE: '+(avg===null?'—':formatSleepDuration(avg));
   if(!Object.hasOwn(days,selectedDay))selectedDay=null;
   showSelection();
   size=chartSize();
   const chart=$('chart');
   const focusedDay=chart.contains(document.activeElement)?document.activeElement.getAttribute('data-entry'):null;
   drawSleep(chart,days,{selectedId:selectedDay,onSelect:selectDay});
   if(focusedDay)chart.querySelector(`[data-entry="${CSS.escape(focusedDay)}"]`)?.focus({preventScroll:true});
  }
  controls();
 }
 let renderFrame=0;
 function scheduleRender(){
  if(renderFrame)return;
  renderFrame=requestAnimationFrame(()=>{renderFrame=0;render();});
 }
 function clear(){epoch++;store?.dispose();store=null;days={};selectedDay=null;ready=busy=false;shownDay='';$('panel').hidden=true;$('date').value=sleepDay();$('status').textContent='';clearChart($('chart'));$('average').textContent='';showSelection();showLastUpdate(null);controls();}
 function open(user){const current=epoch;$('panel').hidden=false;store=createSleepStore({auth,db,sdk,uid:user.uid,onChange:(data,synced)=>{if(current!==epoch)return;days=data.days;ready=synced;showLastUpdate(data.updatedAt);scheduleRender();}});scheduleRender();}
 async function change(amount){if(busy||!ready||!store||!navigator.onLine||!$('date').reportValidity())return;const current=epoch;busy=true;controls();$('status').textContent='SAVING';try{await store.adjust(amount,$('date').value);if(current===epoch){$('status').textContent='SAVED';}}catch(e){if(current===epoch)$('status').textContent=navigator.onLine?e.message==='SLEEP'?'SLEEP HOURS':'RETRY':'OFFLINE';}finally{if(current===epoch){busy=false;controls();}}}
 $('form').addEventListener('submit',e=>e.preventDefault());
 for(const [id,amount]of [['add',1],['remove',-1],['add-minutes',1/6],['remove-minutes',-1/6]])$(id).addEventListener('click',()=>change(amount));
 for(const [id,step]of [['day-prev',-1],['day-next',1]])$(id).addEventListener('click',()=>{const d=new Date(($('date').value||sleepDay())+'T12:00:00');d.setDate(d.getDate()+step);const next=sleepDay(d.getTime());if(next>sleepLastDay())return;$('date').value=next;controls();});
 $('date').addEventListener('change',controls);window.addEventListener('resize',scheduleRender);for(const event of ['online','offline'])window.addEventListener(event,controls);setInterval(()=>{if(!document.hidden&&shownDay!==sleepDay())render();},30000);
 let chartWidth=0;
 new ResizeObserver(([entry])=>{
  const width=entry.contentRect.width;
  if(width===chartWidth)return;
  chartWidth=width;
  if(width>0)scheduleRender();
 }).observe($('chart').parentElement);
 clear();return {clear,open,renderIfResized};
}
