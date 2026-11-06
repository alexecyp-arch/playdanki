import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url),{chromium}=require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const temp=fileURLToPath(new URL('../../qa/word-quiz-tmp/',import.meta.url));
await fs.mkdir(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+relative+(relative.endsWith('/')?'index.html':''));
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/',browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
const decks=[
  ['german','words-mode','deutsch5000:v1','german/words.json'],
  ['french','french-words-mode','francais5000:v1','french/words.json'],
  ['spanish','spanish-words-mode','spanish5000:v1','languages/spanish-words.json'],
  ['italian','italian-words-mode','italian5000:v1','languages/italian-words.json'],
  ['greek','greek-words-mode','greek5000:v1','languages/greek-words.json'],
  ['korean','korean-words-mode','korean5000:v1','languages/korean-words.json']
];
async function context(options={}){
  const value=await browser.newContext({viewport:{width:1440,height:900},timezoneId:'Asia/Nicosia',...options});
  await value.addInitScript(()=>{window.quizVoices=[];document.addEventListener('danki-card-voice',event=>window.quizVoices.push(event.detail));});
  await value.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort());
  value.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  return value;
}
const saved=(page,key)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
async function choose(page,id){await page.locator('#languages-toggle').click();await page.locator('#'+id).click();await page.locator('#answer-box').waitFor({state:'visible'});}
async function correct(page,text){await page.locator('.word-choice').filter({hasText:new RegExp('^'+text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).click();}
try{
 const c=await context(),p=await c.newPage();
 for(const path of ['','programming.html','quant.html','arithmetic.html','digit-span/index.html','temponotes/','timebox/','weight-tracker/','data-atlas/']){
  await p.goto(url+path);await p.waitForLoadState('domcontentloaded');
  const result=await p.evaluate(()=>{const button=document.createElement('button');button.textContent='TEST';document.body.append(button);document.documentElement.dataset.dankiTheme='indigo';const blue=getComputedStyle(button).backgroundColor;document.documentElement.dataset.dankiTheme='charcoal';const black=getComputedStyle(button).backgroundColor;button.remove();return {blue,black};});
  assert.equal(result.black,'rgb(26, 11, 16)',path+' charcoal button');assert.notEqual(result.blue,result.black,path+' blue theme unchanged');
  console.log('PASS burgundy button on '+(path||'home'));
 }
 await p.goto(url+'#german');await p.locator('.word-choice').first().waitFor();await p.mouse.move(0,0);
 assert.equal(await p.locator('.word-choice').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(26, 11, 16)');
 for(const theme of ['charcoal','indigo']){await p.evaluate(theme=>document.documentElement.dataset.dankiTheme=theme,theme);for(const state of ['normal','hover']){if(state==='hover')await p.locator('#today').hover();const style=await p.locator('#today').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow}));assert.equal(style.bg,'rgba(0, 0, 0, 0)');assert.equal(style.shadow,'none');}assert.equal(await p.locator('#today .chevron').count(),0);}
 await p.mouse.move(0,0);await p.evaluate(()=>document.documentElement.dataset.dankiTheme='charcoal');await p.waitForTimeout(80);
 for(const selector of ['.word-choice','#games-toggle'])assert.match(await p.locator(selector).first().evaluate(e=>getComputedStyle(e).boxShadow),/rgb\(18, 5, 9\)/);
 console.log('PASS practice counter transparent in both themes and on hover; no arrow; burgundy lower 3D layers');
 await p.locator('.word-choice').first().evaluate(e=>e.classList.add('word-correct'));await p.waitForTimeout(80);assert.equal(await p.locator('.word-choice').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(34, 108, 67)');
 await p.locator('.word-choice').first().evaluate(e=>{e.classList.remove('word-correct');e.classList.add('word-wrong')});await p.waitForTimeout(80);assert.equal(await p.locator('.word-choice').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(133, 44, 52)');
 await p.locator('.word-choice').first().evaluate(e=>e.classList.remove('word-wrong'));await p.waitForTimeout(80);
 await p.screenshot({path:'../qa/burgundy-buttons-desktop.png',fullPage:true});await p.setViewportSize({width:390,height:844});await p.screenshot({path:'../qa/burgundy-buttons-phone.png',fullPage:true});
 await p.evaluate(()=>document.documentElement.dataset.dankiTheme='indigo');await p.waitForTimeout(80);assert.equal(await p.locator('.word-choice').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(42, 45, 50)');

 await p.goto(url+'#german');for(const width of [1440,390]){await p.setViewportSize({width,height:900});for(const theme of ['charcoal','indigo']){await p.evaluate(theme=>document.documentElement.dataset.dankiTheme=theme,theme);for(const selector of ['#previous-card','#embedded-previous-card']){const style=await p.locator(selector).evaluate(e=>({background:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow,border:getComputedStyle(e).borderTopWidth}));assert.equal(style.background,'rgba(0, 0, 0, 0)');assert.equal(style.shadow,'none');assert.equal(style.border,'0px');}}}console.log('PASS Previous Card is text-only at desktop and phone widths in both themes');
 await p.goto(url+'#german');await p.locator('#today').click();await p.locator('#close-history').hover();const close=await p.locator('#close-history').evaluate(e=>({bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow}));assert.equal(close.bg,'rgba(0, 0, 0, 0)');assert.equal(close.shadow,'none');await p.locator('#close-history').click();
 await p.goto(url+'timebox/');
 const edges=await p.evaluate(()=>{const el=document.createElement('article');el.className='timebox-card';document.body.append(el);const result=[];for(const color of ['#aa3344','#3388bb']){el.style.setProperty('--box-color',color);for(const running of [false,true]){el.classList.toggle('running',running);el.style.transition='none';const s=getComputedStyle(el);result.push({shadow:s.boxShadow,border:s.borderColor,edge:s.getPropertyValue('--box-edge')});}}el.remove();return result;});assert.notEqual(edges[0].shadow,edges[2].shadow);assert.notEqual(edges[0].border,edges[2].border);assert(edges.every(s=>!s.shadow.includes('rgb(20, 20, 23)')));
 await p.goto(url+'temponotes/');const note=await p.evaluate(()=>{const el=document.createElement('div');el.innerHTML='<article class="note" style="--note-wood:linear-gradient(90deg,#765432,#432100)"><div class="note-heading">NOTE</div><div class="note-footer" style="background-color:rgb(120,30,40)"><div class="note-time-buttons"><button>+DAY</button></div><button class="delete">DELETE</button></div></article><div class="composer-wrap"><form>WRITE A NOTE</form></div>';document.body.append(el);const footer=el.querySelector('.note-footer'),wood=getComputedStyle(footer,'::after'),out={wood:wood.backgroundImage,color:wood.backgroundColor,buttons:[...el.querySelectorAll('button')].map(b=>getComputedStyle(b).backgroundColor),composer:getComputedStyle(el.querySelector('form')).boxShadow,note:getComputedStyle(el.querySelector('.note')).boxShadow};el.remove();return out;});assert(note.wood.includes('linear-gradient'));assert.equal(note.color,'rgb(120, 30, 40)');assert(note.buttons.every(c=>c==='rgb(26, 11, 16)'));assert(note.composer.includes('rgb(5, 6, 7)'));assert(!note.composer.includes('rgb(18, 5, 9)'));assert(!note.note.includes('rgb(18, 5, 9)'));console.log('PASS popup X stays clear; Timebox depth follows task colours; note depth inherits wood; composer depth black; note actions burgundy');

 await p.goto(url+'#german');for(const theme of ['charcoal','indigo']){await p.evaluate(theme=>document.documentElement.dataset.dankiTheme=theme,theme);for(const menu of ['languages','games']){await p.locator('#'+menu+'-toggle').click();const bg=await p.locator('#'+menu+'-list').evaluate(e=>getComputedStyle(e).backgroundColor);assert.equal(bg,theme==='charcoal'?'rgb(26, 11, 16)':'rgb(16, 44, 89)');await p.locator('#'+menu+'-toggle').click();}}
 await p.goto(url+'temponotes/');const closeStyles=await p.evaluate(()=>{const wrapper=document.createElement('section');wrapper.innerHTML='<section id="eternal-panel"><button class="eternal-close">×</button></section><section id="locked-panel"><button class="locked-close">×</button></section>';document.body.append(wrapper);const result=[];for(const theme of ['charcoal','indigo']){document.documentElement.dataset.dankiTheme=theme;for(const button of wrapper.querySelectorAll('button')){const s=getComputedStyle(button);result.push({bg:s.backgroundColor,shadow:s.boxShadow,border:s.borderTopWidth});}}wrapper.remove();return result;});assert(closeStyles.every(s=>s.bg==='rgba(0, 0, 0, 0)'&&s.shadow==='none'&&s.border==='0px'));console.log('PASS full Games/Language menu surfaces; Eternal and Locked Notes close buttons text-only in both themes');

 await p.goto(url+'#german');for(const width of [1440,390]){await p.setViewportSize({width,height:900});const layering=await p.evaluate(()=>{const menu=document.getElementById('account-menu'),panel=document.getElementById('account-panel'),previous=document.getElementById('previous-card');menu.open=true;panel.style.minHeight='380px';const r=previous.getBoundingClientRect(),box=panel.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);const out={overlaps:x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom,covered:panel.contains(hit)};menu.open=false;panel.style.minHeight='';return out;});assert(layering.overlaps,'test popup overlaps Previous Card at '+width);assert(layering.covered,'Account popup must cover Previous Card at '+width);}console.log('PASS Account popup paints above Previous Card at desktop and phone widths');
 console.log('PASS answer feedback stays green/red; blue theme stays unchanged');await c.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
