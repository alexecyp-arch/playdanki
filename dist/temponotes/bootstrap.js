import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {mount} from './ui.js?v=8e1a9a28795d';
import {createNotesStore} from './notes-store.mjs?v=8e1a9a28795d';
import {createCloudSelection} from './cloud-selection.mjs?v=8e1a9a28795d';
import {createTimeboxStore} from './timebox-store.mjs?v=8e1a9a28795d';
const config=JSON.parse(document.getElementById('auth-config').textContent);
const app=initializeApp(config.firebase),auth=getAuth(app),db=sdk.getFirestore(app);
const root=document.getElementById('root'),gate=document.getElementById('auth-gate'),status=document.getElementById('auth-status'),button=document.getElementById('sign-in');
let generation=0,dispose=()=>{},unmount=()=>{},loading,selectionStore,timeboxStore;
function clear(){selectionStore?.dispose();selectionStore=null;timeboxStore?.dispose();timeboxStore=null;++generation;loading?.abort();unmount();dispose();unmount=dispose=()=>{};root.replaceChildren();gate.hidden=false;}
beforeAuthStateChanged(auth,clear);
window.addEventListener('pagehide',clear);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
if(window.parent!==window){
 document.querySelector('.danki-return').addEventListener('click',event=>{if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();window.parent.postMessage({type:'danki-notes-return'},location.origin);});
 window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===window.parent&&event.data?.type==='danki-notes-visibility')window.dispatchEvent(new CustomEvent('temponotes-visibility',{detail:!!event.data.visible}));});
}
button.addEventListener('click',async()=>{button.disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch(error){status.textContent='Could not sign in. Please try again.';button.hidden=false;}finally{button.disabled=false;}});
onAuthStateChanged(auth,async user=>{
  clear();const current=generation;loading=new AbortController();
  button.hidden=!!user;status.textContent=user?'':'Sign in to use your private notes.';status.hidden=!!user;
  if(!user)return;
  try{
    const pending=createNotesStore({auth,db,sdk,uid:user.uid,signal:loading.signal});
    let storage;try{storage=localStorage;}catch{}
    const selection=selectionStore=createCloudSelection({auth,db,sdk,uid:user.uid,storage,onError:()=>{if(current===generation){status.hidden=false;status.textContent='Could not sync the pin. Tap the note to retry.';}}});
    timeboxStore=createTimeboxStore({auth,db,sdk,uid:user.uid});
    gate.hidden=true;unmount=mount(root,async(...args)=>(await pending).request(...args),{visible:window.parent===window||!window.frameElement?.hidden,selection,timebox:timeboxStore});
    const store=await pending;
    if(current!==generation){store.dispose();return;}
    dispose=store.dispose;
  }catch(error){if(current!==generation)return;unmount();timeboxStore?.dispose();timeboxStore=null;gate.hidden=false;status.hidden=false;status.textContent='Could not load your notes. Refresh to try again.';}
});
