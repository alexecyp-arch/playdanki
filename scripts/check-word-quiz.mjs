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
  const keys=await context(),kp=await keys.newPage();
  for(const digit of ['1','2','3']){
    await kp.goto(url+'#german');await kp.locator('.word-choice').first().waitFor();
    await kp.evaluate(()=>localStorage.removeItem('deutsch5000:v1'));await kp.reload();await kp.locator('.word-choice').first().waitFor();
    const texts=await kp.locator('.word-choice').allTextContents(),word=JSON.parse(await fs.readFile(path.join(root,'german/words.json'),'utf8'))[0][0],index=Number(digit)-1;
    await kp.locator('#game').focus();await kp.keyboard.press('Shift+'+digit);assert.equal(await saved(kp,'deutsch5000:v1'),null);
    await kp.evaluate(()=>{const input=document.createElement('input');input.id='keyboard-test';document.body.append(input);input.focus();});await kp.keyboard.press(digit);assert.equal(await saved(kp,'deutsch5000:v1'),null);await kp.locator('#keyboard-test').evaluate(e=>e.remove());
    await kp.locator('#game').focus();await kp.keyboard.press(digit);
    await kp.waitForFunction(()=>!!localStorage.getItem('deutsch5000:v1'));const state=await saved(kp,'deutsch5000:v1'),row=Object.values(state.days)[0];
    assert.equal(texts[index]===word?row.correct:row.misses,1,'number key selects its visual row');
  }
  await keys.close();console.log('PASS keys 1, 2 and 3 select top/middle/bottom; typing and modified keys do not answer');
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
  await choose(page,'sentences-mode');assert.equal(await page.locator('#position').textContent(),'1 / 500');assert.equal(await page.locator('.word-choice').count(),3);assert.equal(await page.locator('#translation').isVisible(),false);
  const sentence=JSON.parse(await fs.readFile(path.join(root,'decks/sentences.json'),'utf8'))[0];await correct(page,sentence[0]);await page.waitForFunction(()=>document.getElementById('position').textContent==='2 / 500');
  console.log('PASS sentence cards use three choices with the 500-card limit');
  const extended=await context(),ep=await extended.newPage();
  const expanded=[
    ['german','sentences-mode','deutsch1000sentences:v1','decks/sentences.json'],
    ['french','french-sentences-mode','francais1000sentences:v1','french/sentences.json'],
    ['spanish','spanish-sentences-mode','spanish1000sentences:v1','languages/spanish-sentences.json'],
    ['italian','italian-sentences-mode','italian1000sentences:v1','languages/italian-sentences.json'],
    ['greek','greek-sentences-mode','greek1000sentences:v1','languages/greek-sentences.json'],
    ['economics',null,'economics3500:v1','decks/economics.json'],
    ['trivia',null,'trivia20000:v1','trivia/0.json']
  ];
  for(const [section,mode,key,file] of expanded){
    const cards=JSON.parse(await fs.readFile(path.join(root,file),'utf8')),answer=cards[0][mode?0:1];
    await ep.goto(url+'#'+section);if(mode)await choose(ep,mode);await ep.locator('.word-choice').first().waitFor();
    const choices=ep.locator('.word-choice');assert.equal(await choices.count(),3);
    const texts=await choices.allTextContents(),wrong=texts.find(text=>text!==answer);
    await ep.locator('#game').focus();await ep.keyboard.press(String(texts.indexOf(wrong)+1));await ep.locator('.word-wrong').waitFor();
    assert.equal(await ep.locator('#word-accuracy').textContent(),'0% CORRECT');
    await correct(ep,answer);await ep.waitForFunction(()=>document.getElementById('position').textContent.startsWith('2 / '));
    assert.equal(await ep.locator('#word-accuracy').textContent(),'50% CORRECT');
    await ep.reload();await ep.locator('.word-choice').first().waitFor();
    assert((await ep.locator('#position').textContent()).startsWith('2 / '));assert.equal(await ep.locator('#word-accuracy').textContent(),'50% CORRECT');
    assert.equal((await saved(ep,key)).cursor,1);
    if(section==='trivia'){assert.equal((await saved(ep,key)).run.correct,1);assert.equal((await saved(ep,key)).run.misses,1);assert.equal(await ep.locator('#question-image').isVisible(),false);}
    if(section==='economics')assert.equal(Object.values((await saved(ep,key)).weeks)[0].correct,1);
    console.log('PASS '+section+(mode?' sentences':'')+': graded choices, saved 50% accuracy, reload and progress');
  }
  for(const course of ['programming','quant']){
    const cards=JSON.parse(await fs.readFile(path.join(root,course+'/cards.json'),'utf8'));
    await ep.goto(url+'#'+course);const frame=ep.frameLocator('#arithmetic-frame');
    await ep.waitForFunction(course=>{const frame=document.getElementById('arithmetic-frame')?.contentDocument;return frame?.location.pathname.endsWith('/'+course+'.html')&&frame.body?.getAttribute('aria-busy')==='false'&&frame.querySelectorAll('.word-choice').length===3;},course);
    await frame.locator('.word-choice').first().waitFor();assert.equal(await frame.locator('.word-choice').count(),3);
    const answer=cards[0].answer,texts=await frame.locator('.word-choice').allTextContents(),wrong=texts.find(text=>text!==answer);
    await ep.locator('#games-toggle').focus();await ep.keyboard.press(String(texts.indexOf(wrong)+1));await frame.locator('.word-wrong').waitFor();
    assert.equal(await frame.locator('#quiz-accuracy').textContent(),'0% CORRECT');
    const key=course+'5000:v1',before=await saved(ep,key);
    await frame.locator('#study').click({position:{x:5,y:5}});assert.deepEqual((await saved(ep,key)).quiz,before.quiz);
    await frame.locator('.word-choice').first().focus();await ep.keyboard.press(String(texts.indexOf(answer)+1));await frame.locator('#card').filter({hasText:'CARD 2/5000'}).waitFor();
    assert.equal(await frame.locator('#quiz-accuracy').textContent(),'50% CORRECT');
    await ep.reload();await frame.locator('.word-choice').first().waitFor();assert.equal(await frame.locator('#quiz-accuracy').textContent(),'50% CORRECT');
    const stored=await saved(ep,key);assert.deepEqual(stored.quiz,{correct:1,wrong:1});
    if(course==='programming')assert.equal(stored.nextId,2);else assert.equal(stored.cursor,1);
    await frame.locator('#stats-toggle').click();assert.match(await frame.locator('#stats-values').textContent(),/50% CORRECT/);await frame.locator('#stats-close').click();
    await ep.screenshot({path:fileURLToPath(new URL('../../qa/'+course+'-quiz-desktop.png',import.meta.url)),fullPage:true});
    console.log('PASS '+course+': meaningful choices, graded attempts, saved progress, statistics and no tap bypass');
  }
  await ep.goto(url+'#trivia');await ep.locator('.word-choice').first().waitFor();
  const trivia=JSON.parse(await fs.readFile(path.join(root,'trivia/0.json'),'utf8')),flag=trivia.findIndex(card=>typeof card[5]==='string');
  const seedTrivia=async cursor=>{
    await ep.evaluate(cursor=>{localStorage.setItem('trivia20000:v1',JSON.stringify({v:1,cursor,round:1,days:{'2026-11-05':{correct:0,wrong:0,skipped:cursor}},run:{correct:0,wrong:0,skipped:cursor}}));dispatchEvent(new StorageEvent('storage',{key:'trivia20000:v1'}));},cursor);
    await ep.waitForFunction(cursor=>document.getElementById('position').textContent===(cursor+1)+' / 20000',cursor);await ep.locator('.word-choice').first().waitFor();
  };
  await seedTrivia(flag);await ep.waitForFunction(()=>{const image=document.getElementById('question-image');return !image.hidden&&image.naturalWidth>0;});await correct(ep,trivia[flag][1]);await ep.waitForFunction(position=>document.getElementById('position').textContent===position,flag+2+' / 20000');
  await seedTrivia(1999);await correct(ep,trivia[1999][1]);await ep.waitForFunction(()=>document.getElementById('position').textContent==='2001 / 20000'&&document.querySelectorAll('.word-choice').length===3);
  assert.equal((await saved(ep,'trivia20000:v1')).cursor,2000);console.log('PASS flag questions and loading the next 2000-question chunk preserve the quiz and progress');
  await extended.close();
  const phone=await context({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),mobile=await phone.newPage();
  await mobile.goto(url+'#german');await mobile.locator('.word-choice').first().waitFor();
  for(const width of [320,390]){
    await mobile.setViewportSize({width,height:width===320?568:844});
    const layout=await mobile.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,boxes:Array.from(document.querySelectorAll('.word-choice')).map(button=>{const r=button.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height};}),accuracy:document.getElementById('word-accuracy').getBoundingClientRect().bottom,position:document.getElementById('position').getBoundingClientRect().top}));
    assert.equal(layout.overflow,false);assert(layout.accuracy<=layout.position);assert(layout.boxes.every(box=>box.left>=0&&box.right<=width&&box.height>=44));assert(layout.boxes[0].bottom<layout.boxes[1].top&&layout.boxes[1].bottom<layout.boxes[2].top);
  }
  await mobile.locator('.word-choice').filter({hasText:new RegExp('^'+firstWord+'$')}).tap();await mobile.waitForFunction(()=>document.getElementById('position').textContent==='2 / 1000');
  await mobile.screenshot({path:fileURLToPath(new URL('../../qa/word-quiz-phone.png',import.meta.url)),fullPage:true});
  for(const course of ['programming','quant']){
    await mobile.goto(url+'#'+course);await mobile.waitForFunction(course=>{const doc=document.getElementById('arithmetic-frame')?.contentDocument;return doc?.location.pathname.endsWith('/'+course+'.html')&&doc.body?.getAttribute('aria-busy')==='false'&&doc.querySelectorAll('.word-choice').length===3;},course);
    const frame=mobile.frameLocator('#arithmetic-frame'),cards=JSON.parse(await fs.readFile(path.join(root,course+'/cards.json'),'utf8'));
    assert.equal(await frame.locator('html').evaluate(element=>element.scrollWidth>innerWidth),false);
    await frame.getByRole('button',{name:cards[0].answer,exact:true}).tap();await frame.locator('#card').filter({hasText:'CARD 2/5000'}).waitFor();
    await mobile.screenshot({path:fileURLToPath(new URL('../../qa/'+course+'-quiz-phone.png',import.meta.url)),fullPage:true});
  }
  await choose(page,'words-mode');await page.screenshot({path:fileURLToPath(new URL('../../qa/word-quiz-desktop.png',import.meta.url)),fullPage:true});
  console.log('PASS 320px/390px phone layouts, stacked touch targets and touch grading');
  await phone.close();await desktop.close();assert.deepEqual(errors,[]);console.log('PASS no page errors');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
