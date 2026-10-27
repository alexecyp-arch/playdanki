(()=>{'use strict';
const leavesKey='danki:leaves:v1';let leavesEnabled=true;
function readLeaves(){try{return localStorage.getItem(leavesKey)!=='off';}catch{return leavesEnabled;}}
function applyLeaves(on=readLeaves()){leavesEnabled=on;document.documentElement.dataset.dankiLeaves=on?'on':'off';const b=document.querySelector('#leaves-toggle');if(b){b.setAttribute('aria-pressed',String(on));b.title=on?'LEAVES ON':'LEAVES OFF';}document.dispatchEvent?.(new Event('danki-leaves-change'));}
const key='danki:theme:v1',valid=v=>v==='indigo'?'indigo':'charcoal';
function apply(value){const theme=valid(value);document.documentElement.dataset.dankiTheme=theme;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='charcoal'?'#18191c':'#071e48';for(const b of document.querySelectorAll('[data-theme-choice]'))b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme));}
function read(){try{return localStorage.getItem(key);}catch{return 'charcoal';}}
apply(read());applyLeaves();document.addEventListener('DOMContentLoaded',()=>{apply(read());applyLeaves();});
document.addEventListener('click',event=>{if(!event.target.closest?.('#leaves-toggle'))return;const on=!leavesEnabled;try{localStorage.setItem(leavesKey,on?'on':'off');}catch{}applyLeaves(on);});
document.addEventListener('click',event=>{const button=event.target.closest?.('[data-theme-choice]');if(!button)return;const theme=valid(button.dataset.themeChoice);try{localStorage.setItem(key,theme);}catch{}apply(theme);});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(read());if(event.key===leavesKey||event.key===null)applyLeaves();});
})();
