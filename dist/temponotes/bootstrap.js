// Let the gate paint, but never wait indefinitely in a hidden warm frame.
let started=false;
const start=()=>{if(started)return;started=true;import('./runtime.js?v=6b0d81e61f10').catch(()=>{const status=document.getElementById('auth-status');document.getElementById('auth-gate').hidden=false;document.getElementById('notes-navigation').hidden=false;status.hidden=false;status.textContent='Could not load notes. Refresh to try again.';});};
setTimeout(start,250);
requestAnimationFrame(()=>requestAnimationFrame(start));
