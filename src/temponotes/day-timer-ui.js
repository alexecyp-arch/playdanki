import {readTimer,timerElapsed,timerText} from './day-timer.mjs';
export function mountDayTimer(store){
 const button=document.createElement('button');button.id='note-day-timer';button.type='button';button.disabled=true;button.textContent='00:00:00';
 document.body.append(button);document.body.classList.add('has-note-day-timer');
 let state=readTimer(),ready=false,busy=false,disposed=false,error='';
 function render(){
  if(disposed)return;const current=readTimer(state),running=current.started!==null;
  button.textContent=timerText(timerElapsed(current));button.setAttribute('aria-pressed',String(running));
  button.setAttribute('aria-label',(running?'Pause':'Start')+" today's timer, "+button.textContent);
  button.title=error||(running?'PAUSE TIMER':'START TIMER');button.disabled=!ready||busy||!navigator.onLine;
 }
 const stop=store.subscribe(next=>{state=next.state;ready=next.ready;error=next.error;render();});
 async function click(){
  if(busy||!ready)return;const running=readTimer(state).started!==null,previous=state;
  // Show the pressed face immediately while the private cloud write completes.
  state=running?{...readTimer(state),elapsed:timerElapsed(state),started:null}:{...readTimer(state),started:Date.now()};busy=true;error='';render();
  try{await store.setRunning(!running);}catch{state=previous;error='COULD NOT SAVE TIMER. TRY AGAIN.';}finally{busy=false;render();}
 }
 button.addEventListener('click',click);const tick=setInterval(render,1000);
 for(const event of ['online','offline','focus'])window.addEventListener(event,render);
 document.addEventListener('visibilitychange',render);render();
 return()=>{disposed=true;clearInterval(tick);stop();for(const event of ['online','offline','focus'])window.removeEventListener(event,render);document.removeEventListener('visibilitychange',render);button.remove();document.body.classList.remove('has-note-day-timer');};
}
