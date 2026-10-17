import fs from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
// Run monthly to refresh the curated KANJIDIC2 extract; no browser requests.
const url='https://www.edrdg.org/pub/Nihongo/kanjidic2.xml.gz';
const bytes=process.argv[2]?await fs.readFile(process.argv[2]):Buffer.from(await (await fetch(url)).arrayBuffer());
const xml=gunzipSync(bytes).toString('utf8'),root=new URL('../',import.meta.url);
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos);/g,m=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[m])).replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0]==='x'?parseInt(n.slice(1),16):+n));
const plain=s=>s.replace(/\s*\([^)]*\)/g,'').trim();
const choose={'張':'stretch','懸':'hang','薫':'fragrant','済':'finish','掲':'display','頂':'summit','申':'sign of the monkey','梗':'flower stem'};
const cards=[];
for(const match of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)){const c=match[1],grade=+(c.match(/<grade>(\d+)<\/grade>/)?.[1]||0);if(![1,2,3,4,5,6,8].includes(grade))continue;const glyph=decode(c.match(/<literal>([^<]+)<\/literal>/)[1]),meanings=[...c.matchAll(/<meaning>([\s\S]*?)<\/meaning>/g)].map(m=>decode(m[1]));if(!meanings.length)throw new Error('Kanji has no English meaning');const meaning=choose[glyph]||plain(meanings[0]),rank=+(c.match(/<freq>(\d+)<\/freq>/)?.[1]||9999);if(choose[glyph]&&!meanings.includes(meaning))throw new Error('Unknown curated meaning');cards.push([glyph,meaning,rank,[...new Set([...meanings,...meanings.map(plain)])],grade])}
cards.sort((a,b)=>a[2]-b[2]||a[4]-b[4]||a[1].length-b[1].length||a[0].codePointAt(0)-b[0].codePointAt(0));
if(cards.length!==2136||new Set(cards.map(c=>c[0])).size!==2136)throw new Error('Expected exactly 2136 unique Jōyō Kanji');
await fs.writeFile(new URL('src/kanji.json',root),JSON.stringify(cards)+'\n');
console.log(JSON.stringify({kanji:cards.length,sourceDate:xml.match(/<date_of_creation>([^<]+)/)?.[1],ranked:cards.filter(c=>c[2]<9999).length}));
