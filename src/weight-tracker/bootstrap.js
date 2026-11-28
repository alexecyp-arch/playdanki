import {mountSleep} from './sleep-ui.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {createWeightStore} from './store.mjs';
import {clearChart,draw} from './chart.mjs';
import {bodyMassIndex,kilograms,weight,forecastTargetTime,formatForecastDate} from './model.mjs';
const $=id=>document.getElementById(id),app=initializeApp(JSON.parse($('auth-config').textContent).firebase),auth=getAuth(app),db=sdk.getFirestore(app);
let pendingChart=0,chartSize='',chartDay='';
const currentChartSize=()=>`${$('chart').parentElement.clientWidth}:${window.innerHeight}`;
function scheduleChart(){
 if(pendingChart)return;
 pendingChart=requestAnimationFrame(()=>{pendingChart=0;render();});
}
let store=null,entries=[],unit='KG',ready=false,saving=false,generation=0,selectedId=null,targetKg=null,heightM=null,targetReady=false;
function controls(){const disabled=!ready||saving||!navigator.onLine;$('add').disabled=disabled;$('remove').disabled=disabled||!selectedId;$('set-target').disabled=$('set-height').disabled=!targetReady||saving||!navigator.onLine;}
function renderWeightSummary(){
 const latestKg=entries.at(-1)?.kg;
 const bmi=bodyMassIndex(latestKg,heightM);
 const calories=latestKg!==undefined&&targetKg!==null
  ? 'CALORIES TO LOSE = '+Math.round(Math.max(0,latestKg-targetKg)*7000).toLocaleString('en-GB')
  : '';
 const summary=$('calories-to-lose');
 summary.textContent=[calories,bmi===null?'':'BMI = '+bmi.toFixed(1)].filter(Boolean).join(', ');
 summary.hidden=!summary.textContent;
}
function render(){const selected=entries.find(p=>p.id===selectedId);if(!selected)selectedId=null;$('selected-entry').hidden=!selected;$('selected-value').textContent=selected?Number(weight(selected.kg,unit).toFixed(2)).toLocaleString()+' '+unit+' · '+new Date(selected.time).toLocaleString('en-GB'):'';const targetTime=forecastTargetTime(entries,targetKg);$('change-rate').hidden=targetKg===null;renderWeightSummary();$('change-rate').textContent='ESTIMATED DATE YOU WILL HIT YOUR TARGET = '+formatForecastDate(targetTime);chartSize=currentChartSize();chartDay=new Date().toDateString();draw($('chart'),entries,unit,{selectedId,targetKg,heightM,onSelect:id=>{if(saving)return;selectedId=id;render();}});controls();}
function clear(){generation++;store?.dispose();store=null;entries=[];selectedId=null;targetKg=null;heightM=null;targetReady=false;ready=false;saving=false;for(const id of ['weight','target-weight','target-height'])$(id).value='';$('calories-to-lose').hidden=$('change-rate').hidden=true;$('calories-to-lose').textContent='';$('weight-form').hidden=$('target-controls').hidden=true;$('target-controls').open=false;$('auth-gate').hidden=false;$('status').textContent='';clearChart($('chart'));scheduleChart();}
const sleepLogs=mountSleep({auth,db,sdk,signInReady:true});
const clearAll=()=>{window.dispatchEvent(new Event('danki-private-auth-clearing'));sleepLogs.clear();clear();};
beforeAuthStateChanged(auth,clearAll);window.addEventListener('pagehide',clearAll);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
onAuthStateChanged(auth,user=>{clearAll();window.dispatchEvent(new CustomEvent('danki-private-auth',{detail:user?.uid||null}));if(!user)return;sleepLogs.open(user);const current=generation;$('auth-gate').hidden=true;$('weight-form').hidden=$('target-controls').hidden=false;
 store=createWeightStore({auth,db,sdk,uid:user.uid,onTarget:(kg,online,savedHeight)=>{
   if(current!==generation)return;
   const targetChanged=targetKg!==kg;
   const chartChanged=targetChanged||heightM!==savedHeight;
   if(targetChanged&&document.activeElement!==$('target-weight'))$('target-weight').value=kg===null?'':Number(weight(kg,unit).toFixed(4));
   if(heightM!==savedHeight&&document.activeElement!==$('target-height'))$('target-height').value=savedHeight??'';
   targetKg=kg;heightM=savedHeight;targetReady=online;
   if(chartChanged)scheduleChart();
   else{renderWeightSummary();controls();}
  },onChange:rows=>{if(current!==generation)return;entries=rows;scheduleChart();},onStatus:(text,online)=>{if(current!==generation)return;ready=online;if(!saving)$('status').textContent=text;controls();}});
});
for(const next of ['KG','LB'])$(next.toLowerCase()).addEventListener('click',()=>{const kg=kilograms($('weight').value,unit),target=kilograms($('target-weight').value,unit);unit=next;if(kg!==null)$('weight').value=Number(weight(kg,unit).toFixed(4));if(target!==null)$('target-weight').value=Number(weight(target,unit).toFixed(4));for(const id of ['weight','target-weight'])$(id).max=unit==='KG'?'1000':'2204.6226';$('target-unit').textContent=unit;$('kg').setAttribute('aria-pressed',String(unit==='KG'));$('lb').setAttribute('aria-pressed',String(unit==='LB'));render();});
$('weight-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!ready)return;const current=generation;saving=true;controls();$('status').textContent='SAVING';try{await store.add($('weight').value,unit);if(current!==generation)return;$('weight').value='';$('status').textContent='SAVED';}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('remove').addEventListener('click',async()=>{if(saving||!store||!ready||!selectedId)return;const id=selectedId,current=generation;saving=true;controls();$('status').textContent='REMOVING';try{await store.remove(id);if(current!==generation)return;selectedId=null;$('status').textContent='REMOVED';render();}catch{if(current===generation)$('status').textContent=navigator.onLine?'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('target-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!targetReady)return;const current=generation,kg=$('target-weight').value.trim()===''?null:kilograms($('target-weight').value,unit);saving=true;controls();$('status').textContent='SAVING';try{await store.setTarget($('target-weight').value,unit);if(current!==generation)return;targetKg=kg;$('status').textContent='SAVED';render();}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('height-form').addEventListener('submit',async event=>{
 event.preventDefault();
 if(saving||!store||!targetReady)return;
 const current=generation;
 saving=true;controls();$('status').textContent='SAVING';
 try{
  const savedHeight=await store.setHeight($('target-height').value);
  if(current!==generation)return;
  heightM=savedHeight;
  $('status').textContent='SAVED';
  render();
 }catch(error){
  if(current===generation)$('status').textContent=navigator.onLine?(error.message==='HEIGHT'?'HEIGHT':'RETRY'):'OFFLINE';
 }finally{
  if(current===generation){saving=false;controls();}
 }
});
$('sign-in').addEventListener('click',async()=>{$('sign-in').disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch{$('status').textContent='RETRY';}finally{$('sign-in').disabled=false;}});
for(const type of ['online','offline'])window.addEventListener(type,()=>{if(!navigator.onLine)$('status').textContent='OFFLINE';else if(ready)$('status').textContent='';controls();});
let chartWidth=0;
new ResizeObserver(([entry])=>{
 const width=entry.contentRect.width;
 if(width===chartWidth)return;
 chartWidth=width;
 if(width>0)scheduleChart();
}).observe($('chart').parentElement);
window.addEventListener('message',event=>{
 if(parent!==window&&event.source===parent&&event.origin===location.origin&&
    event.data?.type==='danki-weight-visibility'&&event.data.visible){
   if(chartSize!==currentChartSize()||chartDay!==new Date().toDateString())scheduleChart();
   sleepLogs.renderIfResized();
 }
});window.addEventListener('resize',scheduleChart);scheduleChart();
setInterval(()=>{if(!document.hidden&&new Date().toDateString()!==chartDay)scheduleChart();},30000);
