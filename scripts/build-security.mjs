import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const frameGuard="(()=>{'use strict';if(window.top===window)return;let same=false;try{same=window.top.location.origin===location.origin;}catch{}if(!same&&location.ancestorOrigins?.length)same=Array.from(location.ancestorOrigins).every(origin=>origin===location.origin);if(same)return;try{parent.postMessage({type:'danki-frame-blocked'},location.origin);}catch{}document.documentElement.style.display='none';window.stop();throw Error('Open PlayDanki directly.');})();";
export async function buildSecurity(root){
 let pages=0;
 async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const path=new URL(entry.name,dir);if(entry.isDirectory())await walk(new URL(entry.name+'/',dir));else if(entry.name.endsWith('.html')){
  let html=await fs.readFile(path,'utf8');html=html.replace(/<head([^>]*)>/i,'<head$1><script>'+frameGuard+'</script>');
  const hashes=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!(/\bsrc\s*=/i.test(m[1]))&&!(/\btype\s*=\s*["']application\/json/i.test(m[1]))).map(m=>"'sha256-"+createHash('sha256').update(m[2]).digest('base64')+"'");
  const policy=["default-src 'self'","script-src 'self' "+[...new Set(hashes)].join(' ')+" https://www.gstatic.com https://apis.google.com https://static.cloudflareinsights.com","style-src 'self' 'unsafe-inline'","img-src 'self' data: https:","font-src 'self' data:","connect-src 'self' https://*.googleapis.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://*.firebaseio.com wss://*.firebaseio.com https://cloudflareinsights.com https://*.cloudflareinsights.com","frame-src 'self' https://playdanki.com https://www.playdanki.com https://*.firebaseapp.com https://accounts.google.com https://www.google.com","worker-src 'self' blob:","media-src 'self' blob:","object-src 'none'","base-uri 'self'","form-action 'self'"].join('; ');
  // Place the policy before every script, so unapproved inline code stays blocked.
  html=html.replace(/<head([^>]*)>/i,'<head$1><meta http-equiv="Content-Security-Policy" content="'+policy+'"><meta name="referrer" content="same-origin">');await fs.writeFile(path,html);pages++;
 }}}
 await walk(new URL('dist/',root));return pages;
}
