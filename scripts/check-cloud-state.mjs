import assert from 'node:assert/strict';
import {gameKey,snapshot,validate,encode,decode,choose} from '../src/cloud-state.mjs';
for(const key of ['deutsch5000:v1','quant5000:v1','korean:hangul:v1','weekly-arithmetic-v1:practice:2026-10-12:device-abc','weekly-arithmetic-v1:settings'])assert(gameKey(key),key);
for(const key of ['firebase:authUser:secret','danki:owner:v1','unrelated','__proto__','weekly-arithmetic-v1:secret'])assert(!gameKey(key),key);
const a={'deutsch5000:v1':JSON.stringify({cursor:3,days:{}})},b={'deutsch5000:v1':JSON.stringify({cursor:4,days:{}})},c={'deutsch5000:v1':JSON.stringify({cursor:8,days:{}})};
assert.equal(choose(a,a,b),'remote');assert.equal(choose(a,b,a),'local');assert.equal(choose(a,b,c),'conflict');assert.equal(choose(null,{},b),'remote');assert.equal(choose(null,b,{}),'local');assert.equal(choose(a,b,b),'equal');
assert.deepEqual(await decode(await encode(b)),b);
assert.deepEqual(await decode('j:'+JSON.stringify(a)),a);
assert.deepEqual(await decode(await encode({'german:mode:v1':'sentences'})),{'german:mode:v1':'sentences'});
assert.throws(()=>validate({'firebase:authUser:secret':'"token"'}));
await assert.rejects(()=>decode('j:'+JSON.stringify({'deutsch5000:v1':'broken json'})));
const map=new Map([...Object.entries(a),['private-token','secret']]);const fake={get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)};assert.deepEqual(snapshot(fake),a);
// Full course histories remain below the document cap after compression.
const course={cards:Object.fromEntries(Array.from({length:5000},(_,i)=>[i+1,{id:i+1,timesSeen:4,timesSkipped:4,lastPracticed:'2026-10-18T10:00:00.000Z'}]))};
const big={'programming5000:v1':JSON.stringify(course),'quant5000:v1':JSON.stringify(course)};const packed=await encode(big);assert(packed.length<700000);assert.deepEqual(await decode(packed),big);
console.log('Cloud state checks passed: filtering, conflicts, compression and full-course size.');
