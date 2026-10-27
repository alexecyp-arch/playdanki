// Paint the sign-in gate before downloading the private notes runtime.
const start=()=>import('./runtime.js?v=36b4886b36d3').catch(()=>{const status=document.getElementById('auth-status');status.hidden=false;status.textContent='Could not load notes. Refresh to try again.';});
requestAnimationFrame(()=>requestAnimationFrame(start));
