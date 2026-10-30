// Run only against a local Firestore emulator, never a production database.
import assert from 'node:assert/strict';
const origin=process.env.FIRESTORE_EMULATOR_HOST||'127.0.0.1:8891';
assert(/^(127\.0\.0\.1|localhost):\d+$/.test(origin),'Local emulator only');
const project='demo-playdanki-privacy',base=`http://${origin}/v1/projects/${project}/databases/(default)/documents`;
const token=uid=>[Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({aud:project,iss:`https://securetoken.google.com/${project}`,sub:uid,user_id:uid,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,firebase:{sign_in_provider:'google.com',identities:{}}})).toString('base64url'),''].join('.');
const fields=value=>Object.fromEntries(Object.entries(value).map(([k,v])=>[k,typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(v)}:Array.isArray(v)?{arrayValue:{values:v.map(n=>({integerValue:String(n)}))}}:{stringValue:v}]));
let checks=0;
async function call(uid,path,method='GET',value){const r=await fetch(base+'/'+path,{method,headers:{'Content-Type':'application/json',...(uid?{Authorization:'Bearer '+token(uid)}:{})},...(value?{body:JSON.stringify({fields:fields(value)})}:{})});return {status:r.status,body:await r.json()};}
async function allowed(uid,path,method,value){const r=await call(uid,path,method,value);assert(r.status>=200&&r.status<300,JSON.stringify(r));checks++;}
async function denied(uid,path,method,value){const r=await call(uid,path,method,value);assert.equal(r.status,403,JSON.stringify({uid,path,method,...r}));checks++;}
const id='00000000-0000-4000-a000-000000000001';
for(const owner of ['alice','bob']){
 const now=Date.now(),normal=`users/${owner}/temponotes/${id}`,eternal=`users/${owner}/eternalNotes/${id}`;
 await allowed(owner,normal,'PATCH',{body:owner+' private manual',createdAt:now,expiresAt:now+3600000});
 await allowed(owner,eternal,'PATCH',{body:owner+' private recurring',days:[1,3],createdAt:Date.now(),dismissedOn:''});
 for(const path of [normal,eternal]){
  await allowed(owner,path);await allowed(owner,path.slice(0,path.lastIndexOf('/')));
  for(const intruder of [null,owner==='alice'?'bob':'alice']){
   await denied(intruder,path);await denied(intruder,path.slice(0,path.lastIndexOf('/')));
   await denied(intruder,path,'DELETE');
   await denied(intruder,path,'PATCH',{body:'attempted overwrite',createdAt:now,expiresAt:now+7200000});
  }
 }
 await allowed(owner,normal+'?updateMask.fieldPaths=expiresAt','PATCH',{expiresAt:now+5400000});
 await allowed(owner,eternal+'?updateMask.fieldPaths=dismissedOn','PATCH',{dismissedOn:'2026-10-19'});
 await allowed(owner,eternal+'?updateMask.fieldPaths=days','PATCH',{days:[]});
 const dormant=await call(owner,eternal);assert.equal(dormant.status,200);assert.equal(dormant.body.fields.days.arrayValue.values?.length||0,0,'Zero weekdays remain saved in private storage');checks++;
 for(const intruder of [null,owner==='alice'?'bob':'alice']){await denied(intruder,eternal);await denied(intruder,eternal+'?updateMask.fieldPaths=days','PATCH',{days:[3]});}
 await allowed(owner,eternal+'?updateMask.fieldPaths=days','PATCH',{days:[3]});
 for(const intruder of [null,owner==='alice'?'bob':'alice']){
  await denied(intruder,`users/${owner}/temponotes/00000000-0000-4000-a000-000000000002`,'PATCH',{body:'forged note',createdAt:Date.now(),expiresAt:Date.now()+3600000});
  await denied(intruder,`users/${owner}/eternalNotes/00000000-0000-4000-a000-000000000002`,'PATCH',{body:'forged recurring',days:[1],createdAt:Date.now(),dismissedOn:''});
  await denied(intruder,`users/${owner}/temponotesMeta/clock`);
  await denied(intruder,`users/${owner}/progress/main`);
 }
 const late='users/'+owner+'/temponotes/00000000-0000-4000-a000-000000000099',stamp=Date.now();
 await allowed(owner,late,'PATCH',{body:'late note',createdAt:stamp,expiresAt:stamp+20000,daily:true});
 await denied(owner,late+'?updateMask.fieldPaths=daily','PATCH',{daily:false});
 await allowed(owner,late+'?updateMask.fieldPaths=expiresAt','PATCH',{expiresAt:stamp+20000+86400000});
 await denied(owner,late+'?updateMask.fieldPaths=expiresAt','PATCH',{expiresAt:stamp+10000});
 await allowed(owner,late,'DELETE');
 await allowed(owner,normal,'DELETE');await allowed(owner,eternal,'DELETE');
}
for(const uid of [null,'alice','bob']){
 await denied(uid,'users');
 for(const collectionId of ['temponotes','eternalNotes']){
  const r=await fetch(base+':runQuery',{method:'POST',headers:{'Content-Type':'application/json',...(uid?{Authorization:'Bearer '+token(uid)}:{})},body:JSON.stringify({structuredQuery:{from:[{collectionId,allDescendants:true}]}})});
  assert.equal(r.status,403,'Collection-group reads must not enumerate everybody\'s notes');checks++;
 }
}
// Timers and encrypted notebooks use owner-only progress rules with server time and revisions.
for(const owner of ['alice','bob'])for(const key of ['timebox','repbox','locked-notes','locked-notes-part-0','weight-target','note-order']){
 const path=`users/${owner}/progress/${key}`,name=`projects/${project}/databases/(default)/documents/${path}`;
 const write=async(uid,revision)=>fetch(base+':commit',{method:'POST',headers:{'Content-Type':'application/json',...(uid?{Authorization:'Bearer '+token(uid)}:{})},body:JSON.stringify({writes:[{update:{name,fields:fields({value:JSON.stringify({tasks:[]}),version:1,revision})},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}]}]})});
 let result=await write(owner,1);assert.equal(result.status,200,await result.text());checks++;await allowed(owner,path);
 for(const intruder of [null,owner==='alice'?'bob':'alice']){await denied(intruder,path);await denied(intruder,path,'DELETE');result=await write(intruder,2);assert.equal(result.status,403);checks++;}
 result=await write(owner,1);assert.equal(result.status,403,'Stale revisions cannot overwrite timers');checks++;
 result=await write(owner,2);assert.equal(result.status,200,await result.text());checks++;await allowed(owner,path,'DELETE');
}
console.log(`Privacy rules passed ${checks} checks: owner access, cross-account and signed-out reads/lists/writes/deletes denied, global note queries denied, and TIMEBOX/REPBOX/LOCKED NOTES cloud writes and revisions checked.`);
