import {timeFor,duration,dayKey} from './timebox-model.mjs';
export function mountTimebox(root,store){
 const side=root.querySelector('.timebox-side');
 side.innerHTML=`<header class="timebox-header"><h2>TIMEBOX</h2><button type="button" class="timebox-add" aria-label="Create timebox">+</button></header><form class="timebox-editor" hidden><label class="sr-only" for="timebox-name">Task name</label><input id="timebox-name" maxlength="60" placeholder="TASK NAME" required><label class="timebox-color-label">COLOUR<input type="color" value="#7652a3" aria-label="Box colour"></label><section class="timebox-adjust" aria-label="Adjust today's time" hidden><div class="timebox-adjust-total">TODAY <time></time></div><label for="timebox-minutes">MINUTES</label><input id="timebox-minutes" type="number" inputmode="numeric" min="1" max="1440" step="1" value="30"><div><button type="button" data-time-adjust="-1">− TIME</button><button type="button" data-time-adjust="1">+ TIME</button></div></section><div class="timebox-editor-actions"><button type="button" class="timebox-remove" hidden>REMOVE</button><button type="button" class="timebox-cancel">CANCEL</button><button type="submit">SAVE</button></div></form><p class="timebox-error" role="alert" hidden></p><div class="timebox-grid" aria-label="Task timers"></div><aside class="timebox-chart-area"><button type="button" id="timebox-chart-toggle" aria-expanded="false" aria-controls="timebox-chart">TIME SPENT ⌃</button><section id="timebox-chart" aria-label="Time spent by task" hidden><header><div role="group" aria-label="Chart period"><button type="button" data-period="today" aria-pressed="true">TODAY</button><button type="button" data-period="week" aria-pressed="false">WEEK</button></div><button type="button" class="timebox-chart-close" aria-label="Close time chart">×</button></header><div class="timebox-chart-caption"></div><div class="timebox-chart-axis"><span>0</span><span class="timebox-chart-middle"></span><span class="timebox-chart-max"></span></div><div class="timebox-bars"></div></section></aside>`;
 const $=s=>side.querySelector(s),grid=$('.timebox-grid'),editor=$('form'),name=$('#timebox-name'),color=$('[type=color]'),error=$('.timebox-error'),panel=$('#timebox-chart'),toggle=$('#timebox-chart-toggle'),nodes=new Map();
 let tasks=[],confirmedTasks=[],ready=false,editing=null,draft=null,busy=false,period='today',disposed=false,drag=null,moving=false;
 const pending=new Set();
 function showError(message=''){error.textContent=message;error.hidden=!message;}
 function controls(){for(const b of editor.querySelectorAll('button'))b.disabled=busy||!ready;name.disabled=color.disabled=busy;$('#timebox-minutes').disabled=busy;$('.timebox-add').disabled=!ready||busy;for(const [id,node]of nodes)for(const b of node.querySelectorAll('button'))b.disabled=!ready||pending.has(id)||(b.classList.contains('timebox-move')&&moving);}
 function closeEditor(){editor.hidden=true;editing=draft=null;name.value='';$('.timebox-remove').hidden=true;$('.timebox-adjust').hidden=true;}
 function openEditor(task){editing=task?.id||null;draft=null;name.value=task?.name||'';color.value=task?.color||'#7652a3';$('.timebox-remove').hidden=!task;$('.timebox-adjust').hidden=!task;$('#timebox-minutes').value='30';editor.hidden=false;render();showError();controls();name.focus();}
 function contrast(hex){const rgb=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#111215':'#ffffff';}
 function chart(now){
  if(panel.hidden)return;const values=tasks.map(task=>({task,ms:timeFor(task,now,period==='week')})),max=Math.max(60000,...values.map(v=>v.ms));
  $('.timebox-chart-caption').textContent=period==='week'?'DAILY AVERAGE · LAST 7 DAYS':'TODAY';$('.timebox-chart-middle').textContent=duration(max/2);$('.timebox-chart-max').textContent=duration(max);const bars=$('.timebox-bars');bars.replaceChildren();
  for(const {task,ms}of values){const row=document.createElement('div');row.className='timebox-chart-row';const label=document.createElement('span'),track=document.createElement('div'),bar=document.createElement('div'),value=document.createElement('span');label.textContent=task.name;label.title=task.name;track.className='timebox-chart-track';bar.className='timebox-chart-bar';bar.style.width=(ms/max*100)+'%';bar.style.backgroundColor=task.color;value.textContent=duration(ms);track.append(bar);row.append(label,track,value);row.setAttribute('aria-label',task.name+': '+duration(ms)+(period==='week'?' PER DAY':''));bars.append(row);}
 }
 function render(){
  if(disposed)return;const now=Date.now(),ids=new Set(tasks.map(t=>t.id));
  for(const [id,node]of nodes)if(!ids.has(id)){node.remove();nodes.delete(id);if(editing===id&&!busy)closeEditor();}
  tasks.forEach((task,i)=>{let node=nodes.get(task.id);if(!node){node=document.createElement('article');node.className='timebox-card';node.dataset.id=task.id;node.innerHTML='<button type="button" class="timebox-move" title="Drag to move. Use arrow keys." aria-label="Move timebox">⠿</button><button type="button" class="timebox-run"><span class="timebox-name"></span><time></time><span class="timebox-state"></span></button><button type="button" class="timebox-edit" aria-label="Edit timebox">···</button>';nodes.set(task.id,node);}
   const running=task.runningSince!==null,run=node.querySelector('.timebox-run');node.style.setProperty('--box-color',task.color);node.style.setProperty('--box-text',contrast(task.color));node.classList.toggle('running',running);node.classList.toggle('dragging',drag?.id===task.id);node.querySelector('.timebox-move').setAttribute('aria-label','Move '+task.name);run.setAttribute('aria-pressed',String(running));run.setAttribute('aria-label',(running?'Pause ':'Start ')+task.name);node.querySelector('.timebox-edit').setAttribute('aria-label','Edit '+task.name);node.querySelector('.timebox-name').textContent=task.name;node.querySelector('time').textContent=duration(timeFor(task,now));node.querySelector('.timebox-state').textContent=running?'Ⅱ':'▶';if(grid.children[i]!==node)grid.insertBefore(node,grid.children[i]||null);
  });if(editing){const task=tasks.find(t=>t.id===editing);if(task)$('.timebox-adjust-total time').textContent=duration(timeFor(task,now));}controls();chart(now);
 }
 $('.timebox-add').addEventListener('click',()=>openEditor());$('.timebox-cancel').addEventListener('click',closeEditor);
 async function save(action){busy=true;controls();showError();try{await store.act(action);if(!disposed)closeEditor();}catch(e){if(!disposed)showError(e.message);}finally{busy=false;if(!disposed){controls();render();}}}
 editor.addEventListener('submit',event=>{event.preventDefault();if(busy||!name.value.trim())return;draft??=crypto.randomUUID();save({type:editing?'edit':'create',id:editing||draft,name:name.value,color:color.value});});
 $('.timebox-remove').addEventListener('click',()=>{if(editing&&!busy)save({type:'remove',id:editing});});
 for(const button of side.querySelectorAll('[data-time-adjust]'))button.addEventListener('click',async()=>{
  if(!editing||busy||!ready)return;const input=$('#timebox-minutes'),minutes=Number(input.value);
  if(!Number.isInteger(minutes)||minutes<1||minutes>1440){showError('ENTER 1–1440 MINUTES');input.focus();return;}
  busy=true;controls();showError();try{await store.act({type:'adjust',id:editing,minutes:minutes*Number(button.dataset.timeAdjust),day:dayKey(new Date())});}catch(e){if(!disposed)showError(e.message);}finally{busy=false;if(!disposed){controls();render();}}
 });
 grid.addEventListener('click',async event=>{const node=event.target.closest('.timebox-card'),button=event.target.closest('button');if(!node||!button||button.classList.contains('timebox-move'))return;const task=tasks.find(t=>t.id===node.dataset.id);if(!task||pending.has(task.id)||!ready)return;if(button.classList.contains('timebox-edit')){openEditor(task);return;}pending.add(task.id);controls();showError();try{await store.act({type:'running',id:task.id,running:task.runningSince===null});}catch(e){if(!disposed)showError(e.message);}finally{pending.delete(task.id);if(!disposed)render();}});
 function moveLocal(id,index){const from=tasks.findIndex(t=>t.id===id);if(from<0||from===index)return;const reordered=[...tasks],[task]=reordered.splice(from,1);reordered.splice(index,0,task);tasks=reordered;render();}
 async function commitMove(id){
  const index=tasks.findIndex(t=>t.id===id);if(index<0)return;
  const beforeId=tasks[index+1]?.id||null;moving=true;pending.add(id);controls();showError();
  try{await store.act({type:'move',id,beforeId});}catch(e){if(!disposed)showError(e.message);}finally{moving=false;pending.delete(id);if(!disposed){tasks=confirmedTasks;render();if(document.activeElement===document.body)nodes.get(id)?.querySelector('.timebox-move').focus({preventScroll:true});}}
 }
 grid.addEventListener('pointerdown',event=>{
  const handle=event.target.closest('.timebox-move');if(!handle||!ready||moving||drag||event.button!==0||event.isPrimary===false)return;
  const id=handle.closest('.timebox-card').dataset.id;if(pending.has(id))return;
  event.preventDefault();handle.focus({preventScroll:true});grid.setPointerCapture(event.pointerId);
  drag={id,pointerId:event.pointerId,handle,x:event.clientX,y:event.clientY,moved:false,original:tasks.map(t=>t.id).join(',')};render();
 });
 grid.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();
  if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<5)return;drag.moved=true;
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.timebox-card');
  if(target&&grid.contains(target)){const index=tasks.findIndex(t=>t.id===target.dataset.id);if(index>=0)moveLocal(drag.id,index);}
  const bounds=side.getBoundingClientRect();if(event.clientY>bounds.bottom-45)side.scrollTop+=14;else if(event.clientY<bounds.top+45)side.scrollTop-=14;
 });
 function endDrag(cancel=false){if(!drag)return;const current=drag;drag=null;if(grid.hasPointerCapture(current.pointerId))grid.releasePointerCapture(current.pointerId);
  if(!cancel&&current.moved&&current.original!==tasks.map(t=>t.id).join(','))commitMove(current.id);else {tasks=confirmedTasks;render();}
 }
 grid.addEventListener('pointerup',event=>{if(drag?.pointerId===event.pointerId)endDrag();});
 grid.addEventListener('pointercancel',()=>endDrag(true));
 grid.addEventListener('lostpointercapture',()=>endDrag(true));
 grid.addEventListener('keydown',event=>{const handle=event.target.closest('.timebox-move'),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}[event.key];if(!handle||!delta||moving||drag||!ready)return;event.preventDefault();const id=handle.closest('.timebox-card').dataset.id,index=tasks.findIndex(t=>t.id===id),next=Math.max(0,Math.min(tasks.length-1,index+delta));if(index!==next){moveLocal(id,next);commitMove(id);}});
 function closeChart(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));chart(Date.now());});$('.timebox-chart-close').addEventListener('click',closeChart);
 for(const b of side.querySelectorAll('[data-period]'))b.addEventListener('click',()=>{period=b.dataset.period;for(const option of side.querySelectorAll('[data-period]'))option.setAttribute('aria-pressed',String(option===b));chart(Date.now());});
 const outside=event=>{if(!$('.timebox-chart-area').contains(event.target))closeChart();},escape=event=>{if(event.key==='Escape'){endDrag(true);closeChart();if(!busy)closeEditor();}};document.addEventListener('click',outside);document.addEventListener('keydown',escape);
 const stop=store.subscribe(data=>{confirmedTasks=data.state.tasks;if(!drag&&!moving)tasks=confirmedTasks;ready=data.ready;if(data.error)showError(data.error);render();});const tick=setInterval(()=>{if(!document.hidden)render();},1000),refresh=()=>render();document.addEventListener('visibilitychange',refresh);window.addEventListener('temponotes-visibility',refresh);
 return ()=>{disposed=true;stop();clearInterval(tick);document.removeEventListener('click',outside);document.removeEventListener('keydown',escape);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('temponotes-visibility',refresh);side.replaceChildren();nodes.clear();tasks=[];};
}
