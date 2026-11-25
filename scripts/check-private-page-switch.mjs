import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source=await fs.readFile(new URL('../src/private-routes.js',import.meta.url),'utf8');
const origin='https://playdanki.com';

function host(initial='/#german'){
 const window=new EventTarget(),document=new EventTarget(),classes=new Set(),created=[],idle=[],timers=[];
 const location={origin,assign:path=>navigations.push(path),reload:()=>navigations.push('reload')};
 const navigations=[];
 function setPath(path){const url=new URL(path,origin);for(const field of ['pathname','search','hash'])location[field]=url[field];}
 setPath(initial);
 const history={replaceState:(_state,_title,path)=>setPath(path),pushState:(_state,_title,path)=>setPath(path)};
 class Frame extends EventTarget{
  hidden=true;
  contentWindow={postMessage:()=>{},focus:()=>{}};
  remove(){this.removed=true;}
 }
 const isGame=location.pathname==='/';
 document.title=isGame?'German Words':'Temponote';
 document.querySelector=()=>isGame?{}:null;
 document.createElement=type=>type==='iframe'?new Frame():{};
 document.head={append(){}};
 document.body={
  append:frame=>created.push(frame),
  classList:{add:cls=>classes.add(cls),remove:(...items)=>items.forEach(cls=>classes.delete(cls)),toggle:(cls,on)=>on?classes.add(cls):classes.delete(cls)},
 };
 window.requestIdleCallback=fn=>idle.push(fn);
 const context={window,parent:window,document,location,history,navigator:{},CustomEvent,
  setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}};
 vm.runInNewContext(source,context);
 const prefix=isGame?'danki-auth':'danki-private-auth';
 const auth=uid=>window.dispatchEvent(new CustomEvent(prefix,{detail:uid}));
 const clear=()=>window.dispatchEvent(new Event(prefix+'-clearing'));
 const click=(pathname,modifiers={})=>{
  const event=new Event('click',{cancelable:true});
  const link={origin,pathname,focus(){}};
  Object.defineProperty(event,'target',{value:{closest:()=>link}});
  Object.assign(event,{button:0},modifiers);
  return !document.dispatchEvent(event);
 };
 const message=(frame,path,from=origin)=>{
  const event=new Event('message');
  Object.assign(event,{origin:from,source:frame.contentWindow,data:{type:'danki-private-navigate',path}});
  window.dispatchEvent(event);
 };
 const pop=path=>{setPath(path);window.dispatchEvent(new Event('popstate'));};
 return {auth,clear,click,created,document,idle,location,classes,message,pop,navigations};
}

const game=host();
assert.equal(game.click('/monthly-logs/'),false,'Signed-out clicks remain direct');
game.auth('old');game.clear();game.auth('owner');
idle(game);
assert.equal(game.created.length,1,'Skip stale warmup and warm only one route at a time');
const notes=game.created[0];
assert.equal(notes.id,'private-notes-frame');
assert(notes.hidden&&notes.inert);
notes.dispatchEvent(new Event('load'));idle(game);
const weight=game.created[1];
weight.dispatchEvent(new Event('load'));idle(game);
const monthly=game.created[2];
monthly.dispatchEvent(new Event('load'));idle(game);
assert.equal(game.created.length,3);
assert.equal(game.click('/monthly-logs/',{ctrlKey:true}),false);
assert(game.click('/temponotes/'));
game.message(weight,'/monthly-logs/');
game.message(notes,'/monthly-logs/','https://elsewhere.invalid');
assert(monthly.hidden,'Reject hidden frames and other origins');
game.message(notes,'/monthly-logs/');
assert(!monthly.hidden&&notes.hidden);
game.message(monthly,'/weight-tracker/');
assert(!weight.hidden&&monthly.hidden);
game.pop('/monthly-logs/');
assert(!monthly.hidden&&weight.hidden);
game.pop('/weight-tracker/');
assert(!weight.hidden&&monthly.hidden);
game.message(weight,'/');
assert(game.created.every(frame=>frame.hidden&&frame.inert));
assert.equal(game.location.hash,'#german');
assert.equal(game.document.title,'German Words');
game.click('/monthly-logs/');
game.clear();
assert(game.created.every(frame=>frame.removed));
assert.equal(game.location.pathname,'/');
game.auth('second');
game.message(monthly,'/temponotes/');
idle(game);
assert(game.created.at(-1).hidden);

const direct=host('/temponotes/?test');
direct.auth('owner');idle(direct);
assert.equal(direct.created[0].id,'private-weight-frame','Direct notes warm their peer routes, not another copy of notes');
assert(direct.click('/monthly-logs/'));
direct.message(direct.created.at(-1),'/temponotes/');
assert.equal(direct.location.search,'?test');
assert(direct.created.every(frame=>frame.hidden));
assert.equal(direct.click('/'),false,'Standalone host still has a direct DANKI link');
direct.click('/monthly-logs/');
direct.message(direct.created.at(-1),'/');
assert.deepEqual(direct.navigations,['/']);
console.log('Private routes: ordered warmup, repeat reuse, Back and Forward, direct links, signed-out fallback, and account isolation passed.');

function idle(test){for(const start of test.idle.splice(0))start();}
