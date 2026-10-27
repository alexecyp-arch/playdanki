import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {readBest,recordBest,BEST_KEY} from '../src/digit-span/best-score.mjs';
import {gameKey,encode,decode} from '../src/cloud-state.mjs';
const m=new Map(),storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
assert.equal(readBest(storage),0);assert.equal(recordBest(storage,4),0);assert.equal(recordBest(storage,7),7);assert.equal(recordBest(storage,6),7);assert.equal(recordBest(storage,9),9);assert.equal(readBest(storage),9);assert(gameKey(BEST_KEY));assert.deepEqual(await decode(await encode({[BEST_KEY]:storage.getItem(BEST_KEY)})),{[BEST_KEY]:storage.getItem(BEST_KEY)});
const source=(await fs.readFile('src/analytics.js','utf8')).replace('ANALYTICS_CONFIG',JSON.stringify(JSON.parse(await fs.readFile('src/analytics-config.json','utf8'))));
function analytics({url='https://playdanki.com/',automated=false,frame=false,existing,blocked=false}={}){const u=new URL(url),scripts=[],values=new Map(existing?[['danki:analytics:exclude:v1','1']]:[]),storage={getItem:k=>{if(blocked)throw Error();return values.get(k);},setItem:(k,v)=>{if(blocked)throw Error();values.set(k,v);},removeItem:k=>values.delete(k)},window={};window.top=frame?{}:window;vm.runInNewContext(source,{window,location:u,navigator:{webdriver:automated,userAgent:'Chrome'},URLSearchParams,localStorage:storage,document:{createElement:()=>({setAttribute(k,v){this[k]=v;}}),head:{append:s=>scripts.push(s)}}});return {scripts,values};}
assert.equal(analytics().scripts.length,1);for(const args of [{url:'http://127.0.0.1:8897/'},{url:'https://playdanki.com/?analytics=off'},{automated:true},{frame:true},{existing:true},{url:'https://playdanki.com/temponotes/'},{url:'https://playdanki.com/weight-tracker/'}])assert.equal(analytics(args).scripts.length,0,JSON.stringify(args));assert.equal(analytics({existing:true,url:'https://playdanki.com/?analytics=on'}).scripts.length,1);assert.equal(analytics({url:'https://playdanki.com/?analytics=off',blocked:true}).scripts.length,0);
console.log('Preferences passed: persistent maximum best score, cloud inclusion, analytics injection and test/bot/frame/private-page exclusions.');

const themeSource=await fs.readFile('src/theme.js','utf8');
for(const [stored,expected] of [[null,'charcoal'],['invalid','charcoal'],['charcoal','charcoal'],['indigo','indigo']]){
 const document={documentElement:{dataset:{}},querySelector:()=>null,querySelectorAll:()=>[],addEventListener:()=>{}};
 vm.runInNewContext(themeSource,{document,localStorage:{getItem:()=>stored},window:{addEventListener:()=>{}}});
 assert.equal(document.documentElement.dataset.dankiTheme,expected);
}
assert(!(await fs.readFile('src/theme.css','utf8')).includes('outline-offset:2px'));
console.log('Grey default and no selected white box checks passed.');

const leafTheme=await fs.readFile('src/theme.js','utf8'),leafValues=new Map();
function leafPage(blocked=false){const docEvents=new Map(),winEvents=new Map(),button={setAttribute(k,v){this[k]=v;}},document={documentElement:{dataset:{}},querySelector:s=>s==='#leaves-toggle'?button:null,querySelectorAll:()=>[],dispatchEvent(){},addEventListener(k,fn){const a=docEvents.get(k)||[];a.push(fn);docEvents.set(k,a);}};vm.runInNewContext(leafTheme,{Event,document,localStorage:{getItem:k=>{if(blocked)throw Error();return leafValues.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error();leafValues.set(k,v);}},window:{addEventListener:(k,fn)=>winEvents.set(k,fn)}});return {document,button,click:()=>{for(const fn of docEvents.get('click')||[])fn({target:{closest:s=>s==='#leaves-toggle'?button:null}});},storage:()=>winEvents.get('storage')({key:'danki:leaves:v1'})};}
const leafMain=leafPage(),leafPeer=leafPage();assert.equal(leafMain.button['aria-pressed'],'true');leafMain.click();assert.equal(leafMain.document.documentElement.dataset.dankiLeaves,'off');assert.equal(leafValues.get('danki:leaves:v1'),'off');assert.equal(leafPage().button['aria-pressed'],'false','Refresh remembers leaves off');leafPeer.storage();assert.equal(leafPeer.document.documentElement.dataset.dankiLeaves,'off','Cached pages receive the same preference');leafMain.click();leafPeer.storage();assert.equal(leafPeer.button['aria-pressed'],'true');const noStorage=leafPage(true);noStorage.click();assert.equal(noStorage.button['aria-pressed'],'false','Leaf toggle still works when storage is blocked');console.log('Leaf toggle passed: default on, instant off/on, reload persistence, cached-page sync and blocked storage.');
