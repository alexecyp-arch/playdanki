import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),directory=new URL('src/programming/',root),plan=JSON.parse(await fs.readFile(new URL('curriculum-plan.json',directory),'utf8')),cards=[],lessons=[];
const overrides=JSON.parse(await fs.readFile(new URL('card-overrides.json',directory),'utf8')),appliedOverrides=new Set();
const weeks=[];let start=1;for(let i=1;i<=52;i++){const count=i<=8?97:96;weeks.push({week:i,start,end:start+count-1,count});start+=count}
const parseExample=sample=>{const match=sample.match(/^(JS|PY|HTML|CSS|PS|SQL):\s*([\s\S]*)$/);return match?{language:{JS:'JavaScript',PY:'Python',HTML:'HTML',CSS:'CSS',PS:'PowerShell',SQL:'SQL'}[match[1]],code:match[2].replaceAll('\\n','\n')}: {example:sample.replace(/^NOTE:\s*/, '').replaceAll('\\n','\n')}};
const previousSubject=new Map(),questionKeys=new Set(),counts={};
for(const band of plan.bands){const text=await fs.readFile(new URL('lessons-'+band.difficulty+'.txt',directory),'utf8'),rows=text.split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#')),bandCounts={};if(rows.length!==50)throw Error('Band '+band.difficulty+' needs 50 authored micro-lessons; got '+rows.length);
for(const line of rows){const fields=line.split('¦').map(t=>t.trim());if(fields.length!==9||fields.some(t=>!t))throw Error('Invalid authored lesson: '+line.slice(0,100));const [subject,term,definition,purpose,sample,result,mistake,fix,check]=fields;if(!(subject in plan.subjects))throw Error('Unknown subject '+subject);bandCounts[subject]=(bandCounts[subject]||0)+1;counts[subject]=(counts[subject]||0)+10;
const base=cards.length+1,example=parseExample(sample),topic=term,prerequisites=previousSubject.has(subject)?[previousSubject.get(subject)]:[],foundational=band.difficulty<=3||subject==='Fundamentals',plainSample=example.example||example.code;
let first='What does “'+term+'” mean?';if(term==='computer')first='What is a computer?';if(term==='program')first='What is a program?';if(term==='code')first='What is code?';if(term==='programming language')first='What is a programming language?';
const authored=[
 [first,definition,'definition'],
 ['When is '+term+' useful?',purpose,'purpose'],
 ['Which concept fits this description?\n\n'+definition,term+'.','recognition'],
 ['Explain this '+term+' example.',result,'reading'],
 ['What happens in this '+term+' example?',result,'prediction'],
 ['What common mistake should you avoid with '+term+'?',mistake,'bug'],
 ['How would you fix this '+term+' problem?\n\n'+mistake,fix,'fix'],
 ['What should you check when using '+term+'?',check,'verification'],
 ['How does this example use '+term+' correctly?',result+' '+check,'comparison'],
 ['You want to '+purpose.replace(/^[A-Z]/,c=>c.toLowerCase()).replace(/[.!]$/,'')+'. How could you apply '+term+'?',result+' '+fix,'scenario']
];
for(let n=0;n<10;n++){let [question,answer,type]=authored[n];const id=cards.length+1;if([3,4,8,9].includes(n)&&example.example)question+='\n\nExample: '+plainSample;const item={id,question,answer,difficulty:Number((1+9*(id-1)/4999).toFixed(4)),difficultyLevel:band.difficulty,week:weeks.find(w=>id<=w.end).week,subject,topic:band.title,subtopic:topic,type,foundational,prerequisites,timesSeen:0,timesCorrect:0,timesWrong:0,masteryState:'NEW',lastReviewed:null,nextReview:null};if([3,4,8,9].includes(n)&&example.code){item.code=example.code;item.language=example.language}const override=overrides[term]?.[n+1];if(override){Object.assign(item,override);appliedOverrides.add(term+':'+(n+1));if(override.code===null){delete item.code;delete item.language}}const key=item.question.toLowerCase().replace(/\s+/g,' ').trim();if(questionKeys.has(key))throw Error('Repeated question: '+item.question);questionKeys.add(key);cards.push(item)}
lessons.push({start:base,end:base+9,subject,term,difficultyLevel:band.difficulty});previousSubject.set(subject,base);
}
for(const [subject,count]of Object.entries(band.lessons))if(bandCounts[subject]!==count)throw Error('Band '+band.difficulty+' '+subject+': expected '+count+' lessons, got '+bandCounts[subject]);for(const subject of Object.keys(bandCounts))if(!(subject in band.lessons))throw Error('Unexpected subject '+subject+' in band '+band.difficulty);
}
if(cards.length!==5000)throw Error('Expected exactly 5000 cards.');for(const [subject,count]of Object.entries(plan.subjects))if(counts[subject]!==count)throw Error(subject+' weighting differs.');for(const [term,items]of Object.entries(overrides))for(const n of Object.keys(items))if(!appliedOverrides.has(term+':'+n))throw Error('Unmatched authored override '+term+':'+n);
const content=JSON.stringify(cards);await fs.writeFile(new URL('cards.json',directory),content);await fs.writeFile(new URL('summary.json',directory),JSON.stringify({version:1,total:cards.length,weeks,subjects:counts,lessons,contentHash:createHash('sha256').update(content).digest('hex')},null,2));console.log(JSON.stringify({programming:cards.length,lessons:lessons.length,weeks:weeks.length,subjects:counts,bytes:Buffer.byteLength(content)}));
