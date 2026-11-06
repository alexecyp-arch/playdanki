export const key=text=>text.normalize('NFKC').toLowerCase().replaceAll('−','-').replace(/[^\p{L}\p{N}+\-*/%=<>]/gu,'');
const stop=new Set('a an the is are was were be been to of in on at for and or it its this that what which who how does do did with from as by can you your'.split(' '));
const tokens=text=>new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter(word=>word.length>2&&!stop.has(word))||[]);
const overlap=(a,b)=>Array.from(a).reduce((sum,word)=>sum+(b.has(word)?1:0),0);
export function distinct(answer,values){const seen=new Set([key(answer)]);return values.filter(value=>{if(typeof value!=='string'||!value.trim()||value.includes('\ufffd')||seen.has(key(value)))return false;seen.add(key(value));return true;});}
function numbered(answer){
 const statement=answer.split(/(?<=[.!?])\s+(?=[A-Z])/)[0];
 const matches=Array.from(statement.matchAll(/(?<![\p{L}\d])[-−]?\d+(?:\.\d+)?/gu));if(!matches.length)return [];
 const match=matches.at(-1),value=Number(match[0].replace('−','-'));if(!Number.isFinite(value))return [];
 const step=Math.max(Number.isInteger(value)?1:.01,Math.abs(value)*.1);
 return [-1,1].map(direction=>statement.slice(0,match.index)+String(Number((value+direction*step).toFixed(4)))+statement.slice(match.index+match[0].length));
}
function inverted(answer){
 const pairs=[[/\bdoes not\b/,'does'],[/\bdo not\b/,'do'],[/\bcannot\b/,'can'],[/\bmust not\b/,'must'],[/\bis not\b/,'is'],[/\bare not\b/,'are'],[/\bwithout\b/,'with'],[/\bincreases\b/,'decreases'],[/\bdecreases\b/,'increases'],[/\balways\b/,'never'],[/\bonly\b/,'never'],[/\bcan\b/,'cannot'],[/\bmust\b/,'must not'],[/\bis\b/,'is not'],[/\bare\b/,'are not']];
 const extra=[
  ['should','should not'],['requires','does not require'],['depends','does not depend'],['helps','does not help'],
  ['gives','does not give'],['combines','does not combine'],['prevents','does not prevent'],['keeps','does not keep'],
  ['measures','does not measure'],['uses','does not use'],['assigns','does not assign'],['counts','does not count'],
  ['describes','does not describe'],['allows','does not allow'],['makes','does not make'],['equals','does not equal'],
  ['follows','ignores'],['preserves','discards'],['different','identical'],['identical','different'],
  ['larger','smaller'],['smaller','larger'],['above','below'],['below','above'],['positive','negative'],['negative','positive'],
  ['minimum','maximum'],['maximum','minimum'],['independent','dependent'],['dependent','independent'],
  ['numerator','denominator'],['denominator','numerator'],['before','after'],['after','before'],
  ['divide','multiply'],['multiply','divide'],['add','subtract'],['subtract','add'],
  ['check','ignore'],['test','avoid testing'],['compare','avoid comparing'],['save','discard'],
  ['identify','ignore'],['estimate','avoid estimating'],['audit','skip auditing'],['report','omit']
 ];
 const changes=pairs.filter(([pattern])=>pattern.test(answer)).map(([pattern,replacement])=>answer.replace(pattern,replacement));
 for(const [word,replacement]of extra){const pattern=new RegExp('\\b'+word+'\\b','i');if(pattern.test(answer))changes.push(answer.replace(pattern,matched=>/^[A-Z]/.test(matched)?replacement[0].toUpperCase()+replacement.slice(1):replacement));}
 return changes;
}
function related(card,pool,question,answer,group){
 const words=tokens(question+' '+answer);
 return pool.filter(other=>other!==card&&group(other)===group(card)).map(other=>({other,score:overlap(words,tokens(other.question+' '+other.answer))})).sort((a,b)=>b.score-a.score||a.other.id-b.other.id).map(item=>item.other.answer);
}
function misconception(card){
 if(!card)return [];
 const question=card.question.replace(/[“”"]/g,'').trim();
 const claim=question.replace(/\s*(?:What is wrong|Why wrong|What is missing|What fails|Why questionable|Why unsafe|What information is lost)\??[\s\S]*$/i,'').replace(/^Someone says\s+/i,'').trim();
 if(claim!==question&&!/^(why|what|which|how|does|do|is|are|can)\b/i.test(claim))return [claim];
 const why=question.match(/^Why (?:not|is) (.+?)(?: wrong(?: here)?| a poor .+)?\?$/i);
 if(why&&/^Why not /i.test(question))return [why[1][0].toUpperCase()+why[1].slice(1)+'.'];
 if(why&&/ wrong(?: here)?\?$/i.test(question))return [why[1][0].toUpperCase()+why[1].slice(1)+'.'];
 if(!/^(?:No|Not)\b/.test(card.answer))return [];
 const does=question.match(/^Does (.+?) (mean|prove|imply|guarantee|show|make|remove|increase|decrease|require|allow|give|equal|change|ensure|represent|predict|demonstrate|work|hold|help|reflect|use)\b(.*?)\?$/i);
 if(does){const verb=does[2].toLowerCase(),form=verb.endsWith('y')?verb.slice(0,-1)+'ies':verb==='show'?'shows':verb+'s';return [does[1][0].toUpperCase()+does[1].slice(1)+' '+form+does[3]+'.'];}
 const is=question.match(/^Is (.+?) (always|exactly|guaranteed|enough|a |an |the )(.+)\?$/i);
 if(is)return [is[1][0].toUpperCase()+is[1].slice(1)+' is '+is[2]+is[3]+'.'];
 return [];
}
export function courseWrongAnswers(card,cards){
 const same=cards.filter(other=>(other.skillKey||other.subtopic)===(card.skillKey||card.subtopic));
 const view=card.cardType||card.type;
 const candidates=[];
 if(card.subject==='Fundamentals'&&card.subtopic==='computer'&&view==='definition')return ['A storage device that keeps files but cannot execute instructions.','A network connection that transfers information between machines.'];
 const concept=card.subtopic||card.skillKey;
 if(card.skillKey==='prac-percent'){
  const wrong=[['Percent means out of 10; 20% means 20 out of 10.','Percent gives a fixed count, independent of the group size.'],['It gives the same number of people for every group size.','It removes the need to know the size of the whole group.'],['Colouring 25 of 100 equal squares represents 75%.','Colouring 25 of 100 equal squares represents 2.5%.'],['Percent = whole ÷ part × 100.','Percent = part ÷ whole, without multiplying by 100.'],['30 ÷ 100 × 100 = 3%.','30 ÷ 100 × 100 = 300%.'],['20% always means 20 people, regardless of group size.','20% always means one person in every twenty.'],['A quarter: 50/100 = 1/4.','Three quarters: 50/100 = 3/4.'],['Only the number of buyers; the total group size is irrelevant.','The final percentage alone; its denominator is unnecessary.'],['5 ÷ 20 × 100 = 4%.','5 ÷ 20 × 100 = 75%.'],['B has the higher rate because it has 30 buyers versus 10.','The rates are equal because both shops have buyers.']];
  return wrong[(card.id-1)%10];
 }
 if(/recognition/.test(view))return distinct(card.answer,related(card,cards,card.question,card.answer,other=>other.subject+'|'+other.type)).slice(0,2);
 if(!['definition','recognition'].includes(view))candidates.push(...numbered(card.answer));
 if(view==='bug')candidates.push(...same.filter(other=>['fix','verification'].includes(other.type)).map(other=>other.answer));
 if(['fix','purpose','verification','scenario'].includes(view))candidates.push(...same.filter(other=>other.type==='bug').map(other=>other.answer));
 candidates.push(...inverted(card.answer));
 if(card.cardType)candidates.push(...misconception(same.find(other=>other.cardType==='error spotting')));
 if(card.cardType)for(const rule of same.filter(other=>['rule','definition','assumptions'].includes(other.cardType)))candidates.push(...inverted(rule.answer));
 if(card.type&&view!=='bug')for(const check of same.filter(other=>other.type==='verification'))candidates.push(...inverted(check.answer));
 if(['definition','recognition'].includes(view))candidates.push(...related(card,cards,card.question,card.answer,other=>other.subject+'|'+(other.cardType||other.type)));
 else if(card.type){
  candidates.push('Skip the '+concept+' checks and assume the first result is correct.','Apply '+concept+' without checking its input or the instructions being executed.');
 }else{
  candidates.push('The '+concept+' result is guaranteed without checking the inputs or assumptions.','The '+concept+' rule gives the same result for every input and situation.');
 }
 const wrong=distinct(card.answer,candidates).slice(0,2);if(wrong.length!==2)throw Error('Missing plausible course distractors '+card.id);return wrong;
}
const sentenceWords=text=>text.toLowerCase().replaceAll('’',"'").replace(/what's/g,'what is').replace(/i'm/g,'i am').replace(/you're/g,'you are').replace(/don't/g,'do not').replace(/doesn't/g,'does not').replace(/can't/g,'cannot').replace(/it's/g,'it is').replace(/that's/g,'that is').replace(/^(?:yes|yeah|okay),?\s+(?=\w)/,'').replace(/\b(very|really|so|please|much|sir)\b/g,'').replace(/[^\p{L}\p{N}\s]/gu,'').replace(/\s+/g,' ').trim();
const sentenceMeaning=text=>{const value=sentenceWords(text);if(/\bthank|\bthanks/.test(value)&&!/^no\b/.test(value))return 'gratitude';if(/^(yes|yeah|yep|sure|certainly|of course)\b/.test(value))return 'affirmative';if(/^i (?:do not know|have no idea)/.test(value))return 'i-do-not-know';if(/^i know\b/.test(value))return 'i-know';if(/^(?:it is true|that is true)/.test(value))return 'true';if(/^(?:what is wrong|what is the matter|what is going on|is something wrong|what happened)/.test(value))return 'what-is-wrong';if(/^(?:excuse me|pardon me|forgive me|i am sorry)/.test(value))return 'apology';if(/^(?:come on|come now|hurry up|get a move on)/.test(value))return 'hurry';if(/^(?:it is ok|it is okay|that is fine|its fine|it is fine|all right)/.test(value))return 'okay';return key(value);};
function sameSentenceMeaning(left,right){
 if(sentenceMeaning(left)===sentenceMeaning(right))return true;
 const a=new Set(sentenceWords(left).split(' ')),b=new Set(sentenceWords(right).split(' '));
 const negated=set=>['not','no','never','cannot'].some(word=>set.has(word));if(negated(a)!==negated(b))return false;
 return Array.from(a).every(word=>b.has(word))||Array.from(b).every(word=>a.has(word));
}
export function sentenceQuiz(cards){
 return cards.map((card,index)=>{
  const words=tokens(card[1]),native=tokens(card[0]);
  const candidates=cards.filter(other=>!sameSentenceMeaning(other[1],card[1])&&key(other[0])!==key(card[0])).map((other,i)=>({other,i,score:4*overlap(words,tokens(other[1]))+overlap(native,tokens(other[0]))+(other[1].endsWith('?')===card[1].endsWith('?')?1:0)-Math.abs(other[1].length-card[1].length)/100})).sort((a,b)=>b.score-a.score||a.i-b.i);
  const wrong=distinct(card[0],candidates.slice(0,12).map(item=>item.other[0]));if(wrong.length<2)throw Error('Missing sentence distractors '+index);
  return [...card,{wrongAnswers:wrong.slice(0,6)}];
 });
}
export function factQuiz(cards){
 const pool=cards.map((card,id)=>({id,question:card[0],answer:card[1],group:(typeof card[5]==='string'&&!card[5].startsWith('data:')?card[5]:card[3])+'|'+card[4]}));
 return cards.map((card,index)=>{
  const current=pool[index],candidates=[card[2],...numbered(card[2]),...numbered(card[1]),...inverted(card[1]),...related(current,pool,card[0],card[1],other=>other.group)];
  const wrong=distinct(card[1],candidates).slice(0,2);if(wrong.length!==2)throw Error('Missing fact distractors '+index);
  return [...card,{wrongAnswers:wrong}];
 });
}
