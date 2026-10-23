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
let echoes=0;const unsubscribe=windows.subscribe(()=>echoes++);const selectionRef='users/alice/progress/note-selection',currentDoc={...docs.get(selectionRef)};
for(const fn of watchers.get(selectionRef)||[]){fn({exists:()=>true,data:()=>({...currentDoc,revision:currentDoc.revision-1,value:JSON.stringify({id})}),metadata:{fromCache:false,hasPendingWrites:false}});fn(snap(selectionRef));}
assert.equal(windows.get(),other,'Delayed older snapshots cannot move the pin back');assert.equal(echoes,0,'Unchanged server echoes do not rerender the pin');unsubscribe();
phone.set(null);await settle();assert.equal(windows.get(),null,'Unpin reaches other device');
windows.dispose();windowsStorage.setItem('danki:note-selection:v1:alice',id);const returning=make(alice,'alice',windowsStorage);await settle();assert.equal(returning.get(),null,'A stale browser does not restore a cloud-unpinned note');
phone.set(id);phone.set(other);phone.set(id);await settle();assert.equal(returning.get(),id,'Last tap wins across queued saves');
// A committed write may resolve before its snapshot arrives. getDoc may still
// return the preceding cached revision; it must never undo a fresh local tap.
const raceDocs=new Map(),raceWatchers=new Set();let heldSnapshot=null,staleReads=0;
const raceRef='users/race/progress/note-selection';raceDocs.set(raceRef,{value:JSON.stringify({id}),revision:1});
const raceSnap=(value)=>({exists:()=>!!value,data:()=>value,metadata:{fromCache:false,hasPendingWrites:false}});
const staleDoc={...raceDocs.get(raceRef)};
const raceSdk={doc:()=>raceRef,serverTimestamp:()=>0,getDoc:async()=>{staleReads++;return raceSnap(staleDoc)},onSnapshot(ref,options,fn){raceWatchers.add(fn);queueMicrotask(()=>fn(raceSnap(staleDoc)));return()=>raceWatchers.delete(fn);},async runTransaction(db,fn){const result=await fn({get:async()=>raceSnap(raceDocs.get(raceRef)),set(ref,value){raceDocs.set(ref,value);heldSnapshot=value;}});return result;}};
const race=createCloudSelection({auth:{currentUser:{uid:'race'}},db:{},sdk:raceSdk,uid:'race',storage:storage()});await settle();
const raceChanges=[];race.subscribe(v=>raceChanges.push(v));race.set(null);await settle();
assert.equal(race.get(),null,'A stale cached read after a successful unpin must not repin the note');
assert.deepEqual(raceChanges,[null],'One tap emits exactly one pin change before the server echo');
for(const fn of raceWatchers)fn(raceSnap(heldSnapshot));assert.equal(race.get(),null);
for(const fn of raceWatchers)fn(raceSnap(staleDoc));assert.equal(race.get(),null,'Older server snapshot after commit cannot repin');
assert.equal(staleReads,0,'Pin writes never read back from the stale cache');
race.set(id);race.set(null);race.set(id);race.set(null);await settle();assert.equal(race.get(),null,'Rapid alternating taps keep the last choice');
for(const fn of raceWatchers)fn(raceSnap(heldSnapshot));assert.equal(race.get(),null);
const remote={value:JSON.stringify({id:other}),revision:heldSnapshot.revision+1};for(const fn of raceWatchers)fn(raceSnap(remote));assert.equal(race.get(),other,'A genuinely newer change from another device still syncs');race.dispose();
const bobAuth={currentUser:{uid:'bob'}},bob=make(bobAuth,'bob',storage());await settle();assert.equal(bob.get(),null);bob.set(other);await settle();assert.equal(phone.get(),id,'Another account cannot change Alice selection');
alice.currentUser={uid:'bob'};assert.equal(phone.get(),null);phone.set(other);await settle();assert.equal(JSON.parse(docs.get('users/alice/progress/note-selection').value).id,id);phone.dispose();returning.dispose();emptyDesktop.dispose();bob.dispose();assert.equal(errors,0);
console.log('Cloud pin checks passed: legacy migration, two-device updates/unpin, stale browser protection, last tap wins, account isolation and disposal.');
