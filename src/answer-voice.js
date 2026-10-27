// Only public game answers cross into the same-origin main voice controller.
(()=>{'use strict';
function host(){try{return parent!==window&&parent.document.getElementById('arithmetic-frame')?.contentDocument===document?parent:null;}catch{return null;}}
window.DankiAnswerVoice=(scope,id,text,announce=false)=>{const h=host();if(!h)return;h.document.dispatchEvent(new h.CustomEvent('danki-card-voice',{detail:{scope:'embedded:'+scope,id:String(id),text:String(text),lang:'en',announce,sourceDocument:document}}));};
for(const type of ['pointerdown','keydown'])document.addEventListener(type,event=>{const h=host();if(h&&event.isTrusted)h.document.dispatchEvent(new h.CustomEvent('danki-voice-gesture',{detail:{sourceDocument:document,trusted:true}}));},{capture:true,passive:true});
})();
