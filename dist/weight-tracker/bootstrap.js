import {mountSleep} from './sleep-ui.js?v=8d52d9c201d8';
import {createProteinStore,proteinAverage,proteinDay,proteinLastDay,MAX_PROTEIN} from './protein-tracker.mjs?v=8d52d9c201d8';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {createWeightStore} from './store.mjs?v=8d52d9c201d8';
import {draw,drawProtein} from './chart.mjs?v=8d52d9c201d8';
import {kilograms,weight,forecastTargetTime,formatForecastDate} from './model.mjs?v=8d52d9c201d8';
const $=id=>document.getElementById(id),app=initializeApp(JSON.parse($('auth-config').textContent).firebase),auth=getAuth(app),db=sdk.getFirestore(app);
let proteinStore=null,protein={},proteinTarget=null,proteinReady=false,shownProteinDay='';
let store=null,entries=[],unit='KG',ready=false,saving=false,generation=0,selectedId=null,targetKg=null,targetReady=false;
function controls(){const disabled=!ready||saving||!navigator.onLine;$('add').disabled=disabled;$('remove').disabled=disabled||!selectedId;$('protein-add').disabled=$('protein-remove').disabled=$('set-protein-target').disabled=!proteinReady||saving||!navigator.onLine;$('set-target').disabled=!targetReady||saving||!navigator.onLine;}
function syncProteinArrows(){const date=$('protein-date');$('protein-day-next').disabled=!!date.max&&date.value>=date.max;}
function stepProteinDay(amount){const date=$('protein-date');if(!date.value)date.value=proteinDay();const next=new Date(date.value+'T12:00:00');next.setDate(next.getDate()+amount);const day=proteinDay(next.getTime());if(day>proteinLastDay())return;date.value=day;syncProteinArrows();}
$('protein-day-prev').addEventListener('click',()=>stepProteinDay(-1));
$('protein-day-next').addEventListener('click',()=>stepProteinDay(1));
$('protein-date').addEventListener('change',syncProteinArrows);
function renderProtein(){
 const now=Date.now(),today=proteinDay(now),date=$('protein-date');if(!date.value||date.value===shownProteinDay)date.value=today;date.max=proteinLastDay(now);shownProteinDay=today;syncProteinArrows();
 if($('protein-panel').hidden)return;
 const average=proteinAverage(protein,now);
 $('protein-average').textContent='7-DAY AVERAGE: '+(average===null?'—':average.toLocaleString()+' GRAMS');
 drawProtein($('protein-chart'),protein,proteinTarget,now);
}
function render(){renderProtein();const selected=entries.find(p=>p.id===selectedId);if(!selected)selectedId=null;$('selected-entry').hidden=!selected;$('selected-value').textContent=selected?Number(weight(selected.kg,unit).toFixed(2)).toLocaleString()+' '+unit+' · '+new Date(selected.time).toLocaleString('en-GB'):'';const targetTime=forecastTargetTime(entries,targetKg);$('change-rate').hidden=targetKg===null;$('calories-to-lose').hidden=targetKg===null||!entries.length;$('calories-to-lose').textContent='CALORIES TO LOSE = '+Math.round(Math.max(0,(entries.at(-1)?.kg??0)-(targetKg??0))*7000).toLocaleString('en-GB');$('change-rate').textContent='ESTIMATED DATE YOU WILL HIT YOUR TARGET = '+formatForecastDate(targetTime);draw($('chart'),entries,unit,{selectedId,targetKg,onSelect:id=>{if(saving)return;selectedId=id;render();}});controls();}
function clear(){$('protein-date').value=proteinDay();shownProteinDay=proteinDay();generation++;proteinStore?.dispose();proteinStore=null;protein={};proteinTarget=null;proteinReady=false;store?.dispose();store=null;entries=[];selectedId=null;targetKg=null;targetReady=false;ready=false;saving=false;for(const id of ['weight','target-weight','protein-amount','target-protein'])$(id).value='';$('weight-form').hidden=$('target-controls').hidden=$('protein-panel').hidden=true;for(const id of ['protein-chart','protein-average'])$(id).replaceChildren();$('target-controls').open=false;$('auth-gate').hidden=false;$('status').textContent=$('protein-status').textContent=$('protein-target-status').textContent='';render();}
const sleepLogs=mountSleep({auth,db,sdk,signInReady:true});
const clearAll=()=>{sleepLogs.clear();clear();};
beforeAuthStateChanged(auth,clearAll);window.addEventListener('pagehide',clearAll);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
onAuthStateChanged(auth,user=>{clearAll();if(!user)return;sleepLogs.open(user);const current=generation;$('auth-gate').hidden=true;$('weight-form').hidden=$('target-controls').hidden=$('protein-panel').hidden=false;proteinStore=createProteinStore({auth,db,sdk,uid:user.uid,onChange:({days,target},online)=>{if(current!==generation)return;protein=days;proteinTarget=target;proteinReady=online;if(document.activeElement!==$('target-protein'))$('target-protein').value=target??'';render();}});
 store=createWeightStore({auth,db,sdk,uid:user.uid,onTarget:(kg,online)=>{if(current!==generation)return;targetKg=kg;targetReady=online;if(document.activeElement!==$('target-weight'))$('target-weight').value=kg===null?'':Number(weight(kg,unit).toFixed(4));render();},onChange:rows=>{if(current!==generation)return;entries=rows;render();},onStatus:(text,online)=>{if(current!==generation)return;ready=online;if(!saving)$('status').textContent=text;controls();}});
});
for(const next of ['KG','LB'])$(next.toLowerCase()).addEventListener('click',()=>{const kg=kilograms($('weight').value,unit),target=kilograms($('target-weight').value,unit);unit=next;if(kg!==null)$('weight').value=Number(weight(kg,unit).toFixed(4));if(target!==null)$('target-weight').value=Number(weight(target,unit).toFixed(4));for(const id of ['weight','target-weight'])$(id).max=unit==='KG'?'1000':'2204.6226';$('target-unit').textContent=unit;$('kg').setAttribute('aria-pressed',String(unit==='KG'));$('lb').setAttribute('aria-pressed',String(unit==='LB'));render();});
$('weight-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!ready)return;const current=generation;saving=true;controls();$('status').textContent='SAVING';try{await store.add($('weight').value,unit);if(current!==generation)return;$('weight').value='';$('status').textContent='SAVED';}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('remove').addEventListener('click',async()=>{if(saving||!store||!ready||!selectedId)return;const id=selectedId,current=generation;saving=true;controls();$('status').textContent='REMOVING';try{await store.remove(id);if(current!==generation)return;selectedId=null;$('status').textContent='REMOVED';render();}catch{if(current===generation)$('status').textContent=navigator.onLine?'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
$('target-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||!store||!targetReady)return;const current=generation,kg=$('target-weight').value.trim()===''?null:kilograms($('target-weight').value,unit);saving=true;controls();$('status').textContent='SAVING';try{await store.setTarget($('target-weight').value,unit);if(current!==generation)return;targetKg=kg;$('status').textContent='SAVED';render();}catch(error){if(current===generation)$('status').textContent=navigator.onLine?error.message==='WEIGHT'?'WEIGHT':'RETRY':'OFFLINE';}finally{if(current===generation){saving=false;controls();}}});
async function saveProtein(action,status,after=()=>{}){
 if(saving||!proteinStore||!proteinReady)return;
 const current=generation;saving=true;controls();status.textContent='SAVING';
 try{await action(proteinStore);if(current===generation){after();status.textContent='SAVED';}}
 catch(e){if(current===generation)status.textContent=navigator.onLine?(e.message==='PROTEIN'||e.message==='TARGET PROTEIN'?e.message:'RETRY'):'OFFLINE';}
 finally{if(current===generation){saving=false;controls();}}
}
function proteinChange(sign){
 const input=$('protein-amount'),amount=Number(input.value);
 if(!Number.isInteger(amount)||amount<1||amount>MAX_PROTEIN){input.reportValidity();return;}
 const day=$('protein-date').value;if(!$('protein-date').reportValidity())return;
 saveProtein(store=>store.adjust(sign*amount,day),$('protein-status'),()=>{input.value='';});
}
$('protein-form').addEventListener('submit',e=>{e.preventDefault();proteinChange(1);});
$('protein-remove').addEventListener('click',()=>proteinChange(-1));
$('protein-target-form').addEventListener('submit',e=>{
 e.preventDefault();const value=$('target-protein').value;
 saveProtein(store=>store.setTarget(value),$('protein-target-status'));
});
$('sign-in').addEventListener('click',async()=>{$('sign-in').disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch{$('status').textContent='RETRY';}finally{$('sign-in').disabled=false;}});
for(const type of ['online','offline'])window.addEventListener(type,()=>{if(!navigator.onLine)$('status').textContent='OFFLINE';else if(ready)$('status').textContent='';controls();});
new ResizeObserver(render).observe($('chart'));window.addEventListener('resize',render);render();
if(parent!==window)document.querySelector('.danki-return').addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();parent.postMessage({type:'danki-weight-return'},location.origin);});

if(parent!==window)document.querySelector('.temponote-link').addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();parent.postMessage({type:'danki-weight-open-notes'},location.origin);});

setInterval(()=>{if(!document.hidden&&shownProteinDay!==proteinDay())render();},30000);
