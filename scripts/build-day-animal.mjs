import fs from 'node:fs/promises';
export async function buildDayAnimal(root,version){
 for(const file of ['day-animal.js','day-animal.css'])await fs.copyFile(new URL('src/'+file,root),new URL('dist/'+file,root));
 async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=new URL(entry.name,dir);if(entry.isDirectory())await walk(new URL(entry.name+'/',dir));else if(entry.name.endsWith('.html')){let html=await fs.readFile(file,'utf8');html=html.replace('</head>','<link rel="stylesheet" href="/day-animal.css?v='+version+'"></head>').replace('</body>','<script defer src="/day-animal.js?v='+version+'"></script></body>');await fs.writeFile(file,html);}}}
 await walk(new URL('dist/',root));
}
