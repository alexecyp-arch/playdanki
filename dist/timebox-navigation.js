// Keep one private, same-origin timebox page in memory while its owner plays.
(()=>{'use strict';
const link=document.querySelector('.timebox-link');if(!link)return;
let uid=null,frame=null,shown=false,returnUrl=location.pathname+location.search+location.hash,gameTitle=document.title;
const style=document.createElement('style');style.textContent='#private-timebox-frame{position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:#071e48}#private-timebox-frame[hidden]{display:none}body.timebox-open{overflow:hidden}';document.head.append(style);
function visibility(){if(!frame)return;frame.hidden=!shown;frame.contentWindow?.postMessage({type:'danki-timebox-visibility',visible:shown},location.origin);}
function prepare(){if(frame)return;frame=document.createElement('iframe');frame.id='private-timebox-frame';frame.title='Your private timebox';frame.hidden=true;frame.src='/timebox/?v=2eceba27af97';frame.addEventListener('load',visibility);document.body.append(frame);visibility();}
function display(open){if(open)window.dispatchEvent(new CustomEvent('danki-view-opening',{detail:'timebox'}));shown=open;document.body.classList.toggle('timebox-open',open);document.title=open?'TIMEBOX':gameTitle;visibility();if(open)frame?.contentWindow?.focus();else link.focus({preventScroll:true});}
window.addEventListener('danki-auth-clearing',()=>{frame?.remove();frame=null;uid=null;});
window.addEventListener('danki-auth',event=>{
 const next=event.detail||null;if(next===uid&&frame)return;
 // Remove the entire old document, listeners and timebox memory before changing owners.
 frame?.remove();frame=null;uid=next;if(uid||shown)prepare();
});
link.addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!uid)return;
 event.preventDefault();returnUrl=location.pathname+location.search+location.hash;gameTitle=document.title;prepare();history.pushState({privateTimebox:true},'','/timebox/');display(true);
});
window.addEventListener('danki-private-open',event=>{if(event.detail?.view!=='timebox'||!uid)return;returnUrl=event.detail.returnUrl;gameTitle=event.detail.gameTitle;prepare();history.pushState(null,'','/timebox/');display(true);});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
 if(event.data?.type==='danki-timebox-open-notes'){if(uid&&shown)window.dispatchEvent(new CustomEvent('danki-private-open',{detail:{view:'notes',returnUrl,gameTitle}}));return;}
 if(event.data?.type!=='danki-timebox-return')return;
 if(shown){history.replaceState(null,'',returnUrl);display(false);}
});
window.addEventListener('danki-view-opening',event=>{if(event.detail==='timebox')return;shown=false;document.body.classList.remove('timebox-open');visibility();});
window.addEventListener('popstate',()=>{if(location.pathname.startsWith('/weight-tracker/')||location.pathname.startsWith('/data-atlas/')||location.pathname.startsWith('/temponotes/'))return;const open=location.pathname==='/timebox/';if(open)prepare();display(open);});
// A restored document must revalidate its owner before displaying any note memory.
window.addEventListener('pagehide',()=>{frame?.remove();frame=null;});
window.addEventListener('pageshow',event=>{if(event.persisted){location.reload();}});
})();
