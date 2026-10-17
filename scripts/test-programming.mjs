import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),deck=JSON.parse(await fs.readFile(new URL('src/programming/cards.json',root),'utf8')),info=JSON.parse(await fs.readFile(new URL('src/programming/summary.json',root),'utf8')),plan=JSON.parse(await fs.readFile(new URL('src/programming/curriculum-plan.json',root),'utf8'));
const context=vm.createContext({Date,Math,Set,Map});vm.runInContext(await fs.readFile(new URL('src/programming-scheduler.js',root),'utf8'),context);const C=context.ProgramCourse;
let checks=0,serial=0;function check(name,fn){fn();checks++;console.log('PASS '+name)}
let now=Date.parse('2026-10-04T09:00:00Z');const unique=()=>String(++serial);
const present=s=>C.present(s,deck,info,now,unique);
const grade=(s,known,hesitant=false)=>{const current=present(s);assert.ok(current);assert.equal(C.grade(s,current.token,known,now,info,hesitant),true);now+=10;return current};
// Review selection has its own ordering tests. Target one studied card here to isolate its day-based rating rules.
const reviewTarget=(s,id,known)=>{s.cards[id].timesSeen++;s.current={id,kind:'due',week:1,token:unique(),shownAt:new Date(now).toISOString()};assert.equal(C.grade(s,s.current.token,known,now,info),true);now+=10};
const roundTrip=s=>C.normalize(JSON.parse(JSON.stringify(s)));
check('exact deck, weights, IDs and all required fields',()=>{
 assert.equal(deck.length,5000);const counts={};const required=['id','question','answer','difficulty','week','subject','topic','subtopic','timesSeen','timesCorrect','timesWrong','masteryState','lastReviewed','nextReview'];
 for(const [i,c]of deck.entries()){assert.equal(c.id,i+1);for(const field of required)assert.ok(field in c);assert.ok(c.question.trim()&&c.answer.trim());assert.ok(!/^Programming question \d/i.test(c.question));assert.equal(c.masteryState,'NEW');assert.equal(c.difficultyLevel,Math.floor(i/500)+1);if(i)assert.ok(c.difficulty>deck[i-1].difficulty);for(const prerequisite of c.prerequisites)assert.ok(prerequisite<c.id);counts[c.subject]=(counts[c.subject]||0)+1}
 assert.deepEqual(counts,info.subjects);assert.deepEqual(counts,plan.subjects);assert.equal(new Set(deck.map(c=>c.question.toLowerCase().replace(/\s+/g,' ').trim())).size,5000);assert.equal(deck[0].question,'What is a computer?');assert.equal(deck.at(-1).subtopic,'end-to-end application failure diagnosis');
});
check('52 continuous week ranges with eight 97-card weeks',()=>{assert.equal(info.weeks.length,52);let next=1;for(const w of info.weeks){assert.equal(w.start,next);assert.equal(w.count,w.week<=8?97:96);assert.equal(w.end-w.start+1,w.count);for(const c of deck.slice(w.start-1,w.end))assert.equal(c.week,w.week);next=w.end+1}assert.equal(next,5001)});
check('presentation is stable across reload and can only be graded once',()=>{const s=C.create(),first=present(s);present(s);assert.equal(s.cards[1].timesSeen,1);const loaded=roundTrip(s);assert.equal(present(loaded).token,first.token);assert.ok(C.grade(loaded,first.token,true,now,info));assert.equal(C.grade(loaded,first.token,false,now,info),false);assert.equal(loaded.nextId,2);assert.equal(loaded.cards[1].timesCorrect,1)});
check('wrong returns after two cards, then repeated wrong after one',()=>{
 const s=C.create();grade(s,false,true);assert.equal(s.cards[1].masteryState,'WEAK');assert.equal(s.cards[1].hesitations,1);assert.equal(grade(s,true).id,2);assert.equal(grade(s,true).id,3);const review=grade(s,false);assert.equal(review.id,1);assert.equal(review.kind,'due');assert.equal(s.nextId,4);assert.equal(grade(s,true).id,4);assert.equal(grade(s,true).id,1);assert.equal(s.cards[1].masteryState,'LEARNING');assert.equal(s.nextId,5);
});
check('known intervals increase and mastery requires days of reviews',()=>{
 const s=C.create();const original=now;grade(s,true);assert.equal(s.cards[1].masteryState,'LEARNING');assert.ok(Math.abs(Date.parse(s.cards[1].nextReview)-original-C.DAY)<20);
 now=original+C.DAY+100;reviewTarget(s,1,true);assert.equal(s.cards[1].masteryState,'GOOD');const second=Date.parse(s.cards[1].lastReviewed);assert.equal(Date.parse(s.cards[1].nextReview)-second,3*C.DAY);
 now=second+3*C.DAY+100;reviewTarget(s,1,true);assert.equal(s.cards[1].masteryState,'GOOD');const third=Date.parse(s.cards[1].lastReviewed);assert.equal(Date.parse(s.cards[1].nextReview)-third,7*C.DAY);
 now=third+7*C.DAY+100;reviewTarget(s,1,true);assert.equal(s.cards[1].masteryState,'MASTERED');const fourth=Date.parse(s.cards[1].lastReviewed);assert.equal(Date.parse(s.cards[1].nextReview)-fourth,14*C.DAY);
 now=fourth+14*C.DAY+100;reviewTarget(s,1,false);assert.equal(s.cards[1].masteryState,'WEAK');assert.equal(s.cards[1].streak,0);
});
check('due reviews cannot starve ordered new cards',()=>{const s=C.create();for(let i=0;i<30;i++)assert.equal(grade(s,true).id,i+1);now+=2*C.DAY;assert.equal(grade(s,true).kind,'due');assert.equal(grade(s,true).kind,'due');assert.equal(grade(s,true).id,31);assert.equal(s.nextId,32)});
check('review priority favors weak, hesitant and upcoming prerequisite cards',()=>{const s=C.create();for(let i=0;i<97;i++){grade(s,true)}const r=s.cards[90];r.masteryState='WEAK';r.timesWrong=3;r.timesSeen+=3;r.wrongStreak=2;r.hesitations=3;r.nextReview=new Date(now-1).toISOString();const choices=C.reviewSelection(s,deck,info,now);assert.equal(choices[0],90);assert.ok(choices.every(id=>id<s.nextId));assert.equal(choices.length,16);assert.ok(C.startWeekly(s,deck,info,now));assert.equal(s.pendingReview.mode,'review');const loaded=roundTrip(s);assert.deepEqual(loaded.pendingReview.queue,s.pendingReview.queue)});
check('all 5,000 new cards and all 52 week reviews preserve continuous progress',()=>{
 const s=C.create();let newCards=0,reviews=0,weeks=0;const order=[];const starting=now;
 while(s.nextId<=5000||s.pendingReview){
  if(s.pendingReview?.mode==='summary'){const p=s.pendingReview;weeks++;assert.equal(p.week,weeks);assert.equal(C.choose(s,deck,info,now),null);assert.equal(C.stats(s,info).weekProgress,100);const stored=JSON.stringify(s);now+=1;assert.equal(JSON.stringify(roundTrip(s)),stored);assert.ok(C.startWeekly(s,deck,info,now));continue}
  if(s.pendingReview?.mode==='complete'){assert.ok(C.finishWeekly(s));continue}
  const c=grade(s,true);if(c.kind==='new'){newCards++;order.push(c.id)}else reviews++;
 }
 assert.equal(newCards,5000);assert.equal(weeks,52);assert.equal(reviews,52*16);assert.deepEqual(order,Array.from({length:5000},(_,i)=>i+1));assert.equal(C.stats(s,info).totalProgress,100);assert.equal(C.stats(s,info).remaining,0);assert.equal(C.stats(s,info).mastered,0);assert.ok(now-starting<C.DAY);assert.equal(C.choose(s,deck,info,now),null);
 const restored=roundTrip(s);now+=400*C.DAY;assert.equal(C.stats(restored,info).completed,5000);assert.equal(C.stats(restored,info).week,52);assert.equal(Object.keys(restored.weeks).length,52);assert.equal(C.choose(restored,deck,info,now).kind,'due');now-=400*C.DAY;
 assert.ok(C.startPractice(s,deck,info,now));for(let i=0;i<16;i++){const c=grade(s,true);assert.equal(c.kind,'practice')}assert.equal(s.nextId,5001);assert.equal(s.practice.mode,'complete');assert.ok(C.finishPractice(s));assert.equal(s.nextId,5001);
});
check('saved state validation keeps malformed progress from silently resetting',()=>{assert.throws(()=>C.normalize({version:99}));const s=C.create();grade(s,true);const missing=JSON.parse(JSON.stringify(s));delete missing.cards[1];assert.throws(()=>C.normalize(missing));const invalid=JSON.parse(JSON.stringify(s));invalid.cards[1].masteryState='INVALID';assert.throws(()=>C.normalize(invalid));assert.equal(roundTrip(s).nextId,2)});
check('personal saved data remains well below browser storage budgets',()=>{const s=C.create();for(let id=1;id<=5000;id++){const r=C.rowFor(s,id);Object.assign(r,{timesSeen:20,timesCorrect:17,timesWrong:3,masteryState:'GOOD',lastReviewed:new Date(now).toISOString(),nextReview:new Date(now+C.DAY).toISOString(),firstReviewed:new Date(now-30*C.DAY).toISOString(),streak:5,wrongStreak:0,correctDays:['2026-10-01','2026-10-02','2026-10-03'],hesitations:3})}assert.ok(Buffer.byteLength(JSON.stringify(s))<2000000)});
check('study skips keep existing ratings and resume after an old review',()=>{
 const s=C.create();grade(s,false);const old=JSON.stringify(s.cards[1]);C.presentStudy(s,deck,info,now,unique);assert.equal(s.current.id,2);const attempt=s.current.token;assert.ok(C.skipStudy(s,attempt,now,info));assert.equal(C.skipStudy(s,attempt,now,info),false);assert.equal(s.nextId,3);assert.equal(s.cards[2].timesSkipped,1);assert.equal(s.cards[2].timesCorrect,0);assert.equal(s.cards[2].timesWrong,0);assert.equal(s.cards[2].masteryState,'NEW');assert.equal(JSON.stringify(s.cards[1]),old);assert.equal(roundTrip(s).nextId,3);
});
check('study visits all 5,000 cards without reveal or course-week stops',()=>{
 const s=C.create();for(let id=1;id<=5000;id++){const c=C.presentStudy(s,deck,info,now,unique);assert.equal(c.id,id);assert.ok(C.skipStudy(s,c.token,now,info));assert.equal(s.pendingReview,null)}
 const restored=roundTrip(s);assert.equal(restored.nextId,5001);assert.equal(C.presentStudy(restored,deck,info,now,unique),null);assert.equal(C.stats(restored,info).totalProgress,100);assert.equal(C.stats(restored,info).accuracy,null);assert.equal(Object.values(restored.studyDays).reduce((a,b)=>a+b,0),5000);
 assert.ok(C.startStudyReplay(restored));assert.equal(C.presentStudy(restored,deck,info,now,unique).id,1);assert.ok(C.skipStudy(restored,restored.current.token,now,info));assert.equal(restored.nextId,5001);assert.equal(C.presentStudy(roundTrip(restored),deck,info,now,unique).id,2);assert.equal(C.stats(restored,info).totalProgress,100);
});
console.log(JSON.stringify({checks,cards:deck.length,weeks:info.weeks.length,subjectWeights:info.subjects}));
