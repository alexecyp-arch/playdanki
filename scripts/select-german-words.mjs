import fs from 'node:fs';
const {rows}=JSON.parse(fs.readFileSync(new URL('../src/german-word-replacements.json',import.meta.url),'utf8'));
export function selectGermanWords(source){
 const cards=source.slice(0,1000).map(card=>structuredClone(card));
 for(const {word,replacement,originalPosition,sourcePosition}of rows){
  if(cards[originalPosition-1]?.[0]!==word||source[sourcePosition-1]?.[0]!==replacement)throw Error('German replacement source changed: '+word);
  cards[originalPosition-1]=structuredClone(source[sourcePosition-1]);
 }
 if(cards.length!==1000||new Set(cards.map(c=>c[0].toLocaleLowerCase('de-DE'))).size!==1000||cards.some(c=>rows.some(row=>row.word===c[0])))throw Error('Invalid German common-word selection');
 return cards;
}
