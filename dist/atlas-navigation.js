// Keep the public atlas warm and preserve the game and atlas positions.
(()=>{'use strict';
const link=document.querySelector('.atlas-link');if(!link)return;
const routes=new Set(['/data-atlas/','/data-atlas/index.html','/data-atlas/europe-consumption.html','/data-atlas/ancient-ancestry.html','/data-atlas/average-home-size.html']);
let frame=null,shown=false,readyPath='/data-atlas/',atlasTitle='Data Atlas',returnUrl=location.pathname+location.search+location.hash,gameTitle=document.title;
const style=document.createElement('style');style.textContent='#data-atlas-frame{position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1001;background:#071e48}#data-atlas-frame[hidden]{display:none}body.atlas-open{overflow:hidden}';document.head.append(style);
function prepare(path='/data-atlas/'){
 if(frame)return;frame=document.createElement('iframe');frame.id='data-atlas-frame';frame.title='Data Atlas';frame.hidden=true;frame.src=path+'?v=192296d4da46';document.body.append(frame);
}
function display(open){shown=open;frame.hidden=!open;document.body.classList.toggle('atlas-open',open);if(open){window.dispatchEvent(new CustomEvent('danki-view-opening',{detail:'atlas'}));window.dispatchEvent(new Event('danki-atlas-opening'));document.title=atlasTitle;frame.contentWindow?.focus();}else{document.title=document.body.classList.contains('notes-open')?'Temponote':gameTitle;link.focus({preventScroll:true});}}
function navigate(path){frame.contentWindow.location.replace(path+'?v=192296d4da46');}
link.addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();returnUrl=location.pathname+location.search+location.hash;gameTitle=document.title;prepare();history.pushState({atlas:true},'',readyPath);display(true);
});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
 if(event.data?.type==='danki-atlas-return'&&shown){history.replaceState(null,'',returnUrl);display(false);}
 if(event.data?.type==='danki-atlas-navigate'&&shown&&routes.has(event.data.path)&&readyPath!==event.data.path){history.pushState({atlas:true},'',event.data.path);navigate(event.data.path);}
 if(event.data?.type==='danki-atlas-ready'&&routes.has(event.data.path)){
  const changed=readyPath!==event.data.path;readyPath=event.data.path;atlasTitle=typeof event.data.title==='string'?event.data.title:'Data Atlas';
  if(shown){if(changed&&location.pathname!==readyPath)history.replaceState({atlas:true},'',readyPath);document.title=atlasTitle;}
 }
});
window.addEventListener('popstate',()=>{
 const path=location.pathname;if(routes.has(path)){prepare(path);if(readyPath!==path)navigate(path);display(true);}
 else if(shown)display(false);
});
window.addEventListener('danki-view-opening',event=>{if(event.detail==='atlas')return;shown=false;frame.hidden=true;document.body.classList.remove('atlas-open');});
prepare();
})();
