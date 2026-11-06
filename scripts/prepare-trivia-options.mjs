import fs from 'node:fs/promises';
import path from 'node:path';
import {distinct,factQuiz,key} from './quiz-distractors.mjs';
const directory=path.resolve(process.argv[2]||'../trivia-sources');
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const cards=await read('src/trivia.json'),provenance=await read('src/trivia-provenance.json');
const records=new Map();
for(const file of ['open.json','mmlu.json'])for(const row of await read(path.join(directory,file)))records.set(row.source+'|'+row.id,row);
(await read(path.join(directory,'sciq.json'))).forEach((row,index)=>records.set('SciQ|sciq:'+index,{a:row.correct_answer,options:[row.distractor1,row.distractor2,row.distractor3]}));
const fallbackIndices=cards.map((card,index)=>index).filter(index=>!records.has(provenance[index].join('|')));
const fallback=factQuiz(fallbackIndices.map(index=>cards[index]));
const fallbackMap=new Map(fallbackIndices.map((index,i)=>[index,fallback[i].at(-1).wrongAnswers]));
const countries=cards.filter((card,index)=>provenance[index][0]==='flag-icons').map(card=>card[1]);
const capitals=cards.filter((card,index)=>provenance[index][0]==='GeoNames').map(card=>card[1]);
const overrides={
 'Which planet is known as the Red Planet?':['Venus','Jupiter','Mercury'],
 'What does AI stand for?':['Automated Internet','Adaptive interface','Algorithmic integration'],
 'Which city is the capital of the Republic of Cyprus?':['Limassol','Larnaca','Paphos'],
 'Which ancient Greek city is associated with the development of democracy?':['Sparta','Corinth','Thebes'],
 'What does HNW commonly mean in wealth management?':['High national wage','Household net wage','High nominal wages'],
 'What is an antibiotic generally used to target?':['Viruses','Fungi','Parasitic worms'],
 'What does NATO stand for?':['North American Trade Organization','North Atlantic Trade Organization','National Asian Trade Office'],
 'What is generative AI designed to produce?':['Only exact copies of stored records, with no new combinations.','Only fixed classification labels from manually written rules.'],
 'What is a family office designed to manage?':['The accounts of every publicly listed company.','Public tax collection for an entire country.'],
 'What is a computer?':['A storage device that cannot execute instructions.','A connection that only transfers data between devices.']
};
let recovered=0;const missing=[];
const out=cards.map((card,index)=>{
 const row=records.get(provenance[index].join('|'));
 let values=overrides[card[0]];
 if(!values&&row){
  values=distinct(card[1],[card[2],...row.options.filter(value=>key(value)!==key(row.a))]).filter(value=>!/(?:all|none|both) of|both [a-d]|[a-d] and [a-d]/i.test(value));
  if(values.length>=2)recovered++;
 }
 if(!values||values.length<2){
  if(provenance[index][0]==='flag-icons'||/which country|what country/i.test(card[0]))values=distinct(card[1],[card[2],...countries]);
  else if(provenance[index][0]==='GeoNames'||/capital (?:city )?of/i.test(card[0]))values=distinct(card[1],[card[2],...capitals]);
  else values=distinct(card[1],[...(values||[]),...(fallbackMap.get(index)||[])]);
 }
 values=distinct(card[1],values||[]);
 if(values.length<2&&/^(yes|no|true|false)$/i.test(card[1]))values=distinct(card[1],[card[2],'Not enough information to decide.']);
 if(values.length<2){
  const words=new Set(card[0].toLowerCase().match(/[a-z]{4,}/g)||[]);
  const donors=cards.filter(other=>other!==card&&other[3]===card[3]&&!/^(yes|no|true|false)$/i.test(other[2])).map(other=>({other,score:(other[0].toLowerCase().match(/[a-z]{4,}/g)||[]).filter(word=>words.has(word)).length})).sort((a,b)=>b.score-a.score);
  values=distinct(card[1],[...values,...donors.map(item=>item.other[2])]);
 }
 if(values.length<2)missing.push({index,question:card[0],answer:card[1],wrong:card[2]});
 return values.slice(0,3);
});
if(missing.length)throw Error(JSON.stringify(missing));
await fs.writeFile('src/trivia-distractors.json',JSON.stringify(out));
console.log(JSON.stringify({questions:out.length,recoveredSourceChoices:recovered,relatedAuthoredChoices:out.length-recovered}));
