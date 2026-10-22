import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const original=JSON.parse(await read('src/sentences.json')).slice(0,1000);
assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'37a32a56e00514c3d80158a9726049ef5a06a0879b963423e5e00b782aece34c','Keep the original 1,000 cards and their order unchanged');
const extra=(await read('src/german-sentences-extra.tsv')).trim().split(/\r?\n/).map(line=>line.split('\t'));
assert.equal(extra.length,750);
const key=s=>s.normalize('NFKC').toLocaleLowerCase('de-DE').replace(/[^\p{L}\p{N}]/gu,'');
for(const column of [0,1]){const seen=new Set(original.map(row=>key(row[column])));for(const row of extra){assert.equal(row.length,2);assert(row.every(text=>text.trim()===text&&text.length>0&&!/[\uFFFD\u0000-\u001F]/u.test(text)));assert(!seen.has(key(row[column])),'Duplicate: '+row[column]);seen.add(key(row[column]));}}
// Zero denotes unranked original teaching content, not a measured corpus frequency.
// Retain the legacy unused distractor column for the existing deck format.
const added=extra.map(([de,en],i)=>[de,en,extra[(i+375)%extra.length][1],0]);
await fs.writeFile(new URL('src/sentences.json',root),JSON.stringify([...original,...added])+'\n');
const sources=JSON.parse(await read('src/sentence-sources.json'));
sources.selection='The original 1,000 corpus-selected sentences remain unchanged and in their original order, followed by 750 original everyday German sentences with authored English translations. Supplemental cards are not frequency-ranked.';
sources.cards=sources.cards.slice(0,1000);
sources.supplement={count:750,file:'german-sentences-extra.tsv',kind:'Original educational content',selection:'Everyday home, shopping, food, transport, travel, health, work, study, technology, family, appointments, weather, money and leisure situations.',frequency:null,duplicateCheck:'German and English normalized with NFKC, lowercased, and stripped of punctuation and whitespace; zero collisions with the original set or within the supplement.',originalCardsSHA256:'37a32a56e00514c3d80158a9726049ef5a06a0879b963423e5e00b782aece34c'};
await fs.writeFile(new URL('src/sentence-sources.json',root),JSON.stringify(sources,null,2)+'\n');
console.log('German sentences: 1,000 unchanged + 750 original additions; no German or English duplicates.');
