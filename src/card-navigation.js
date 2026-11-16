(()=>{'use strict';
 const controls='button,a,input,textarea,select,summary,[contenteditable="true"],.games-menu,.navigation,#account-bar,.tracker,#tracker,#history,#stats,[role="dialog"]';
 function canTap(event){return !event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&event.button===0&&matchMedia('(pointer:coarse),(max-width:600px)').matches&&!event.target.closest?.(controls)&&!window.getSelection()?.toString();}
 function install({next,previous,enabled}){document.getElementById('previous-card').addEventListener('click',previous);document.addEventListener('click',event=>{if(enabled()&&canTap(event))next();},true);}
 window.StudyNavigation={canTap,install};
})();

(()=>{'use strict';const memory=new Map();
function load(key,size,start=0){const k='repetition:'+key;let v;try{v=JSON.parse(localStorage.getItem(k));}catch{}v=v||memory.get(k);if(!v||v.v!==1||v.size!==size||!Array.isArray(v.queue)||!v.queue.length||v.queue.length>size*4||v.queue.some(n=>!Number.isInteger(n)||n<0||n>=size)||!Number.isSafeInteger(v.steps)||!Number.isInteger(v.base)||v.base<0||v.base>=size)v={v:1,size,steps:0,base:start%size,queue:[],easy:{}};v.easy=v.easy||{};fill(v);return v;}
function fill(s){while(s.queue.length<s.size){const id=s.base;s.base=(s.base+1)%s.size;if((s.easy[id]||0)>s.steps+s.queue.length+1)continue;s.queue.push(id);}}
function save(key,s){memory.set('repetition:'+key,s);try{localStorage.setItem('repetition:'+key,JSON.stringify(s));document.dispatchEvent(new Event('danki-progress'));try{if(parent!==window)parent.document.dispatchEvent(new Event('danki-progress'));}catch{}}catch{}}
function current(key,size,start=0){return load(key,size,start).queue[0];}
function advance(key,size,rating,start=0){const s=load(key,size,start),id=s.queue.shift();s.steps++;if(rating==='easy'){s.easy[id]=s.steps+size+1;s.queue=s.queue.filter(n=>n!==id);}if(rating==='hard'){const span=s.queue.length;s.queue.splice(Math.floor(span*2/3),0,id);s.queue.splice(Math.floor(span/3),0,id);}fill(s);for(const id of Object.keys(s.easy))if(s.easy[id]<=s.steps)delete s.easy[id];save(key,s);return s;}
function buttons(next,enabled){const box=document.createElement('div');document.body.classList.add('repetition-enabled');box.id='repetition-controls';box.className='repeat-controls';for(const [rating,text]of [['hard','VERY HARD +3'],['easy','EASY']]){const b=document.createElement('button');b.type='button';b.className='repeat-'+rating;b.textContent=text;b.addEventListener('click',()=>{if(enabled()){b.blur();next(rating);}});box.append(b);}document.body.append(box);return show=>{box.hidden=!show;document.body.classList.toggle('repetition-enabled',show);};}
window.DankiRepetition={current,advance,buttons,load};})();
