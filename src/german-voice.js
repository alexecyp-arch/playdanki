// Speech uses only public learning-card text, never notes or account data.
(()=>{'use strict';
const button=document.getElementById('voice-toggle'),synth=window.speechSynthesis,key='danki:voice:v1';if(!button)return;
const seenScopes=new Map();
let primed=false;
function prime(){if(primed||!enabled||!supported||!(/Android|iPhone|iPad|iPod/i.test(globalThis.navigator?.userAgent||'')))return;primed=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;synth.speak(u);if(synth.paused)synth.resume();}catch{}}
let enabled=false,unlocked=false,current=null,seen='',pending='',voice=null,frame=0,token=0,activeUtterance=null;
try{enabled=localStorage.getItem(key)==='on';}catch{}
const languages={en:['English','en-US'],de:['German','de-DE'],fr:['French','fr-FR'],es:['Spanish','es-ES'],it:['Italian','it-IT'],el:['Greek','el-GR'],ja:['Japanese','ja-JP'],ko:['Korean','ko-KR']};
const supported=!!synth&&typeof window.SpeechSynthesisUtterance==='function';
const identity=card=>card?(card.scope||'main')+'|'+card.lang+'|'+card.id+'|'+card.text:'';
function available(){const lang=current?.lang||'de';return supported?synth.getVoices().filter(v=>v.lang?.replace('_','-').toLowerCase().split('-')[0]===lang):[];}
function bestVoice(){return available().sort((a,b)=>rank(b)-rank(a))[0]||null;}
function rank(v){const name=v.name||'';return (/neural|natural|premium|enhanced/i.test(name)?1000:0)+(/google/i.test(name)?800:0)+(!v.localService?100:0)+(v.lang?.replace('_','-').toLowerCase()===languages[current?.lang||'de'][1].toLowerCase()?30:0)+(v.default?5:0);}
function sync(){button.disabled=!supported;button.setAttribute('aria-checked',String(enabled));button.querySelector('span').textContent=enabled?'ON':'OFF';button.dataset.voice=voice?.name||'';button.title=!supported?'Voice is unavailable in this browser':voice?languages[current?.lang||'de'][0]+' voice: '+voice.name:'Using the device '+languages[current?.lang||'de'][0]+' voice';}
function visible(){const area=current?.scope?.startsWith('embedded:')?document.getElementById('arithmetic-frame'):document.getElementById('game');return current?.text&&!document.hidden&&area&&!area.hidden&&!['notes-open','atlas-open','weight-open','timebox-open'].some(c=>document.body.classList.contains(c));}
function stop(){token++;pending='';if(frame)cancelAnimationFrame(frame);frame=0;activeUtterance=null;button.dataset.speaking='false';if(supported)synth.cancel();}
function play(){
 frame=0;if(!pending||pending!==identity(current))return;if(!enabled||!unlocked||!visible()){stop();return;}voice=bestVoice();sync();
 const ticket=++token;synth.cancel();pending='';
 // Short sentence-sized utterances avoid long-answer cutoffs on mobile engines.
 const chunks=[];let rest=current.text.trim();while(rest.length>200){let cut=rest.slice(0,200).search(/[.!?。！？]\s*[^.!?。！？]*$/);if(cut<50)cut=rest.lastIndexOf(' ',200);if(cut<1)cut=200;else if(/[.!?。！？]/.test(rest[cut]))cut++;chunks.push(rest.slice(0,cut).trim());rest=rest.slice(cut).trim();}if(rest)chunks.push(rest);
 const tag=voice?.lang||languages[current?.lang||'de'][1],chosen=voice;
 function speakNext(){if(ticket!==token||!visible()||!enabled)return;const value=chunks.shift();if(!value){button.dataset.speaking='false';activeUtterance=null;return;}
 const utterance=new SpeechSynthesisUtterance(value);if(chosen)utterance.voice=chosen;utterance.lang=tag;utterance.rate=.96;utterance.pitch=1;utterance.volume=1;activeUtterance=utterance;
 utterance.onstart=()=>{if(ticket===token){button.dataset.speaking='true';delete button.dataset.error;}};
 utterance.onend=()=>{if(ticket===token)speakNext();};
 utterance.onerror=event=>{if(ticket!==token)return;activeUtterance=null;button.dataset.speaking='false';if(!['canceled','interrupted'].includes(event.error)){button.dataset.error=event.error||'unavailable';button.title='Voice could not play. Try the next card.';}};
 try{if(synth.paused)synth.resume();synth.speak(utterance);}catch{button.dataset.error='unavailable';}
 }speakNext();
}
function schedule(){if(frame)cancelAnimationFrame(frame);if(globalThis.navigator?.userActivation?.isActive)play();else frame=requestAnimationFrame(play);}
button.addEventListener('click',()=>{if(!supported)return;unlocked=true;enabled=!enabled;try{localStorage.setItem(key,enabled?'on':'off');}catch{}sync();if(!enabled)stop();else prime();});
document.addEventListener('danki-card-voice',event=>{
 const next=event.detail,lang=next?.lang||'de';
 if(!next||typeof next.text!=='string'||!next.text.trim()||!Object.hasOwn(languages,lang)){current=null;stop();return;}
 const scope=next.scope||'main';if(scope.startsWith('embedded:')){const embed=document.getElementById('arithmetic-frame');if(!embed||next.sourceDocument!==embed.contentDocument)return;}
 const card={id:String(next.id),text:next.text,lang,scope},id=identity(card),previous=seenScopes.get(scope),changed=(!!previous&&previous!==id)||next.announce===true;
 current=card;voice=bestVoice();sync();if(previous===id)return;
 seen=id;seenScopes.set(scope,id);stop();
 // The initial card and returning to an unchanged card are silent. Only a visible card change requests speech.
 if(changed&&enabled&&unlocked&&visible()){pending=id;schedule();}
});
// A gesture unlocks browser audio, but must never replay the current card.
function unlock(event){if(event.isTrusted){unlocked=true;prime();}}
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock,{passive:true});
document.addEventListener('danki-voice-gesture',event=>{const embed=document.getElementById('arithmetic-frame');if(embed&&event.detail?.sourceDocument===embed.contentDocument&&event.detail.trusted){unlocked=true;prime();}});
window.addEventListener('danki-view-opening',()=>stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',()=>stop());window.addEventListener('danki-auth-clearing',()=>{current=null;seen='';seenScopes.clear();stop();});
window.addEventListener('storage',event=>{if(event.key!==key&&event.key!==null)return;try{enabled=localStorage.getItem(key)==='on';}catch{enabled=false;}sync();if(!enabled)stop();});
new MutationObserver(()=>{if(!visible())stop();}).observe(document.body,{attributes:true,attributeFilter:['class']});
if(supported){synth.addEventListener('voiceschanged',()=>{voice=bestVoice();sync();if(pending&&enabled&&unlocked)schedule();});voice=bestVoice();}
sync();
})();
