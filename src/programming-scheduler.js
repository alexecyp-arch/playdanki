/* A course week is a curriculum chunk, never a calendar reset. */
(()=>{'use strict';
const DAY=86400000,TOTAL=5000,INTERVALS=[1,3,7,14,30,60,120],STATES=['NEW','LEARNING','WEAK','GOOD','MASTERED'];
const integer=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const dateKey=now=>{const d=new Date(now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const iso=now=>new Date(now).toISOString();
function create(){return {version:1,nextId:1,turn:0,cards:{},weeks:{},current:null,pendingReview:null,practice:null,reviewStreak:0,lastId:null}}
function normalize(value){
 if(!value||value.version!==1||!integer(value.nextId,1,TOTAL+1)||!integer(value.turn,0,100000000)||!value.cards||!value.weeks)throw Error('Unrecognized saved course');
 const s=Object.assign(create(),value);
 for(const [key,r]of Object.entries(s.cards)){
  if(!integer(+key,1,TOTAL)||!r||r.id!==+key||!integer(r.timesSeen,0,10000000)||!integer(r.timesCorrect,0,10000000)||!integer(r.timesWrong,0,10000000)||!integer(r.timesSkipped||0,0,10000000)||r.timesCorrect+r.timesWrong+(r.timesSkipped||0)>r.timesSeen||!STATES.includes(r.masteryState)||!Array.isArray(r.correctDays))throw Error('Invalid saved card');
 }
 for(let id=1;id<s.nextId;id++)if(!s.cards[id]||s.cards[id].timesCorrect+s.cards[id].timesWrong+(s.cards[id].timesSkipped||0)===0)throw Error('Saved course has a missing completed card');
 if(s.studyReplay&&!integer(s.studyReplay.cursor,1,TOTAL+1))throw Error('Invalid saved replay');
 for(const queue of [s.pendingReview,s.practice])if(queue){if(!Array.isArray(queue.queue)||queue.queue.some(id=>!integer(id,1,s.nextId-1))||!integer(queue.position,0,queue.queue.length)||!['summary','review','complete'].includes(queue.mode))throw Error('Invalid saved review')}
 if(s.current){const c=s.current;if(!integer(c.id,1,TOTAL)||typeof c.token!=='string'||!['new','due','weekly','practice'].includes(c.kind)||!s.cards[c.id]||c.kind==='new'&&c.id!==s.nextId||c.kind!=='new'&&c.id>=s.nextId)throw Error('Invalid saved presentation')}
 return s;
}
function rowFor(s,id){return s.cards[id]||(s.cards[id]={id,timesSeen:0,timesCorrect:0,timesWrong:0,masteryState:'NEW',lastReviewed:null,nextReview:null,firstReviewed:null,streak:0,wrongStreak:0,correctDays:[],reviewTurn:null,hesitations:0})}
function weekFor(s,info){const id=Math.min(s.nextId,TOTAL);return info.weeks.find(w=>id<=w.end).week}
function weekRow(s,week){return s.weeks[week]||(s.weeks[week]={known:0,wrong:0,reviewsKnown:0,reviewsWrong:0,reviewComplete:false,completedAt:null})}
function isDue(s,r,now){return r.timesCorrect+r.timesWrong>0&&(r.reviewTurn!==null&&r.reviewTurn<=s.turn||r.nextReview!==null&&Date.parse(r.nextReview)<=now)}
function priority(s,card,now,upcoming){const r=s.cards[card.id];return (r.masteryState==='WEAK'?100:0)+r.wrongStreak*20+Math.min(r.timesWrong,8)*3+Math.min(r.hesitations,4)*12+(card.foundational?10:0)+(upcoming.has(card.id)?35:0)+(isDue(s,r,now)?30:0)-Math.min(r.timesCorrect,10)*2-Math.min(r.timesSeen,20)*.2}
function studied(s,deck){return deck.slice(0,s.nextId-1).filter(c=>s.cards[c.id]&&s.cards[c.id].timesCorrect+s.cards[c.id].timesWrong>0)}
function dueCards(s,deck,now){const upcoming=new Set();return studied(s,deck).filter(c=>isDue(s,s.cards[c.id],now)).sort((a,b)=>priority(s,b,now,upcoming)-priority(s,a,now,upcoming)||Date.parse(s.cards[a.id].lastReviewed)-Date.parse(s.cards[b.id].lastReviewed)||a.id-b.id)}
function reviewSelection(s,deck,info,now,limit=16){
 const nextWeek=info.weeks.find(w=>w.week===Math.min(52,weekFor(s,info))),upcoming=new Set();
 for(const card of deck.slice(s.nextId-1,Math.min(TOTAL,nextWeek?.end||s.nextId+96)))for(const id of card.prerequisites||[])if(id<s.nextId)upcoming.add(id);
 const pool=studied(s,deck).sort((a,b)=>priority(s,b,now,upcoming)-priority(s,a,now,upcoming)||Date.parse(s.cards[a.id].lastReviewed)-Date.parse(s.cards[b.id].lastReviewed)||a.id-b.id);
 return pool.slice(0,limit).map(c=>c.id);
}
function choose(s,deck,info,now){
 if(s.pendingReview){const p=s.pendingReview;return p.mode==='review'&&p.position<p.queue.length?{id:p.queue[p.position],kind:'weekly',week:p.week}:null}
 if(s.practice){const p=s.practice;return p.mode==='review'&&p.position<p.queue.length?{id:p.queue[p.position],kind:'practice',week:52}:null}
 const due=dueCards(s,deck,now),candidate=due.find(c=>c.id!==s.lastId)||due[0];
 if(candidate&&(s.nextId>TOTAL||s.reviewStreak<2))return {id:candidate.id,kind:'due',week:weekFor(s,info)};
 return s.nextId<=TOTAL?{id:s.nextId,kind:'new',week:weekFor(s,info)}:null;
}
function present(s,deck,info,now,token){
 if(s.current)return s.current;
 const choice=choose(s,deck,info,now);if(!choice)return null;
 const r=rowFor(s,choice.id);r.timesSeen++;s.current={...choice,token:typeof token==='function'?token():token,shownAt:iso(now)};return s.current;
}
function grade(s,token,known,now,info,hesitant=false){
 const c=s.current;if(!c||c.token!==token)return false;
 const r=rowFor(s,c.id),w=weekRow(s,c.week);s.turn++;r.lastReviewed=iso(now);r.firstReviewed=r.firstReviewed||r.lastReviewed;if(hesitant)r.hesitations++;
 if(known){
  r.timesCorrect++;r.streak++;r.wrongStreak=0;r.reviewTurn=null;
  const day=dateKey(now);if(!r.correctDays.includes(day))r.correctDays.push(day);r.correctDays=r.correctDays.slice(-8);
  r.masteryState=r.streak>=4&&r.correctDays.length>=3&&now-Date.parse(r.firstReviewed)>=7*DAY?'MASTERED':r.streak>=2?'GOOD':'LEARNING';
  r.nextReview=iso(now+INTERVALS[Math.min(r.streak-1,INTERVALS.length-1)]*DAY);
 }else{
  r.timesWrong++;r.streak=0;r.wrongStreak++;r.masteryState='WEAK';r.reviewTurn=s.turn+(r.wrongStreak>=2?1:2);r.nextReview=iso(now+180000);
 }
 if(c.kind==='new'){
  known?w.known++:w.wrong++;s.nextId++;s.reviewStreak=0;
  const week=info.weeks.find(item=>item.week===c.week);
  if(c.id===week.end){w.completedAt=iso(now);s.pendingReview={week:c.week,mode:'summary',queue:[],position:0,known:0,wrong:0}}
 }else{
  known?w.reviewsKnown++:w.reviewsWrong++;s.reviewStreak++;
  const p=c.kind==='weekly'?s.pendingReview:c.kind==='practice'?s.practice:null;
  if(p){known?p.known++:p.wrong++;p.position++;if(p.position===p.queue.length){p.mode='complete';if(c.kind==='weekly')w.reviewComplete=true}}
 }
 s.lastId=c.id;s.current=null;return true;
}
function startWeekly(s,deck,info,now){const p=s.pendingReview;if(!p||p.mode!=='summary')return false;p.queue=reviewSelection(s,deck,info,now);p.position=0;p.known=0;p.wrong=0;p.mode=p.queue.length?'review':'complete';return true}
function finishWeekly(s){const p=s.pendingReview;if(!p||p.mode!=='complete')return false;weekRow(s,p.week).reviewComplete=true;s.pendingReview=null;s.reviewStreak=0;return true}
function startPractice(s,deck,info,now){if(s.nextId<=TOTAL||s.pendingReview||s.practice||s.current)return false;s.practice={mode:'review',queue:reviewSelection(s,deck,info,now),position:0,known:0,wrong:0};if(!s.practice.queue.length)s.practice.mode='complete';return true}
function finishPractice(s){if(s.practice?.mode!=='complete')return false;s.practice=null;s.reviewStreak=0;return true}
function stats(s,info){
 let known=0,wrong=0,mastered=0,weak=0;for(const r of Object.values(s.cards)){known+=r.timesCorrect;wrong+=r.timesWrong;if(r.masteryState==='MASTERED')mastered++;if(r.masteryState==='WEAK')weak++}
 const completed=s.nextId-1,week=s.pendingReview?.week||weekFor(s,info),range=info.weeks[week-1],inWeek=Math.max(0,Math.min(range.count,completed-range.start+1));
 return {completed,remaining:TOTAL-completed,known,wrong,accuracy:known+wrong?100*known/(known+wrong):null,mastered,weak,week,weekCompleted:inWeek,weekCount:range.count,weekProgress:100*inWeek/range.count,totalProgress:100*completed/TOTAL};
}
// Reading a shown answer counts as practice, without changing earlier ratings.
function presentStudy(s,deck,info,now,token){
 s.pendingReview=null;s.practice=null;
 if(s.current)return s.current;
 const replay=s.studyReplay,id=replay?replay.cursor:s.nextId;if(id>TOTAL)return null;
 const card=deck[id-1],r=rowFor(s,id);r.timesSeen++;s.current={id,kind:replay?'practice':'new',week:card.week,token:typeof token==='function'?token():token,shownAt:iso(now)};return s.current;
}
function skipStudy(s,token,now,info){
 const c=s.current;if(!c||c.token!==token)return false;
 const r=rowFor(s,c.id),w=weekRow(s,c.week);r.timesSkipped=(r.timesSkipped||0)+1;r.lastPracticed=iso(now);
 s.studyDays=s.studyDays||{};const day=dateKey(now);s.studyDays[day]=(s.studyDays[day]||0)+1;
 if(s.studyReplay){s.studyReplay.cursor++;w.reviewsSkipped=(w.reviewsSkipped||0)+1}
 else if(c.kind==='new'){s.nextId++;w.skipped=(w.skipped||0)+1;if(c.id===info.weeks[c.week-1].end)w.completedAt=w.completedAt||iso(now)}
 else w.reviewsSkipped=(w.reviewsSkipped||0)+1;
 s.lastId=c.id;s.current=null;return true;
}
function startStudyReplay(s){if(s.nextId<=TOTAL||s.current||s.studyReplay&&s.studyReplay.cursor<=TOTAL)return false;s.studyReplay={cursor:1};s.studyRound=(s.studyRound||1)+1;return true}
globalThis.ProgramCourse=Object.freeze({DAY,TOTAL,create,normalize,dateKey,rowFor,weekFor,weekRow,isDue,dueCards,reviewSelection,choose,present,grade,startWeekly,finishWeekly,startPractice,finishPractice,stats,presentStudy,skipStudy,startStudyReplay});
})();
