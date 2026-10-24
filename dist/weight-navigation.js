// Keep one private, same-origin weight page in memory while its owner plays.
(()=>{'use strict';
const link=document.querySelector('.weight-link');if(!link)return;
let uid=null,frame=null,shown=false,returnUrl=location.pathname+location.search+location.hash,gameTitle=document.title;
const style=document.createElement('style');style.textContent='#private-weight-frame{position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:#071e48}#private-weight-frame[hidden]{display:none}body.weight-open{overflow:hidden}';document.head.append(style);
function visibility(){if(!frame)return;frame.hidden=!shown;frame.contentWindow?.postMessage({type:'danki-weight-visibility',visible:shown},location.origin);}
function prepare(){if(frame)return;frame=document.createElement('iframe');frame.id='private-weight-frame';frame.title='Your private weight tracker';frame.hidden=true;frame.src='/weight-tracker/?v=8e1a9a28795d';frame.addEventListener('load',visibility);document.body.append(frame);visibility();}
function display(open){if(open)window.dispatchEvent(new CustomEvent('danki-view-opening',{detail:'weight'}));shown=open;document.body.classList.toggle('weight-open',open);document.title=open?'WEIGHT TRACKER':gameTitle;visibility();if(open)frame?.contentWindow?.focus();else link.focus({preventScroll:true});}
window.addEventListener('danki-auth-clearing',()=>{frame?.remove();frame=null;uid=null;});
window.addEventListener('danki-auth',event=>{
 const next=event.detail||null;if(next===uid&&frame)return;
 // Remove the entire old document, listeners and weight memory before changing owners.
 frame?.remove();frame=null;uid=next;if(uid||shown)prepare();
});
link.addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!uid)return;
 event.preventDefault();returnUrl=location.pathname+location.search+location.hash;gameTitle=document.title;prepare();history.pushState({privateWeight:true},'','/weight-tracker/');display(true);
});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame?.contentWindow||event.data?.type!=='danki-weight-return')return;
 if(shown){history.replaceState(null,'',returnUrl);display(false);}
});
window.addEventListener('danki-view-opening',event=>{if(event.detail==='weight')return;shown=false;document.body.classList.remove('weight-open');visibility();});
window.addEventListener('popstate',()=>{if(location.pathname.startsWith('/data-atlas/')||location.pathname.startsWith('/temponotes/'))return;const open=location.pathname==='/weight-tracker/';if(open)prepare();display(open);});
// A restored document must revalidate its owner before displaying any note memory.
window.addEventListener('pagehide',()=>{frame?.remove();frame=null;});
window.addEventListener('pageshow',event=>{if(event.persisted){location.reload();}});
})();
