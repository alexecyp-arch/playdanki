(()=>{'use strict';
 const layer=document.createElement('div');layer.className='autumn-leaves';layer.setAttribute('aria-hidden','true');
 const range=(min,max)=>min+Math.random()*(max-min),base=document.currentScript.src,shapes=['autumn-leaf.svg','autumn-oak.svg','autumn-birch.svg'];
 for(let i=0;i<21;i++){
  const leftSide=i<10,duration=range(19,37),leaf=document.createElement('span');leaf.className='autumn-leaf';
  const values={left:(leftSide?range(.2,17):range(82,98))+'%',mobileLeft:(leftSide?range(-1,5):range(94,99))+'%',size:range(19,37)+'px',duration:duration+'s',delay:-range(0,duration)+'s',start:range(-180,180)+'deg',spin:range(-220,220)+'deg',drift1:range(-20,24)+'px',drift2:range(-28,28)+'px',drift3:range(-18,24)+'px',sway:range(3,9)+'px',swayTime:range(4,9)+'s',alpha:range(.42,.74),hue:range(-28,22)+'deg'};
  for(const [name,value]of Object.entries(values))leaf.style.setProperty('--'+name,value);
  const img=document.createElement('img');img.src=new URL(shapes[Math.floor(range(0,shapes.length))],base).href;img.alt='';img.width=96;img.height=128;img.decoding='async';leaf.append(img);layer.append(leaf);
 }
 document.body.append(layer);let visible=parent===window||!window.frameElement?.hidden;
 const pause=()=>layer.classList.toggle('paused',!visible||document.hidden);
 document.addEventListener('visibilitychange',pause);window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='danki-notes-visibility'){visible=!!event.data.visible;pause();}});pause();
})();
