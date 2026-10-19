(()=>{
  'use strict';
  const pictures=BACKGROUND_DATA,anchor=Date.UTC(2026,9,18)/86400000;
  const index=date=>((Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)-anchor)%pictures.length+pictures.length)%pictures.length;
  const query='(max-width: 800px)';let screen=matchMedia(query);
  // A display:none iframe can report a tiny viewport. Use our real host window.
  try{if(window.parent!==window&&window.parent.location.origin===location.origin)screen=window.parent.matchMedia(query);}catch{}
  let active='',timer;
  const preload=document.createElement('link');preload.rel='preload';preload.as='image';document.head.append(preload);
  function update(){
    // Tall phone screens were stretching the short landscape mobile thumbnails.
    const now=new Date(),photo=pictures[index(now)],url=photo.desktop;
    if(url!==active){active=url;preload.href=url;document.documentElement.style.setProperty('--daily-background','url("'+url+'")');}
    clearTimeout(timer);
    timer=setTimeout(update,Math.max(1000,new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now+50));
  }
  update();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  window.addEventListener('pageshow',update);
  screen.addEventListener('change',update);
  window.addEventListener('resize',update);
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===window.parent&&event.data?.type==='danki-notes-visibility'&&event.data.visible)update();});
})();
