// German card speech uses only public deck text, never notes or account data.
(()=>{'use strict';
const button=document.getElementById('voice-toggle'),synth=window.speechSynthesis,key='danki:voice:v1';if(!button)return;
let enabled=false,unlocked=false,current=null,last='',voice=null,frame=0,token=0,activeUtterance=null;
try{enabled=localStorage.getItem(key)==='on';}catch{}
const supported=!!synth&&typeof window.SpeechSynthesisUtterance==='function';
function available(){return supported?synth.getVoices().filter(v=>/^de(?:[-_]|$)/i.test(v.lang)):[];}
function bestVoice(){return available().sort((a,b)=>rank(b)-rank(a))[0]||null;}
function rank(v){const name=v.name||'';return (/neural|natural|premium|enhanced/i.test(name)?1000:0)+(/google.*(deutsch|german)|google/i.test(name)?800:0)+(!v.localService?100:0)+(/^de[-_]DE$/i.test(v.lang)?30:0)+(v.default?5:0);}
function sync(){button.disabled=!supported;button.setAttribute('aria-checked',String(enabled));button.querySelector('span').textContent=enabled?'ON':'OFF';button.dataset.voice=voice?.name||'';button.title=!supported?'Voice is unavailable in this browser':voice?'German voice: '+voice.name:'Waiting for a German voice';}
function visible(){return current?.text&&!document.hidden&&!document.getElementById('game').hidden&&!['notes-open','atlas-open','weight-open'].some(c=>document.body.classList.contains(c));}
function stop(){token++;if(frame)cancelAnimationFrame(frame);frame=0;last='';activeUtterance=null;button.dataset.speaking='false';if(supported)synth.cancel();}
function play(){frame=0;if(!enabled||!unlocked||!visible()){stop();return;}voice=bestVoice();sync();if(!voice){stop();return;}const id=current.id+'|'+current.text;if(last===id)return;const ticket=++token;synth.cancel();const utterance=new SpeechSynthesisUtterance(current.text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.96;utterance.pitch=1;utterance.volume=1;activeUtterance=utterance;last=id;
 utterance.onstart=()=>{if(ticket===token){button.dataset.speaking='true';delete button.dataset.error;}};
 utterance.onend=()=>{if(ticket===token){button.dataset.speaking='false';activeUtterance=null;}};
 utterance.onerror=event=>{if(ticket!==token)return;activeUtterance=null;button.dataset.speaking='false';if(!['canceled','interrupted'].includes(event.error)){last='';button.dataset.error=event.error||'unavailable';button.title='Voice could not play. Tap VOICE OFF, then ON to retry.';}};
 try{if(synth.paused)synth.resume();synth.speak(utterance);}catch{last='';button.dataset.error='unavailable';}
}
function schedule(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(play);}
button.addEventListener('click',()=>{if(!supported)return;unlocked=true;enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off');}catch{}sync();if(enabled)play();else stop();});
document.addEventListener('danki-card-voice',event=>{const next=event.detail;if(!next||typeof next.text!=='string'||!next.text.trim()){current=null;stop();return;}if(current?.id!==next.id||current.text!==next.text)stop();current={id:String(next.id),text:next.text};schedule();});
// Browsers require a real tap/key after a page is opened before speaking.
function unlock(event){if(!event.isTrusted)return;unlocked=true;if(enabled)schedule();}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);window.addEventListener('danki-auth-clearing',()=>{current=null;stop();});
window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{enabled=localStorage.getItem(key)==='on';}catch{enabled=false;}sync();if(!enabled)stop();});
new MutationObserver(()=>{if(!visible())stop();}).observe(document.body,{attributes:true,attributeFilter:['class']});
if(supported){synth.addEventListener('voiceschanged',()=>{voice=bestVoice();sync();if(enabled&&unlocked&&current)schedule();});voice=bestVoice();}
sync();
})();
