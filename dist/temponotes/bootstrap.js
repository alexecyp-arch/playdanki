// Let the gate paint, but never wait indefinitely in a hidden warm frame.
let started=false;
const start=()=>{if(started)return;started=true;import('./runtime.js?v=ee8206a776d2').catch(()=>{const status=document.getElementById('auth-status');status.hidden=false;status.textContent='Could not load notes. Refresh to try again.';});};
setTimeout(start,250);
requestAnimationFrame(()=>requestAnimationFrame(start));
