(()=>{'use strict';
const leavesKey='danki:leaves:v1';let leavesEnabled=true;
function readLeaves(){try{return localStorage.getItem(leavesKey)!=='off';}catch{return leavesEnabled;}}
function applyLeaves(on=readLeaves()){leavesEnabled=on;document.documentElement.dataset.dankiLeaves=on?'on':'off';const b=document.querySelector('#leaves-toggle');if(b){b.setAttribute('aria-pressed',String(on));b.title=on?'LEAVES ON':'LEAVES OFF';}document.dispatchEvent?.(new Event('danki-leaves-change'));}
function apply(){document.documentElement.dataset.dankiTheme='charcoal';const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#141518';}
apply();applyLeaves();document.addEventListener('DOMContentLoaded',()=>{apply();applyLeaves();});

document.addEventListener('click',event=>{if(!event.target.closest?.('#leaves-toggle'))return;const on=!leavesEnabled;try{localStorage.setItem(leavesKey,on?'on':'off');}catch{}applyLeaves(on);});
window.addEventListener('storage',event=>{if(event.key===leavesKey||event.key===null)applyLeaves();});
})();

(()=>{const title=document.querySelector?.("title");if(!title)return;const caps=()=>{const text=title.textContent,upper=text.toUpperCase();if(text!==upper)title.textContent=upper;};caps();new MutationObserver(caps).observe(title,{childList:true,characterData:true,subtree:true});})();

(()=>{'use strict';
const pictures=DAILY_PICTURES,key='danki:pictures:v1',media=matchMedia('(max-width:700px)');let enabled=false,timer;
function read(){try{return localStorage.getItem(key)==='on';}catch{return enabled;}}
function apply(on=read()){
 enabled=on;const root=document.documentElement;root.dataset.dankiPictures=on?'on':'off';
 const button=document.querySelector('#background-toggle');if(button){button.setAttribute('aria-pressed',String(on));button.title=on?'PICTURES ON':'PICTURES OFF';}
 if(on){const now=new Date(),day=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000),item=pictures[((day%pictures.length)+pictures.length)%pictures.length];root.style.setProperty('--danki-picture','url("/wallpapers/'+item[media.matches?'mobile':'desktop']+'")');}else root.style.removeProperty('--danki-picture');
 clearTimeout(timer);const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);if(on)timer=setTimeout(()=>apply(),next-now+50);
}
apply();document.addEventListener('DOMContentLoaded',()=>apply());
document.addEventListener('click',event=>{if(!event.target.closest?.('#background-toggle'))return;const on=!enabled;try{localStorage.setItem(key,on?'on':'off');}catch{}apply(on);});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply();});window.addEventListener('focus',()=>apply());document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply();});media.addEventListener('change',()=>apply());
})();
