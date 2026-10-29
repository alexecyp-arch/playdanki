import {initStandaloneNavigation} from '../temponotes/private-page-navigation.js?v=9d0122a9fc22';
initStandaloneNavigation();
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {createBoxStore} from '../temponotes/timebox-store.mjs?v=9d0122a9fc22';
import {mountTimeboxHub} from './hub-ui.js?v=9d0122a9fc22';
const $=id=>document.getElementById(id),app=initializeApp(JSON.parse($('auth-config').textContent).firebase),auth=getAuth(app),db=sdk.getFirestore(app);
let store=null,unmount=()=>{};
function clear(){window.dispatchEvent(new Event('danki-private-auth-clearing'));unmount();unmount=()=>{};store?.dispose();store=null;$('root').replaceChildren();$('auth-gate').hidden=false;}
beforeAuthStateChanged(auth,clear);window.addEventListener('pagehide',clear);window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
onAuthStateChanged(auth,user=>{clear();$('sign-in').hidden=!!user;$('auth-status').hidden=true;window.dispatchEvent(new CustomEvent('danki-private-auth',{detail:user?.uid||null}));if(!user)return;try{store=createBoxStore({auth,db,sdk,uid:user.uid});unmount=mountTimeboxHub($('root'),store,{visible:parent===window||!window.frameElement?.hidden});$('auth-gate').hidden=true;}catch{$('auth-status').hidden=false;$('auth-status').textContent='COULD NOT LOAD TIMEBOX. REFRESH TO TRY AGAIN.';}});
$('sign-in').addEventListener('click',async()=>{$('sign-in').disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch{$('auth-status').hidden=false;$('auth-status').textContent='COULD NOT SIGN IN. TRY AGAIN.';}finally{$('sign-in').disabled=false;}});
if(parent!==window)document.querySelector('.danki-return').addEventListener('click',e=>{if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();parent.postMessage({type:'danki-timebox-return'},location.origin);});

if(parent!==window){document.querySelector('.page-switch').addEventListener('click',e=>{if(e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();parent.postMessage({type:'danki-timebox-open-notes'},location.origin);});window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='danki-timebox-visibility')window.dispatchEvent(new CustomEvent('temponotes-visibility',{detail:!!e.data.visible}));});}
