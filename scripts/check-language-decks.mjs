import {selectGermanWords} from './select-german-words.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const read=async path=>JSON.parse(await fs.readFile(path,'utf8'));
const configs=[
  ['words','german/words',1000],['sentences','decks/sentences',500],
  ['french-words','french/words',1000],['french-sentences','french/sentences',500],
  ...['spanish','italian','greek'].flatMap(language=>[
    [language+'-words','languages/'+language+'-words',1000],
    [language+'-sentences','languages/'+language+'-sentences',500]
  ]),
  ['korean-words','languages/korean-words',1000]
];
const norm=text=>text.normalize('NFC').toLowerCase().replace(/[’]/g,"'").trim();
const source=await fs.readFile('src/app.js','utf8');
const quiz=vm.createContext({Math,Set});
vm.runInContext(source.slice(source.indexOf('function wordMeanings('),source.indexOf('async function answerWord(')),quiz);
let checked=0;
for(const [name,path,count] of configs){
  const full=await read('src/'+name+'.json'),cards=await read('dist/'+path+'.json');
  assert.equal(cards.length,count,name);
  assert.deepEqual(cards.map(card=>card.at(-1)?.wrongAnswers?card.slice(0,-1):card),(name==='words'?selectGermanWords(full):full.slice(0,count)).map(card=>path.startsWith('languages/')?card.slice(0,2):card),name+' highest ranked prefix');
  assert.equal(new Set(cards.map(card=>norm(card[0]))).size,count,name+' duplicates');
  assert(cards.every(card=>card.slice(0,2).every(text=>typeof text==='string'&&text.trim()&&!/[\u0000-\u001f\ufffd]/.test(text))),name+' text');
  if(count===1000){
    for(let i=0;i<count;i++){
      const choices=quiz.wordChoices(name==='words'?selectGermanWords(full):full.slice(0,count),i);
      assert.equal(choices.length,3);
      assert.equal(new Set(choices.map(choice=>norm(choice.text))).size,3);
      assert.equal(choices.filter(choice=>choice.correct).length,1);
      assert.equal(choices.find(choice=>choice.correct).text,cards[i][0]);
    }
  }
  checked+=count;
  console.log('PASS '+name+': '+count+' unique cards, original ranked prefix'+(count===1000?', three unambiguous labels per word':''));
}
function ordered(values,ascending=false){assert(values.every((value,i)=>Number.isFinite(value)&&value>0&&(!i||(ascending?values[i-1]<=value:values[i-1]>=value))));}
for(const [name,column,ascending] of [
  ['sentences',3],['french-words',4],['french-sentences',3],
  ['spanish-words',4],['spanish-sentences',3],['italian-words',3],['italian-sentences',2],['korean-words',2,true]
]){
  const cards=await read('src/'+name+'.json');
  ordered(cards.slice(0,name==='sentences'?1000:cards.length).map(card=>card[column]),ascending);
}
const greek=await read('src/greek-sources.json');
for(const [file,metadata,field,key] of [['greek-words','word_attribution','frequency','word'],['greek-sentences','sentence_attribution','count','greek']]){
  const cards=await read('src/'+file+'.json'),rows=greek[metadata];
  assert.deepEqual(cards.map(card=>card[0]),rows.map(row=>row[key]));ordered(rows.map(row=>row[field]));
}
const korean=await read('src/korean-sources.json'),words=await read('src/korean-words.json');
assert.deepEqual(words.map(card=>[card[0],card[2]]),korean.entries.map(row=>[row.word,row.rank]));
console.log('PASS '+checked+' retained cards, recorded frequency/rank order, provenance alignment and all 6000 word choice sets');
