import assert from 'node:assert/strict';
import {proteinDay,proteinLastDay,proteinDays,proteinAverage,proteinChartData,createProteinStore} from '../src/weight-tracker/protein-tracker.mjs';

const now=new Date(2026,10,9,12).getTime(),today=proteinDay(now),yesterday=proteinDays(now,-1).at(-1).key;
assert.equal(proteinAverage({[yesterday]:2200,[today]:9000},now),2200);
assert.equal(proteinAverage({[today]:1000},now),null);
const chart=proteinChartData({[today]:2000,[yesterday]:1800,'2026-02-30':100},2250,now);
assert.deepEqual(chart.points.map(p=>p.value),[1800,2000]);
assert.deepEqual(chart.y,[1790,2260]);
assert.equal(chart.target,2250);
assert.equal(proteinChartData({},2000,now).points.length,0);

let listener,saved,ready,data,disposed=false;
// Existing protein history used a flat day map; preserve it when upgrading.
const legacy='{"2026-11-08":125.5}';
const auth={currentUser:{uid:'alice'}};
const snapshot=(fromCache=false)=>({metadata:{fromCache},exists:()=>!!saved,data:()=>saved});
const sdk={
 doc:(db,...path)=>path.join('/'),
 onSnapshot:(ref,options,cb)=>{assert.equal(ref,'users/alice/progress/daily-protein');listener=cb;return()=>disposed=true;},
 serverTimestamp:()=>1,
 async runTransaction(db,action){
  await action({get:async()=>snapshot(),set:(ref,value)=>{assert.equal(ref,'users/alice/progress/daily-protein');saved=value;}});
  listener(snapshot());
 }
};
const store=createProteinStore({auth,sdk,uid:'alice',now:()=>now,onChange:(value,synced)=>{data=value;ready=synced;}});
listener(snapshot(true));
await assert.rejects(store.adjust(1),/WAIT FOR CLOUD SYNC/);
saved={value:legacy,revision:0};listener(snapshot());assert.equal(data.days['2026-11-08'],125.5);saved=undefined;listener(snapshot());
assert(ready);
await Promise.all([store.adjust(500),store.setTarget('2150'),store.adjust(300)]);
assert.deepEqual(data,{days:{[today]:800},target:2150});
assert.equal(saved.revision,3);
await store.adjust(-150);
assert.equal(data.days[today],650);
await store.adjust(-999);
assert.equal(data.days[today],0);
await store.setTarget('');
assert.equal(data.target,null);
await assert.rejects(store.adjust(NaN),/PROTEIN/);
await assert.rejects(store.setTarget('0'),/TARGET PROTEIN/);
await store.adjust(1000,yesterday);
await store.adjust(-200,yesterday);
assert.equal(data.days[yesterday],800);assert.equal(data.days[today],0);
await assert.rejects(store.adjust(100,'2026-02-30'),/DATE/);
await store.adjust(2000,'2026-11-10');
await store.adjust(1800,'2026-11-14');
await store.adjust(-300,'2026-11-14');
assert.equal(data.days['2026-11-10'],2000);assert.equal(data.days['2026-11-14'],1500);assert.equal(data.days[today],0);
assert.equal(proteinAverage(data.days,now),800,'Future plans stay out of the historical average');
assert.equal(proteinChartData(data.days,null,now).points.at(-1).id,'2026-11-14');
await assert.rejects(store.adjust(100,'2026-11-15'),/DATE/);
assert.equal(proteinLastDay(new Date(2026,10,28,12)),'2026-12-03');
assert.equal(proteinLastDay(new Date(2026,11,29,12)),'2027-01-03');
assert.equal(proteinLastDay(new Date(2028,1,27,12)),'2028-03-03');
assert.equal(proteinLastDay(new Date(2026,2,26,12)),'2026-03-31');
auth.currentUser={uid:'bob'};
await assert.rejects(store.adjust(200),/SIGN IN/);
await assert.rejects(store.setTarget('2000'),/SIGN IN/);
store.dispose();
assert(disposed);
console.log('Proteins passed: daily totals, 10-gram bounds, target, transactional writes, floor, offline and account isolation.');

assert.equal(proteinChartData({[today]:134},157,now).y[0]%10,0);assert.equal(proteinChartData({[today]:134},157,now).y[1]%10,0);
