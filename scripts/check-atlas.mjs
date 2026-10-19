import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
class Element extends EventTarget{hidden=false;contentWindow={focus(){},location:{replace:path=>this.navigated=path}};focus(){}}
const window=new EventTarget(),link=new Element(),frames=[],classes=new Set(),location={origin:'https://playdanki.com',pathname:'/',search:'?v=test',hash:'#quant'};
const update=url=>{const u=new URL(url,location.origin);Object.assign(location,{pathname:u.pathname,search:u.search,hash:u.hash});};
const document={title:'QUANT',querySelector:()=>link,createElement:()=>new Element(),head:{append(){}},body:{append:f=>frames.push(f),classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),contains:c=>classes.has(c)}}};
let pushes=0;const history={pushState:(s,t,url)=>{pushes++;update(url)},replaceState:(s,t,url)=>update(url)};
vm.runInNewContext(await fs.readFile('src/atlas-navigation.js','utf8'),{window,document,location,history,Event});
assert.equal(frames.length,1);const frame=frames[0];assert(frame.hidden,'Atlas warms while the game stays visible');
const click=(extra={})=>{const e=new Event('click',{cancelable:true});Object.assign(e,{button:0,...extra});link.dispatchEvent(e);return e};
assert(!click({ctrlKey:true}).defaultPrevented);assert(click().defaultPrevented);assert(!frame.hidden);assert(classes.has('atlas-open'));assert.equal(location.pathname,'/data-atlas/');
const message=(data,source=frame.contentWindow,origin=location.origin)=>{const e=new Event('message');Object.assign(e,{source,origin,data});window.dispatchEvent(e)};
message({type:'danki-atlas-return'},{});assert(!frame.hidden);
message({type:'danki-atlas-return'},frame.contentWindow,'https://evil.example');assert(!frame.hidden);
message({type:'danki-atlas-navigate',path:'/temponotes/'});assert.equal(location.pathname,'/data-atlas/');
message({type:'danki-atlas-navigate',path:'/data-atlas/average-home-size.html'});assert.equal(location.pathname,'/data-atlas/average-home-size.html');assert(frame.navigated.includes('average-home-size.html?v='));
message({type:'danki-atlas-ready',path:'/data-atlas/average-home-size.html',title:'Average home size — Data Atlas'});assert.equal(document.title,'Average home size — Data Atlas');
message({type:'danki-atlas-return'});assert(frame.hidden);assert.equal(location.hash,'#quant');assert.equal(location.search,'?v=test');assert.equal(document.title,'QUANT');
click();assert.equal(frames.length,1);assert.equal(location.pathname,'/data-atlas/average-home-size.html','Reopening keeps the selected dataset');
update('/');window.dispatchEvent(new Event('popstate'));assert(frame.hidden);
update('/data-atlas/');const before=pushes;window.dispatchEvent(new Event('popstate'));assert(!frame.hidden);assert.equal(pushes,before,'Back does not create another history entry');assert(frame.navigated.startsWith('/data-atlas/?v='));
for(const name of ['index.html','europe-consumption.html','ancient-ancestry.html','average-home-size.html']){
 const original=await fs.readFile('src/data-atlas/upstream/'+name,'utf8'),built=await fs.readFile('dist/data-atlas/'+name,'utf8');
 const scripts=html=>[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[0]);
 assert.deepEqual(scripts(built).slice(0,-1),scripts(original),'Original data and map scripts stay identical');
 assert.deepEqual([...built.matchAll(/d="([^"]+)"/g)].map(m=>m[1]),[...original.matchAll(/d="([^"]+)"/g)].map(m=>m[1]),'Map geometry stays identical');
 assert(built.includes('href="/">DANKI</a>'));assert(built.includes('background:#071e48'));
 const strip=html=>html.replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace('<a class="danki-return" href="/">DANKI</a>','');
 assert.equal(strip(built),strip(original),'All original content and layout markup stay identical');
 for(const [,href]of built.matchAll(/(?:href|src)="(\.\/[^"#?]+)"/g))await fs.access('dist/data-atlas/'+href);
}
console.log('Data Atlas passed: all 4 original pages, unchanged data/maps/content, local links, warm reuse, return route, history and message security.');
