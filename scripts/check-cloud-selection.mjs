import assert from 'node:assert/strict';
import {createCloudSelection} from '../src/temponotes/cloud-selection.mjs';
const docs=new Map(),watchers=new Map();let lock=Promise.resolve();
const snap=ref=>({exists:()=>docs.has(ref),data:()=>docs.get(ref),metadata:{fromCache:false,hasPendingWrites:false}});
const sdk={doc:(_,...p)=>p.join('/'),serverTimestamp:()=>Date.now(),getDoc:async ref=>snap(ref),onSnapshot(ref,options,fn){const set=watchers.get(ref)||new Set();watchers.set(ref,set);set.add(fn);queueMicrotask(()=>fn(snap(ref)));return()=>set.delete(fn);},runTransaction(db,fn){const task=lock.then(async()=>{const changed=new Set();await fn({get:async ref=>snap(ref),set(ref,value){docs.set(ref,value);changed.add(ref);}});for(const ref of changed)for(const f of watchers.get(ref)||[])f(snap(ref));});lock=task.catch(()=>{});return task;}};
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
const alice={currentUser:{uid:'alice'}},phoneStorage=storage(),windowsStorage=storage(),id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';let errors=0;
phoneStorage.setItem('danki:note-selection:v1:alice',id);
const make=(auth,uid,storage)=>createCloudSelection({auth,db:{},sdk,uid,storage,onError:()=>errors++});
const emptyDesktop=make(alice,'alice',storage());async function settle(){for(let i=0;i<150;i++)await Promise.resolve();}
await settle();assert(!docs.has('users/alice/progress/note-selection'),'Fresh Windows browser must not erase an older phone pin');const phone=make(alice,'alice',phoneStorage);await settle();assert.equal(JSON.parse(docs.get('users/alice/progress/note-selection').value).id,id);
const windows=make(alice,'alice',windowsStorage);await settle();assert.equal(windows.get(),id,'Pin migrates from phone to fresh Windows browser');
windows.set(other);await settle();assert.equal(phone.get(),other);assert.equal(windows.get(),other);
phone.set(null);await settle();assert.equal(windows.get(),null,'Unpin reaches other device');
windows.dispose();windowsStorage.setItem('danki:note-selection:v1:alice',id);const returning=make(alice,'alice',windowsStorage);await settle();assert.equal(returning.get(),null,'A stale browser does not restore a cloud-unpinned note');
phone.set(id);phone.set(other);phone.set(id);await settle();assert.equal(returning.get(),id,'Last tap wins across queued saves');
const bobAuth={currentUser:{uid:'bob'}},bob=make(bobAuth,'bob',storage());await settle();assert.equal(bob.get(),null);bob.set(other);await settle();assert.equal(phone.get(),id,'Another account cannot change Alice selection');
alice.currentUser={uid:'bob'};assert.equal(phone.get(),null);phone.set(other);await settle();assert.equal(JSON.parse(docs.get('users/alice/progress/note-selection').value).id,id);phone.dispose();returning.dispose();emptyDesktop.dispose();bob.dispose();assert.equal(errors,0);
console.log('Cloud pin checks passed: legacy migration, two-device updates/unpin, stale browser protection, last tap wins, account isolation and disposal.');
