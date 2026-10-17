import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {calculations} from './economics-calculations.mjs';
const root=new URL('../',import.meta.url),text=await fs.readFile(new URL('src/economics-terms.txt',root),'utf8');
let group;
const terms=[];
for(const line of text.split(/\r?\n/)){
 if(!line.trim())continue;
 if(line.startsWith('# ')){const [difficulty,topic]=line.slice(2).split('|');group={difficulty:+difficulty,topic};continue}
 const fields=line.split('|');assert.equal(fields.length,4,'Four authored fields required: '+line);
 assert(fields.every(x=>x.trim()===x&&x.length>0));assert(group);
 terms.push({term:fields[0],definition:fields[1],wrong:fields[2],scenario:fields[3],...group});
}
assert.equal(terms.length,720);assert.equal(new Set(terms.map(x=>x.term.toLowerCase())).size,720);
const groups=new Map();for(const term of terms){if(!groups.has(term.topic))groups.set(term.topic,[]);groups.get(term.topic).push(term)}
assert.equal(groups.size,14);for(const [topic,rows]of groups)assert.equal(rows.length,topic==='Small-cap basics'?70:50,topic+' has an unexpected term count');
const distractor=(term,offset)=>{const rows=groups.get(term.topic);return rows[(rows.indexOf(term)+offset)%rows.length].term};
const cards=terms.map(t=>[t.term,t.definition,t.wrong,t.difficulty,'term',t.topic]);
for(const t of terms)cards.push(['Which term means: '+t.definition+'?',t.term,distractor(t,23),6+t.difficulty,'recall',t.topic]);
for(const t of terms)cards.push([t.scenario,t.term,distractor(t,31),12+t.difficulty,'scenario',t.topic]);
assert.equal(calculations.length,100,'Expected 100 distinct quantitative skills');
const modelNames=new Set();
for(const [modelIndex,model]of calculations.entries()){
 assert(!modelNames.has(model.name));modelNames.add(model.name);
 for(let n=1;n<=(modelIndex<40?14:13);n++){
  const [prompt,right,wrong]=model.make(n);
  assert([prompt,right,wrong].every(x=>typeof x==='string'&&x.trim()),model.name);
  assert.notEqual(right,wrong,model.name+' has equivalent rounded choices');
  cards.push([prompt,right,wrong,20+model.level,'calculation',model.name]);
 }
}
assert.equal(cards.length,3500);assert.equal(new Set(cards.map(x=>x[0].toLowerCase().replace(/\s+/g,' ').trim())).size,3500,'Repeated prompt');
assert(cards.every(c=>c[1].toLowerCase()!==c[2].toLowerCase()));
await fs.writeFile(new URL('src/economics.json',root),JSON.stringify(cards)+'\n');
console.log(JSON.stringify({items:cards.length,terms:720,recall:720,scenarios:720,calculations:1340,quantitativeSkills:100,topics:[...groups.keys()]}));
