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
 const cards=JSON.parse(await fs.readFile(path.join(root,'coding1000/cards.json'),'utf8'));assert.equal(cards.length,1000);assert.equal(new Set(cards.map(c=>c[0])).size,1000);assert(cards.every(c=>c.at(-1).wrongAnswers.length===2));assert(cards.every(c=>new Set([c[1],...c.at(-1).wrongAnswers]).size===3));assert(!cards.some(c=>c.at(-1).wrongAnswers.some(t=>/Python|^Skip .* checks and assume/.test(t))));
 const plan=JSON.parse(await fs.readFile('src/coding1000/curriculum.json','utf8'));assert.equal(plan.lessonCount,198);assert(plan.lessons.every((l,i)=>!i||l.difficulty>=plan.lessons[i-1].difficulty));assert(plan.lessons.some(l=>l.term==='Git diff'));assert(plan.lessons.some(l=>l.term==='Git ignore rule'));
 const c=await context(),p=await c.newPage();await p.goto(url);await p.locator('#games-toggle').click();await p.locator('#coding-mode').click();await p.locator('.word-choice').first().waitFor();assert.equal(await p.locator('#position').textContent(),'1 / 1000');assert.match(await p.locator('#word').textContent(),/program lets you edit/);assert.equal(await p.locator('.word-choice').count(),3);
 let texts=await p.locator('.word-choice').allTextContents(),wrong=texts.findIndex(s=>s!==cards[0][1]);await p.locator('#game').focus();await p.keyboard.press(String(wrong+1));await p.locator('.word-wrong').waitFor();assert.equal(await p.locator('#word-accuracy').textContent(),'0% CORRECT');await p.keyboard.press(String(texts.indexOf(cards[0][1])+1));await p.waitForFunction(()=>document.getElementById('position').textContent==='2 / 1000');assert.equal(await p.locator('#word-accuracy').textContent(),'50% CORRECT');await p.reload();await p.locator('.word-choice').first().waitFor();assert.equal(await p.locator('#position').textContent(),'2 / 1000');assert.equal(await p.locator('#word-accuracy').textContent(),'50% CORRECT');await p.locator('#previous-card').click();assert.equal(await p.locator('#position').textContent(),'1 / 1000');
 await p.setViewportSize({width:390,height:844});assert.equal(await p.locator('html').evaluate(e=>e.scrollWidth>innerWidth),false);await p.screenshot({path:'../qa/coding1000-phone.png',fullPage:true});await p.setViewportSize({width:1440,height:900});await p.screenshot({path:'../qa/coding1000-desktop.png',fullPage:true});
 await p.evaluate(()=>{localStorage.setItem('coding1000:v1',JSON.stringify({v:1,cursor:999,round:1,days:{}}));dispatchEvent(new StorageEvent('storage',{key:'coding1000:v1'}));});await p.locator('#position').filter({hasText:'1000 / 1000'}).waitFor();await p.getByRole('button',{name:cards[999][1],exact:true}).click();await p.locator('#word').filter({hasText:'Complete'}).waitFor();assert.equal((await saved(p,'coding1000:v1')).cursor,1000);
 console.log('PASS Coding 1000: menu, exactly 1000 cards, related choices, 1/2/3 grading, 50% accuracy, refresh, previous card and phone width');await c.close();assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
