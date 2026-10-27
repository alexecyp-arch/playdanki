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
auth('alice');assert.equal(frames.length,3,'Both private pages warm once');const [notes,timebox,weight]=frames;
click('.temponotes-link');assert(!notes.hidden);assert(timebox.hidden);
message(notes.contentWindow,'https://evil.example','danki-notes-open-weight');assert(weight.hidden);message(notes.contentWindow,location.origin,'danki-notes-open-weight');assert(!weight.hidden&&notes.hidden);assert.equal(location.pathname,'/weight-tracker/');message(weight.contentWindow,'https://evil.example','danki-weight-open-notes');assert(notes.hidden);message(weight.contentWindow,location.origin,'danki-weight-open-notes');assert(!notes.hidden&&weight.hidden);assert.equal(location.pathname,'/temponotes/');message(notes.contentWindow,location.origin,'danki-notes-open-weight');message(weight.contentWindow,location.origin,'danki-weight-return');assert(weight.hidden);click('.temponotes-link');
message(notes.contentWindow,'https://evil.example','danki-notes-open-timebox');assert(timebox.hidden);
message({},location.origin,'danki-notes-open-timebox');assert(timebox.hidden);
for(let i=0;i<10;i++){message(notes.contentWindow,location.origin,'danki-notes-open-timebox');assert(notes.hidden);assert(!timebox.hidden);assert.equal(location.pathname,'/timebox/');message(timebox.contentWindow,location.origin,'danki-timebox-open-notes');assert(!notes.hidden);assert(timebox.hidden);assert.equal(location.pathname,'/temponotes/');}
assert.equal(frames.length,3,'Twenty direct switches create zero extra documents; notes-to-weight route');
message(notes.contentWindow,location.origin,'danki-notes-open-timebox');message(timebox.contentWindow,location.origin,'danki-timebox-return');assert(notes.hidden&&timebox.hidden);assert.equal(location.pathname,'/');assert.equal(location.hash,'#german');assert.equal(document.title,'GERMAN');
win.dispatchEvent(new Event('danki-auth-clearing'));auth('bob');assert(notes.removed&&timebox.removed&&weight.removed);const bob=frames.slice(3);message(notes.contentWindow,location.origin,'danki-notes-open-timebox');assert(bob.every(f=>f.hidden),'Old account frames cannot reopen private pages');
console.log('Direct page checks passed: warm reuse, 20 swaps with zero new documents, game return, source/origin checks and old-account rejection.');
