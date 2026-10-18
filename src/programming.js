(()=>{'use strict';
const C=ProgramCourse,$=id=>document.getElementById(id),KEY='programming5000:v1',info=JSON.parse($('programming-info').textContent);
let deck=[],state=C.create(),memory=state,storageOK=true,storageNotice='',busy=false,shownToken=null,loadError=false,operation=Promise.resolve();
const percentage=(value,digits=1)=>value.toFixed(digits).replace(/\.?0+$/,'')+'%';
const token=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function notice(message){$('notice').textContent=[...new Set([message,storageNotice].filter(Boolean))].join(' ')}
function read(){if(!storageOK)return memory;try{const raw=localStorage.getItem(KEY);return raw?C.normalize(JSON.parse(raw)):C.create()}catch{storageOK=false;storageNotice='Saved progress could not be read. It has been kept unchanged. This session will use temporary progress.';notice('');return memory}}
function save(next){memory=next;if(!storageOK)return;try{const raw=JSON.stringify(next);if(localStorage.getItem(KEY)!==raw){localStorage.setItem(KEY,raw);try{parent.document.dispatchEvent(new Event('danki-progress'))}catch{}}}catch{storageOK=false;storageNotice='This browser could not save progress. Keep this page open to keep this session.';notice('')}}
function change(fn){const run=()=>{const next=read(),result=fn(next);save(next);state=next;return result};const task=()=>navigator.locks?.request?navigator.locks.request(KEY,run):Promise.resolve().then(run);const result=operation.then(task);operation=result.catch(()=>{});return result}
function setControls(){document.body.setAttribute('aria-busy',String(busy));for(const id of ['again','retry','next-card'])$(id).disabled=busy}
function statLine(container,label,value){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;container.append(dt,dd)}
function renderStats(){
 const s=C.stats(state,info),values=$('stats-values');values.replaceChildren();
 for(const [label,value]of [['Cards completed',s.completed.toLocaleString()],['Cards remaining',s.remaining.toLocaleString()],['Total progress',percentage(s.totalProgress,2)]])statLine(values,label,value);
 if(s.accuracy!==null){statLine(values,'Earlier accuracy',percentage(s.accuracy));statLine(values,'Earlier mastered',s.mastered.toLocaleString());statLine(values,'Earlier weak',s.weak.toLocaleString())}
 const history=$('weeks-history');history.replaceChildren();
 const days=Object.entries(state.studyDays||{}).sort(([a],[b])=>b.localeCompare(a));
 for(const [day,count]of days){const item=document.createElement('div');item.className='week-history';item.textContent=day+' · Practiced '+count.toLocaleString();history.append(item)}
 for(const [week,w]of Object.entries(state.weeks).sort((a,b)=>+b[0]-+a[0])){const item=document.createElement('div');item.className='week-history';const title=document.createElement('strong');title.textContent='COURSE PART '+week;const details=document.createElement('div'),graded=w.known+w.wrong;details.textContent='Practiced '+(graded+(w.skipped||0))+'/'+info.weeks[+week-1].count+(graded?' · Earlier accuracy '+percentage(100*w.known/graded):'');item.append(title,details);history.append(item)}
 if(!history.childElementCount){const p=document.createElement('p');p.textContent='Your practice history will appear here.';history.append(p)}
}
function render(){
 const s=C.stats(state,info);$('total-progress').textContent='TOTAL PROGRESS: '+percentage(s.totalProgress,2);$('completed-mini').textContent=s.completed.toLocaleString()+' / 5000 completed';
 $('study').hidden=true;$('complete').hidden=true;$('retry').hidden=!loadError;
 if(loadError){shownToken=null;$('card').textContent='CARD —/5000';return}
 if(state.current){const current=state.current,card=deck[current.id-1];shownToken=current.token;$('study').hidden=false;$('card').textContent='CARD '+card.id+'/5000';$('review-label').textContent=card.subject;$('question').textContent=card.question;$('code').textContent=card.code||'';$('code').hidden=!card.code;$('answer').textContent=card.answer}
 else{shownToken=null;$('complete').hidden=false;$('card').textContent='CARD 5000/5000'}
 if(!$('stats').hidden)renderStats();setControls();
}
async function refresh(){if(!deck.length||loadError)return;await change(s=>C.presentStudy(s,deck,info,Date.now(),token));render()}
async function load(){
 busy=true;loadError=false;$('retry').hidden=true;notice('');setControls();
 try{const embedded=$('programming-data').textContent.trim();if(embedded&&embedded!=='[]')deck=JSON.parse(embedded);else{const response=await fetch('programming/cards.json?v='+info.contentHash);if(!response.ok)throw Error('Course download failed');deck=await response.json()}
 const fields=['question','answer','difficulty','week','subject','topic','subtopic','timesSeen','timesCorrect','timesWrong','masteryState','lastReviewed','nextReview'];
 if(deck.length!==5000||info.weeks.length!==52||deck.some((c,i)=>c.id!==i+1||fields.some(f=>!(f in c))||!c.question||!c.answer))throw Error('Invalid course');notice('');await refresh()}
 catch{loadError=true;notice('The course could not load. Your saved progress has been kept. Please try again.');render()}
 finally{busy=false;setControls()}
}
function menuOpen(){try{return parent!==window&&!!parent.document.querySelector('.games-menu[open]')}catch{return false}}
async function advance(){
 if(busy||loadError||!deck.length||!$('stats').hidden||menuOpen()||document.hidden)return;busy=true;setControls();const attempt=shownToken;
 try{await change(s=>{if(attempt)C.skipStudy(s,attempt,Date.now(),info);else C.startStudyReplay(s);C.presentStudy(s,deck,info,Date.now(),token)});render()}
 catch{notice('Progress could not be saved. Please try again.')}
 finally{busy=false;setControls()}
}
$('again').addEventListener('click',advance);document.addEventListener('study-next',advance);
$('next-card').addEventListener('click',advance);
function stats(open){$('stats').hidden=!open;$('stats-toggle').setAttribute('aria-expanded',String(open));if(open)renderStats()}
$('stats-toggle').addEventListener('click',()=>stats($('stats').hidden));$('stats-close').addEventListener('click',()=>stats(false));$('retry').addEventListener('click',load);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('stats').hidden){stats(false);$('stats-toggle').focus();return}if(e.isComposing||e.ctrlKey||e.altKey||e.metaKey||!(e.key==='Enter'||e.key===' '||e.code==='Space'))return;const control=e.target.closest?.('input,textarea,select,[contenteditable="true"],summary,a,button');if(control&&control!==$('again'))return;e.preventDefault();if(!e.repeat)advance()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)refresh().catch(()=>notice('Progress could not refresh. Please reload.'))});
window.addEventListener('storage',e=>{if((e.key===KEY||e.key===null)&&!busy)refresh().catch(()=>notice('Progress could not refresh. Please reload.'))});
state=read();memory=state;load();
})();
