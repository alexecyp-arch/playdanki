// Paint the sign-in gate before downloading the private notes runtime.
const start=()=>import('./runtime.js?v=87277263d61c').catch(()=>{const status=document.getElementById('auth-status');status.hidden=false;status.textContent='Could not load notes. Refresh to try again.';});
requestAnimationFrame(()=>requestAnimationFrame(start));
