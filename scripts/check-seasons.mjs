import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';
const source=await fs.readFile('src/temponotes/autumn.js','utf8');
function page(at,center=false,main=false){let now=new Date(at),layer;const events=new Map(),timers=[];
 const node=()=>({children:[],values:{},className:'',classList:{toggle(){}},style:{setProperty(k,v){this.owner.values[k]=v}},setAttribute(){},append(n){this.children.push(n)},replaceChildren(){this.children=[]}});
 const make=()=>{const n=node();n.style.owner=n;return n;};
 const document={hidden:false,currentScript:{src:'https://playdanki.com/temponotes/autumn.js',hasAttribute:k=>k==='data-danki-timebox'?center:k==='data-danki-main'?main:false},documentElement:{dataset:{}},body:{append:n=>layer=n,classList:{contains:()=>false}},createElement:make,addEventListener:(name,fn)=>events.set(name,fn)};
 const window={addEventListener:(name,fn)=>events.set(name,fn)};const DateMock=class extends Date{constructor(...args){super(...(args.length?args:[now]));}};
 vm.runInNewContext(source,{Date:DateMock,Intl,Math,URL,document,window,parent:window,setInterval:(fn,ms)=>timers.push({fn,ms}),MutationObserver:class{observe(){}}});
 return {layer,document,events,timers,advance:value=>{now=new Date(value);timers[0].fn();}};
}
const count=(p,type)=>p.layer.children.filter(n=>n.className==='autumn-leaf seasonal-'+type).length;
for(let month=0;month<12;month++)for(const day of [1,11,21]){const p=page(new Date(2026,month,day,12));assert.equal(p.layer.children.length,32);assert(count(p,'flower')<=6);for(const n of p.layer.children){assert(+n.values['--alpha']<=.45);assert(n.children[0].alt==='');assert(+n.values['--left'].slice(0,-1)<18||+n.values['--left'].slice(0,-1)>81);}}
const snow=[1,11,21].map(day=>count(page(new Date(2026,11,day,12)),'snow'));assert(snow[0]<snow[1]&&snow[1]<snow[2]);
const spring=[1,11,21].map(day=>count(page(new Date(2026,2,day,12)),'snow'));assert(spring[0]>spring[1]&&spring[1]>spring[2]);
assert.equal(count(page('2026-06-01T12:00:00Z'),'snow'),0);assert(count(page('2026-04-11T12:00:00Z'),'flower')>0);
// The next Swiss date starts before UTC midnight during winter.
assert.equal(count(page('2026-12-10T23:30:00Z'),'snow'),snow[1]);
const p=page('2026-10-29T12:00:00Z',true,true);for(const n of p.layer.children)assert(+n.values['--left'].slice(0,-1)>=45&&+n.values['--left'].slice(0,-1)<=55);
const first=p.layer.children[0];p.advance('2026-10-30T12:00:00Z');assert.equal(p.layer.children[0],first,'Same segment keeps existing objects');p.advance('2026-12-25T12:00:00Z');assert.equal(p.layer.children.length,32);assert.equal(count(p,'snow'),24);
p.document.documentElement.dataset.dankiLeaves='off';p.events.get('danki-leaves-change')();assert.equal(p.layer.hidden,true);assert.equal(p.timers.length,1);assert.equal(p.timers[0].ms,3600000);
assert((await fs.stat('src/temponotes/season-snow.svg')).size+(await fs.stat('src/temponotes/season-flower.svg')).size<1024);
console.log('Seasons passed: all 36 steps, Swiss date boundary, snow ramp, spring flowers, 32-object cap, transparency, edge/centre layouts, disabled state and no needless rebuilding. New artwork is under 1 KB total.');
