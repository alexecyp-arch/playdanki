// Standalone notes/timebox pages keep one owner-scoped peer document warm.
export function initStandaloneNavigation(){'use strict';if(parent!==window)return;
 const notes=location.pathname.startsWith('/temponotes/'),view=notes?'notes':'timebox',peer=notes?'timebox':'notes',ownPath=notes?'/temponotes/':'/timebox/',peerPath=notes?'/timebox/':'/temponotes/',link=document.querySelector('.page-switch');if(!link)return;
 const title=notes?'Temponote':'TIMEBOX',peerTitle=notes?'TIMEBOX':'Temponote';let uid=null,frame=null,shown=false;
 const style=document.createElement('style');style.textContent='#private-peer-frame{position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:#18191c}#private-peer-frame[hidden]{display:none}';document.head.append(style);
 function visibility(){window.dispatchEvent(new CustomEvent('temponotes-visibility',{detail:!shown}));frame?.contentWindow?.postMessage({type:'danki-'+peer+'-visibility',visible:shown},location.origin);}
 function prepare(){if(frame||!uid)return;frame=document.createElement('iframe');frame.id='private-peer-frame';frame.title=peerTitle;frame.hidden=true;frame.src=peerPath+'?v=3271791762a0';frame.addEventListener('load',visibility);document.body.append(frame);}
 function display(open){shown=open;if(frame)frame.hidden=!open;document.title=open?peerTitle:title;visibility();if(open)frame?.contentWindow?.focus();else link.focus({preventScroll:true});}
 window.addEventListener('danki-private-auth-clearing',()=>{frame?.remove();frame=null;uid=null;if(shown){history.replaceState(null,'',ownPath);display(false);}});
 window.addEventListener('danki-private-auth',event=>{const next=event.detail||null;if(next===uid&&frame)return;frame?.remove();frame=null;uid=next;prepare();});
 link.addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!uid)return;event.preventDefault();prepare();history.pushState(null,'',peerPath);display(true);});
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame?.contentWindow||!uid)return;if(event.data?.type==='danki-notes-open-weight'){location.assign('/weight-tracker/');return;}if(event.data?.type==='danki-'+peer+'-open-'+view){history.pushState(null,'',ownPath);display(false);}else if(event.data?.type==='danki-'+peer+'-return'){location.assign('/');}});
 window.addEventListener('popstate',()=>{const open=location.pathname.startsWith(peerPath);if(open)prepare();display(open);});window.addEventListener('pagehide',()=>{frame?.remove();frame=null;});
}
