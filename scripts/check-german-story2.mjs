import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {germanStoryTwoCards,germanStoryTwoAudit,germanExtraFrequency} from './build-german-story2.mjs';
import {encode,decode,gameKey} from '../src/cloud-state.mjs';
assert.equal(germanStoryTwoCards.length,500);
assert.equal(germanStoryTwoAudit.familiarHeadwordsUsed,360);
assert.equal(germanStoryTwoAudit.additionalHeadwordsUsed,700);
assert.equal(germanExtraFrequency.rows.length,1000);
assert.equal(germanExtraFrequency.rows.filter(r=>r.basis==='FOLK private conversation').length,857);
assert(germanExtraFrequency.rows.every(r=>r.translation.trim()&&r.word.trim()));
const key='deutschstory2-500:v1',state={[key]:JSON.stringify({v:1,cursor:17,round:1,days:{}}),'german:mode:v1':'germanStoryTwo'};
assert(gameKey(key));assert(gameKey('repetition:'+key));
assert.deepEqual(await decode(await encode(state)),state);
const app=await fs.readFile('src/app.js','utf8');assert(app.includes("sequential:true,...remoteCards('german-story-2')"));
const source=await fs.readFile('src/german-story2.txt','utf8');
assert.equal(source.split(/^# /m).slice(1).length,50);
console.log('Story 2: 1000 additional distinct headwords, 500 bilingual cards, exact 360/700 headword coverage, ordered lazy deck and private cloud-safe progress passed.');

