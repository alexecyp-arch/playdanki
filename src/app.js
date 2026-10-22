(()=>{'use strict';
const $=id=>document.getElementById(id),modeKeys={french:'french:mode:v1',german:'german:mode:v1',japanese:'japanese:mode:v1',spanish:'spanish:mode:v1',italian:'italian:mode:v1',greek:'greek:mode:v1',korean:'korean:mode:v1'},triviaInfo=JSON.parse($('trivia-info').textContent),triviaLoads=new Map(),languageInfo=JSON.parse($('language-info').textContent),languageLoads=new Map();
const menuOpen=()=>!!document.querySelector('.games-menu[open]');
function languageDeck(file,key,title,section,lang,unit,options={}){const info=languageInfo[file];return {key,title,section,lang,unit,limit:info.limit,cards:new Array(info.count),remote:file,...options}}
const coreDeckInfo=JSON.parse($('core-deck-info').textContent);
const remoteCards=id=>({cards:new Array(coreDeckInfo[id].count),remote:id,...coreDeckInfo[id]});
const decks={
  frenchWords:{key:'francais5000:v1',title:'Français 5000',unit:'words',section:'french',lang:'fr',limit:5000,...remoteCards('french-word')},
  frenchSentences:{key:'francais1000sentences:v1',title:'French Sentences 1000',unit:'sentences',section:'french',lang:'fr',limit:1000,fixedChoices:true,...remoteCards('french-sentence')},
  words:{key:'deutsch5000:v1',title:'Deutsch 5000',unit:'words',section:'german',lang:'de',limit:5000,cards:JSON.parse($('word-data').textContent)},
  sentences:{key:'deutsch1000sentences:v1',title:'Sentences 1750',unit:'sentences',section:'german',lang:'de',limit:1750,...remoteCards('sentence')},
  kana:{key:'japanese:kana:v1',title:'Hiragana + Katakana',unit:'Kana answers',section:'japanese',lang:'ja',limit:500,daily:true,cards:JSON.parse($('kana-data').textContent)},
  kanji:{key:'japanese:kanji:v1',title:'Kanji 2136',unit:'Kanji',section:'japanese',lang:'ja',limit:2136,...remoteCards('kanji')},
  spanishWords:languageDeck('spanish-words','spanish5000:v1','Spanish 5000','spanish','es','words'),
  spanishSentences:languageDeck('spanish-sentences','spanish1000sentences:v1','Spanish Sentences 1000','spanish','es','sentences'),
  italianWords:languageDeck('italian-words','italian5000:v1','Italian 5000','italian','it','words'),
  italianSentences:languageDeck('italian-sentences','italian1000sentences:v1','Italian Sentences 1000','italian','it','sentences'),
  greekWords:languageDeck('greek-words','greek5000:v1','Greek 5000','greek','el','words'),
  greekSentences:languageDeck('greek-sentences','greek1000sentences:v1','Greek Sentences 1000','greek','el','sentences'),
  hangul:languageDeck('korean-hangul','korean:hangul:v1','Korean Hangul','korean','ko','symbols',{daily:true}),
  koreanWords:languageDeck('korean-words','korean5000:v1','Korean 5000','korean','ko','words'),
  economics:{key:'economics3500:v1',title:'Economics 3500',unit:'items',section:'economics',lang:'en',fixedChoices:true,weekly:true,...remoteCards('economics')},
  trivia:{key:'trivia20000:v1',title:'Trivia 20000',unit:'questions',section:'trivia',lang:'en',fixedChoices:true,cumulative:true,limit:triviaInfo.total,cards:new Array(triviaInfo.total)}
};
decks.economics.limit=decks.economics.cards.length;
const word=$('word'),position=$('position'),translation=$('translation'),feedback=$('feedback'),history=$('history'),today=$('today'),again=$('again'),practice=document.querySelector('.practice');
const modeButtons={frenchWords:$('french-words-mode'),frenchSentences:$('french-sentences-mode'),words:$('words-mode'),sentences:$('sentences-mode'),kana:$('kana-mode'),kanji:$('kanji-mode'),spanishWords:$('spanish-words-mode'),spanishSentences:$('spanish-sentences-mode'),italianWords:$('italian-words-mode'),italianSentences:$('italian-sentences-mode'),greekWords:$('greek-words-mode'),greekSentences:$('greek-sentences-mode'),hangul:$('hangul-mode'),koreanWords:$('korean-words-mode'),economics:$('economics-mode'),trivia:$('trivia-mode')},preferredModes={french:'frenchWords',german:'words',japanese:'kana',spanish:'spanishWords',italian:'italianWords',greek:'greekWords',korean:'hangul',economics:'economics',trivia:'trivia'};
const game=$('game'),answerBox=$('answer-box'),questionImage=$('question-image');
const memory=new Map();
let storageOK=true,warning,mode='words',active=decks.words,state,locked=false,shownCursor=0,shownRound=1,shownCard=0,shownDay='',screenVersion=0,midnightTimer,practiceActive=true,reviewCursor=null;
function dayKey(date=new Date()){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function weekKey(date=new Date()){const monday=new Date(date.getFullYear(),date.getMonth(),date.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);return dayKey(monday)}
function localDate(key){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d)}
const blank=deck=>({v:1,cursor:0,round:1,days:{},...(deck.daily?{day:dayKey()}:{}),...(deck.cumulative?{run:{correct:0,wrong:0}}:{}),...(deck.weekly?{week:weekKey(),weeks:{}}:{})});
function warn(){if(warning)return;warning=document.createElement('div');warning.className='storage-warning';warning.setAttribute('role','status');warning.textContent='Browser storage is unavailable. This session can still be practiced.';document.body.append(warning)}
const emptyRow=()=>({correct:0,wrong:0,misses:0,skipped:0});
const validRow=row=>row&&Number.isSafeInteger(row.correct)&&Number.isSafeInteger(row.wrong)&&row.correct>=0&&row.wrong>=0;
const copyRow=row=>({correct:row.correct,wrong:row.wrong,misses:Number.isSafeInteger(row.misses)&&row.misses>=0?row.misses:0,skipped:Number.isSafeInteger(row.skipped)&&row.skipped>=0?row.skipped:0});
function clean(raw,deck){
  if(!raw||raw.v!==1||!Number.isInteger(raw.cursor)||raw.cursor<0||raw.cursor>deck.limit||!Number.isInteger(raw.round)||raw.round<1||!raw.days||typeof raw.days!=='object')return blank(deck);
  const days={};for(const [date,row]of Object.entries(raw.days))if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&validRow(row))days[date]=copyRow(row);
  const value={v:1,cursor:raw.cursor,round:raw.round,days};
  if(deck.daily){value.day=dayKey();if(raw.day!==value.day){value.cursor=0;value.round++}}
  if(deck.cumulative){if(!validRow(raw.run)||practiced(copyRow(raw.run))!==value.cursor)return blank(deck);value.run=copyRow(raw.run)}
  if(deck.weekly){
    value.week=weekKey();value.weeks={};
    if(raw.weeks&&typeof raw.weeks==='object'){for(const [date,row]of Object.entries(raw.weeks))if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&date===weekKey(localDate(date))&&validRow(row))value.weeks[date]=copyRow(row)}
    else for(const [date,row]of Object.entries(days)){const week=weekKey(localDate(date)),sum=value.weeks[week]||(value.weeks[week]=emptyRow());sum.correct+=row.correct;sum.wrong+=row.wrong;sum.misses+=row.misses;sum.skipped+=row.skipped}
    const last=Object.keys(days).sort().at(-1),previous=raw.week||(last?weekKey(localDate(last)):value.week);if(previous!==value.week){value.cursor=0;value.round++}
  }
  return value;
}
function read(deck=active){if(!storageOK)return clean(memory.get(deck.key),deck);try{const value=clean(JSON.parse(localStorage.getItem(deck.key)),deck);memory.set(deck.key,value);return value}catch{storageOK=false;warn();return clean(memory.get(deck.key),deck)}}
function save(deck,value){memory.set(deck.key,value);if(!storageOK)return;try{localStorage.setItem(deck.key,JSON.stringify(value));document.dispatchEvent(new Event('danki-progress'))}catch{storageOK=false;warn()}}
const practiced=row=>row.correct+row.wrong+(row.skipped||0);
const accuracy=row=>{const graded=row.correct+row.wrong+(row.misses||0);return graded?Math.round(row.correct/graded*1000)/10:null};
function score(){const row=active.cumulative?state.run:((active.weekly?state.weeks[weekKey()]:state.days[dayKey()])||emptyRow());$('tracker-period').textContent='All time';$('today-count').textContent='Practiced '+Object.values(state.days).reduce((sum,item)=>sum+practiced(item),0).toLocaleString();$('today-score').hidden=true;if(!history.hidden)renderHistory()}
function renderHistory(){const holder=$('history-rows');$('history-title').textContent=(active.weekly?'Previous weeks · ':'Previous days · ')+active.title;holder.replaceChildren();const current=document.createElement('div');current.className='history-row';const label=document.createElement('div');label.className='history-date';label.textContent='Today';const count=document.createElement('div');count.className='history-count';count.textContent='Practiced '+practiced(state.days[dayKey()]||emptyRow()).toLocaleString();current.append(label,count);holder.append(current);const rows=active.weekly?state.weeks:state.days,period=active.weekly?weekKey():dayKey(),dates=Object.keys(rows).filter(d=>d!==period).sort().reverse();if(!dates.length){const p=document.createElement('p');p.className='empty-history';p.textContent=active.weekly?'No previous practice weeks yet.':'No previous practice days yet.';holder.append(p);return}const fragment=document.createDocumentFragment();for(const date of dates){const row=rows[date],box=document.createElement('div'),label=document.createElement('div'),count=document.createElement('div'),result=document.createElement('div');box.className='history-row';label.className='history-date';const [y,m,d]=date.split('-').map(Number);label.textContent=new Date(y,m-1,d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});if(active.weekly){const end=new Date(y,m-1,d+6);label.textContent+=' – '+end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}count.className='history-count';count.textContent='Practiced '+practiced(row)+'/'+active.limit;result.className='history-score';const previous=accuracy(row);result.hidden=previous===null;result.textContent=previous===null?'':'Earlier accuracy = '+previous+'%';box.append(label,count,result);fragment.append(box)}holder.append(fragment)}
function cardIndex(){if(active===decks.hangul)return active.cards[0]?hangulPracticeOrder(active.cards,dayKey())[shownCursor]:0;if(!active.daily)return shownCursor;const done=practiced(state.days[dayKey()]||{correct:0,wrong:0})+shownCursor-state.cursor,order=kanaPracticeOrder(active.cards,dayKey());return order[done<92?done:92+(done-92)%408]}
function centerAnswer(){
  if(!practiceActive||game.hidden||answerBox.hidden)return;
  const h=answerBox.getBoundingClientRect().height,topEnd=Math.max(word.getBoundingClientRect().bottom,questionImage.hidden?0:questionImage.getBoundingClientRect().bottom)+scrollY;
  const center=Math.max(innerHeight/2,topEnd+24+h/2);
  answerBox.style.top=center+'px';
  game.style.minHeight=Math.max(innerHeight,center+h/2+144)+'px';
}
window.addEventListener('resize',centerAnswer);questionImage.addEventListener('load',centerAnswer);
function cardVoice(text=''){document.dispatchEvent(new CustomEvent('danki-card-voice',{detail:{id:mode+':'+shownRound+':'+shownCursor,text}}));}
function render(){
  if(!practiceActive)return;
  screenVersion++;locked=false;shownCursor=reviewCursor??state.cursor;shownRound=state.round;shownDay=dayKey();feedback.textContent='';$('answer-box').hidden=true;game.style.minHeight='';
  practice.classList.toggle('sentence-mode',active.unit==='sentences'||active.fixedChoices);practice.classList.toggle('japanese-mode',active.section==='japanese'||active.section==='korean');
  $('game').setAttribute('aria-label',active.section[0].toUpperCase()+active.section.slice(1)+' flashcards');word.lang='en';translation.lang=active.lang;$('kanji-credit').hidden=active!==decks.kanji;
  for(const [name,b]of Object.entries(modeButtons)){b.classList.toggle('active',name===mode);b.setAttribute('aria-pressed',String(name===mode))}
  $('retry').hidden=true;$('question-image').hidden=true;$('question-image').removeAttribute('src');score();
  const total=active.limit,complete=shownCursor===total;again.hidden=!complete;position.textContent=(complete?total:shownCursor+1)+' / '+total;$('previous-card').disabled=shownCursor===0;
  if(complete){cardVoice();word.textContent='Complete';feedback.textContent=active.daily?'Daily goal reached.':'All '+total+' '+active.unit+' practiced.';word.lang='en';return}
  shownCard=cardIndex();const current=active.cards[shownCard];
  if(active.remote&&!current){cardVoice();locked=true;word.textContent='';const deck=active,view=screenVersion;loadLanguage(deck).then(()=>{if(active===deck&&screenVersion===view)render()}).catch(()=>{if(active===deck&&screenVersion===view){word.textContent='Unable to load cards';feedback.textContent='Check your connection and retry.';$('retry').hidden=false}});return}
  if(active===decks.trivia&&!current){cardVoice();locked=true;word.textContent='';const view=screenVersion;loadTrivia(shownCard).then(()=>{if(active===decks.trivia&&screenVersion===view)render()}).catch(()=>{if(active===decks.trivia&&screenVersion===view){word.textContent='Unable to load questions';feedback.textContent='Check your connection and retry.';$('retry').hidden=false}});return}
  if(active===decks.trivia){if(current[5]){const img=$('question-image');img.src=current[5];img.hidden=false}const next=shownCard+200;if(next<active.limit&&Math.floor(next/triviaInfo.chunkSize)!==Math.floor(shownCard/triviaInfo.chunkSize))loadTrivia(next).catch(()=>{})}
  const language=active.lang!=='en';word.textContent=current[language?1:0];translation.textContent=current[language?0:1];$('answer-box').hidden=false;centerAnswer();cardVoice(active===decks.words||active===decks.sentences?current[0]:'');
}
function previousCard(){if(!practiceActive||menuOpen()||!history.hidden||locked||shownCursor<=0)return;reviewCursor=shownCursor-1;render();}
function nextCard(){
  if(!practiceActive||menuOpen()||!history.hidden||locked)return;
  if(reviewCursor!==null){reviewCursor++;if(reviewCursor>=state.cursor)reviewCursor=null;render();return}
  if(state.cursor===active.limit){again.click();return}
  if(shownDay!==dayKey()){state=read(active);render();return}
  locked=true;const deck=active,cursor=shownCursor,round=shownRound,view=screenVersion,date=shownDay;
  const finish=()=>{
    const fresh=read(deck);let recorded=false;
    if(fresh.cursor===cursor&&fresh.round===round&&dayKey()===date){
      const row=fresh.days[date]||(fresh.days[date]=emptyRow());row.skipped++;
      if(deck.cumulative)fresh.run.skipped=(fresh.run.skipped||0)+1;
      if(deck.weekly){const week=fresh.weeks[weekKey()]||(fresh.weeks[weekKey()]=emptyRow());week.skipped++}
      fresh.cursor++;save(deck,fresh);recorded=true;
    }
    if(active!==deck)return;state=fresh;
    if(view!==screenVersion||!recorded){render();return}
    render();
  };
  if(navigator.locks?.request)navigator.locks.request(deck.key,finish).catch(()=>{if(active===deck&&screenVersion===view){state=read(deck);render()}});else finish();
}
function loadTrivia(index){const deck=decks.trivia;if(deck.cards[index])return Promise.resolve();const embedded=$('trivia-data');if(embedded.textContent.trim()!=='[]'){const all=JSON.parse(embedded.textContent);if(all.length!==deck.limit)throw Error('Incomplete question bank');deck.cards=all;embedded.textContent='[]';return Promise.resolve()}const chunk=Math.floor(index/triviaInfo.chunkSize);if(triviaLoads.has(chunk))return triviaLoads.get(chunk);const task=fetch('trivia/'+chunk+'.json?v='+triviaInfo.version).then(r=>{if(!r.ok)throw Error('Question bank unavailable');return r.json()}).then(cards=>{const start=chunk*triviaInfo.chunkSize,expected=Math.min(triviaInfo.chunkSize,deck.limit-start);if(!Array.isArray(cards)||cards.length!==expected||cards.some(c=>!Array.isArray(c)||!c.slice(0,3).every(s=>typeof s==='string'&&s.trim())||c[1]===c[2]))throw Error('Invalid question bank');for(let i=0;i<cards.length;i++)deck.cards[start+i]=cards[i]}).catch(error=>{triviaLoads.delete(chunk);throw error});triviaLoads.set(chunk,task);return task}
function loadLanguage(deck){if(languageLoads.has(deck.remote))return languageLoads.get(deck.remote);const info=languageInfo[deck.remote]||deck,embedded=$(deck.remote+'-data');const task=Promise.resolve().then(()=>embedded.textContent.trim()!=='[]'?JSON.parse(embedded.textContent):fetch((info.url||'languages/'+deck.remote+'.json')+'?v='+info.version).then(r=>{if(!r.ok)throw Error('Cards unavailable');return r.json()})).then(cards=>{if(!Array.isArray(cards)||cards.length!==info.count||cards.some(c=>!Array.isArray(c)||!c.slice(0,2).every(s=>typeof s==='string'&&s.trim())||(deck===decks.hangul&&(!Number.isFinite(c[2])||c[2]<1))))throw Error('Invalid language cards');deck.cards=cards;embedded.textContent='[]'}).catch(error=>{languageLoads.delete(deck.remote);throw error});languageLoads.set(deck.remote,task);return task}
$('retry').addEventListener('click',()=>render());
StudyNavigation.install({next:nextCard,previous:previousCard,enabled:()=>practiceActive&&!menuOpen()&&history.hidden&&!(document.body.classList.contains('notes-open')||(document.body.classList.contains('atlas-open')||document.body.classList.contains('weight-open')))});
function closeHistory(){history.hidden=true;today.setAttribute('aria-expanded','false')}
function switchMode(name){reviewCursor=null;if(mode===name){state=read(active);render();return}mode=name;active=decks[name];preferredModes[active.section]=name;state=read(active);if(storageOK&&modeKeys[active.section]){try{localStorage.setItem(modeKeys[active.section],name)}catch{storageOK=false;warn()}}closeHistory();render()}
for(const [name,b]of Object.entries(modeButtons))b.addEventListener('click',()=>switchMode(name));
document.addEventListener('practice-section',e=>{if(e.detail!=='german')cardVoice();reviewCursor=null;practiceActive=!e.detail.startsWith('arithmetic')&&!['programming','quant','digit-span'].includes(e.detail);closeHistory();if(practiceActive){const next=preferredModes[e.detail];if(mode===next){state=read(active);render()}else switchMode(next)}});
function skipKey(e){if(!practiceActive||(document.body.classList.contains('atlas-open')||document.body.classList.contains('weight-open'))||menuOpen()||e.ctrlKey||e.altKey||e.metaKey||e.isComposing)return;const next=e.code==='Space'||e.key===' '||e.key==='Enter';if(!next)return;const control=e.target.closest?.('input,textarea,select,[contenteditable="true"],summary,a,button');if(control&&control!==again)return;e.preventDefault();if(!e.repeat)nextCard()}
document.addEventListener('keydown',skipKey);
document.addEventListener('keydown',e=>{if(!practiceActive||menuOpen())return;if(e.key==='Escape'){closeHistory();today.focus({preventScroll:true})}});
today.addEventListener('click',()=>{history.hidden=!history.hidden;today.setAttribute('aria-expanded',String(!history.hidden));if(!history.hidden){state=read(active);renderHistory()}});$('close-history').addEventListener('click',()=>{closeHistory();today.focus({preventScroll:true})});
document.addEventListener('click',e=>{if(!e.target.closest('.tracker'))closeHistory()});
again.addEventListener('click',()=>{if(!practiceActive)return;const deck=active,restart=()=>{const fresh=read(deck);if(fresh.cursor===deck.limit){fresh.cursor=0;fresh.round++;if(deck.cumulative)fresh.run={correct:0,wrong:0};save(deck,fresh)}if(active===deck){state=fresh;render()}};if(navigator.locks?.request)navigator.locks.request(deck.key,restart).catch(()=>{if(active===deck){state=read(deck);render()}});else restart()});
window.addEventListener('storage',e=>{if(e.key===active.key||e.key===null){reviewCursor=null;state=read(active);render()}});
function refresh(){if(locked)return;const fresh=read(active);if(shownDay!==dayKey()||fresh.cursor!==state.cursor||fresh.round!==state.round){reviewCursor=null;state=fresh;render()}else{state=fresh;score()}}
window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
function scheduleMidnight(){clearTimeout(midnightTimer);const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);midnightTimer=setTimeout(()=>{reviewCursor=null;state=read(active);render();scheduleMidnight()},Math.max(100,next-now+30))}
const context=document.modelContext;if(context?.registerTool){const life=new AbortController();window.addEventListener('pagehide',()=>life.abort(),{once:true});try{Promise.resolve(context.registerTool({name:'get_german_practice_progress',title:'Read practice progress',description:'Read saved French, German, Japanese, Economics and Trivia card positions and daily practice totals without submitting an answer.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Expected an empty object');return {mode:active.title,frenchWordPosition:read(decks.frenchWords).cursor,frenchSentencePosition:read(decks.frenchSentences).cursor,wordPosition:read(decks.words).cursor,sentencePosition:read(decks.sentences).cursor,kanaPosition:read(decks.kana).cursor,kanjiPosition:read(decks.kanji).cursor,economicsPosition:read(decks.economics).cursor,triviaPosition:read(decks.trivia).cursor,triviaRun:read(decks.trivia).run,economicsWeek:read(decks.economics).week,economicsWeeks:read(decks.economics).weeks,round:state.round,today:dayKey(),days:state.days}}},{signal:life.signal})).catch(()=>{})}catch{}}
for(const [section,key]of Object.entries(modeKeys))try{const preferred=localStorage.getItem(key);if(Object.hasOwn(decks,preferred)&&decks[preferred].section===section)preferredModes[section]=preferred}catch{storageOK=false;warn()}
const startSection=location.hash.slice(1);practiceActive=!['arithmetic','programming','quant','digit-span'].includes(startSection);mode=preferredModes[startSection]||preferredModes.german;active=decks[mode];state=read(active);render();scheduleMidnight();
})();
