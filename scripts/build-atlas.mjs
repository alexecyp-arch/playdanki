import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),source=new URL('src/data-atlas/',root);
export const atlasPages=['index.html','europe-consumption.html','ancient-ancestry.html','average-home-size.html'];
const theme=await fs.readFile(new URL('theme.css',source),'utf8'),bridge=await fs.readFile(new URL('bridge.js',source),'utf8');
const documents=await Promise.all(atlasPages.map(f=>fs.readFile(new URL('upstream/'+f,source),'utf8')));
export const atlasVersion=createHash('sha256').update(documents.join('\n')+theme+bridge+await fs.readFile(new URL('src/atlas-navigation.js',root),'utf8')).digest('hex').slice(0,12);
await fs.mkdir(new URL('dist/data-atlas/',root),{recursive:true});
await fs.cp(new URL('upstream/assets/',source),new URL('dist/data-atlas/assets/',root),{recursive:true});
for(let i=0;i<atlasPages.length;i++){
 const html=documents[i].replace('</head>','<style>'+theme+'</style></head>')
  .replace(/<header class="topbar">/,'<header class="topbar"><a class="danki-return" href="/">DANKI</a>')
  .replace('</body>','<script>'+bridge+'</script></body>');
 if(!html.includes('class="danki-return"'))throw Error('Missing Data Atlas return button');
 await fs.writeFile(new URL('dist/data-atlas/'+atlasPages[i],root),html);
}
