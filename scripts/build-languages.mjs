import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
export const languageInfo={};
const configs=[
 ['spanish-words',5000,'es'],['spanish-sentences',1000,'es'],
 ['italian-words',5000,'it'],['italian-sentences',1000,'it'],
 ['greek-words',5000,'el'],['greek-sentences',1000,'el'],
 ['korean-hangul',40,'ko'],['korean-words',5000,'ko']
];
await fs.mkdir(new URL('dist/languages/',root),{recursive:true});
for(const [name,count,lang]of configs){
 const cards=JSON.parse(await fs.readFile(new URL('src/'+name+'.json',root),'utf8'));
 const norm=s=>s.normalize('NFC').toLocaleLowerCase(lang).replace(/[’]/g,"'").replace(/[.!?·;,]+$/gu,'').trim();
 if(cards.length!==count||new Set(cards.map(c=>norm(c[0]))).size!==count||cards.some(c=>!Array.isArray(c)||!c.slice(0,2).every(s=>typeof s==='string'&&s.trim()&&!s.includes('\ufffd'))))throw Error('Expected '+count+' unique valid bilingual cards in '+name);
 if(name==='korean-hangul'&&cards.some(c=>[...c[0]].length!==1||!Number.isSafeInteger(c[2])||c[2]<1))throw Error('Every Hangul letter needs a positive observed count');
 const data=JSON.stringify(cards.map(c=>name==='korean-hangul'?c.slice(0,3):c.slice(0,2)));
 languageInfo[name]={count,limit:name==='korean-hangul'?500:count,version:createHash('sha256').update(data).digest('hex').slice(0,16)};
 await fs.writeFile(new URL('dist/languages/'+name+'.json',root),data);
}
for(const language of ['spanish','italian','greek','korean'])await fs.copyFile(new URL('src/'+language+'-sources.json',root),new URL('dist/languages/'+language+'-sources.json',root));
await fs.copyFile(new URL('src/italian-sentence-sources.json',root),new URL('dist/languages/italian-sentence-sources.json',root));
console.log(JSON.stringify({newLanguageCards:configs.reduce((sum,c)=>sum+c[1],0),decks:languageInfo}));
