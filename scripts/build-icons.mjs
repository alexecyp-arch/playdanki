import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,12);
export async function buildIcons(root){
 const svg=await fs.readFile(new URL('src/favicon.svg',root)),assets=JSON.parse(await fs.readFile(new URL('src/icon-assets.json',root),'utf8'));
 const version=hash(svg);await fs.writeFile(new URL('dist/favicon.svg',root),svg);
 // A PNG-backed ICO preserves the icon's transparent background.
 const png=Buffer.from(assets[32],'base64'),ico=Buffer.alloc(22);
 ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=ico[7]=32;
 ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(png.length,14);ico.writeUInt32LE(22,18);
 await fs.writeFile(new URL('dist/favicon.ico',root),Buffer.concat([ico,png]));
 async function writePng(name,size){const bytes=Buffer.from(assets[size],'base64');await fs.writeFile(new URL('dist/'+name,root),bytes);return '/'+name+'?v='+hash(bytes);}
 const apple=await writePng('apple-touch-icon.png',180),android=[];
 for(const size of [192,512])android.push({src:await writePng('icon-'+size+'.png',size),sizes:size+'x'+size,type:'image/png',purpose:'any'});
 const manifest=JSON.stringify({name:'PlayDanki',short_name:'PlayDanki',id:'/',start_url:'/',display:'browser',icons:android},null,2)+'\n';
 await fs.writeFile(new URL('dist/manifest.webmanifest',root),manifest);
 return `<link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico?v=${version}"><link rel="icon" type="image/png" sizes="192x192" href="${android[0].src}"><link rel="icon" type="image/svg+xml" href="/favicon.svg?v=${version}"><link rel="apple-touch-icon" sizes="180x180" href="${apple}"><link rel="manifest" href="/manifest.webmanifest?v=${hash(manifest)}">`;
}
