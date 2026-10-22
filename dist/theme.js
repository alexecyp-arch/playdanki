(()=>{'use strict';
const key='danki:theme:v1',valid=v=>v==='charcoal'?'charcoal':'indigo';
function apply(value){const theme=valid(value);document.documentElement.dataset.dankiTheme=theme;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='charcoal'?'#18191c':'#071e48';for(const b of document.querySelectorAll('[data-theme-choice]'))b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme));}
function read(){try{return localStorage.getItem(key);}catch{return 'indigo';}}
apply(read());document.addEventListener('DOMContentLoaded',()=>apply(read()));
document.addEventListener('click',event=>{const button=event.target.closest?.('[data-theme-choice]');if(!button)return;const theme=valid(button.dataset.themeChoice);try{localStorage.setItem(key,theme);}catch{}apply(theme);});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(read());});
})();
