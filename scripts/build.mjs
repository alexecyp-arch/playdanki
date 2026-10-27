import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {atlasVersion} from './build-atlas.mjs';
import './build-economics.mjs';
import './build-german-sentences.mjs';
import './build-programming.mjs';
import './build-quant.mjs';
import {triviaInfo} from './build-trivia.mjs';
import {frenchWords,frenchSentences} from './build-french.mjs';
import {languageInfo} from './build-languages.mjs';
const root=new URL('../',import.meta.url);
const runtimeFiles=['temponotes/runtime.js','atlas-navigation.js','cursor.css','temponotes/style.css','temponotes/navigation.css','german-voice.js','answer-voice.js','theme.js','theme.css','autumn-main.css','analytics.js','analytics-config.json','digit-span/best-score.mjs','digit-span/index.html','digit-span/style.css','digit-span/game.js','digit-span/model.mjs','account.js','notes-navigation.js','weight-navigation.js','timebox-navigation.js','timebox/index.html','timebox/bootstrap.js','timebox/style.css','app.js','arithmetic.html','arithmetic-theme.css','card-navigation.js','sections.js','programming.js','quant.js','study.css',...['bootstrap.js','confirm-delete.js','locked-crypto.mjs','locked-store.mjs','locked-ui.js','locked-order.mjs','timebox-model.mjs','timebox-store.mjs','timebox-ui.js','ui.js','notes-store.mjs','eternal-ui.js','eternal.mjs','note-order.mjs','selection.mjs','cloud-selection.mjs','private-page-navigation.js','autumn.js','autumn.css','autumn-leaf.svg','autumn-oak.svg','autumn-birch.svg'].map(f=>'temponotes/'+f),...['bootstrap.js','store.mjs','model.mjs','chart.mjs','style.css','index.html'].map(f=>'weight-tracker/'+f)];
const runtimeVersion=createHash('sha256').update((await Promise.all(runtimeFiles.map(f=>fs.readFile(new URL('src/'+f,root),'utf8')))).join('\n')+atlasVersion).digest('hex').slice(0,12);
let html=await fs.readFile(new URL('src/index.html',root),'utf8');
const css=await fs.readFile(new URL('src/style.css',root),'utf8');
const js=await fs.readFile(new URL('src/app.js',root),'utf8');
const germanVoice=await fs.readFile(new URL('src/german-voice.js',root),'utf8');
const cardNavigation=await fs.readFile(new URL('src/card-navigation.js',root),'utf8');
const sections=(await fs.readFile(new URL('src/sections.js',root),'utf8')).replaceAll("'digit-span/index.html'","'digit-span/index.html?v="+runtimeVersion+"'").replace(/'(arithmetic|programming|quant)\.html'/g,"'$1.html?v="+runtimeVersion+"'");
const cursorCss=await fs.readFile(new URL('src/cursor.css',root),'utf8');
const studyCss=await fs.readFile(new URL('src/study.css',root),'utf8');
const supportCss=await fs.readFile(new URL('src/support.css',root),'utf8'),supportJs=await fs.readFile(new URL('src/support.js',root),'utf8'),supportConfig=JSON.parse(await fs.readFile(new URL('src/support-config.json',root),'utf8'));
const accountCss=await fs.readFile(new URL('src/account.css',root),'utf8'),authConfig=JSON.parse(await fs.readFile(new URL('src/auth-config.json',root),'utf8'));
if(authConfig.enabled&&(!authConfig.firebase?.apiKey||!authConfig.firebase?.projectId||!authConfig.firebase?.authDomain||!authConfig.firebase?.appId))throw Error('Firebase public web configuration is incomplete');
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
if(sentenceEntries.length!==1750||new Set(sentenceEntries.map(s=>sentenceKey(s[0]))).size!==1750)throw new Error('The sentence deck must contain exactly 1750 distinct German sentences');
if(sentenceEntries.some((s,i)=>s.length!==4||!s.slice(0,3).every(t=>typeof t==='string'&&t.trim())||sentenceKey(s[1])===sentenceKey(s[2])||!Number.isInteger(s[3])||(i<1000?s[3]<1:s[3]!==0)||(i&&sentenceEntries[i-1][3]<s[3])))throw new Error('Each sentence needs two different choices; original corpus frequencies descend and unranked additions use zero');
const kana=await fs.readFile(new URL('src/kana.json',root),'utf8'),kanaEntries=JSON.parse(kana);
const hiragana='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const katakana='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
if(kanaEntries.length!==92||new Set(kanaEntries.map(c=>c[0])).size!==92||kanaEntries.filter(c=>c[3]==='hiragana').map(c=>c[0]).join('')!==hiragana||kanaEntries.filter(c=>c[3]==='katakana').map(c=>c[0]).join('')!==katakana||kanaEntries.some(c=>!c[1]||!Number.isSafeInteger(c[2])||c[2]<0||!Array.isArray(c[4])))throw new Error('Expected 46 basic Hiragana and 46 basic Katakana with sounds and observed frequency counts');
const kanji=await fs.readFile(new URL('src/kanji.json',root),'utf8'),kanjiEntries=JSON.parse(kanji);
const economics=await fs.readFile(new URL('src/economics.json',root),'utf8'),economicsEntries=JSON.parse(economics);
const economicsKey=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
if(economicsEntries.length!==3500||new Set(economicsEntries.map(c=>economicsKey(c[0]))).size!==3500||economicsEntries.some((c,i)=>c.length!==6||!c.slice(0,3).every(t=>typeof t==='string'&&t.trim())||economicsKey(c[1])===economicsKey(c[2])||!Number.isInteger(c[3])||(i&&economicsEntries[i-1][3]>c[3])||!['term','recall','scenario','calculation'].includes(c[4])||!c[5]))throw new Error('Expected 3500 unique Economics items with distinct authored choices in curriculum order');
if(kanjiEntries.length!==2136||new Set(kanjiEntries.map(c=>c[0])).size!==2136||kanjiEntries.some((c,i)=>[...c[0]].length!==1||!c[1]||!Array.isArray(c[3])||!c[3].includes(c[1])||![1,2,3,4,5,6,8].includes(c[4])||!Number.isInteger(c[2])||(i&&kanjiEntries[i-1][2]>c[2])))throw new Error('Expected 2136 unique Jōyō Kanji with valid English meanings in frequency order');
const coreDeckInfo={};
await fs.mkdir(new URL('dist/decks/',root),{recursive:true});
await fs.mkdir(new URL('dist/german/',root),{recursive:true});
for(const [id,data,url] of [['german-word',words,'german/words.json'],['french-word',frenchWords,'french/words.json'],['french-sentence',frenchSentences,'french/sentences.json'],['sentence',sentences,'decks/sentences.json'],['kanji',kanji,'decks/kanji.json'],['economics',economics,'decks/economics.json']]){
 coreDeckInfo[id]={count:JSON.parse(data).length,url,version:createHash('sha256').update(data).digest('hex').slice(0,16)};
 await fs.writeFile(new URL('dist/'+url,root),data);
}
html=html.replace('<script defer src="card-navigation.js"></script>',()=>'<script>'+cardNavigation+'</script>').replace('<link rel="stylesheet" href="style.css">','<style>'+css.trim()+'\n'+cursorCss.trim()+'\n'+studyCss.trim()+'\n'+supportCss.trim()+'\n'+accountCss.trim()+'</style>')
 .replace('<script defer src="app.js"></script>','').replace('<script defer src="german-voice.js"></script>','')
 .replace('CORE_DECK_INFO',()=>JSON.stringify(coreDeckInfo))
 .replace('FRENCH_WORD_DATA','[]')
 .replace('FRENCH_SENTENCE_DATA','[]')
 .replace('WORD_DATA',JSON.stringify(entries.slice(0,32)).replace(/</g,'\\u003c'))
 .replace('SENTENCE_DATA','[]')
 .replace('KANA_DATA',kana.replace(/</g,'\\u003c'))
 .replace('KANJI_DATA','[]')
 .replace('ECONOMICS_DATA','[]')
 .replace('TRIVIA_INFO',JSON.stringify(triviaInfo))
 .replace('LANGUAGE_INFO',JSON.stringify(languageInfo))
 .replace('SUPPORT_CONFIG',()=>JSON.stringify(supportConfig).replace(/</g,'\\u003c'))
 .replace('AUTH_CONFIG',()=>JSON.stringify(authConfig).replace(/</g,'\\u003c'))
 .replace('</body>',()=>'<script>'+germanVoice.trim()+'</script>\n<script>'+schedule.trim()+'</script>\n<script>'+js.trim()+'</script>\n<script>'+sections.trim()+'</script>\n<script>'+supportJs.trim()+'</script>\n<script defer src="notes-navigation.js"></script>\n<script defer src="account.js"></script>\n</body>');
await fs.mkdir(new URL('dist/',root),{recursive:true});
await fs.rm(new URL('dist/arithmetic-aim.html',root),{force:true});
html=html.replace('</head>','<style>'+await fs.readFile(new URL('src/autumn-main.css',root),'utf8')+'</style></head>').replace('</body>','<script defer data-danki-main src="temponotes/autumn.js?v='+runtimeVersion+'"></script></body>');
html=html.replace('src="notes-navigation.js"','src="notes-navigation.js?v='+runtimeVersion+'"').replace('src="account.js"','src="account.js?v='+runtimeVersion+'"');
html=html.replace('</body>','<script defer src="atlas-navigation.js?v='+runtimeVersion+'"></script></body>');
await fs.writeFile(new URL('dist/atlas-navigation.js',root),(await fs.readFile(new URL('src/atlas-navigation.js',root),'utf8')).replaceAll('ATLAS_RELEASE',atlasVersion));
html=html.replace('</body>','<script defer src="weight-navigation.js?v='+runtimeVersion+'"></script></body>');
await fs.writeFile(new URL('dist/weight-navigation.js',root),(await fs.readFile(new URL('src/weight-navigation.js',root),'utf8')).replaceAll('WEIGHT_RELEASE',runtimeVersion));
html=html.replace('</body>','<script defer src="timebox-navigation.js?v='+runtimeVersion+'"></script></body>');
await fs.writeFile(new URL('dist/timebox-navigation.js',root),(await fs.readFile(new URL('src/timebox-navigation.js',root),'utf8')).replaceAll('TIMEBOX_RELEASE',runtimeVersion));
await fs.mkdir(new URL('dist/timebox/',root),{recursive:true});
for(const name of ['bootstrap.js','style.css','index.html']){let source=await fs.readFile(new URL('src/timebox/'+name,root),'utf8');source=source.replace('src="../temponotes/autumn.js"','src="../temponotes/autumn.js?v='+runtimeVersion+'"').replace('src="../temponotes/private-page-navigation.js"','src="../temponotes/private-page-navigation.js?v='+runtimeVersion+'"').replace('AUTH_CONFIG',JSON.stringify(authConfig)).replace(/from '(\.\.\/temponotes\/[^']+)'/g,(all,path)=>"from '"+path+'?v='+runtimeVersion+"'").replace('src="bootstrap.js"','src="bootstrap.js?v='+runtimeVersion+'"');await fs.writeFile(new URL('dist/timebox/'+name,root),source);}
await fs.cp(new URL('src/weight-tracker/',root),new URL('dist/weight-tracker/',root),{recursive:true});
for(const name of ['bootstrap.js','store.mjs','chart.mjs']){const file='weight-tracker/'+name;const source=await fs.readFile(new URL('src/'+file,root),'utf8');await fs.writeFile(new URL('dist/'+file,root),source.replaceAll('PRIVATE_RELEASE',runtimeVersion).replace(/from '(\.\/[^']+\.(?:mjs|js))'/g,(all,path)=>"from '"+path+'?v='+runtimeVersion+"'"));}
const weightHtml=(await fs.readFile(new URL('src/weight-tracker/index.html',root),'utf8')).replace('AUTH_CONFIG',JSON.stringify(authConfig)).replace('href="style.css"','href="style.css?v='+runtimeVersion+'"').replace('src="bootstrap.js"','src="bootstrap.js?v='+runtimeVersion+'"');
await fs.writeFile(new URL('dist/weight-tracker/index.html',root),weightHtml);
await fs.cp(new URL('src/digit-span/',root),new URL('dist/digit-span/',root),{recursive:true});
for(const name of ['index.html','game.js']){const file='digit-span/'+name;const source=await fs.readFile(new URL('src/'+file,root),'utf8');await fs.writeFile(new URL('dist/'+file,root),source.replace('href="style.css"','href="style.css?v='+runtimeVersion+'"').replace('src="game.js"','src="game.js?v='+runtimeVersion+'"').replace("'./model.mjs'","'./model.mjs?v="+runtimeVersion+"'").replace("'./best-score.mjs'","'./best-score.mjs?v="+runtimeVersion+"'"));}
await fs.writeFile(new URL('dist/index.html',root),html);
for(const file of ['account.js','cloud-state.mjs','notes-navigation.js'])await fs.copyFile(new URL('src/'+file,root),new URL('dist/'+file,root));
await fs.writeFile(new URL('dist/account.js',root),(await fs.readFile(new URL('src/account.js',root),'utf8')).replace("'./cloud-state.mjs'","'./cloud-state.mjs?v="+runtimeVersion+"'"));
await fs.writeFile(new URL('dist/notes-navigation.js',root),(await fs.readFile(new URL('src/notes-navigation.js',root),'utf8')).replace('NOTES_RELEASE',runtimeVersion));
await fs.cp(new URL('src/temponotes/',root),new URL('dist/temponotes/',root),{recursive:true,filter:source=>!source.endsWith('.tsx')&&!source.endsWith('background.jpg')});
const notesHtml=(await fs.readFile(new URL('src/temponotes/index.html',root),'utf8')).replace('src="./bootstrap.js"','src="./bootstrap.js?v='+runtimeVersion+'"').replace('src="./autumn.js"','src="./autumn.js?v='+runtimeVersion+'"').replace('src="./private-page-navigation.js"','src="./private-page-navigation.js?v='+runtimeVersion+'"');
for(const file of runtimeFiles.filter(f=>f.startsWith('temponotes/'))){const source=await fs.readFile(new URL('src/'+file,root),'utf8');await fs.writeFile(new URL('dist/'+file,root),source.replaceAll('PRIVATE_RELEASE',runtimeVersion).replace(/from '(\.\/[^']+\.(?:mjs|js))'/g,(all,path)=>"from '"+path+'?v='+runtimeVersion+"'"));}
const backgrounds=JSON.parse(await fs.readFile(new URL('src/temponotes/backgrounds.json',root),'utf8'));
if(backgrounds.length!==34||backgrounds.some(p=>!p.desktop||!p.mobile))throw Error('Expected all 34 daily backgrounds');
const retainedBackgrounds=new Set(backgrounds.flatMap(p=>[p.desktop.split('/').at(-1),p.mobile.split('/').at(-1)]));
for(const name of await fs.readdir(new URL('dist/temponotes/backgrounds/',root)))if(/^[0-9]+-(desktop|mobile)-[a-f0-9]+\.webp$/.test(name)&&!retainedBackgrounds.has(name))await fs.rm(new URL('dist/temponotes/backgrounds/'+name,root));
const backgroundScript=(await fs.readFile(new URL('src/temponotes/daily-background.js',root),'utf8')).replace('BACKGROUND_DATA',()=>JSON.stringify(backgrounds));
await fs.writeFile(new URL('dist/temponotes/index.html',root),notesHtml.replace('DAILY_BACKGROUND_SCRIPT',()=>backgroundScript).replace('AUTH_CONFIG',()=>JSON.stringify(authConfig).replace(/</g,'\\u003c')));
await fs.writeFile(new URL('dist/arithmetic.html',root),arithmetic.replace('</style>',arithmeticTheme.trim()+'\n'+cursorCss.trim()+'\n'+studyCss.trim()+'\n</style>'));
await fs.rm(new URL('dist/credits.txt',root),{force:true});
console.log(JSON.stringify({words:entries.length,sentences:sentenceEntries.length,frenchWords:5000,frenchSentences:1000,kana:kanaEntries.length,kanji:kanjiEntries.length,economics:economicsEntries.length,htmlBytes:Buffer.byteLength(html),compressedBytes:gzipSync(html).length}));

const {buildShared}=await import('./build-shared.mjs');await buildShared(root);

const {buildSecurity}=await import('./build-security.mjs');await buildSecurity(root);
