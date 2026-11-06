import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import './generate-programming.mjs';
const root=new URL('../',import.meta.url),bank=JSON.parse(await fs.readFile(new URL('src/programming/cards.json',root),'utf8'));
const intro=(await fs.readFile(new URL('src/coding1000/intro.txt',root),'utf8')).trim().split(/\r?\n/).map(line=>{const [subject,topic,question,answer,...wrongAnswers]=line.split('¦');return {subject,topic,question,answer,wrongAnswers,source:'coding1000/intro.txt'};});
if(intro.length!==10||intro.some(c=>c.wrongAnswers.length!==2))throw Error('Ten authored setup cards required');
const quota={Tools:12,Fundamentals:10,HTML:45,CSS:40,JavaScript:81,APIs:10};
const fundamentals=new Set(['Boolean value','comparison','condition','iteration','algorithm','bug','error message','debugging','scope','mutation']);
const exclude=/Python|speech|Speech|Audio|GainNode|screener|quote|PDF|reader|TTS|socket reconnection|stream update|WebSocket|release artifact/;
const lessons=[];for(let i=0;i<bank.length;i+=10){const first=bank[i];if(!(first.subject in quota)||exclude.test(first.subtopic))continue;if(first.subject==='Fundamentals'&&!fundamentals.has(first.subtopic))continue;if(lessons.filter(l=>l.subject===first.subject).length>=quota[first.subject])continue;lessons.push({subject:first.subject,term:first.subtopic,start:i,difficulty:first.difficultyLevel});}
for(const [subject,count]of Object.entries(quota))if(lessons.filter(l=>l.subject===subject).length!==count)throw Error('Missing '+subject+' lessons');
const cards=[...intro];for(const lesson of lessons){for(const offset of [0,1,4,5,6]){const card=bank[lesson.start+offset],mistake=bank[lesson.start+5].answer,fix=bank[lesson.start+6].answer,check=bank[lesson.start+7].answer;
 const candidates=[...card.wrongAnswers.filter(text=>!/^Skip .* checks and assume/.test(text)&&!/(?:Python|interpreter environment)/i.test(text)),...(offset===5?[fix,check]:[mistake]),...bank.filter(c=>c.subject===lesson.subject&&c.type==='definition'&&c.subtopic!==lesson.term).map(c=>c.answer)];
 const seen=new Set([card.answer.normalize('NFKC').toLowerCase().trim()]),wrongAnswers=[];for(const text of candidates){const key=text.normalize('NFKC').toLowerCase().trim();if(seen.has(key))continue;seen.add(key);wrongAnswers.push(text);if(wrongAnswers.length===2)break;}
 cards.push({subject:lesson.subject,topic:lesson.term,question:card.question+(card.code?'\n\n'+card.code:''),answer:card.answer,wrongAnswers,sourceId:card.id});}}
if(cards.length!==1000||new Set(cards.map(c=>c.question)).size!==1000)throw Error('Need 1000 unique coding questions');
for(const [i,c]of cards.entries()){if(!c.answer||!c.question||c.wrongAnswers.length<2||new Set([c.answer,...c.wrongAnswers]).size!==c.wrongAnswers.length+1)throw Error('Invalid choices '+i);c.id=i+1;}
export const codingCards=cards.map(c=>[c.question,c.answer,c.wrongAnswers[0],{wrongAnswers:c.wrongAnswers}]);
await fs.writeFile(new URL('src/coding1000/cards.json',root),JSON.stringify(cards));
await fs.writeFile(new URL('src/coding1000/curriculum.json',root),JSON.stringify({total:1000,intro:10,lessonCount:198,viewsPerLesson:5,selection:'Editorial practical core, not a measured frequency ranking. Each micro-lesson covers definition, use, code reading, common mistake and repair. Original existing course material is reused deliberately.',quota,lessons,contentHash:createHash('sha256').update(JSON.stringify(cards)).digest('hex')},null,2));
await fs.mkdir(new URL('dist/coding1000/',root),{recursive:true});
await fs.writeFile(new URL('dist/coding1000/sources.json',root),JSON.stringify({references:['https://code.visualstudio.com/docs/getstarted/overview','https://developer.mozilla.org/en-US/curriculum/core/','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'],authorship:'Original setup cards and an ordered selection from PlayDanki original programming micro-lessons. References inform coverage; they do not rank a top 1000.'}));
console.log('CODING 1000: 10 setup cards + 198 ordered micro-lessons with 5 practical views.');
