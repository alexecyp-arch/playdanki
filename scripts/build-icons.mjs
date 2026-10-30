import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function buildIcons(root){
 const svg=await fs.readFile(new URL('src/favicon.svg',root));
 const version=createHash('sha256').update(svg).digest('hex').slice(0,12);
 await fs.writeFile(new URL('dist/favicon.svg',root),svg);
 // Also cover browsers requesting /favicon.ico directly.
 const size=32,pixels=size*size*4,mask=size*4,ico=Buffer.alloc(22+40+pixels+mask);
 ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=size;ico[7]=size;
 ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(40+pixels+mask,14);ico.writeUInt32LE(22,18);
 ico.writeUInt32LE(40,22);ico.writeInt32LE(size,26);ico.writeInt32LE(size*2,30);ico.writeUInt16LE(1,34);ico.writeUInt16LE(32,36);ico.writeUInt32LE(pixels+mask,42);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const coverage=Math.max(0,Math.min(1,3.5-Math.hypot(x+.5-16,y+.5-16))),i=62+((31-y)*size+x)*4;
  for(const [c,blue] of [72,30,7].entries())ico[i+c]=Math.round(blue+(255-blue)*coverage);
  ico[i+3]=255;
 }
 await fs.writeFile(new URL('dist/favicon.ico',root),ico);
 return `<link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico?v=${version}"><link rel="icon" type="image/svg+xml" href="/favicon.svg?v=${version}">`;
}
