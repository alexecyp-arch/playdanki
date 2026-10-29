// Restore Google sign-in on startup so private notes can prepare while games run.
(()=>{'use strict';
const cfg=JSON.parse(document.getElementById('auth-config').textContent);if(!cfg.enabled)return;
const $=id=>document.getElementById(id),menu=$('account-menu'),label=$('account-label'),status=$('account-status'),login=$('account-login'),logout=$('account-logout'),sync=$('account-sync'),identity=$('account-identity');
menu.hidden=false;
let ready,api,core,auth,db,user=null,epoch=0,base=null,revision=0,busy=false,pending=null,poll=null,settling=false;
const ownerKey='danki:owner:v1',guestKey='danki:guest:v1',cacheKey=uid=>'danki:account:v1:'+uid;
function tell(text){status.textContent=text}
function cache(uid,value){localStorage.setItem(cacheKey(uid),JSON.stringify(value))}
async function cached(uid){try{const c=JSON.parse(localStorage.getItem(cacheKey(uid)));return c?{snapshot:await core.decode(c.snapshot),base:c.base?await core.decode(c.base):null,revision:c.revision}:null}catch{return null}}
async function backup(value){const packed=await core.encode(value),key='danki:backup:v1:'+Date.now()+'-'+Math.random().toString(36).slice(2,6);const keys=Object.keys(localStorage).filter(k=>k.startsWith('danki:backup:v1:')).sort();for(const old of keys.slice(0,-3))localStorage.removeItem(old);localStorage.setItem(key,packed)}
function capture(){return core.snapshot(localStorage)}
function refresh(){window.dispatchEvent(new StorageEvent('storage',{key:null}));const frame=$('arithmetic-frame');try{frame?.contentWindow?.dispatchEvent(new StorageEvent('storage',{key:null}))}catch{}}
async function apply(value){core.validate(value);const previous=capture();await backup(previous);if(!core.same(capture(),previous))throw Error('Progress changed during restore');for(const key of Object.keys(previous))if(!(key in value))localStorage.removeItem(key);for(const [key,text]of Object.entries(value))localStorage.setItem(key,text);refresh()}
function controls(){const signed=!!user;label.textContent=signed?'Account':'Google sign in';identity.textContent=signed?(user.email||'Signed in with Google'):'Save your place on your other devices.';login.hidden=signed;logout.hidden=!signed;sync.hidden=!signed;sync.disabled=!signed||busy||settling||!!pending;logout.disabled=busy||settling;login.disabled=!api||busy||settling}
async function remember(){if(!user||localStorage.getItem(ownerKey)!==user.uid)return;const uid=user.uid,rev=revision,[snapshot,packedBase]=await Promise.all([core.encode(capture()),base?core.encode(base):null]);if(localStorage.getItem(ownerKey)===uid&&revision===rev)cache(uid,{snapshot,base:packedBase,revision:rev})}
// Cloud wins automatically when two devices have different unsynced changes.
// apply() preserves the displaced browser copy in the existing local backups.
async function conflict(remote,rev,local){await apply(remote);await acknowledge(remote,rev);tell('Cloud progress loaded.');}
async function acknowledge(value,rev){base=value;revision=rev;await remember();tell('Saved to your Google account.');controls()}
async function restore(next){const ticket=++epoch;busy=true;settling=true;pending=null;$('account-conflict').hidden=true;clearInterval(poll);poll=null;
try{
 const owner=localStorage.getItem(ownerKey);if(user)await remember();user=next;
 if(!next){if(owner){const packed=localStorage.getItem(guestKey),guest=packed?await core.decode(packed):{};await apply(guest);localStorage.removeItem(ownerKey)}base=null;revision=0;tell('Progress saves in this browser.');return}
 const saved=await cached(next.uid);if(owner!==next.uid){if(!owner)localStorage.setItem(guestKey,await core.encode(capture()));await apply(saved?.snapshot||{});localStorage.setItem(ownerKey,next.uid)}
 base=saved?.base||null;revision=saved?.revision||0;controls();tell('');
 const ref=api.doc(db,'users',next.uid,'progress','main'),cloud=await api.getDoc(ref);if(ticket!==epoch)return;
 const data=cloud.exists()?cloud.data():null,remote=data?await core.decode(data.value):{},rev=data?.revision||0;
 let local=owner===next.uid||saved?capture():{};
 // First sign-in imports guest progress only when this account has no cloud save.
 if(!data&&!saved&&owner===null){const packed=localStorage.getItem(guestKey),guest=packed?await core.decode(packed):{};await apply(guest);local=capture()}
 const choice=core.choose(base,local,remote);if(choice==='conflict'){await conflict(remote,rev,local);return}
 if(choice==='remote'){await apply(remote);await acknowledge(remote,rev)}else{base=remote;revision=rev;await remember();tell(choice==='equal'?'Saved to your Google account.':'Cloud save pending.')}
}catch(error){tell(navigator.onLine?'Cloud save unavailable. Your browser progress is kept. Press Save to retry.':'Offline. Your browser progress is kept.');console.warn('Account sync:',error.code||error.message)}
finally{if(ticket===epoch){busy=false;settling=false;controls();if(user){poll=setInterval(()=>flush(),30000);if(!pending)flush()}}}}
async function flush(){if(!user||busy||pending||settling||!navigator.onLine||localStorage.getItem(ownerKey)!==user.uid)return;const uid=user.uid,ticket=epoch,local=capture();busy=true;controls();tell('Saving…');
try{
 const packed=await core.encode(local);if(packed.length>700000)throw Error('Cloud save is too large');
 const ref=api.doc(db,'users',uid,'progress','main');
 const result=await api.runTransaction(db,async tx=>{const doc=await tx.get(ref);const data=doc.exists()?doc.data():null,rev=data?.revision||0;const remote=data?await core.decode(data.value):{};
 if(ticket!==epoch||auth.currentUser?.uid!==uid)throw Error('Account changed');
 const choice=core.choose(base,local,remote);
 if(choice==='conflict')return {conflict:true,remote,rev};
 if(choice==='remote')return {remote,rev};
 if(choice==='equal')return {value:local,rev};
 tx.set(ref,{value:packed,revision:rev+1,version:1,updatedAt:api.serverTimestamp()});return {value:local,rev:rev+1};});
 if(ticket!==epoch)return;
 if(result.conflict){await conflict(result.remote,result.rev,capture());return}
 if(result.remote){if(!core.same(capture(),local)){await conflict(result.remote,result.rev,capture());return}await apply(result.remote);await acknowledge(result.remote,result.rev)}else await acknowledge(result.value,result.rev);
 if(!core.same(capture(),base))tell('Cloud save pending.');
}catch(error){try{await remember()}catch{}tell(navigator.onLine?'Cloud save failed. Your browser progress is kept. Press Save to retry.':'Offline. Your browser progress is kept.');console.warn('Account sync:',error.code||error.message)}finally{if(ticket===epoch){busy=false;controls()}}}
async function setup(){if(ready)return ready;login.disabled=true;tell('');ready=(async()=>{core=await import('./cloud-state.mjs?v=100d6b5a9e78');const url='https://www.gstatic.com/firebasejs/13.0.0/';const [app,a,f]=await Promise.all([import(url+'firebase-app.js'),import(url+'firebase-auth.js'),import(url+'firebase-firestore.js')]);api={...a,...f};const instance=app.initializeApp(cfg.firebase);auth=a.getAuth(instance);db=f.getFirestore(instance);a.beforeAuthStateChanged(auth,()=>window.dispatchEvent(new CustomEvent('danki-auth-clearing')));a.onAuthStateChanged(auth,next=>{window.dispatchEvent(new CustomEvent('danki-auth',{detail:next?.uid||null}));restore(next)});login.disabled=false;controls()})().catch(error=>{ready=null;tell('Google sign-in could not load. Reopen this menu to retry.');console.warn('Sign-in:',error.code||error.message)});return ready}
menu.addEventListener('toggle',()=>{if(menu.open)setup()});
login.addEventListener('click',async()=>{if(!api||busy)return;busy=true;controls();try{await api.signInWithPopup(auth,new api.GoogleAuthProvider())}catch(error){tell(error.code==='auth/popup-closed-by-user'?'Sign-in cancelled. Browser progress is unchanged.':'Sign-in failed. Please allow the Google popup and try again.')}finally{busy=false;controls()}});
logout.addEventListener('click',async()=>{if(busy||settling)return;await flush();if(pending){tell('Choose which progress to keep before signing out.');return}try{await remember();await api.signOut(auth)}catch{tell('Could not sign out. Please try again.')}});
sync.addEventListener('click',()=>flush());
addEventListener('online',()=>flush());
addEventListener('storage',e=>{if(e.key===ownerKey&&localStorage.getItem(ownerKey)!==user?.uid)location.reload()});
addEventListener('pagehide',()=>{remember().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{if(document.hidden){remember().catch(()=>{});flush()}else if(user)flush()});
document.addEventListener('danki-progress',()=>{if(user&&!settling&&!busy)tell('Cloud save pending.')});
try{localStorage.getItem(ownerKey);if(window.requestAnimationFrame)window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>setup()));else setup();}catch{tell('Enable browser storage to use account saves.');login.disabled=true}
})();
