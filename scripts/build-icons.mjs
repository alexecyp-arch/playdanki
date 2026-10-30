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
 const stops=[[0,[93,169,255]],[.38,[18,101,199]],[.75,[9,44,104]],[1,[3,14,38]]];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const rgb=[0,0,0];let alpha=0;
  // Supersampling keeps the round edge and small white dot smooth at tab size.
  for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
   const px=x+(sx+.5)/4,py=y+(sy+.5)/4,d=Math.hypot(px-16,py-16);
   if(d>15)continue;alpha++;
   const t=Math.min(1,Math.hypot(px-10.6,py-8.5)/22.5),j=stops.findIndex(s=>s[0]>=t),a=stops[Math.max(0,j-1)],b=stops[j],f=b[0]===a[0]?0:(t-a[0])/(b[0]-a[0]);
   for(let c=0;c<3;c++)rgb[c]+=d<=2?255:a[1][c]+(b[1][c]-a[1][c])*f;
  }
  const row=31-y,i=62+(row*size+x)*4;
  for(let c=0;c<3;c++)ico[i+c]=alpha?Math.round(rgb[2-c]/alpha):0;
  ico[i+3]=Math.round(alpha/16*255);
  if(!alpha)ico[62+pixels+row*4+(x>>3)]|=0x80>>(x&7);
 }
 await fs.writeFile(new URL('dist/favicon.ico',root),ico);
 return `<link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico?v=${version}"><link rel="icon" type="image/svg+xml" href="/favicon.svg?v=${version}">`;
}
