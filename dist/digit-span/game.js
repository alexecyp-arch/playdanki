import {createRun,percentileLabel} from './model.mjs?v=d488816c3fad';
import {BEST_KEY,readBest,recordBest} from './best-score.mjs?v=d488816c3fad';
const $=id=>document.getElementById(id);
let best=0;function bestStorage(){try{return localStorage;}catch{return null;}}
function showBest(){best=readBest(bestStorage());$('best').textContent='BEST: '+best+' DIGITS';}
showBest();window.addEventListener('storage',event=>{if(event.key===null||event.key===BEST_KEY){run.pause();showBest();}});
if(parent!==window)parent.addEventListener('danki-auth-clearing',()=>{run.pause();best=0;$('best').textContent='BEST: 0 DIGITS';});
let phase='idle',speechRun=0;
function render(s){
 const previous=phase;phase=s.phase;if(phase==='showing'&&previous!=='showing')speechRun++;
 if(phase==='over'&&previous!=='over')window.DankiAnswerVoice?.('digit-span',speechRun,'The sequence was '+[...(s.solution||'')].join(', ')+'. '+(s.achieved?s.achieved+' digits achieved.':'Fewer than five digits achieved.'),true);
 if(phase==='correct'){try{best=recordBest(bestStorage(),s.achieved);$('best').textContent='BEST: '+best+' DIGITS';(parent===window?document:parent.document).dispatchEvent(new Event('danki-progress'));}catch{}}
 $('level').textContent=s.length+' DIGITS';$('digit').textContent=s.digit;
 $('recall').hidden=!['recall','checking'].includes(phase);$('answer').disabled=phase!=='recall';$('answer').maxLength=s.length;
 if($('answer').value!==s.answer)$('answer').value=s.answer;
 for(const b of $('keypad').children)b.disabled=phase!=='recall';
 $('start').hidden=!['idle','over','paused'].includes(phase);$('start').textContent=phase==='over'?'TRY AGAIN':phase==='paused'?'CONTINUE':'START';
 $('prompt').textContent=({idle:'REMEMBER THE DIGITS IN ORDER',showing:'WATCH',recall:'ENTER THE DIGITS IN ORDER',checking:'',correct:'CORRECT',over:'GAME OVER',paused:'ROUND PAUSED'})[phase];
 $('result').hidden=phase!=='over';
 if(phase==='over'){$('score').textContent=s.achieved?s.achieved+' DIGITS ACHIEVED':'FEWER THAN 5 DIGITS';$('percentile').textContent=percentileLabel(s.achieved);}
 if(phase==='recall'&&previous!=='recall')$('answer').focus({preventScroll:true});
}
const run=createRun({onChange:render});
for(const value of ['1','2','3','4','5','6','7','8','9','0','DELETE']){const b=document.createElement('button');b.type='button';b.textContent=value;b.addEventListener('click',()=>{const s=run.snapshot();run.input(value==='DELETE'?s.answer.slice(0,-1):s.answer+value);if(phase==='recall')$('answer').focus({preventScroll:true});});$('keypad').append(b);}
$('start').addEventListener('click',()=>phase==='paused'?run.resume():run.start());
$('answer').addEventListener('input',()=>run.input($('answer').value));
document.addEventListener('keydown',event=>{if(phase!=='recall'||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.target===$('answer'))return;if(/^[0-9]$/.test(event.key)||event.key==='Backspace'){event.preventDefault();if(event.repeat)return;const s=run.snapshot();run.input(event.key==='Backspace'?s.answer.slice(0,-1):s.answer+event.key);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)run.pause();});
if(parent!==window){try{const observer=new MutationObserver(()=>{if(frameElement.hidden||['notes-open','atlas-open','weight-open'].some(c=>parent.document.body.classList.contains(c)))run.pause();});observer.observe(frameElement,{attributes:true,attributeFilter:['hidden']});observer.observe(parent.document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});}catch{}}
window.addEventListener('pagehide',()=>run.dispose(),{once:true});render(run.snapshot());
