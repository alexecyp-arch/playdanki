import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
class Element extends EventTarget{hidden=false;removed=false;messages=[];contentWindow={postMessage:(...args)=>this.messages.push(args),focus(){}};focus(){}remove(){this.removed=true;}}
const win=new EventTarget(),links={'.temponotes-link':new Element(),'.timebox-link':new Element(),'.weight-link':new Element()},frames=[],classes=new Set();
const location={origin:'https://playdanki.com',pathname:'/',search:'?analytics=off',hash:'#german',reload(){}};
const setUrl=url=>{const u=new URL(url,location.origin);location.pathname=u.pathname;location.search=u.search;location.hash=u.hash;};
const history={pushState:(s,t,u)=>setUrl(u),replaceState:(s,t,u)=>setUrl(u)};
const document={title:'GERMAN',querySelector:s=>links[s],createElement:()=>new Element(),head:{append(){}},body:{append:f=>frames.push(f),classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),remove:c=>classes.delete(c)}}};
const context=vm.createContext({window:win,document,location,history,CustomEvent});
for(const file of ['notes','timebox','weight'])new vm.Script(await fs.readFile(new URL('../src/'+file+'-navigation.js',import.meta.url),'utf8')).runInContext(context);
const auth=uid=>win.dispatchEvent(new CustomEvent('danki-auth',{detail:uid}));
const message=(source,origin,type)=>{const e=new Event('message');Object.assign(e,{source,origin,data:{type}});win.dispatchEvent(e);};
const click=selector=>{const e=new Event('click',{cancelable:true});Object.assign(e,{button:0});links[selector].dispatchEvent(e);};
const queued=[];win.requestIdleCallback=fn=>queued.push(fn);auth('alice');assert.equal(frames.length,0);win.dispatchEvent(new Event('danki-auth-clearing'));auth('bob');queued.splice(0).forEach(fn=>fn());assert.equal(frames.length,3);const old=frames.slice();win.dispatchEvent(new Event('danki-auth-clearing'));assert(old.every(f=>f.removed));console.log('Deferred private warmup passed: old account callbacks ignored and all frames removed before account change.');