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
 console.log('PASS answer feedback stays green/red; blue theme stays unchanged');await c.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
