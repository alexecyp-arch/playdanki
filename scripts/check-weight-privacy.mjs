import assert from 'node:assert/strict';
const host=process.env.FIRESTORE_EMULATOR_HOST||'127.0.0.1:8892';assert(/^(127\.0\.0\.1|localhost):\d+$/.test(host));const project='demo-playdanki-privacy',database=`projects/${project}/databases/(default)`,base=`http://${host}/v1/${database}/documents`;
const token=uid=>[Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({aud:project,iss:`https://securetoken.google.com/${project}`,sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,firebase:{sign_in_provider:'google.com',identities:{}}})).toString('base64url'),''].join('.');
const headers=uid=>({'Content-Type':'application/json',...(uid?{Authorization:'Bearer '+token(uid)}:{})});let checks=0;
async function commit(uid,owner,id,fields={kg:{doubleValue:80}},automatic=true,expect=200){const r=await fetch(base+':commit',{method:'POST',headers:headers(uid),body:JSON.stringify({writes:[{update:{name:`${database}/documents/users/${owner}/weights/${id}`,fields},...(automatic?{updateTransforms:[{fieldPath:'recordedAt',setToServerValue:'REQUEST_TIME'}]}:{})}]})});const body=await r.json();assert.equal(r.status,expect,JSON.stringify(body));checks++;return body;}
async function read(uid,path,expect,method='GET'){const r=await fetch(base+'/'+path,{method,headers:headers(uid)});assert.equal(r.status,expect,await r.text());checks++;}
for(const owner of ['alice','bob']){
 const other=owner==='alice'?'bob':'alice';for(let i=0;i<3;i++)await commit(owner,owner,'entry'+i);
 await read(owner,`users/${owner}/weights/entry0`,200);await read(owner,`users/${owner}/weights`,200);
 for(const intruder of [null,other]){await read(intruder,`users/${owner}/weights/entry0`,403);await read(intruder,`users/${owner}/weights`,403);await commit(intruder,owner,'forged',undefined,true,403);await read(intruder,`users/${owner}/weights/entry0`,403,'DELETE');}
 await commit(owner,owner,'entry0',{kg:{doubleValue:70}},true,403);await read(owner,`users/${owner}/weights/entry0`,403,'DELETE');
 for(const value of [{doubleValue:-1},{doubleValue:0},{doubleValue:1001},{stringValue:'80'}])await commit(owner,owner,'bad'+checks,{kg:value},true,403);
 await commit(owner,owner,'extra',{kg:{doubleValue:80},public:{booleanValue:true}},true,403);
 await commit(owner,owner,'missing',{kg:{doubleValue:80}},false,403);
 await commit(owner,owner,'forged-time',{kg:{doubleValue:80},recordedAt:{timestampValue:'2000-01-01T00:00:00Z'}},false,403);
}
for(const uid of [null,'alice','bob']){const r=await fetch(base+':runQuery',{method:'POST',headers:headers(uid),body:JSON.stringify({structuredQuery:{from:[{collectionId:'weights',allDescendants:true}]}})});assert.equal(r.status,403,await r.text());checks++;}
console.log(`Weight privacy passed ${checks} checks: owner-only access, repeated entries, immutable server times, signed-out/cross-account/global reads denied, bad data denied.`);
