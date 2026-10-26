// Keep one private, same-origin notes page in memory while its owner plays.
(()=>{'use strict';
const link=document.querySelector('.temponotes-link');if(!link)return;
let uid=null,frame=null,shown=false,returnUrl=location.pathname+location.search+location.hash,gameTitle=document.title;
const style=document.createElement('style');style.textContent='#private-notes-frame{position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:#111225}#private-notes-frame[hidden]{display:none}body.notes-open{overflow:hidden}';document.head.append(style);
function visibility(){if(!frame)return;frame.hidden=!shown;frame.contentWindow?.postMessage({type:'danki-notes-visibility',visible:shown},location.origin);}
function prepare(){if(frame)return;frame=document.createElement('iframe');frame.id='private-notes-frame';frame.title='Your private Temponotes';frame.hidden=true;frame.src='/temponotes/?v=165ba0f69598';frame.addEventListener('load',visibility);document.body.append(frame);visibility();}
function display(open){if(open)window.dispatchEvent(new CustomEvent('danki-view-opening',{detail:'notes'}));shown=open;document.body.classList.toggle('notes-open',open);document.title=open?'Temponote':gameTitle;visibility();if(open)frame?.contentWindow?.focus();else link.focus({preventScroll:true});}
window.addEventListener('danki-auth-clearing',()=>{frame?.remove();frame=null;uid=null;});
window.addEventListener('danki-auth',event=>{
 const next=event.detail||null;if(next===uid&&frame)return;
 // Remove the entire old document, listeners and note memory before changing owners.
 frame?.remove();frame=null;uid=next;if(uid||shown)prepare();
});
link.addEventListener('click',event=>{
 if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!uid)return;
 event.preventDefault();returnUrl=location.pathname+location.search+location.hash;gameTitle=document.title;prepare();history.pushState({privateNotes:true},'','/temponotes/');display(true);
});
window.addEventListener('danki-private-open',event=>{if(event.detail?.view!=='notes'||!uid)return;returnUrl=event.detail.returnUrl;gameTitle=event.detail.gameTitle;prepare();history.pushState(null,'','/temponotes/');display(true);});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame?.contentWindow)return;
 if(event.data?.type==='danki-notes-open-timebox'){if(uid&&shown)window.dispatchEvent(new CustomEvent('danki-private-open',{detail:{view:'timebox',returnUrl,gameTitle}}));return;}
 if(event.data?.type!=='danki-notes-return')return;
 if(shown){history.replaceState(null,'',returnUrl);display(false);}
});
window.addEventListener('danki-view-opening',event=>{if(event.detail==='notes')return;shown=false;document.body.classList.remove('notes-open');visibility();});
window.addEventListener('danki-atlas-opening',()=>{shown=false;document.body.classList.remove('notes-open');visibility();});
window.addEventListener('popstate',()=>{if(location.pathname.startsWith('/timebox/')||location.pathname.startsWith('/data-atlas/')||location.pathname.startsWith('/weight-tracker/'))return;const open=location.pathname==='/temponotes/';if(open)prepare();display(open);});
// A restored document must revalidate its owner before displaying any note memory.
window.addEventListener('pagehide',()=>{frame?.remove();frame=null;});
window.addEventListener('pageshow',event=>{if(event.persisted){location.reload();}});
})();
