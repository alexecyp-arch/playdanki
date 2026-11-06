(()=>{'use strict';
const leavesKey='danki:leaves:v1';let leavesEnabled=true;
function readLeaves(){try{return localStorage.getItem(leavesKey)!=='off';}catch{return leavesEnabled;}}
function applyLeaves(on=readLeaves()){leavesEnabled=on;document.documentElement.dataset.dankiLeaves=on?'on':'off';const b=document.querySelector('#leaves-toggle');if(b){b.setAttribute('aria-pressed',String(on));b.title=on?'LEAVES ON':'LEAVES OFF';}document.dispatchEvent?.(new Event('danki-leaves-change'));}
function apply(){document.documentElement.dataset.dankiTheme='charcoal';const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#18191c';}
apply();applyLeaves();document.addEventListener('DOMContentLoaded',()=>{apply();applyLeaves();});

document.addEventListener('click',event=>{if(!event.target.closest?.('#leaves-toggle'))return;const on=!leavesEnabled;try{localStorage.setItem(leavesKey,on?'on':'off');}catch{}applyLeaves(on);});
window.addEventListener('storage',event=>{if(event.key===leavesKey||event.key===null)applyLeaves();});
})();

(()=>{const title=document.querySelector?.("title");if(!title)return;const caps=()=>{const text=title.textContent,upper=text.toUpperCase();if(text!==upper)title.textContent=upper;};caps();new MutationObserver(caps).observe(title,{childList:true,characterData:true,subtree:true});})();
