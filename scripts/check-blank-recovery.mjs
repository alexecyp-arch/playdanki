import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
class Element extends EventTarget{hidden=false;removed=false;messages=[];contentWindow={postMessage:(...args)=>this.messages.push(args),focus(){}};focus(){}remove(){this.removed=true;}}
const win=new EventTarget(),links={'.temponotes-link':new Element(),'.timebox-link':new Element(),'.weight-link':new Element()},frames=[],classes=new Set();
const location={origin:'https://playdanki.com',pathname:'/',search:'?analytics=off',hash:'#german',reload(){}};
const setUrl=url=>{const u=new URL(url,location.origin);location.pathname=u.pathname;location.search=u.search;location.hash=u.hash;};
const history={pushState:(s,t,u)=>setUrl(u),replaceState:(s,t,u)=>setUrl(u)};
const document={title:'GERMAN',querySelector:s=>links[s],createElement:()=>new Element(),head:{append(){}},body:{append:f=>frames.push(f),classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),remove:c=>classes.delete(c)}}};
const timers=[],navigations=[];location.assign=url=>navigations.push(url);const context=vm.createContext({window:win,document,location,history,CustomEvent,setTimeout:fn=>timers.push(fn)});
for(const file of ['notes','timebox','weight'])new vm.Script(await fs.readFile(new URL('../src/'+file+'-navigation.js',import.meta.url),'utf8')).runInContext(context);
const auth=uid=>win.dispatchEvent(new CustomEvent('danki-auth',{detail:uid}));
const message=(source,origin,type)=>{const e=new Event('message');Object.assign(e,{source,origin,data:{type}});win.dispatchEvent(e);};
const click=selector=>{const e=new Event('click',{cancelable:true});Object.assign(e,{button:0});links[selector].dispatchEvent(e);};
auth('alice');for(const f of frames){f.contentDocument={URL:'about:blank'};f.contentWindow.location={replace:url=>f.retried=url};}click('.temponotes-link');assert.equal(frames[0].retried,frames[0].src);frames[0].contentDocument.URL=location.origin+'/temponotes/';timers.splice(0).forEach(fn=>fn());assert.equal(navigations.length,0,'Loaded document stays cached');click('.timebox-link');timers.splice(0).forEach(fn=>fn());assert.equal(navigations.at(-1),frames[1].src,'Persistent blank opens the same trusted page directly');click('.weight-link');win.dispatchEvent(new Event('danki-auth-clearing'));auth('bob');const before=navigations.length;timers.splice(0).forEach(fn=>fn());assert.equal(navigations.length,before,'Old account cannot trigger delayed navigation');console.log('Blank-page recovery passed: retry, cached reuse, same-page fallback and cancelled old-account recovery.');