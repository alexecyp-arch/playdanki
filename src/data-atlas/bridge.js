(()=>{'use strict';
const embedded=parent!==window;
function tell(type,extra={}){if(embedded)parent.postMessage({type,...extra},location.origin);}
const route=location.pathname;
tell('danki-atlas-ready',{path:route,title:document.title});
for(const link of document.querySelectorAll('.dataset-link'))link.addEventListener('click',event=>{
 if(!embedded||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const target=new URL(link.href);if(target.origin!==location.origin)return;
 event.preventDefault();tell('danki-atlas-navigate',{path:target.pathname});
});
document.querySelector('.danki-return').addEventListener('click',event=>{
 if(!embedded||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();tell('danki-atlas-return');
});
})();
