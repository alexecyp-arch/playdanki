import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const html=await fs.readFile('src/arithmetic.html','utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
let elapsed=0,randomIndex=0;
const at=new Date(2026,10,17,12).getTime(),listeners=new Map(),timers=[],nodes=new Map();
function node(){return {textContent:'',value:'',hidden:false,disabled:false,open:false,children:[],handlers:new Map(),addEventListener(k,fn){this.handlers.set(k,fn)},append(...children){this.children.push(...children)},replaceChildren(...children){this.children=children},focus(){},closest(){return null},fire(k,event={}){this.handlers.get(k)?.(event)}}}
for(const id of ['round-status','exercise','problem','answer','result','start','warning','bottom','history','total','rows'])nodes.set(id,node());
const saved=new Map([['weekly-arithmetic-v1:settings',JSON.stringify({ops:[0],a:[999,999,999,999],m:[999,999,999,999]})],['weekly-arithmetic-v1:count:2026-11-16:legacy','500']]);
const storage={get length(){return saved.size},key:i=>[...saved.keys()][i],getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))};
const DateMock=class extends Date{constructor(...args){super(...(args.length?args:[at+elapsed]))}static now(){return at+elapsed}};
const math=Object.create(Math);math.random=()=>{const i=randomIndex++;return i%3===0?Math.floor(i/3)%4/4+.01:0};
const context={document:{hidden:false,getElementById:id=>nodes.get(id),createElement:node,addEventListener:(k,fn)=>listeners.set(k,fn),dispatchEvent(){}},localStorage:storage,Date:DateMock,Math:math,performance:{now:()=>elapsed},crypto:{randomUUID:()=> 'test-tab'},setInterval:(fn,ms)=>timers.push({fn,ms}),addEventListener:(k,fn)=>listeners.set(k,fn),Event:class{}};
context.window=context;context.parent=context;
vm.runInNewContext(source,context);
const start=()=>nodes.get('start').fire('click'),input=value=>{nodes.get('answer').value=String(value);nodes.get('answer').fire('input')},tick=()=>timers.find(t=>t.ms===100).fn();
start();
for(const [problem,answer]of [['2 + 2 =',4],['4 − 2 =',2],['2 × 2 =',4],['4 ÷ 2 =',2]]){assert.equal(nodes.get('problem').textContent,problem);input(999);assert.equal(nodes.get('problem').textContent,problem);input(answer)}
assert.equal(nodes.get('round-status').textContent,'60 SECONDS · 4 CORRECT');
elapsed=60000;tick();assert.equal(nodes.get('result').textContent,'4 CORRECT');assert.equal(saved.get('arithmetic60:v1:best:2026-11-17:test-tab'),'4');
start();elapsed+=60000;input(4);assert.equal(nodes.get('result').textContent,'0 CORRECT');assert.equal(saved.get('arithmetic60:v1:best:2026-11-17:test-tab'),'4');
assert.equal(saved.get('weekly-arithmetic-v1:count:2026-11-16:legacy'),'500');
assert(!html.includes('id="settings"'));assert(!html.includes('name="a0"'));
saved.set('arithmetic60:v1:best:2026-11-17:other-device','9');listeners.get('storage')({key:null});assert.equal(nodes.get('total').textContent,"TODAY'S BEST: 9");
start();saved.set('danki:owner:v1','someone-else');tick();assert.equal(saved.get('arithmetic60:v1:best:2026-11-17:test-tab'),'4');
console.log('Arithmetic 60 passed: fixed default operations, correct-only scoring, exact deadline, daily maximum, remote records, owner guard and legacy progress.');
