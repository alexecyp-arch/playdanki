import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),pictures=JSON.parse(fs.readFileSync(new URL('src/temponotes/backgrounds.json',root)));
const source=fs.readFileSync(new URL('src/temponotes/daily-background.js',root),'utf8').replace('BACKGROUND_DATA',JSON.stringify(pictures));
function run(date,mobile=false,parentMobile){
 let current=date,css='',preload,timer,updates=0,parentSmall=parentMobile;const events={};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[current.getTime()]));}}
 const media={get matches(){return mobile},addEventListener:(type,fn)=>events.mediachange=fn};
 const win={addEventListener:(type,fn)=>events[type]=fn};win.parent=parentMobile===undefined?win:{location:{origin:'https://playdanki.com'},matchMedia:()=>({get matches(){return parentSmall},addEventListener:(type,fn)=>events.mediachange=fn})};
 const context={Date:Clock,Math,location:{origin:'https://playdanki.com'},matchMedia:()=>media,document:{head:{append(el){preload=el;}},createElement:()=>({}),documentElement:{style:{setProperty(key,value){assert.equal(key,'--daily-background');css=value;updates++;}}},addEventListener:(type,fn)=>events[type]=fn,hidden:false},window:win,clearTimeout(){},setTimeout(fn,ms){timer={fn,ms};return 1;}};
 vm.runInNewContext(source,context);
 return {get css(){return css},get preload(){return preload},get updates(){return updates},get timer(){return timer},advance(date){current=date;events.visibilitychange();},resize(small){parentSmall=mobile=small;events.mediachange();},show(){events.message({origin:'https://playdanki.com',source:win.parent,data:{type:'danki-notes-visibility',visible:true}});}};
}
assert.equal(pictures.length,34);
for(let day=0;day<68;day++)for(const mobile of [false,true]){
 const result=run(new Date(2026,9,18+day,12),mobile),expected=pictures[day%34][mobile?'mobile':'desktop'];
 assert.equal(result.css,'url("'+expected+'")');assert.equal(result.preload.href,expected);assert.equal(result.updates,1);
 assert(fs.existsSync(new URL('dist/temponotes/'+expected,root)));
}
const day=run(new Date(2026,9,18,23,59,59));day.advance(new Date(2026,9,18,23,59,59));assert.equal(day.updates,1,'same-day returns must not swap images');day.advance(new Date(2026,9,19));assert.equal(day.preload.href,pictures[1].desktop);assert.equal(day.updates,2);
const hidden=run(new Date(2026,9,18,12),true,false);assert.equal(hidden.preload.href,pictures[0].desktop,'Hidden narrow iframe must use the desktop host resolution');hidden.show();assert.equal(hidden.updates,1,'Return does not downgrade or refetch the correct image');hidden.resize(true);assert.equal(hidden.preload.href,pictures[0].mobile);hidden.resize(false);assert.equal(hidden.preload.href,pictures[0].desktop,'Resizing back to desktop restores the high-resolution image');
const phone=run(new Date(2026,9,18,12),false,true);assert.equal(phone.preload.href,pictures[0].mobile,'A real phone still gets the mobile image');
process.env.TZ='Europe/Berlin';const dst=run(new Date(2026,9,25));assert.equal(dst.timer.ms,25*3600000+50,'schedule local midnight across clock changes');
const html=fs.readFileSync(new URL('dist/temponotes/index.html',root),'utf8');assert(!html.includes('BACKGROUND_DATA'));assert(!html.includes('DAILY_BACKGROUND_SCRIPT'));
for(const f of ['style.css','navigation.css'])assert(!fs.readFileSync(new URL('dist/temponotes/'+f,root),'utf8').includes('background.webp'));
console.log('Background checks passed: 34 pictures, 2 full cycles, mobile selection, midnight, DST and no old-image fetch.');
