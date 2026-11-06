import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {key as choiceKey} from './quiz-distractors.mjs';
const root=new URL('../',import.meta.url);
const cards=JSON.parse(await fs.readFile(new URL('src/trivia.json',root),'utf8'));
const key=s=>s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
if(cards.length!==20000||new Set(cards.map(c=>key(c[0])+'|'+(c[5]||''))).size!==20000||cards.some(c=>c.length<5||c.length>6||!c.slice(0,4).every(t=>typeof t==='string'&&t.trim())||key(c[1])===key(c[2])||![1,2,3].includes(c[4])||c.slice(0,3).some(s=>s.includes('\ufffd'))||(c[5]&&!c[5].startsWith('data:image/svg+xml;base64,'))))throw Error('Trivia needs exactly 20000 unique questions with two distinct answers and topics.');
const distractors=JSON.parse(await fs.readFile(new URL('src/trivia-distractors.json',root),'utf8'));
if(distractors.length!==cards.length)throw Error('Trivia distractor count mismatch');
for(let i=0;i<cards.length;i++){if(!Array.isArray(distractors[i])||distractors[i].length<2||new Set([cards[i][1],...distractors[i]].map(choiceKey)).size!==distractors[i].length+1)throw Error('Invalid trivia distractors '+i);cards[i].push({wrongAnswers:distractors[i]});}
const version=createHash('sha256').update(JSON.stringify(cards)).digest('hex').slice(0,12);
export const triviaInfo={total:cards.length,chunkSize:2000,version};
await fs.mkdir(new URL('dist/trivia/',root),{recursive:true});
for(let i=0;i<cards.length;i+=triviaInfo.chunkSize)await fs.writeFile(new URL('dist/trivia/'+Math.floor(i/triviaInfo.chunkSize)+'.json',root),JSON.stringify(cards.slice(i,i+triviaInfo.chunkSize)));
await fs.copyFile(new URL('src/trivia-provenance.json',root),new URL('dist/trivia/sources.json',root));
await fs.copyFile(new URL('src/trivia-summary.json',root),new URL('dist/trivia/summary.json',root));
await fs.mkdir(new URL('dist/licenses/',root),{recursive:true});
for(const file of await fs.readdir(new URL('src/licenses/',root)))await fs.copyFile(new URL('src/licenses/'+file,root),new URL('dist/licenses/'+file,root));
