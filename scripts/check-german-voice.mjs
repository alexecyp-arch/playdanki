import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../src/german-voice.js',import.meta.url),'utf8');
const google={name:'Google Deutsch',lang:'de-DE',localService:false},robot={name:'Microsoft Hedda Desktop',lang:'de-DE',localService:true},natural={name:'Microsoft Katja Online (Natural)',lang:'de-DE',localService:false};
function app({stored='off',voices=[robot,google],supported=true}={}){const events=new Map(),winEvents=new Map(),synthEvents=new Map(),buttons=new Map(),attrs={},values=new Map([['danki:voice:v1',stored]]),spoken=[],span={},game={hidden:false},classes=new Set();let frame=0,queued=null,observer;
 const button={dataset:{},querySelector:()=>span,setAttribute:(k,v)=>attrs[k]=v,addEventListener:(k,fn)=>buttons.set(k,fn)};
 const document={hidden:false,body:{classList:{contains:c=>classes.has(c)}},getElementById:id=>id==='voice-toggle'?button:game,addEventListener:(k,fn)=>events.set(k,fn)};
 const synth={getVoices:()=>voices,addEventListener:(k,fn)=>synthEvents.set(k,fn),cancel(){this.cancels=(this.cancels||0)+1},speak(u){spoken.push(u);u.onstart?.()},resume(){this.paused=false}};
 const window={addEventListener:(k,fn)=>winEvents.set(k,fn),...(supported?{speechSynthesis:synth,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}}:{})};
 vm.runInNewContext(source,{document,window,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,localStorage:{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},requestAnimationFrame:fn=>{queued=fn;return ++frame},cancelAnimationFrame:()=>queued=null,MutationObserver:class{constructor(fn){observer=fn}observe(){}}});
 return {button,attrs,values,span,spoken,synth,window,document,game,classes,card:(text,id='words:1:0',lang='de')=>events.get('danki-card-voice')({detail:{text,id,lang}}),click:()=>buttons.get('click')(),tick:()=>{const fn=queued;queued=null;fn?.()},event:(type,e)=>events.get(type)?.(e),win:(type,e)=>winEvents.get(type)?.(e),voices:next=>{voices=next;synthEvents.get('voiceschanged')()},bodyChanged:()=>observer()};}
const a=app();a.card('der Baum');a.tick();assert.equal(a.spoken.length,0);a.click();a.tick();assert.equal(a.spoken.length,0,'Turning voice on does not replay the displayed card');
a.card('das Haus','words:1:1');a.tick();assert.equal(a.spoken.length,1);assert.equal(a.spoken[0].voice,google);assert.equal(a.values.get('danki:voice:v1'),'on');
a.card('das Haus','words:1:1');a.tick();assert.equal(a.spoken.length,1,'Same-card refresh stays silent');
for(const overlay of ['notes-open','atlas-open','weight-open','timebox-open']){
 a.classes.add(overlay);a.bodyChanged();a.card('');a.tick();
 a.classes.clear();a.bodyChanged();a.event('pointerdown',{isTrusted:true});a.card('das Haus','words:1:1');a.tick();
 assert.equal(a.spoken.length,1,'Returning from '+overlay+' never repeats the unchanged card, even after a blank render');
}
for(let i=0;i<3;i++){a.document.hidden=true;a.event('visibilitychange',{});a.document.hidden=false;a.event('visibilitychange',{});a.event('keydown',{isTrusted:true});a.card('das Haus','words:1:1');a.voices([google]);a.tick();}
assert.equal(a.spoken.length,1,'Alt-Tab, generic gestures and voice updates cannot request speech');
a.card('neu','words:1:2');a.card('neuer','words:1:3');a.tick();assert.equal(a.spoken.at(-1).text,'neuer');assert.equal(a.spoken.length,2);
a.click();a.click();a.tick();assert.equal(a.spoken.length,2,'OFF/ON stays silent until the next card change');
a.card('Ich lese.','sentences:1:1');a.tick();assert.equal(a.spoken.length,3);
a.spoken.at(-1).onerror({error:'network'});a.event('pointerdown',{isTrusted:true});a.card('');a.card('Ich lese.','sentences:1:1');a.voices([google]);a.tick();assert.equal(a.spoken.length,3,'A speech failure cannot trigger replay on return');

const b=app({stored:'on',voices:[google,natural,robot]});b.card('initial');b.event('pointerdown',{isTrusted:true});b.tick();assert.equal(b.spoken.length,0,'First page load is silent');
b.card('new card','words:1:1');b.tick();assert.equal(b.spoken[0].voice,natural);
b.classes.add('notes-open');b.bodyChanged();b.card('changed while hidden','words:1:2');b.tick();b.classes.clear();b.bodyChanged();b.event('pointerdown',{isTrusted:true});b.card('changed while hidden','words:1:2');b.tick();assert.equal(b.spoken.length,1,'Hidden updates are not spoken when returning');
b.card('changed visibly','words:1:3');b.tick();assert.equal(b.spoken.length,2);
b.win('danki-auth-clearing');b.card('account restored','words:1:20');b.tick();assert.equal(b.spoken.length,2,'Account restore is a silent baseline');

const c=app({stored:'on',voices:[]});c.card('initial');c.event('pointerdown',{isTrusted:true});c.card('Guten Morgen','words:1:1');c.tick();assert.equal(c.spoken.length,0);c.voices([google]);c.tick();assert.equal(c.spoken.length,1,'A real new-card request can wait for browser voices');c.voices([google]);c.tick();assert.equal(c.spoken.length,1);
const hidden=app({stored:'on',voices:[]});hidden.card('initial');hidden.event('pointerdown',{isTrusted:true});hidden.card('pending new card','words:1:1');hidden.tick();hidden.classes.add('notes-open');hidden.bodyChanged();hidden.classes.clear();hidden.voices([google]);hidden.tick();assert.equal(hidden.spoken.length,0,'Leaving cancels delayed speech requests');
const d=app({supported:false});assert(d.button.disabled);d.click();assert.equal(d.spoken.length,0);
for(const [lang,text,tag]of [['de','Guten Morgen.','de-DE'],['fr','Bonjour tout le monde.','fr-FR'],['es','Buenos días.','es-ES'],['it','Buongiorno a tutti.','it-IT'],['el','Καλημέρα σας.','el-GR'],['ja','おはようございます。','ja-JP'],['ko','안녕하세요.','ko-KR']]){
 const naturalVoice={name:'Natural '+lang,lang:tag,localService:false},v=app({stored:'on',voices:[{name:'Older '+lang,lang:tag,localService:true},naturalVoice]});
 v.card('initial',lang+':1:0',lang);v.event('pointerdown',{isTrusted:true});v.card(text,lang+':1:1',lang);v.tick();assert.equal(v.spoken.length,1);assert.equal(v.spoken[0].voice,naturalVoice);assert.equal(v.spoken[0].lang,tag);
 v.card('');v.card(text,lang+':1:1',lang);v.event('keydown',{isTrusted:true});v.tick();assert.equal(v.spoken.length,1);
}
const missing=app({stored:'on',voices:[google]});missing.card('initial','greek:1:0','el');missing.event('pointerdown',{isTrusted:true});missing.card('Καλημέρα','greek:1:1','el');missing.tick();assert.equal(missing.spoken.length,0,'No wrong-language fallback');
console.log('Speech checks passed: card-change-only speech for all seven languages; no initial-load, overlay return, Alt-Tab, gesture, blank-render, error, auth, voice-list or toggle replay; delayed voices and natural voice choice preserved.');