(()=>{
  'use strict';
  const pictures=BACKGROUND_DATA,anchor=Date.UTC(2026,9,18)/86400000;
  const index=date=>((Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000)-anchor)%pictures.length+pictures.length)%pictures.length;
  let active='',timer;
  const preload=document.createElement('link');preload.rel='preload';preload.as='image';document.head.append(preload);
  function update(){
    const now=new Date(),photo=pictures[index(now)],url=matchMedia('(max-width: 800px)').matches?photo.mobile:photo.desktop;
    if(url!==active){active=url;preload.href=url;document.documentElement.style.setProperty('--daily-background','url("'+url+'")');}
    clearTimeout(timer);
    timer=setTimeout(update,Math.max(1000,new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now+50));
  }
  update();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  window.addEventListener('pageshow',update);
})();
