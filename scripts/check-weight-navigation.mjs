import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
class Element extends EventTarget{
 hidden=false;removed=false;inert=false;messages=[];
 contentWindow={postMessage:(...args)=>this.messages.push(args),focus:()=>{}};
 focus(){}remove(){this.removed=true;}
}
const win=new EventTarget(),link=new Element(),frames=[],classes=new Set();
const location={origin:'https://playdanki.com',pathname:'/',search:'',hash:'#quant',reload(){}};
const setUrl=url=>{const u=new URL(url,location.origin);location.pathname=u.pathname;location.search=u.search;location.hash=u.hash;};
const history={pushState:(s,t,u)=>setUrl(u),replaceState:(s,t,u)=>setUrl(u)};
const document={title:'QUANT',querySelector:()=>link,createElement:()=>new Element(),head:{append(){}},body:{append:f=>frames.push(f),classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),remove:c=>classes.delete(c)}}};
const context=vm.createContext({window:win,document,location,history,CustomEvent});
new vm.Script(await fs.readFile(new URL('../src/weight-navigation.js',import.meta.url),'utf8')).runInContext(context);
const auth=uid=>win.dispatchEvent(new CustomEvent('danki-auth',{detail:uid}));
const click=(extra={})=>{const e=new Event('click',{cancelable:true});Object.assign(e,{button:0,...extra});link.dispatchEvent(e);return e;};
assert.equal(click().defaultPrevented,false,'Guests retain the normal sign-in route');assert.equal(frames.length,0);
auth('alice');const alice=frames.at(-1);assert(alice.hidden);assert(alice.src.startsWith('/weight-tracker/?v='));
assert.equal(click({ctrlKey:true}).defaultPrevented,false,'Open in new tab still works');
assert(click().defaultPrevented);assert.equal(frames.at(-1),alice,'Opening reuses the ready document');assert(!alice.hidden);assert.equal(location.pathname,'/weight-tracker/');
const message=(source,origin,type)=>{const e=new Event('message');Object.assign(e,{source,origin,data:{type}});win.dispatchEvent(e);};
message({},location.origin,'danki-weight-return');assert(!alice.hidden,'Other windows cannot switch the page');
message(alice.contentWindow,'https://evil.example','danki-weight-return');assert(!alice.hidden,'Other origins cannot switch the page');
message(alice.contentWindow,location.origin,'danki-weight-return');assert(alice.hidden);assert.equal(location.hash,'#quant');assert.equal(document.title,'QUANT');
click();assert.equal(frames.length,1,'Repeated visits create no extra listeners or frames');
win.dispatchEvent(new CustomEvent('danki-view-opening',{detail:'atlas'}));assert(alice.hidden,'Atlas hides the private notes view');setUrl('/data-atlas/');win.dispatchEvent(new Event('popstate'));assert(alice.hidden);setUrl('/');click();
win.dispatchEvent(new Event('danki-auth-clearing'));assert(alice.removed,'Old note document removed BEFORE the auth change');assert.equal(frames.length,1,'No old-account document is recreated during the transition');
auth('bob');const bob=frames.at(-1);assert.notEqual(bob,alice);assert(!bob.hidden);
message(alice.contentWindow,location.origin,'danki-weight-return');assert(!bob.hidden,'Old document cannot control the new owner');
win.dispatchEvent(new Event('danki-auth-clearing'));auth(null);assert(bob.removed);const gate=frames.at(-1);assert.notEqual(gate,bob,'Sign-out replaces notes with a fresh sign-in page');
win.dispatchEvent(new Event('pagehide'));assert(gate.removed,'Page history never keeps an old notes document');
console.log('Weight navigation passed: warm reuse, game position, modified links, origin/source checks, account switch, sign out and page history.');
