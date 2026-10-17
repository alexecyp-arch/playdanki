import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import './build-economics.mjs';
import './build-programming.mjs';
import './build-quant.mjs';
import {triviaInfo} from './build-trivia.mjs';
import {frenchWords,frenchSentences} from './build-french.mjs';
import {languageInfo} from './build-languages.mjs';
const root=new URL('../',import.meta.url);
let html=await fs.readFile(new URL('src/index.html',root),'utf8');
const css=await fs.readFile(new URL('src/style.css',root),'utf8');
const js=await fs.readFile(new URL('src/app.js',root),'utf8');
const sections=await fs.readFile(new URL('src/sections.js',root),'utf8');
const cursorCss=await fs.readFile(new URL('src/cursor.css',root),'utf8');
const studyCss=await fs.readFile(new URL('src/study.css',root),'utf8');
const supportCss=await fs.readFile(new URL('src/support.css',root),'utf8'),supportJs=await fs.readFile(new URL('src/support.js',root),'utf8'),supportConfig=JSON.parse(await fs.readFile(new URL('src/support-config.json',root),'utf8'));
if(supportConfig.currency!=='USD')throw Error('Support amounts are denominated in USD');
const validPayment=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(u.hostname==='revolut.me'||u.hostname==='revolut.com'||u.hostname.endsWith('.revolut.com'))}catch{return false}};
if(supportConfig.preview)throw Error('Do not publish a payment preview configuration');
if(supportConfig.enabled&&['2','5','10','100'].some(amount=>!validPayment(supportConfig.amountUrls?.[amount]||supportConfig.genericUrl)))throw Error('Connect valid Revolut links for all support amounts before enabling');
const schedule=await fs.readFile(new URL('src/kana-schedule.js',root),'utf8');
const arithmetic=await fs.readFile(new URL('src/arithmetic.html',root),'utf8');
const arithmeticTheme=await fs.readFile(new URL('src/arithmetic-theme.css',root),'utf8');
const words=await fs.readFile(new URL('src/words.json',root),'utf8');
const entries=JSON.parse(words);
if(entries.length!==5000||new Set(entries.map(w=>w[0].toLocaleLowerCase('de-DE'))).size!==5000)throw new Error('The deck must contain exactly 5000 distinct German words');
const sentences=await fs.readFile(new URL('src/sentences.json',root),'utf8');
const sentenceEntries=JSON.parse(sentences);
const sentenceKey=s=>s.toLocaleLowerCase('de-DE').replace(/[^\p{L}\p{N}\s]/gu,'').trim();
if(sentenceEntries.length!==1000||new Set(sentenceEntries.map(s=>sentenceKey(s[0]))).size!==1000)throw new Error('The sentence deck must contain exactly 1000 distinct German sentences');
if(sentenceEntries.some((s,i)=>s.length!==4||!s.slice(0,3).every(t=>typeof t==='string'&&t.trim())||sentenceKey(s[1])===sentenceKey(s[2])||!Number.isInteger(s[3])||s[3]<1||(i&&sentenceEntries[i-1][3]<s[3])))throw new Error('Each sentence needs two different choices and descending corpus frequency');
const kana=await fs.readFile(new URL('src/kana.json',root),'utf8'),kanaEntries=JSON.parse(kana);
const hiragana='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const katakana='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
if(kanaEntries.length!==92||new Set(kanaEntries.map(c=>c[0])).size!==92||kanaEntries.filter(c=>c[3]==='hiragana').map(c=>c[0]).join('')!==hiragana||kanaEntries.filter(c=>c[3]==='katakana').map(c=>c[0]).join('')!==katakana||kanaEntries.some(c=>!c[1]||!Number.isSafeInteger(c[2])||c[2]<0||!Array.isArray(c[4])))throw new Error('Expected 46 basic Hiragana and 46 basic Katakana with sounds and observed frequency counts');
const kanji=await fs.readFile(new URL('src/kanji.json',root),'utf8'),kanjiEntries=JSON.parse(kanji);
const economics=await fs.readFile(new URL('src/economics.json',root),'utf8'),economicsEntries=JSON.parse(economics);
const economicsKey=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
if(economicsEntries.length!==3500||new Set(economicsEntries.map(c=>economicsKey(c[0]))).size!==3500||economicsEntries.some((c,i)=>c.length!==6||!c.slice(0,3).every(t=>typeof t==='string'&&t.trim())||economicsKey(c[1])===economicsKey(c[2])||!Number.isInteger(c[3])||(i&&economicsEntries[i-1][3]>c[3])||!['term','recall','scenario','calculation'].includes(c[4])||!c[5]))throw new Error('Expected 3500 unique Economics items with distinct authored choices in curriculum order');
if(kanjiEntries.length!==2136||new Set(kanjiEntries.map(c=>c[0])).size!==2136||kanjiEntries.some((c,i)=>[...c[0]].length!==1||!c[1]||!Array.isArray(c[3])||!c[3].includes(c[1])||![1,2,3,4,5,6,8].includes(c[4])||!Number.isInteger(c[2])||(i&&kanjiEntries[i-1][2]>c[2])))throw new Error('Expected 2136 unique Jōyō Kanji with valid English meanings in frequency order');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css.trim()+'\n'+cursorCss.trim()+'\n'+studyCss.trim()+'\n'+supportCss.trim()+'</style>')
 .replace('<script defer src="app.js"></script>','')
 .replace('FRENCH_WORD_DATA',frenchWords.replace(/</g,'\\u003c'))
 .replace('FRENCH_SENTENCE_DATA',frenchSentences.replace(/</g,'\\u003c'))
 .replace('WORD_DATA',words.replace(/</g,'\\u003c'))
 .replace('SENTENCE_DATA',sentences.replace(/</g,'\\u003c'))
 .replace('KANA_DATA',kana.replace(/</g,'\\u003c'))
 .replace('KANJI_DATA',kanji.replace(/</g,'\\u003c'))
 .replace('ECONOMICS_DATA',economics.replace(/</g,'\\u003c'))
 .replace('TRIVIA_INFO',JSON.stringify(triviaInfo))
 .replace('LANGUAGE_INFO',JSON.stringify(languageInfo))
 .replace('SUPPORT_CONFIG',()=>JSON.stringify(supportConfig).replace(/</g,'\\u003c'))
 .replace('</body>',()=>'<script>'+schedule.trim()+'</script>\n<script>'+js.trim()+'</script>\n<script>'+sections.trim()+'</script>\n<script>'+supportJs.trim()+'</script>\n</body>');
await fs.mkdir(new URL('dist/',root),{recursive:true});
await fs.rm(new URL('dist/arithmetic-aim.html',root),{force:true});
await fs.writeFile(new URL('dist/index.html',root),html);
await fs.writeFile(new URL('dist/arithmetic.html',root),arithmetic.replace('</style>',arithmeticTheme.trim()+'\n'+cursorCss.trim()+'\n'+studyCss.trim()+'\n</style>'));
await fs.copyFile(new URL('src/credits.txt',root),new URL('dist/credits.txt',root));
console.log(JSON.stringify({words:entries.length,sentences:sentenceEntries.length,frenchWords:5000,frenchSentences:1000,kana:kanaEntries.length,kanji:kanjiEntries.length,economics:economicsEntries.length,htmlBytes:Buffer.byteLength(html),compressedBytes:gzipSync(html).length}));
