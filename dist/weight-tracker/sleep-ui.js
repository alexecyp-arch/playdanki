import {createSleepStore,sleepDay,sleepLastDay,sleepAverage} from './sleep.mjs?v=8fd19e401cf0';
import {drawSleep} from './chart.mjs?v=8fd19e401cf0';
export function mountSleep({auth,db,sdk}){
 const $=id=>document.getElementById('sleep-'+id);let store=null,days={},ready=false,busy=false,epoch=0,shownDay='';
 function controls(){for(const id of ['add','remove'])$(id).disabled=!ready||busy||!navigator.onLine;$('day-next').disabled=$('date').value>=sleepLastDay();}
 function render(){const today=sleepDay();if(!$('date').value||$('date').value===shownDay)$('date').value=today;shownDay=today;$('date').max=sleepLastDay();if(!$('panel').hidden){const avg=sleepAverage(days);$('average').textContent='7-DAY AVERAGE: '+(avg===null?'—':avg.toLocaleString()+' HOURS');drawSleep($('chart'),days);}controls();}
 function clear(){epoch++;store?.dispose();store=null;days={};ready=busy=false;shownDay='';$('panel').hidden=true;$('date').value=sleepDay();$('amount').value='';$('status').textContent='';$('chart').replaceChildren();$('average').textContent='';controls();}
 function open(user){const current=epoch;$('panel').hidden=false;store=createSleepStore({auth,db,sdk,uid:user.uid,onChange:(data,synced)=>{if(current!==epoch)return;days=data.days;ready=synced;render();}});render();}
 async function change(sign){const amount=Number($('amount').value);if(busy||!ready||!store||!$('amount').reportValidity()||!$('date').reportValidity()||!Number.isFinite(amount)||amount<=0||amount>24)return;const current=epoch;busy=true;controls();$('status').textContent='SAVING';try{await store.adjust(sign*amount,$('date').value);if(current===epoch){$('amount').value='';$('status').textContent='SAVED';}}catch(e){if(current===epoch)$('status').textContent=navigator.onLine?e.message==='SLEEP'?'SLEEP HOURS':'RETRY':'OFFLINE';}finally{if(current===epoch){busy=false;controls();}}}
 $('form').addEventListener('submit',e=>{e.preventDefault();change(1);});$('remove').addEventListener('click',()=>change(-1));
 for(const [id,step]of [['day-prev',-1],['day-next',1]])$(id).addEventListener('click',()=>{const d=new Date(($('date').value||sleepDay())+'T12:00:00');d.setDate(d.getDate()+step);const next=sleepDay(d.getTime());if(next>sleepLastDay())return;$('date').value=next;controls();});
 $('date').addEventListener('change',controls);window.addEventListener('resize',render);for(const event of ['online','offline'])window.addEventListener(event,controls);setInterval(()=>{if(!document.hidden&&shownDay!==sleepDay())render();},30000);
 clear();return {clear,open};
}
