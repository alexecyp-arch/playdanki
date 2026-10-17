import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),key=s=>s.normalize('NFC').toLocaleLowerCase('fr-FR').replace(/[^\p{L}\p{N}\s]/gu,'').trim(),wordKey=s=>s.normalize('NFC').toLocaleLowerCase('fr-FR').replace(/’/g,"'").trim();
export const frenchWords=await fs.readFile(new URL('src/french-words.json',root),'utf8'),frenchSentences=await fs.readFile(new URL('src/french-sentences.json',root),'utf8');
const words=JSON.parse(frenchWords),sentences=JSON.parse(frenchSentences);
if(words.length!==5000||new Set(words.map(c=>wordKey(c[0]))).size!==5000||words.some((c,i)=>c.length!==5||!c.slice(0,3).every(s=>typeof s==='string'&&s.trim())||!Array.isArray(c[3])||!c[3].includes(c[1])||!Number.isFinite(c[4])||c[4]<=0||(i&&words[i-1][4]<c[4])||c.slice(0,2).some(s=>s.includes('\ufffd'))))throw Error('Expected 5000 unique French headwords, English meanings, aliases and descending subtitle lemma frequencies');
if(sentences.length!==1000||new Set(sentences.map(c=>key(c[0]))).size!==1000||sentences.some((c,i)=>c.length!==4||!c.slice(0,3).every(s=>typeof s==='string'&&s.trim())||key(c[1])===key(c[2])||!Number.isInteger(c[3])||c[3]<1||(i&&sentences[i-1][3]<c[3])||c.slice(0,3).some(s=>s.includes('\ufffd'))))throw Error('Expected 1000 unique French sentences with distinct English choices and descending subtitle occurrence counts');
await fs.mkdir(new URL('dist/french/',root),{recursive:true});
await fs.copyFile(new URL('src/french-sentence-sources.json',root),new URL('dist/french/sentence-sources.json',root));
for(const [source,target]of [['french-words.json','words.json'],['french-sentences.json','sentences.json'],['french-source-manifest.json','source-manifest.json']])await fs.copyFile(new URL('src/'+source,root),new URL('dist/french/'+target,root));
