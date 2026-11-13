// Lemmas are teaching headwords: inflections share one card. Keep productive
// numerals and everyday colloquialisms that FOLK's lexicography filter omits.
export const aliases={d:'der',die:'der',diese:'dieser',jed:'jeder',welch:'welcher',keine:'kein',all:'alle',dieselbe:'derselbe',eine:'ein',manch:'manche',meiste:'meist',Ganze:'ganz',Gleiche:'gleich',Erste:'erste',Neue:'neu',Gute:'gut',Kleine:'klein',Letzte:'letzte',Einzige:'einzig',bezahlt:'bezahlen',ziehst:'ziehen',gemischt:'mischen',hmhm:'hm',mh:'hm',mmh:'hm',mhmh:'hm','m-m':'hm',he:'hey',jaja:'ja',gerne:'gern',selber:'selbst',Scheiße:'scheiße',zweit:'zweite',dritt:'dritte',viert:'vierte',fünft:'fünfte',sechst:'sechste',siebt:'siebte'};
export const colloquialisms=new Set(['dran','drauf','rein','raus','eh','gern','rum','drüber','alleine','drum','Handy','Scheiß','Wahnsinn','drunter','jawoll','kennenlernen','reinmachen','Job']);
export const excluded=new Set(['ho','uh','la','ts','de','hu','alla','woll','riesen','Ihrem','Bayer','yeah','i','wa','Lade','ober','Platt','Rosa','check']);
export const canonical=word=>(aliases[word]||word).normalize('NFC');
export function rankGermanWords(snapshot){
 const subtitles=new Map(snapshot.subtitles.map(([word,count,rank])=>[word,{count,rank}])),merged=new Map();
 for(const [raw,pos,filter,count]of snapshot.folk){
  if(excluded.has(raw)||!(filter==='1'||pos.split('/').includes('CARD')||pos.split('/').includes('ORD')||colloquialisms.has(raw))||!/^\p{L}+(?:[-']\p{L}+)*$/u.test(raw))continue;
  const word=canonical(raw),key=word.toLocaleLowerCase('de-DE');
  if(!merged.has(key))merged.set(key,{word,privateCount:0,forms:[],partsOfSpeech:[]});
  const row=merged.get(key);row.privateCount+=count;row.forms.push(raw);row.partsOfSpeech.push(pos);
 }
 return [...merged.values()].map(row=>({...row,subtitle:subtitles.get(row.word.toLocaleLowerCase('de-DE'))})).filter(row=>row.subtitle).sort((a,b)=>b.privateCount-a.privateCount||a.word.localeCompare(b.word,'de'));
}
