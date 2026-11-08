import assert from 'node:assert/strict';
import {calorieDay,calorieDays,calorieAverage,calorieChartData,createCalorieStore} from '../src/weight-tracker/calories.mjs';

const now=new Date(2026,10,9,12).getTime(),today=calorieDay(now),yesterday=calorieDays(now,-1).at(-1).key;
assert.equal(calorieAverage({[yesterday]:2200,[today]:9000},now),2200);
assert.equal(calorieAverage({[today]:1000},now),null);
const chart=calorieChartData({[today]:2000,[yesterday]:1800,'2026-02-30':100},2250,now);
assert.deepEqual(chart.points.map(p=>p.value),[1800,2000]);
assert.deepEqual(chart.y,[1700,2400]);
assert.equal(chart.target,2250);
assert.equal(calorieChartData({},2000,now).points.length,0);

let listener,saved,ready,data,disposed=false;
const auth={currentUser:{uid:'alice'}};
const snapshot=(fromCache=false)=>({metadata:{fromCache},exists:()=>!!saved,data:()=>saved});
const sdk={
 doc:(db,...path)=>path.join('/'),
 onSnapshot:(ref,options,cb)=>{assert.equal(ref,'users/alice/progress/daily-calories');listener=cb;return()=>disposed=true;},
 serverTimestamp:()=>1,
 async runTransaction(db,action){
  await action({get:async()=>snapshot(),set:(ref,value)=>{assert.equal(ref,'users/alice/progress/daily-calories');saved=value;}});
  listener(snapshot());
 }
};
const store=createCalorieStore({auth,sdk,uid:'alice',now:()=>now,onChange:(value,synced)=>{data=value;ready=synced;}});
listener(snapshot(true));
await assert.rejects(store.adjust(1),/WAIT FOR CLOUD SYNC/);
listener(snapshot());
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
await assert.rejects(store.adjust(1.5),/CALORIES/);
await assert.rejects(store.setTarget('0'),/TARGET CALORIES/);
auth.currentUser={uid:'bob'};
await assert.rejects(store.adjust(200),/SIGN IN/);
await assert.rejects(store.setTarget('2000'),/SIGN IN/);
store.dispose();
assert(disposed);
console.log('Calories passed: daily totals, 100-kcal bounds, target, transactional writes, floor, offline and account isolation.');
