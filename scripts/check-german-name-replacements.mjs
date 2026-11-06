import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {selectGermanWords} from './select-german-words.mjs';
const read=async path=>JSON.parse(await fs.readFile(path,'utf8'));
const source=await read('src/words.json'),active=await read('dist/german/words.json'),{rows}=await read('src/german-word-replacements.json');
assert.equal(source.length,5000);assert.equal(active.length,1000);assert.equal(rows.length,12);
assert.deepEqual(active,selectGermanWords(source));
const slots=new Set(rows.map(row=>row.originalPosition-1)),names=new Set(rows.map(row=>row.word.toLowerCase()));
assert.equal(new Set(active.map(card=>card[0].toLowerCase())).size,1000);
assert(!active.some(card=>names.has(card[0].toLowerCase())));
for(let i=0;i<1000;i++)if(!slots.has(i))assert.deepEqual(active[i],source[i],'Unchanged card shifted at '+i);
for(const row of rows){assert(row.sourcePosition>1000);assert.deepEqual(active[row.originalPosition-1],source[row.sourcePosition-1]);}
console.log('PASS 12 name/name-like entries replaced; 988 cards stay in their original slots; 1000 unique common-word cards; archived source unchanged.');
