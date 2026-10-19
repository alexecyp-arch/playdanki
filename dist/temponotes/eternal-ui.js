import {weekdays,validSchedule} from './eternal.mjs';
export function mountEternal(root,request,{getSchedules,onChange}){
 const wrapper=document.createElement('aside');wrapper.className='eternal-area';
 wrapper.innerHTML=`<button id="eternal-toggle" type="button" aria-expanded="false" aria-controls="eternal-panel">ETERNAL NOTES ⌃</button><section id="eternal-panel" aria-label="Eternal notes" hidden><header><strong>ETERNAL NOTES</strong><button class="eternal-close" type="button" aria-label="Close eternal notes">×</button></header><div class="eternal-list"></div><form><label class="sr-only" for="eternal-body">Permanent note</label><textarea id="eternal-body" rows="2" maxlength="10000" placeholder="Write a permanent note…"></textarea><div class="eternal-days" role="group" aria-label="Days to appear"></div><div class="eternal-actions"><button type="button" class="eternal-cancel" hidden>Cancel</button><button class="eternal-save" type="submit">Save</button></div></form><p class="error" role="alert" hidden></p></section>`;root.append(wrapper);
 const $=selector=>wrapper.querySelector(selector),toggle=$('#eternal-toggle'),panel=$('#eternal-panel'),input=$('textarea'),days=$('.eternal-days'),list=$('.eternal-list'),error=$('.error');
 let selected=new Set(),editing=null,draft=null,busy=false,disposed=false;
 for(const day of [1,2,3,4,5,6,0]){const button=document.createElement('button');button.type='button';button.textContent=weekdays[day];button.dataset.day=day;button.setAttribute('aria-pressed','false');days.append(button);}
 const controls=()=>{for(const b of panel.querySelectorAll('button'))if(!b.classList.contains('eternal-close'))b.disabled=busy;input.disabled=busy;$('.eternal-save').disabled=busy||!validSchedule(input.value,[...selected]);for(const b of days.children)b.setAttribute('aria-pressed',String(selected.has(Number(b.dataset.day))));};
 function reset(){input.value='';selected.clear();editing=draft=null;$('.eternal-cancel').hidden=true;$('.eternal-save').textContent='Save';controls();}
 function showError(message=''){if(disposed)return;error.textContent=message;error.hidden=!message;}
 function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');}
 function render(){
  if(disposed||panel.hidden)return;list.replaceChildren();
  for(const note of getSchedules().slice().sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id))){
   const row=document.createElement('article');row.className='eternal-row';row.dataset.id=note.id;
   const body=document.createElement('p'),dayText=document.createElement('small'),actions=document.createElement('div');body.textContent=note.body;dayText.textContent=[1,2,3,4,5,6,0].filter(d=>note.days.includes(d)).map(d=>weekdays[d]).join(' · ');
   const edit=document.createElement('button'),remove=document.createElement('button');edit.type=remove.type='button';edit.textContent='Edit';edit.dataset.action='edit';remove.textContent='×';remove.dataset.action='delete';remove.setAttribute('aria-label','Delete permanent note: '+note.body);actions.append(edit,remove);row.append(body,dayText,actions);list.append(row);
  }controls();
 }
 toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden){render();input.focus();}});
 $('.eternal-close').addEventListener('click',()=>{close();toggle.focus();});$('.eternal-cancel').addEventListener('click',()=>{reset();showError();});
 input.addEventListener('input',()=>{draft=null;controls();});days.addEventListener('click',event=>{const b=event.target.closest('[data-day]');if(!b||busy)return;const d=Number(b.dataset.day);selected.has(d)?selected.delete(d):selected.add(d);draft=null;controls();});
 $('form').addEventListener('submit',async event=>{event.preventDefault();if(busy||!validSchedule(input.value,[...selected]))return;busy=true;controls();showError();try{draft??=crypto.randomUUID();const r=await request('/api/eternal',{method:editing?'PATCH':'POST',body:JSON.stringify({id:editing||draft,body:input.value,days:[...selected]})}),data=await r.json();if(!r.ok)throw Error(data.error||'Could not save. Try again.');if(disposed)return;reset();await onChange();}catch(e){showError(e.message);}finally{busy=false;if(!disposed)controls();}});
 list.addEventListener('click',async event=>{const b=event.target.closest('[data-action]'),row=b?.closest('[data-id]');if(!row||busy)return;const note=getSchedules().find(n=>n.id===row.dataset.id);if(!note)return;if(b.dataset.action==='edit'){editing=note.id;draft=null;input.value=note.body;selected=new Set(note.days);$('.eternal-cancel').hidden=false;$('.eternal-save').textContent='Save changes';showError();controls();input.focus();return;}
  busy=true;controls();showError();try{const r=await request('/api/eternal?id='+encodeURIComponent(note.id),{method:'DELETE'}),data=await r.json();if(!r.ok)throw Error(data.error||'Could not delete. Try again.');if(editing===note.id)reset();await onChange();}catch(e){showError(e.message);}finally{busy=false;if(!disposed)controls();}
 });
 const outside=event=>{if(!wrapper.contains(event.target))close();},escape=event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close();toggle.focus();}};
 document.addEventListener('click',outside);document.addEventListener('keydown',escape);controls();
 return {render,dispose(){disposed=true;document.removeEventListener('click',outside);document.removeEventListener('keydown',escape);wrapper.remove();}};
}
