import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';

const stops=[[0,[93,169,255]],[.38,[18,101,199]],[.75,[9,44,104]],[1,[3,14,38]]];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,12);

function spherePixels(size,background){
 const rgba=Buffer.alloc(size*size*4),samples=size===32?4:2,scale=32/size,radius=background?13:15;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const rgb=[0,0,0];let alpha=0;
  for(let sy=0;sy<samples;sy++)for(let sx=0;sx<samples;sx++){
   const px=(x+(sx+.5)/samples)*scale,py=(y+(sy+.5)/samples)*scale;
   if(Math.hypot(px-16,py-16)>radius)continue;alpha++;
   const t=Math.min(1,Math.hypot(px-10.6,py-8.5)/22.5),j=stops.findIndex(s=>s[0]>=t),a=stops[Math.max(0,j-1)],b=stops[j],f=b[0]===a[0]?0:(t-a[0])/(b[0]-a[0]);
   for(let c=0;c<3;c++)rgb[c]+=a[1][c]+(b[1][c]-a[1][c])*f;
  }
  const i=(y*size+x)*4,total=samples*samples;
  for(let c=0;c<3;c++)rgba[i+c]=background?Math.round((rgb[c]+background[c]*(total-alpha))/total):alpha?Math.round(rgb[c]/alpha):0;
  rgba[i+3]=background?255:Math.round(alpha/total*255);
 }
 return rgba;
}

function pngChunk(type,data){
 const chunk=Buffer.alloc(data.length+12);
 chunk.writeUInt32BE(data.length);chunk.write(type,4);data.copy(chunk,8);
 let crc=0xffffffff;
 for(const byte of chunk.subarray(4,-4)){
  crc^=byte;
  for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
 }
 chunk.writeUInt32BE((crc^0xffffffff)>>>0,chunk.length-4);
 return chunk;
}

function spherePng(size,background){
 const header=Buffer.alloc(13),stride=size*4,rows=Buffer.alloc((stride+1)*size),rgba=spherePixels(size,background);
 header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 for(let y=0;y<size;y++)rgba.copy(rows,y*(stride+1)+1,y*stride,(y+1)*stride);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(rows)),pngChunk('IEND',Buffer.alloc(0))]);
}

export async function buildIcons(root){
 const svg=await fs.readFile(new URL('src/favicon.svg',root));
 const version=hash(svg);
 await fs.writeFile(new URL('dist/favicon.svg',root),svg);
 // Also cover browsers requesting /favicon.ico directly.
 const size=32,pixels=size*size*4,mask=size*4,ico=Buffer.alloc(22+40+pixels+mask);
 ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=size;ico[7]=size;
 ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(40+pixels+mask,14);ico.writeUInt32LE(22,18);
 ico.writeUInt32LE(40,22);ico.writeInt32LE(size,26);ico.writeInt32LE(size*2,30);ico.writeUInt16LE(1,34);ico.writeUInt16LE(32,36);ico.writeUInt32LE(pixels+mask,42);
 const rgba=spherePixels(size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=size-1-y,i=62+(row*size+x)*4,p=(y*size+x)*4;
  for(let c=0;c<3;c++)ico[i+c]=rgba[p+2-c];
  ico[i+3]=rgba[p+3];
  if(!rgba[p+3])ico[62+pixels+row*4+(x>>3)]|=0x80>>(x&7);
 }
 await fs.writeFile(new URL('dist/favicon.ico',root),ico);
 async function writePng(name,size,background){
  const png=spherePng(size,background);
  await fs.writeFile(new URL('dist/'+name,root),png);
  return '/'+name+'?v='+hash(png);
 }
 const apple=await writePng('apple-touch-icon.png',180,[24,25,28]);
 const android=[];
 for(const size of [192,512]){
  android.push({src:await writePng('icon-'+size+'.png',size),sizes:size+'x'+size,type:'image/png'});
 }
 const manifest=JSON.stringify({name:'PlayDanki',short_name:'PlayDanki',id:'/',start_url:'/',display:'browser',icons:android},null,2)+'\n';
 await fs.writeFile(new URL('dist/manifest.webmanifest',root),manifest);
 return `<link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon.ico?v=${version}"><link rel="icon" type="image/png" sizes="192x192" href="${android[0].src}"><link rel="icon" type="image/svg+xml" href="/favicon.svg?v=${version}"><link rel="apple-touch-icon" sizes="180x180" href="${apple}"><link rel="manifest" href="/manifest.webmanifest?v=${hash(manifest)}">`;
}
