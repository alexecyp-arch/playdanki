import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {key} from './quiz-distractors.mjs';

const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const runtime=vm.createContext({Math,Set});vm.runInContext(await fs.readFile('src/quiz.js','utf8'),runtime);
const sets=[
 ['German sentences','dist/decks/sentences.json',0],['French sentences','dist/french/sentences.json',0],
 ...['spanish','italian','greek'].map(language=>[language+' sentences','dist/languages/'+language+'-sentences.json',0]),
 ['Economics','dist/decks/economics.json',1],
 ...Array.from({length:10},(_,i)=>['Trivia '+i,'dist/trivia/'+i+'.json',1]),
 ['Programming','dist/programming/cards.json',null],['QUANT','dist/quant/cards.json',null]
];
let total=0;
for(const [name,file,column] of sets){
 const cards=await read(file);
 for(const card of cards){
  const answer=column===null?card.answer:card[column],wrong=column===null?card.wrongAnswers:card.at(-1).wrongAnswers;
  assert(Array.isArray(wrong)&&wrong.length>=2,name+' missing distractors');
  assert(wrong.every(text=>typeof text==='string'&&text.trim()&&!text.includes('\ufffd')),name+' invalid text');
  assert.equal(new Set([answer,...wrong].map(key)).size,wrong.length+1,name+' answer collision');
  const options=runtime.DankiQuiz.options(answer,wrong);
  assert.equal(options.length,3);assert.equal(options.filter(option=>option.correct).length,1);
  assert.equal(options.find(option=>option.correct).text,answer);
 }
 total+=cards.length;console.log('PASS '+name+': '+cards.length+' complete three-choice cards');
}
assert.equal(total,36000);
const programming=await read('dist/programming/cards.json');
assert(programming[0].wrongAnswers.every(text=>/device|connection/.test(text)));
assert(programming[1703].wrongAnswers.every(text=>/^It prints [-\d]+\.$/.test(text)));
const german=await read('dist/decks/sentences.json');
assert(german[0].at(-1).wrongAnswers.every(text=>!['Ich weiß es.','Ja, ich weiß.','Das weiß ich.'].includes(text)));
const french=await read('dist/french/sentences.json');assert(!french[1].at(-1).wrongAnswers.includes("Oui, c'est vrai."));
const spanish=await read('dist/languages/spanish-sentences.json');assert(spanish[0].at(-1).wrongAnswers.every(text=>!/[Gg]racias/.test(text)));
const maths=runtime.DankiQuiz.options('It prints 0.',['It prints -1.','It prints 1.']);assert.equal(maths.length,3);
console.log('PASS 36000 quizzes, distinct signed numeric options, related computer choices and common sentence-paraphrase exclusions');
