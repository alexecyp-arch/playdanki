// Language-card speech uses only public deck text, never notes or account data.
(()=>{'use strict';
const button=document.getElementById('voice-toggle'),synth=window.speechSynthesis,key='danki:voice:v1';if(!button)return;
let enabled=false,unlocked=false,current=null,seen='',pending='',voice=null,frame=0,token=0,activeUtterance=null;
try{enabled=localStorage.getItem(key)==='on';}catch{}
const languages={de:['German','de-DE'],fr:['French','fr-FR'],es:['Spanish','es-ES'],it:['Italian','it-IT'],el:['Greek','el-GR'],ja:['Japanese','ja-JP'],ko:['Korean','ko-KR']};
const supported=!!synth&&typeof window.SpeechSynthesisUtterance==='function';
const identity=card=>card?card.lang+'|'+card.id+'|'+card.text:'';
function available(){const lang=current?.lang||'de';return supported?synth.getVoices().filter(v=>v.lang?.replace('_','-').toLowerCase().split('-')[0]===lang):[];}
function bestVoice(){return available().sort((a,b)=>rank(b)-rank(a))[0]||null;}
function rank(v){const name=v.name||'';return (/neural|natural|premium|enhanced/i.test(name)?1000:0)+(/google/i.test(name)?800:0)+(!v.localService?100:0)+(v.lang?.replace('_','-').toLowerCase()===languages[current?.lang||'de'][1].toLowerCase()?30:0)+(v.default?5:0);}
function sync(){button.disabled=!supported;button.setAttribute('aria-checked',String(enabled));button.querySelector('span').textContent=enabled?'ON':'OFF';button.dataset.voice=voice?.name||'';button.title=!supported?'Voice is unavailable in this browser':voice?languages[current?.lang||'de'][0]+' voice: '+voice.name:'Waiting for a '+languages[current?.lang||'de'][0]+' voice';}
function visible(){return current?.text&&!document.hidden&&!document.getElementById('game').hidden&&!['notes-open','atlas-open','weight-open'].some(c=>document.body.classList.contains(c));}
function stop(){token++;pending='';if(frame)cancelAnimationFrame(frame);frame=0;activeUtterance=null;button.dataset.speaking='false';if(supported)synth.cancel();}
function play(){
 frame=0;if(!pending||pending!==identity(current))return;if(!enabled||!unlocked||!visible()){stop();return;}voice=bestVoice();sync();if(!voice)return;
 const ticket=++token;synth.cancel();const utterance=new SpeechSynthesisUtterance(current.text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.96;utterance.pitch=1;utterance.volume=1;activeUtterance=utterance;pending='';
 utterance.onstart=()=>{if(ticket===token){button.dataset.speaking='true';delete button.dataset.error;}};
 utterance.onend=()=>{if(ticket===token){button.dataset.speaking='false';activeUtterance=null;}};
 utterance.onerror=event=>{if(ticket!==token)return;activeUtterance=null;button.dataset.speaking='false';if(!['canceled','interrupted'].includes(event.error)){button.dataset.error=event.error||'unavailable';button.title='Voice could not play. Try the next card.';}};
 try{if(synth.paused)synth.resume();synth.speak(utterance);}catch{button.dataset.error='unavailable';}
}
function schedule(){if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(play);}
button.addEventListener('click',()=>{if(!supported)return;unlocked=true;enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off');}catch{}sync();if(!enabled)stop();});
document.addEventListener('danki-card-voice',event=>{
 const next=event.detail,lang=next?.lang||'de';
 if(!next||typeof next.text!=='string'||!next.text.trim()||!Object.hasOwn(languages,lang)){current=null;stop();return;}
 const card={id:String(next.id),text:next.text,lang},id=identity(card),changed=!!seen&&seen!==id;
 current=card;voice=bestVoice();sync();if(seen===id)return;
 seen=id;stop();
 // The initial card and returning to an unchanged card are silent. Only a visible card change requests speech.
 if(changed&&enabled&&unlocked&&visible()){pending=id;schedule();}
});
// A gesture unlocks browser audio, but must never replay the current card.
function unlock(event){if(event.isTrusted)unlocked=true;}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',()=>stop());window.addEventListener('danki-auth-clearing',()=>{current=null;seen='';stop();});
window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{enabled=localStorage.getItem(key)==='on';}catch{enabled=false;}sync();if(!enabled)stop();});
new MutationObserver(()=>{if(!visible())stop();}).observe(document.body,{attributes:true,attributeFilter:['class']});
if(supported){synth.addEventListener('voiceschanged',()=>{voice=bestVoice();sync();if(pending&&enabled&&unlocked)schedule();});voice=bestVoice();}
sync();
})();
