import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import * as cryptoHelpers from '../src/temponotes/locked-crypto.mjs';
class El extends EventTarget{
 hidden=false;value='';children=[];dataset={};scrollTop=99;selectionStart=0;selectionEnd=0;
 setAttribute(){}append(e){this.children.push(e)}replaceChildren(){this.children=[]}
 querySelector(s){return elements.get(s)}querySelectorAll(){return []}
 focus(){document.activeElement=this}setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b}remove(){}
}
const elements=new Map();
for(const s of ['#locked-toggle','#locked-panel','.locked-login','#locked-password','.locked-content','#locked-text','.locked-tabs','.locked-change-form','.locked-status','.locked-open','.locked-add','.locked-password-toggle','.locked-delete','.locked-close','#locked-old-password','#locked-new-password','.note-tools'])elements.set(s,new El());
elements.get('#locked-panel').hidden=true;elements.get('.locked-content').hidden=true;
const document=new El();document.createElement=()=>new El();const window=new El();let notify;
const data=cryptoHelpers.emptyLockedNotes();data.tabs[0].text='FIRST LINE\nLAST LINE';
const envelope=await cryptoHelpers.sealNotes(data,await cryptoHelpers.createLock('=='),'alice');
let cloud={value:envelope,ready:true,revision:1},saves=0,active=0,maxActive=0;
const started=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const until=async test=>{const end=Date.now()+2500;while(!test()){assert(Date.now()<end,'Timed out');await delay(10);}};
const store={uid:'alice',subscribe(fn){notify=fn;fn(cloud);return()=>{}},async save(){saves++;return 2}};
let source=await fs.readFile(new URL('../src/temponotes/locked-ui.js',import.meta.url),'utf8');
source=source.replace(/^import .*;\r?\n/gm,'').replace('export function mountLocked','function mountLocked');
const context=vm.createContext({document,window,AbortController,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn(),crypto,structuredClone,confirmDelete:async()=>true,...cryptoHelpers,
 unlockNotes:async(...args)=>{started.push(args[1]);active++;maxActive=Math.max(maxActive,active);try{await delay(100);return await cryptoHelpers.unlockNotes(...args);}finally{active--;}}
});
vm.runInContext(source,context);const dispose=context.mountLocked(new El(),store);
const toggle=elements.get('#locked-toggle'),password=elements.get('#locked-password'),content=elements.get('.locked-content'),panel=elements.get('#locked-panel');
const input=value=>{password.value=value;password.dispatchEvent(new Event('input'));};
const close=async()=>{elements.get('.locked-close').dispatchEvent(new Event('click'));await until(()=>panel.hidden);};
const open=()=>toggle.dispatchEvent(new Event('click'));
open();input('wrong');await until(()=>active===0);assert(content.hidden);assert.equal(password.value,'wrong');
input('======');await until(()=>active===0);assert(content.hidden,'A pasted nonmatching password does not try or accept prefixes');
assert(!started.includes('=='));
input('');started.length=0;
password.dispatchEvent(Object.assign(new Event('keydown'),{key:'=',code:'Equal'}));
for(let n=1;n<=12;n++)input('='.repeat(n));
assert.deepEqual(started,['=','=='],'Both entered candidates start immediately, without waiting for typing to stop');
await until(()=>!content.hidden);assert.equal(elements.get('#locked-text').value,data.tabs[0].text);
assert.equal(document.activeElement,panel,'Held keys stay away from the note editor');
document.dispatchEvent(Object.assign(new Event('keyup'),{key:'=',code:'Equal'}));
assert.equal(document.activeElement,elements.get('#locked-text'));
assert.equal(elements.get('#locked-text').scrollTop,0);assert.equal(saves,0);assert(maxActive<=2);
await close();open();input('==');input('x');await until(()=>active===0);assert(content.hidden,'Replacing text cancels the earlier correct candidate');
input('==');input('=');await until(()=>active===0);assert(content.hidden,'Deleting text cancels the earlier correct candidate');
input('==');await close();await until(()=>active===0);assert(content.hidden,'Closing cancels pending unlocks');
open();input('==');
cloud={value:await cryptoHelpers.sealNotes(data,await cryptoHelpers.createLock('zz'),'alice'),ready:true,revision:2};notify(cloud);
await until(()=>active===0);assert(content.hidden,'A stale result cannot open a changed encrypted record');
input('zz');await until(()=>!content.hidden);assert.equal(elements.get('#locked-text').value,data.tabs[0].text);assert.equal(saves,0);
await close();open();input('zz');dispose();await until(()=>active===0);assert(content.hidden,'Disposal cancels pending unlocks');
console.log('Automatic unlock passed: immediate checks, entered repeated-key password, no pasted-prefix guessing, bounded work, held-key focus, replace/delete/close/revision/disposal cancellation, unchanged plaintext and zero writes.');
