import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {mount} from './ui.js';
import {createNotesStore} from './notes-store.mjs';
const config=JSON.parse(document.getElementById('auth-config').textContent);
const app=initializeApp(config.firebase),auth=getAuth(app),db=sdk.getFirestore(app);
const root=document.getElementById('root'),gate=document.getElementById('auth-gate'),status=document.getElementById('auth-status'),button=document.getElementById('sign-in');
let generation=0,dispose=()=>{},unmount=()=>{};
button.addEventListener('click',async()=>{button.disabled=true;try{await signInWithPopup(auth,new GoogleAuthProvider());}catch(error){status.textContent='Could not sign in. Please try again.';button.hidden=false;}finally{button.disabled=false;}});
onAuthStateChanged(auth,async user=>{
  const current=++generation;unmount();dispose();unmount=dispose=()=>{};root.replaceChildren();gate.hidden=false;
  button.hidden=!!user;status.textContent=user?'':'Sign in to use your private notes.';status.hidden=!!user;
  if(!user)return;
  try{
    const pending=createNotesStore({auth,db,sdk,uid:user.uid});
    gate.hidden=true;unmount=mount(root,async(...args)=>(await pending).request(...args));
    const store=await pending;
    if(current!==generation){store.dispose();return;}
    dispose=store.dispose;
  }catch(error){if(current!==generation)return;unmount();gate.hidden=false;status.hidden=false;status.textContent='Could not load your notes. Refresh to try again.';}
});
