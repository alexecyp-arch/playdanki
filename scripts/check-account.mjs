import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
import * as backend from './mock-firebase.mjs';import {encode,decode} from '../src/cloud-state.mjs';
class Store{map=new Map();get length(){return this.map.size}key(i){return [...this.map.keys()][i]}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
class Element extends EventTarget{hidden=false;disabled=false;textContent='';open=false;click(){this.dispatchEvent(new Event('click'))}}
const ids=['auth-config','account-menu','account-label','account-status','account-login','account-logout','account-sync','account-identity','account-conflict','account-use-cloud','account-use-browser','arithmetic-frame'];
const elements=Object.fromEntries(ids.map(k=>[k,new Element()]));elements['auth-config'].textContent=JSON.stringify({enabled:true,firebase:{}});
const storage=new Store(),win=new EventTarget(),document=Object.assign(new EventTarget(),{getElementById:k=>elements[k],hidden:false});
const key='deutsch5000:v1',guest={v:1,cursor:7,round:1,days:{}};storage.setItem(key,JSON.stringify(guest));
let interval;const context=vm.createContext({document,window:win,localStorage:storage,navigator:{onLine:true},location:{reload(){}},console:{warn(){}},Event,StorageEvent:class extends Event{constructor(type,init){super(type);Object.assign(this,init)}},setInterval:fn=>(interval=fn,1),clearInterval(){},addEventListener:win.addEventListener.bind(win)});
const fake=new URL('./mock-firebase.mjs',import.meta.url).href,core=new URL('../src/cloud-state.mjs',import.meta.url).href;
const source=await fs.readFile(new URL('../src/account.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'account.js',importModuleDynamically:s=>import(s.includes('firebasejs')?fake:core)}).runInContext(context);
const wait=async test=>{for(let i=0;i<200;i++){if(test())return;await new Promise(r=>setTimeout(r,5))}throw Error('Timed out: '+elements['account-status'].textContent)};
elements['account-menu'].open=true;elements['account-menu'].dispatchEvent(new Event('toggle'));await wait(()=>!elements['account-login'].disabled);
assert.equal(backend.docs.size,0,'Guests make no cloud writes');
elements['account-login'].click();await wait(()=>backend.docs.has('users/alice/progress/main')&&!elements['account-sync'].disabled);
assert.equal(JSON.parse((await decode(backend.docs.get('users/alice/progress/main').value))[key]).cursor,7,'First login imports guest progress');
storage.setItem(key,JSON.stringify({...guest,cursor:12}));elements['account-sync'].click();await wait(()=>elements['account-status'].textContent.startsWith('Saved'));
assert.equal(JSON.parse((await decode(backend.docs.get('users/alice/progress/main').value))[key]).cursor,12);
backend.setFail(true);storage.setItem(key,JSON.stringify({...guest,cursor:13}));elements['account-sync'].click();await wait(()=>elements['account-status'].textContent.includes('failed'));assert.equal(JSON.parse(storage.getItem(key)).cursor,13);
backend.setFail(false);elements['account-sync'].click();await wait(()=>elements['account-status'].textContent.startsWith('Saved'));
// Another device changes the cloud while this device also has new work.
const cloud=backend.docs.get('users/alice/progress/main');backend.docs.set('users/alice/progress/main',{...cloud,value:await encode({[key]:JSON.stringify({...guest,cursor:20})}),revision:cloud.revision+1});
storage.setItem(key,JSON.stringify({...guest,cursor:14}));elements['account-sync'].click();await wait(()=>!elements['account-conflict'].hidden);
assert.equal(JSON.parse(storage.getItem(key)).cursor,14,'No automatic overwrite during a conflict');
elements['account-use-cloud'].click();await wait(()=>elements['account-status'].textContent.startsWith('Saved'));assert.equal(JSON.parse(storage.getItem(key)).cursor,20);
elements['account-logout'].click();await wait(()=>!elements['account-login'].hidden&&!elements['account-login'].disabled);assert.equal(JSON.parse(storage.getItem(key)).cursor,7,'Sign out restores original guest data');
await backend.become({uid:'bob',email:'bob@example.test'});await wait(()=>!elements['account-sync'].disabled);assert.notEqual(JSON.parse(storage.getItem(key)||'{}').cursor,20,'Bob never imports Alice progress');
assert([...storage.map.keys()].some(k=>k.startsWith('danki:backup:v1:')));
console.log('Account checks passed: guest import, save, offline retry, conflict, restore and account separation.');
