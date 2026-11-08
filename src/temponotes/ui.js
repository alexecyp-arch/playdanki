import {orderKey,finishOrder} from './daily-notes.mjs';
import {calendarLabel} from './calendar.mjs';
import {confirmDelete} from './confirm-delete.js';
import {noteColors,occurrences} from './eternal.mjs';
import {mountEternal} from './eternal-ui.js';
import {orderNotes} from './note-order.mjs';
import {mountLocked} from './locked-ui.js';
import {mountFortuna} from './fortuna.js';

function noteBrickTexture(id){
 let seed=2166136261;
 for(const letter of id)seed=Math.imul(seed^letter.charCodeAt(0),16777619);
 function pick(min,max){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  return min+Math.floor(seed/4294967296*(max-min+1));
 }
 const tileWidth=320,stones=[],offset=pick(-23,0),grainSeed=pick(1,999);
 const cuts=[0,38+pick(-10,10),103+pick(-12,12),152+pick(-10,10),213+pick(-13,13),263+pick(-10,10),tileWidth];
 const polygon=(points,fill)=>`<polygon points="${points.map(point=>point.join(',')).join(' ')}" fill="${fill}"/>`;
 for(let i=1;i<cuts.length;i++){
  const x=cuts[i-1]+offset,w=cuts[i]-cuts[i-1]-pick(3,6),top=pick(5,9),foot=pick(23,27),shade=pick(145,218);
  const face=[[0,top+pick(4,7)],[pick(3,7),top+1],[Math.round(w*.45),top+pick(-2,2)],[w-pick(4,9),top+pick(0,3)],[w,top+pick(4,8)],[w-pick(1,5),foot-3],[w-pick(5,10),foot],[pick(4,9),foot+pick(-1,1)],[1,foot-pick(2,6)]];
  const upper=face.slice(0,5),lower=face.slice(4);
  const chippedTop=upper.map(([px,py],j)=>[px-pick(1,3),py-pick(j===0||j===4?1:3,5)]);
  const depth=pick(3,5),side=lower.map(([px,py])=>[px+depth,py+depth]);
  const crack=pick(0,3)===0?'':`<path d="M${pick(9,w-12)} ${pick(12,17)}l${pick(2,5)} ${pick(-2,2)} ${pick(-3,1)} ${pick(1,4)} ${pick(1,5)} ${pick(-2,2)}" fill="none" stroke="#363636" stroke-opacity=".6" stroke-width=".8"/>`;
  const stone=polygon(face.map(([px,py])=>[px+depth+1,py+depth+1]),'#151515')
   +polygon([...lower,...side.reverse()],'#4a4a4a')
   +polygon([...chippedTop,...upper.reverse()],'#dedede')
   +polygon(face,`rgb(${shade},${shade},${shade})`)
   +polygon(face,'url(#light)')
   +crack;
  stones.push(`<g transform="translate(${x} 0)">${stone}</g>`);
  if(x<depth)stones.push(`<g transform="translate(${x+tileWidth} 0)">${stone}</g>`);
  if(x+w+depth+1>tileWidth)stones.push(`<g transform="translate(${x-tileWidth} 0)">${stone}</g>`);
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="34" viewBox="0 0 ${tileWidth} 34" preserveAspectRatio="none">
 <defs><linearGradient id="light" x2=".15" y2="1"><stop stop-color="#fff" stop-opacity=".28"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#151515" stop-opacity=".52"/></linearGradient>
 <filter id="grit" filterUnits="userSpaceOnUse" x="0" y="0" width="${tileWidth}" height="34"><feTurbulence type="fractalNoise" baseFrequency=".19 .31" numOctaves="3" seed="${grainSeed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".6"/></feComponentTransfer><feComposite in2="SourceAlpha" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter></defs>
 <rect width="${tileWidth}" height="34" fill="#242424"/><g filter="url(#grit)">${stones.join('')}</g></svg>`;
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
// The original Temponote layout, rendered with browser APIs instead of React.
export function mount(root,request,{visible=true,locked}={}){
 const confirmController=new AbortController();
 root.innerHTML=`<div class="temponote-workspace notes-only"><main class="app"><header class="header"><div class="brand"><span class="brand-icon" aria-hidden="true">◷</span><h1>TEMPONOTE</h1><time class="current-time" aria-label="Current time"></time><span class="current-calendar" aria-label="Day date and season"></span></div></header><section class="notes-area" id="note-list" aria-label="Your notes"><div class="notes-wrap"><ol></ol></div></section><footer class="composer"><div class="composer-wrap"><div class="composer-top"></div><form><label class="sr-only" for="note">Write a note</label><textarea id="note" maxlength="10000" placeholder="Write a note…" rows="2"></textarea><button class="send" type="submit" disabled aria-label="Send note"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15"/></svg></button></form><p class="order-status" role="status" aria-live="polite" hidden></p><p class="error" role="alert" hidden></p></div></footer></main></div>`;
 const $=s=>root.querySelector(s),input=$('textarea'),list=$('ol'),error=$('.error'),sendButton=$('.send'),sendIcon=sendButton.innerHTML,nodes=new Map(),extending=new Set();
 let notes=[],schedules=[],adjustments={},order=[],orderUntil=0,chosen=[],orderBase=[],orderTimer,savingOrder=false,busy=false,draft=null,offset=0,disposed=false,lastSync=0,loaded=false;
 const tools=document.createElement('div');tools.className='note-tools';$('.composer-top').append(tools);
 const eternal=mountEternal(root,request,{getSchedules:()=>schedules,onChange:load});
 const orderButton=document.createElement('button');orderButton.type='button';orderButton.className='order-notes';orderButton.textContent='ORDER';tools.append(orderButton);orderButton.addEventListener('click',beginOrder);
 const fortuna=mountFortuna(tools,()=>activeNotes(Date.now()+offset));
 const stopLocked=locked?mountLocked(root,locked):()=>{};
 const duration=m=>[Math.floor(m/60)?Math.floor(m/60)+'H':'',m%60?m%60+'M':''].filter(Boolean).join(' ');
 const format=t=>new Date(t).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
 function showError(message=''){if(disposed)return;error.textContent=message;error.hidden=!message;}
 function controls(){input.disabled=busy;sendButton.disabled=busy||!input.value.trim();sendButton.innerHTML=busy?'…':sendIcon;}
 function activeNotes(t){return orderNotes([...notes.filter(n=>n.expiresAt>t),...occurrences(schedules,t,adjustments)],orderUntil?orderBase:order);}
 function render(){
  if(disposed||!visible)return;const t=Date.now()+offset,time=$('.current-time');time.textContent=format(t);$('.current-calendar').textContent=calendarLabel(t);time.dateTime=new Date(t).toISOString();orderButton.disabled=!!orderUntil||savingOrder;
  const status=$('.order-status');status.hidden=!orderUntil&&!savingOrder;status.textContent=orderUntil?'ORDER · '+Math.max(1,Math.ceil((orderUntil-Date.now())/1000))+'S · CLICK NOTES IN ORDER':savingOrder?'SAVING ORDER…':'';
  const active=activeNotes(t),ids=new Set(active.map(n=>n.id));
  fortuna.render(active);
  for(const [id,li]of nodes)if(!ids.has(id)){li.remove();nodes.delete(id);}
  active.forEach((n,i)=>{
   let li=nodes.get(n.id);if(!li){li=document.createElement('li');li.dataset.id=n.id;li.innerHTML=`<article class="note"><div class="note-heading"><span class="number"></span><div class="note-body"><p></p></div></div><div class="note-footer"><span class="expiry"></span><div class="note-time-buttons" role="group"><button data-day="1">+DAY</button></div><button class="delete" title="Delete note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg></button></div></article>`;li.style.setProperty('--note-bricks',noteBrickTexture(n.eternalId||n.id));nodes.set(n.id,li);}
   li.querySelector('article').classList.toggle('eternal',!!n.eternalId);li.querySelector('article').classList.toggle('selected',!!orderUntil&&chosen.includes(orderKey(n.id)));const body=li.querySelector('.note-body');body.tabIndex=orderUntil?0:-1;if(orderUntil){body.setAttribute('role','button');body.setAttribute('aria-pressed',String(chosen.includes(orderKey(n.id))));}else{body.removeAttribute('role');body.removeAttribute('aria-pressed');}body.setAttribute('aria-label',(orderUntil?'Choose order for note: ':'Note: ')+n.body);li.querySelector('.number').textContent=orderUntil?(chosen.includes(orderKey(n.id))?(chosen.indexOf(orderKey(n.id))+1)+'.':'·'):(i+1)+'.';if(li.querySelector('p').textContent!==n.body)li.querySelector('p').textContent=n.body;
   const footer=li.querySelector('.note-footer'),barColor=noteColors[n.color]||noteColors.green;footer.style.backgroundColor=footer.style.borderTopColor=barColor;const expiry=li.querySelector('.expiry'),seconds=Math.ceil((n.expiresAt-t)/1000);expiry.textContent=(seconds<60?seconds+'S':duration(Math.ceil(seconds/60)))+' LEFT';expiry.title='Expires '+new Date(n.expiresAt).toLocaleString();li.querySelector('[role=group]').setAttribute('aria-label','Note actions '+(i+1));li.querySelector('.delete').setAttribute('aria-label','Delete note '+(i+1));for(const b of li.querySelectorAll('button'))b.disabled=extending.has(n.id)||!!orderUntil||savingOrder;if(list.children[i]!==li)list.insertBefore(li,list.children[i]||null);
  });
 }
 function selectNote(event){if(!orderUntil||Date.now()>=orderUntil||event.target.closest('button'))return;const li=event.target.closest('li');if(!li)return;if(event.type==='keydown'){if(event.key!=='Enter'&&event.key!==' ')return;event.preventDefault();if(event.repeat)return;}else if(window.getSelection()?.toString())return;const id=orderKey(li.dataset.id);if(!chosen.includes(id)){chosen.push(id);render();}}
 function beginOrder(){if(orderUntil||savingOrder)return;orderBase=activeNotes(Date.now()+offset).map(n=>orderKey(n.id));chosen=[];orderUntil=Date.now()+10000;orderTimer=setTimeout(saveOrder,10000);showError();render();}
 async function saveOrder(){if(disposed)return;const next=finishOrder(chosen,orderBase);orderUntil=0;chosen=[];if(!next.length)return render();order=next;savingOrder=true;render();$('#note-list').scrollTo({top:0,behavior:'instant'});try{const r=await request('/api/note-order',{method:'POST',body:JSON.stringify({ids:next})});if(!r.ok)throw Error('Could not save note order. Press ORDER to retry.');}catch(e){showError(e.message);}finally{savingOrder=false;render();}}
 async function load(){const start=Date.now();try{const r=await request('/api/notes',{cache:'no-store'});if(!r.ok)throw Error('Could not sync notes. Please refresh or sign in again.');const data=await r.json();if(disposed||start<lastSync)return;lastSync=start;offset=data.serverNow-Date.now();notes=data.notes;schedules=data.eternalNotes||[];adjustments=data.eternalAdjustments||{};if(!orderUntil&&!savingOrder)order=data.noteOrder||[];loaded=true;eternal.render();render();showError();}catch(e){showError(e.message);}}
 async function send(){if(busy||!input.value.trim())return;busy=true;showError();controls();try{draft??=crypto.randomUUID();const r=await request('/api/notes',{method:'POST',body:JSON.stringify({body:input.value,id:draft})});if(!r.ok)throw Error('Could not save. Your note is still here. Try again.');if(disposed)return;input.value='';draft=null;lastSync=Date.now();await load();$('#note-list').scrollTo({top:0,behavior:'smooth'});input.disabled=false;input.focus();}catch(e){showError(e.message);}finally{busy=false;if(!disposed){controls();render();}}}
 async function act(event){const button=event.target.closest('button'),li=button?.closest('li');if(!li)return;if(button.classList.contains('order-notes'))return beginOrder();const id=li.dataset.id;if(extending.has(id)||orderUntil||savingOrder)return;const extra=button.dataset.day==='1',scheduled=occurrences(schedules,Date.now()+offset,adjustments).find(n=>n.id===id);if(!button.classList.contains('delete')&&!extra)return;if(!extra&&!await confirmDelete(scheduled?'REMOVE THIS ETERNAL NOTE FOR TODAY?':'DELETE THIS NOTE?',confirmController.signal))return;if(disposed)return;extending.add(id);render();try{const r=await request(scheduled?'/api/eternal':extra?'/api/notes':'/api/notes?id='+encodeURIComponent(id),scheduled?{method:'PATCH',body:JSON.stringify(extra?{id:scheduled.eternalId,occurrenceId:id,days:1}:{id:scheduled.eternalId,dismiss:true})}:extra?{method:'PATCH',body:JSON.stringify({id,days:1})}:{method:'DELETE'});const result=await r.json();if(!r.ok)throw Error(result.error||'Could not save. Try again.');if(disposed)return;lastSync=Date.now();if(scheduled)await load();else if(extra){offset=result.serverNow-Date.now();notes=notes.map(n=>n.id===id?{...n,expiresAt:result.expiresAt}:n);}else notes=notes.filter(n=>n.id!==id);showError();}catch(e){showError(e.message);}finally{extending.delete(id);render();}}
 input.addEventListener('input',()=>{draft=null;controls();});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send();}});$('.composer-wrap>form').addEventListener('submit',e=>{e.preventDefault();send();});list.addEventListener('click',act);
 list.addEventListener('click',selectNote);list.addEventListener('keydown',selectNote);
 let refreshPending=false;const refresh=()=>{if(visible&&!document.hidden&&!refreshPending){refreshPending=true;load().finally(()=>{refreshPending=false;});}},visibility=event=>{visible=event.detail;if(visible){render();refresh();}else fortuna.close();};document.addEventListener('visibilitychange',refresh);window.addEventListener('focus',refresh);window.addEventListener('temponotes-visibility',visibility);const sync=setInterval(refresh,10000),clock=setInterval(render,1000);render();load();
 return ()=>{disposed=true;confirmController.abort();clearTimeout(orderTimer);eternal.dispose();fortuna.dispose();stopLocked();clearInterval(sync);clearInterval(clock);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',refresh);window.removeEventListener('temponotes-visibility',visibility);root.replaceChildren();nodes.clear();notes=[];schedules=[];};
}
