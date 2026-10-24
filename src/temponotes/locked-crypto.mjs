const encoder=new TextEncoder(),decoder=new TextDecoder(),iterations=310000;
const encode=bytes=>{let text='';for(const byte of bytes)text+=String.fromCharCode(byte);return btoa(text);};
const bytes=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
const aad=uid=>encoder.encode('playdanki-locked-notes:v1:'+uid);
export function validPassword(password){return typeof password==='string'&&password.length>=1&&password.length<=1024;}
export function emptyLockedNotes(){return {tabs:[{id:crypto.randomUUID(),text:''}]};}
export function validateNotes(data){if(!data||!Array.isArray(data.tabs)||data.tabs.length<1||data.tabs.length>100||data.tabs.some(t=>!t||typeof t.id!=='string'||!/^[0-9a-f-]{36}$/i.test(t.id)||typeof t.text!=='string'||t.text.length>4000000)||new Set(data.tabs.map(t=>t.id)).size!==data.tabs.length)throw Error('INVALID LOCKED NOTES');return data;}
export function parseEnvelope(value){
 const e=typeof value==='string'?JSON.parse(value):value;
 if(!e||e.format!==1||e.iterations!==iterations||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof e.ciphertext!=='string'||e.ciphertext.length>6000000||bytes(e.salt).length!==16||bytes(e.iv).length!==12||bytes(e.ciphertext).length<16)throw Error('COULD NOT READ LOCKED NOTES');return e;
}
async function derive(password,salt){if(!validPassword(password))throw Error('ENTER A PASSWORD');const material=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function createLock(password){const salt=crypto.getRandomValues(new Uint8Array(16));return {key:await derive(password,salt),salt:encode(salt)};}
export async function sealNotes(data,lock,uid){
 validateNotes(data);const plain=encoder.encode(JSON.stringify(data));if(plain.length>4000000)throw Error('LOCKED NOTES ARE FULL (4 MB)');
 const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(uid)},lock.key,plain);
 return {format:1,iterations,salt:lock.salt,iv:encode(iv),ciphertext:encode(new Uint8Array(cipher))};
}
export async function unlockNotes(envelope,password,uid){
 const e=parseEnvelope(envelope),key=await derive(password,bytes(e.salt));
 try{const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(e.iv),additionalData:aad(uid)},key,bytes(e.ciphertext));return {data:validateNotes(JSON.parse(decoder.decode(plain))),lock:{key,salt:e.salt}};}catch{throw Error('WRONG PASSWORD');}
}
