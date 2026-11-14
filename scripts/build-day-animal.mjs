import fs from 'node:fs/promises';
export async function buildDayAnimal(root,version){
 for(const file of ['day-animal.js','day-animal.css'])await fs.copyFile(new URL('src/'+file,root),new URL('dist/'+file,root));
 const file=new URL('dist/temponotes/index.html',root);let html=await fs.readFile(file,'utf8');html=html.replace('</head>','<link rel="stylesheet" href="/day-animal.css?v='+version+'"></head>').replace('</body>','<script defer src="/day-animal.js?v='+version+'"></script></body>');await fs.writeFile(file,html);
}
