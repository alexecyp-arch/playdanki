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
  const desktop=await context(),page=await desktop.newPage();
  for(const [language,id,key,file] of decks){
    const cards=JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
    await page.goto(url+'#'+language);if(language==='korean')await choose(page,id);
    await page.locator('.word-choice').first().waitFor();
    assert.equal(await page.locator('.word-choice').count(),3);assert.equal(await page.locator('#translation').isVisible(),false);
    assert.equal(await page.locator('#word').textContent(),cards[0][1]);assert.equal(await page.locator('#position').textContent(),'1 / 1000');
    assert.equal(await page.evaluate(text=>window.quizVoices.some(voice=>voice.text===text),cards[0][0]),false,'voice must not reveal the answer');
    await page.locator('#game').focus();await page.keyboard.press('Space');assert.equal(await saved(page,key),null,'Space cannot skip a quiz');
    const wrong=page.locator('.word-choice').filter({hasNotText:new RegExp('^'+cards[0][0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first();
    await wrong.click();await page.locator('.word-wrong').waitFor();assert.equal(await page.locator('.word-wrong').isDisabled(),true);
    let state=await saved(page,key),row=Object.values(state.days)[0];assert.equal(state.cursor,0);assert.equal(row.misses,1);assert.equal(row.correct,0);
    assert.equal(await page.locator('#word-accuracy').textContent(),'0% CORRECT');
    const options=await page.locator('.word-choice').allTextContents();
    await page.evaluate(()=>dispatchEvent(new Event('focus')));
    assert.deepEqual(await page.locator('.word-choice').allTextContents(),options,'Alt-Tab keeps the same choices');
    await page.evaluate(()=>{window.sawGreen=false;new MutationObserver(()=>{if(document.querySelector('.word-correct'))window.sawGreen=true;}).observe(document.getElementById('word-choices'),{subtree:true,attributes:true});});
    await correct(page,cards[0][0]);await page.waitForFunction(()=>document.getElementById('position').textContent==='2 / 1000');
    assert.equal(await page.evaluate(()=>window.sawGreen),true);
    assert.equal(await page.evaluate(text=>window.quizVoices.filter(voice=>voice.text===text&&voice.announce).length,cards[0][0]),1,'pronounce the answer once after a correct choice');
    state=await saved(page,key);row=Object.values(state.days)[0];assert.equal(row.correct,1);assert.equal(row.misses,1);assert.equal(row.skipped,0);
    assert.equal(await page.locator('#word-accuracy').textContent(),'50% CORRECT');
    await page.reload();await page.locator('.word-choice').first().waitFor();assert.equal(await page.locator('#position').textContent(),'2 / 1000');
    assert.equal(await page.locator('#word-accuracy').textContent(),'50% CORRECT');
    await correct(page,cards[1][0]);await page.waitForFunction(()=>document.getElementById('position').textContent==='3 / 1000');
    assert.equal(await page.locator('#word-accuracy').textContent(),'66.7% CORRECT');
    await page.locator('#today').click();assert.match(await page.locator('#history-rows').textContent(),/Today.*Practiced 2.*66\.7% CORRECT/s);await page.locator('#close-history').click();
    console.log('PASS '+language+': three choices, red/green feedback, saved attempts, 66.7% accuracy, history and no Space bypass');
  }
  await page.goto(url+'#german');await page.locator('.word-choice').first().waitFor();
  await page.evaluate(()=>{localStorage.setItem('deutsch5000:v1',JSON.stringify({v:1,cursor:2500,round:2,days:{'2026-11-04':{correct:7,wrong:3,misses:2,skipped:2000}}}));dispatchEvent(new StorageEvent('storage',{key:'deutsch5000:v1'}));});
  await page.locator('#again').waitFor({state:'visible'});assert.equal(await page.locator('#today-count').textContent(),'Practiced 2,010');
  await page.locator('#again').click();await page.locator('.word-choice').first().waitFor();assert.equal((await saved(page,'deutsch5000:v1')).round,3);
  const second=await desktop.newPage();await second.goto(url+'#german');await second.locator('.word-choice').first().waitFor();
  const firstWord=JSON.parse(await fs.readFile(path.join(root,'german/words.json'),'utf8'))[0][0];
  await page.evaluate(()=>{navigator.locks.request('deutsch5000:v1',()=>new Promise(resolve=>{window.releaseQuizLock=resolve;}));});
  await page.waitForFunction(()=>typeof window.releaseQuizLock==='function');
  await Promise.all([page,second].map(p=>p.evaluate(text=>Array.from(document.querySelectorAll('.word-choice')).find(button=>button.textContent===text).click(),firstWord)));
  await page.evaluate(()=>window.releaseQuizLock());
  await page.waitForFunction(()=>document.getElementById('position').textContent==='2 / 1000');
  assert.equal(Object.values((await saved(page,'deutsch5000:v1')).days).reduce((sum,row)=>sum+row.correct,0),8,'two tabs cannot double grade one word');
  console.log('PASS shorter decks preserve old history and replay; simultaneous tabs grade once');
  await choose(page,'sentences-mode');assert.equal(await page.locator('#position').textContent(),'1 / 500');assert.equal(await page.locator('.word-choice').count(),0);assert.equal(await page.locator('#translation').isVisible(),true);
  await page.locator('#game').focus();await page.keyboard.press('Space');await page.waitForFunction(()=>document.getElementById('position').textContent==='2 / 500');
  console.log('PASS sentence cards retain their controls with the new 500-card limit');
  const phone=await context({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),mobile=await phone.newPage();
  await mobile.goto(url+'#german');await mobile.locator('.word-choice').first().waitFor();
  for(const width of [320,390]){
    await mobile.setViewportSize({width,height:width===320?568:844});
    const layout=await mobile.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,boxes:Array.from(document.querySelectorAll('.word-choice')).map(button=>{const r=button.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};}),accuracy:document.getElementById('word-accuracy').getBoundingClientRect().bottom,position:document.getElementById('position').getBoundingClientRect().top}));
    assert.equal(layout.overflow,false);assert(layout.accuracy<=layout.position);assert(layout.boxes.every(box=>box.left>=0&&box.right<=width&&box.height>=44));assert(layout.boxes[0].bottom<layout.boxes[1].top&&layout.boxes[1].bottom<layout.boxes[2].top);
  }
  await mobile.locator('.word-choice').filter({hasText:new RegExp('^'+firstWord+'$')}).tap();await mobile.waitForFunction(()=>document.getElementById('position').textContent==='2 / 1000');
  await mobile.screenshot({path:fileURLToPath(new URL('../../qa/word-quiz-phone.png',import.meta.url)),fullPage:true});
  await choose(page,'words-mode');await page.screenshot({path:fileURLToPath(new URL('../../qa/word-quiz-desktop.png',import.meta.url)),fullPage:true});
  console.log('PASS 320px/390px phone layouts, stacked touch targets and touch grading');
  await phone.close();await desktop.close();assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
