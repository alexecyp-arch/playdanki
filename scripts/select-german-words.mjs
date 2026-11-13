import fs from 'node:fs';
import {canonical,rankGermanWords} from './german-frequency-rules.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(name,import.meta.url),'utf8'));
const replacements=read('../src/german-word-replacements.json').rows;
const snapshot=read('german-frequency-snapshot.json');
const overrides=new Map(fs.readFileSync(new URL('../src/german-common-overrides.tsv',import.meta.url),'utf8').trim().split(/\r?\n/).map(line=>{const [word,meaning,pos]=line.split('\t');return [word.toLocaleLowerCase('de-DE'),[word,meaning,pos,[]]];}));
const key=word=>canonical(word).toLocaleLowerCase('de-DE');
export function selectGermanWords(source){
 const dictionary=new Map(source.map(card=>[key(card[0]),card]));
 const ranked=rankGermanWords(snapshot);
 // FOLK assigns reflexives to personal-pronoun lemmas. Keep the essential
 // teaching headword sich, attested at subtitle word-form rank 46.
 const selected=ranked.slice(0,1199);
 const subtitle=snapshot.subtitles.find(row=>row[0]==='sich');
 if(!subtitle||subtitle[2]!==46)throw Error('Missing reflexive-pronoun evidence');
 selected.push({word:'sich',privateCount:null,forms:['sich'],subtitle:{count:subtitle[1],rank:subtitle[2]},partsOfSpeech:['PRO']});
 const cards=new Map(selected.map(row=>{
  const original=overrides.get(key(row.word))||dictionary.get(key(row.word));
  if(!original)throw Error('Unreviewed German translation: '+row.word);
  const card=structuredClone(original);card[0]=canonical(card[0]);
  return [key(row.word),card];
 }));
 // Keep surviving words in the same slots, retaining the saved cursor/key.
 const prior=source.slice(0,1000).map(card=>structuredClone(card));
 for(const {originalPosition,sourcePosition}of replacements)prior[originalPosition-1]=structuredClone(source[sourcePosition-1]);
 const result=new Array(1200),used=new Set();
 for(let i=0;i<prior.length;i++){const k=key(prior[i][0]);if(cards.has(k)&&!used.has(k)){result[i]=cards.get(k);used.add(k);}}
 const remaining=selected.filter(row=>!used.has(key(row.word))).map(row=>cards.get(key(row.word)));let cursor=0;
 for(let i=0;i<1200;i++)if(!result[i])result[i]=remaining[cursor++];
 if(result.length!==1200||new Set(result.map(c=>key(c[0]))).size!==1200||result.some(c=>!c[0]||!c[1]))throw Error('Invalid German common-word selection');
 return result;
}

export function germanFrequencyAudit(source){
 const ranked=new Map(rankGermanWords(snapshot).map(row=>[key(row.word),row]));
 return {reviewDate:snapshot.retrieved,count:1200,selection:'1199 eligible headwords ranked by observed private-conversation frequency, independently attested within the first 10000 OpenSubtitles word forms; plus the essential reflexive pronoun sich.',limitations:'A corpus-based learner selection, not a universal exact top 1200 of all present-day German speech. The Lexical Explorer is a historical FOLK extract. Counts pool case variants and the documented normalizations, not sense-specific frequencies. Inflections share teaching headwords. No dialogue transcripts are reproduced.',sources:[snapshot.primary,snapshot.secondary],normalization:'scripts/german-frequency-rules.mjs',records:selectGermanWords(source).map((card,i)=>{
 const row=ranked.get(key(card[0])),sub=row?.subtitle||{rank:46,count:snapshot.subtitles.find(r=>r[0]==='sich')[1]};
 return {position:i+1,word:card[0],english:card[1],privateConversationCount:row?.privateCount??null,observedForms:row?.forms??[],subtitleWordFormRank:sub.rank,subtitleCount:sub.count,basis:row?'private conversations + subtitles':'reflexive-pronoun teaching exception; subtitle rank 46'};
 })};
}
