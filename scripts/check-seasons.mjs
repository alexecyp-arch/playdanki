import assert from 'node:assert/strict';import fs from 'node:fs/promises';import vm from 'node:vm';
const source=await fs.readFile('src/temponotes/autumn.js','utf8');
function page(at,center=false,main=false){let now=new Date(at),layer;const events=new Map(),timers=[];
 const node=()=>({children:[],values:{},className:'',classList:{toggle(){}},style:{setProperty(k,v){this.owner.values[k]=v}},setAttribute(){},append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n)}},remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)},replaceChildren(){this.children=[]}});
 const make=()=>{const n=node();n.style.owner=n;return n;};
 const document={hidden:false,currentScript:{src:'https://playdanki.com/temponotes/autumn.js',hasAttribute:k=>k==='data-danki-timebox'?center:k==='data-danki-main'?main:false},documentElement:{dataset:{}},body:{append:n=>layer=n,classList:{contains:()=>false}},createElement:make,addEventListener:(name,fn)=>events.set(name,fn)};
 const media={matches:false,addEventListener:(name,fn)=>events.set('viewport-'+name,fn)};
 const window={matchMedia:()=>media,addEventListener:(name,fn)=>events.set(name,fn)};const DateMock=class extends Date{constructor(...args){super(...(args.length?args:[now]));}};
 vm.runInNewContext(source,{Date:DateMock,Intl,Math,URL,document,window,parent:window,setInterval:(fn,ms)=>timers.push({fn,ms}),MutationObserver:class{observe(){}}});
 return {layer,document,events,timers,resize:phone=>{media.matches=phone;events.get('viewport-change')();},advance:value=>{now=new Date(value);timers[0].fn();}};
}
const count=(p,type)=>p.layer.children.filter(n=>n.className==='autumn-leaf seasonal-'+type).length;
const baseLeft=n=>parseFloat(n.values['--left'].replace('calc(', ''));
for(let month=0;month<12;month++)for(const day of [1,11,21]){const p=page(new Date(2026,month,day,12));assert.equal(p.layer.children.length,32);assert(count(p,'flower')<=6);for(const n of p.layer.children){assert(+n.values['--alpha']<=.45);const image=n.children[0].className==='leaf-turn'?n.children[0].children[0]:n.children[0];assert.equal(image.alt,'');assert(baseLeft(n)<18||baseLeft(n)>81);}}
const snow=[1,11,21].map(day=>count(page(new Date(2026,11,day,12)),'snow'));assert(snow[0]<snow[1]&&snow[1]<snow[2]);
const spring=[1,11,21].map(day=>count(page(new Date(2026,2,day,12)),'snow'));assert(spring[0]>spring[1]&&spring[1]>spring[2]);
assert.equal(count(page('2026-06-01T12:00:00Z'),'snow'),0);assert(count(page('2026-04-11T12:00:00Z'),'flower')>0);
// The next Swiss date starts before UTC midnight during winter.
assert.equal(count(page('2026-12-10T23:30:00Z'),'snow'),snow[1]);
const p=page('2026-10-29T12:00:00Z',true,true);for(const n of p.layer.children)assert(baseLeft(n)>=45&&baseLeft(n)<=55);
const first=p.layer.children[0];p.advance('2026-10-29T14:00:00Z');assert.equal(p.layer.children[0],first,'Same Swiss day keeps existing objects');p.advance('2026-12-25T12:00:00Z');assert.equal(p.layer.children.length,32);assert.equal(count(p,'snow'),24);
p.document.documentElement.dataset.dankiLeaves='off';p.events.get('danki-leaves-change')();assert.equal(p.layer.hidden,true);assert.equal(p.timers.length,2);assert.equal(p.timers[0].ms,3600000);
assert((await fs.stat('src/temponotes/season-snow.svg')).size+(await fs.stat('src/temponotes/season-flower.svg')).size<1024);
const accents=page('2026-10-29T12:00:00Z');const drop=accents.timers.find(t=>t.ms===7500);assert(drop,'One seasonal accent every 7.5 seconds');drop.fn();assert.equal(accents.layer.children.length,33);drop.fn();drop.fn();drop.fn();assert.equal(accents.layer.children.length,35,'Never more than three rare accents');assert(accents.layer.children.at(-1).children[0].src.startsWith('data:image/svg+xml,'));accents.document.documentElement.dataset.dankiLeaves='off';accents.events.get('danki-leaves-change')();const prior=accents.layer.children.length;drop.fn();assert.equal(accents.layer.children.length,prior,'No new accents while disabled');
const greens=day=>page(new Date(2026,9,day,12)).layer.children.filter(n=>n.className==='autumn-leaf seasonal-leaf'&&parseFloat(n.values['--hue'])>=70).length;assert(greens(1)>greens(21));assert(greens(29)>0,'Late October still includes green leaves');
const phone=page('2026-10-29T12:00:00Z');phone.resize(true);
assert.equal(phone.layer.children.length,16);
for(const [viewport,min,max] of [[phone,22,36],[page('2026-10-29T12:00:00Z'),35,65]]){
 const sharedDrift=viewport.layer.children.filter(n=>n.values['--left'].startsWith('calc('));
 assert.equal(sharedDrift.length,Math.round(count(viewport,'leaf')*.65));
 const direction=Math.sign(parseFloat(sharedDrift[0].values['--drift3']));
 for(const leaf of sharedDrift){
  assert.equal(leaf.className,'autumn-leaf seasonal-leaf');
  assert.equal(leaf.values['--gust-distance'],undefined);
  const [first,middle,last]=[1,2,3].map(step=>parseFloat(leaf.values['--drift'+step])*direction);
  assert(first>0&&first<middle&&middle<last&&last>=min&&last<=max);
 }
}
const turns=phone.layer.children.flatMap(n=>n.children).filter(n=>n.className==='leaf-turn');
assert.equal(turns.length,Math.round(count(phone,'leaf')/5));
for(const turn of turns){
 assert.equal(turn.children.length,2);
 const [image,mesh]=turn.children;
 assert.equal(mesh.className,'leaf-mesh');
 assert.equal(mesh.values['--leaf-art'],'url("'+image.src+'")');
 assert.deepEqual(mesh.children.map(half=>half.children.length),[5,5]);
}
const phoneDrop=phone.timers.find(t=>t.ms===7500).fn;
phoneDrop();assert.equal(count(phone,'accent'),0);
phoneDrop();assert.equal(count(phone,'accent'),1);
phoneDrop();assert.equal(count(phone,'accent'),1);
phoneDrop();assert.equal(count(phone,'accent'),2);
phone.resize(false);assert.equal(phone.layer.children.length,32);
phoneDrop();assert.equal(count(phone,'accent'),1);
console.log('Seasons passed: gradual daily transitions, mixed autumn greens, rare accents at 7.5 seconds, Swiss date boundary, snow ramp, spring flowers, 32 regular particles, transparency, edge/centre layouts, disabled state and no needless rebuilding. Snow and flower assets are under 1 KB total.');
