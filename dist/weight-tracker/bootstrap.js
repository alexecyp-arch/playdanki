import {createCalorieStore,calorieAverage,calorieDay,MAX_CALORIES} from './calories.mjs?v=af6f5e986e06';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {createWeightStore} from './store.mjs?v=af6f5e986e06';
import {draw,drawCalories} from './chart.mjs?v=af6f5e986e06';
import {kilograms,weight,forecastTargetTime,formatForecastDate} from './model.mjs?v=af6f5e986e06';
const $=id=>document.getElementById(id),app=initializeApp(JSON.parse($('auth-config').textContent).firebase),auth=getAuth(app),db=sdk.getFirestore(app);
let calorieStore=null,calories={},calorieTarget=null,calorieReady=false,shownCalorieDay='';
let store=null,entries=[],unit='KG',ready=false,saving=false,generation=0,selectedId=null,targetKg=null,targetReady=false;
function controls(){const disabled=!ready||saving||!navigator.onLine;$('add').disabled=disabled;$('remove').disabled=disabled||!selectedId;$('calorie-add').disabled=$('calorie-remove').disabled=$('set-calorie-target').disabled=!calorieReady||saving||!navigator.onLine;$('set-target').disabled=!targetReady||saving||!navigator.onLine;}
function renderCalories(){
 const now=Date.now(),today=calorieDay(now),date=$('calorie-date');if(!date.value||date.value===shownCalorieDay)date.value=today;date.max=today;shownCalorieDay=today;
 if($('calorie-panel').hidden)return;
 const average=calorieAverage(calories,now);
 $('calorie-average').textContent='7-DAY AVERAGE: '+(average===null?'—':average.toLocaleString()+' KCAL');
 drawCalories($('calorie-chart'),calories,calorieTarget,now);
}
function render(){renderCalories();const selected=entries.find(p=>p.id===selectedId);if(!selected)selectedId=null;$('selected-entry').hidden=!selected;$('selected-value').textContent=selected?Number(weight(selected.kg,unit).toFixed(2)).toLocaleString()+' '+unit+' · '+new Date(selected.time).toLocaleString('en-GB'):'';const targetTime=forecastTargetTime(entries,targetKg);$('change-rate').hidden=targetKg===null;$('change-rate').textContent='ESTIMATED DATE YOU WILL HIT YOUR TARGET = '+formatForecastDate(targetTime);draw($('chart'),entries,unit,{selectedId,targetKg,onSelect:id=>{if(saving)return;selectedId=id;render();}});controls();}
function clear(){$('calorie-date').value=calorieDay();shownCalorieDay=calorieDay();generation++;calorieStore?.dispose();calorieStore=null;calories={};calorieTarget=null;calorieReady=false;store?.dispose();store=null;entries=[];selectedId=null;targetKg=null;targetReady=false;ready=false;saving=false;for(const id of ['weight','target-weight','calorie-amount','target-calories'])$(id).value='';$('weight-form').hidden=$('target-controls').hidden=$('calorie-panel').hidden=true;for(const id of ['calorie-chart','calorie-average'])$(id).replaceChildren();$('target-controls').open=false;$('auth-gate').hidden=false;$('status').textContent=$('calorie-status').textContent=$('calorie-target-status').textContent='';render();}
beforeAuthStateChanged(auth,clear);window.addEventListener('pagehide',clear);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
onAuthStateChanged(auth,user=>{clear();if(!user)return;const current=generation;$('auth-gate').hidden=true;$('weight-form').hidden=$('target-controls').hidden=$('calorie-panel').hidden=false;calorieStore=createCalorieStore({auth,db,sdk,uid:user.uid,onChange:({days,target},online)=>{if(current!==generation)return;calories=days;calorieTarget=target;calorieReady=online;if(document.activeElement!==$('target-calories'))$('target-calories').value=target??'';render();}});
 store=createWeightStore({auth,db,sdk,uid:user.uid,onTarget:(kg,online)=>{if(current!==generation)return;targetKg=kg;targetReady=online;if(document.activeElement!==$('target-weight'))$('target-weight').value=kg===null?'':Number(weight(kg,unit).toFixed(4));render();},onChange:rows=>{if(current!==generation)return;entries=rows;render();},onStatus:(text,online)=>{if(current!==generation)return;ready=online;if(!saving)$('status').textContent=text;controls();}});
});
for(const next of ['KG','LB'])$(next.toLowerCase()).addEventListener('click',()=>{const kg=kilograms($('weight').value,unit),target=kilograms($('target-weight').value,unit);unit=next;if(kg!==null)$('weight').value=Number(weight(kg,unit).toFixed(4));if(target!==null)$('target-weight').value=Number(weight(target,unit).toFixed(4));for(const id of ['weight','target-weight'])$(id).max=unit==='KG'?'1000':'2204.6226';$('target-unit').textContent=unit;$('kg').setAttribute('aria-pressed',String(unit==='KG'));$('lb').setAttribute('aria-pressed',String(unit==='LB'));render();});
$('weight-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!ready)return;const current=generation;saving=true;controls();$('status').textContent='SAVING';try{await store.add($('weight').value,unit);if(current!==generation)return;$('weight').value='';$('status').textContent='SAVED';}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('remove').addEventListener('click',async()=>{if(saving||!store||!ready||!selectedId)return;const id=selectedId,current=generation;saving=true;controls();$('status').textContent='REMOVING';try{await store.remove(id);if(current!==generation)return;selectedId=null;$('status').textContent='REMOVED';render();}catch{if(current===generation)$('status').textContent=navigator.onLine?'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('target-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!targetReady)return;const current=generation,kg=$('target-weight').value.trim()===''?null:kilograms($('target-weight').value,unit);saving=true;controls();$('status').textContent='SAVING';try{await store.setTarget($('target-weight').value,unit);if(current!==generation)return;targetKg=kg;$('status').textContent='SAVED';render();}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
async function saveCalories(action,status,after=()=>{}){
 if(saving||!calorieStore||!calorieReady)return;
 const current=generation;saving=true;controls();status.textContent='SAVING';
 try{await action(calorieStore);if(current===generation){after();status.textContent='SAVED';}}
 catch(e){if(current===generation)status.textContent=navigator.onLine?(e.message==='CALORIES'||e.message==='TARGET CALORIES'?e.message:'RETRY'):'OFFLINE';}
 finally{if(current===generation){saving=false;controls();}}
}
function calorieChange(sign){
 const input=$('calorie-amount'),amount=Number(input.value);
 if(!Number.isInteger(amount)||amount<1||amount>MAX_CALORIES){input.reportValidity();return;}
 const day=$('calorie-date').value;if(!$('calorie-date').reportValidity())return;
 saveCalories(store=>store.adjust(sign*amount,day),$('calorie-status'),()=>{input.value='';});
}
$('calorie-form').addEventListener('submit',e=>{e.preventDefault();calorieChange(1);});
$('calorie-remove').addEventListener('click',()=>calorieChange(-1));
$('calorie-target-form').addEventListener('submit',e=>{
 e.preventDefault();const value=$('target-calories').value;
 saveCalories(store=>store.setTarget(value),$('calorie-target-status'));
});
$('sign-in').addEventListener('click',async()=>{$('sign-in').disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch{$('status').textContent='RETRY';}finally{$('sign-in').disabled=false;}});
for(const type of ['online','offline'])window.addEventListener(type,()=>{if(!navigator.onLine)$('status').textContent='OFFLINE';else if(ready)$('status').textContent='';controls();});
new ResizeObserver(render).observe($('chart'));window.addEventListener('resize',render);render();
if(parent!==window)document.querySelector('.danki-return').addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();parent.postMessage({type:'danki-weight-return'},location.origin);});

if(parent!==window)document.querySelector('.temponote-link').addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();parent.postMessage({type:'danki-weight-open-notes'},location.origin);});

setInterval(()=>{if(!document.hidden&&shownCalorieDay!==calorieDay())render();},30000);
