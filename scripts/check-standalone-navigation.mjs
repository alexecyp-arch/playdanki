import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import vm from 'node:vm';
const source=(await fs.readFile(new URL('../src/temponotes/private-page-navigation.js',import.meta.url),'utf8')).replace('export function','function')+'\ninitStandaloneNavigation();';
class Element extends EventTarget{hidden=false;removed=false;contentWindow={postMessage(){},focus(){}};focus(){}remove(){this.removed=true;}}
for(const view of ['notes','timebox']){
 const win=new EventTarget(),link=new Element(),frames=[],hostPath=view==='notes'?'/temponotes/':'/timebox/',peer=view==='notes'?'timebox':'notes',peerPath=view==='notes'?'/timebox/':'/temponotes/';
 const location={origin:'https://playdanki.com',pathname:hostPath,assign:p=>location.assigned=p};const setUrl=p=>{location.pathname=p;};const history={pushState:(s,t,p)=>setUrl(p),replaceState:(s,t,p)=>setUrl(p)};
 const document={title:'',querySelector:()=>link,createElement:()=>new Element(),head:{append(){}},body:{append:f=>frames.push(f)}};
 new vm.Script(source).runInContext(vm.createContext({window:win,parent:win,document,location,history,CustomEvent}));
 const auth=uid=>win.dispatchEvent(new CustomEvent('danki-private-auth',{detail:uid}));const click=()=>{const e=new Event('click',{cancelable:true});Object.assign(e,{button:0});link.dispatchEvent(e);return e;};
 const message=(frame,origin,type)=>{const e=new Event('message');Object.assign(e,{source:frame.contentWindow,origin,data:{type}});win.dispatchEvent(e);};
 assert(!click().defaultPrevented);auth('alice');assert.equal(frames.length,1);const alice=frames[0];assert(alice.hidden);
 for(let i=0;i<10;i++){assert(click().defaultPrevented);assert.equal(location.pathname,peerPath);assert(!alice.hidden);message(alice,'https://evil.example','danki-'+peer+'-open-'+view);assert(!alice.hidden);message(alice,location.origin,'danki-'+peer+'-open-'+view);assert(alice.hidden);assert.equal(location.pathname,hostPath);}
 assert.equal(frames.length,1,'Twenty switches reuse the same peer document from '+view);
 click();win.dispatchEvent(new Event('danki-private-auth-clearing'));assert(alice.removed);assert.equal(location.pathname,hostPath);auth('bob');const bob=frames[1];message(alice,location.origin,'danki-'+peer+'-open-'+view);assert(bob.hidden,'Old account cannot control new view');click();message(bob,location.origin,'danki-'+peer+'-return');assert.equal(location.assigned,'/','DANKI still returns home');
}
console.log('Standalone navigation passed from both entry pages: warm reuse, 20 swaps per entry, return routes, origin checks and account isolation.');
