import {mountMonthlyCounts} from '../weight-tracker/monthly-counts.mjs';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,onAuthStateChanged,beforeAuthStateChanged,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';

const $=id=>document.getElementById(id);
const app=initializeApp(JSON.parse($('auth-config').textContent).firebase);
const auth=getAuth(app),db=sdk.getFirestore(app);
const monthly=mountMonthlyCounts({auth,db,sdk});
function clearAccount(){
 window.dispatchEvent(new Event('danki-private-auth-clearing'));
 monthly.clear();
}
beforeAuthStateChanged(auth,clearAccount);
window.addEventListener('pagehide',monthly.clear);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
window.addEventListener('message',event=>{
 if(parent!==window&&event.source===parent&&event.origin===location.origin&&
    event.data?.type==='danki-monthly-visibility'&&event.data.visible)monthly.refreshMonth();
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)monthly.refreshMonth();});
onAuthStateChanged(auth,user=>{
 clearAccount();
 window.dispatchEvent(new CustomEvent('danki-private-auth',{detail:user?.uid||null}));
 $('auth-gate').hidden=!!user;
 if(user)monthly.open(user);
});
$('sign-in').onclick=async()=>{
 $('sign-in').disabled=true;
 try{await signInWithPopup(auth,new GoogleAuthProvider());}
 catch{$('auth-status').textContent='COULD NOT SIGN IN. TRY AGAIN.';}
 finally{$('sign-in').disabled=false;}
};
