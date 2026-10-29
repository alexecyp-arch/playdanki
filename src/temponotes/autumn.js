(()=>{'use strict';
 const layer=document.createElement('div');layer.className='autumn-leaves';layer.setAttribute('aria-hidden','true');
 const range=(min,max)=>min+Math.random()*(max-min),base=document.currentScript.src,main=document.currentScript.hasAttribute('data-danki-main'),center=document.currentScript.hasAttribute('data-danki-timebox'),shapes=['autumn-leaf.svg','autumn-oak.svg','autumn-birch.svg'];
 // Three quiet steps per month, using the calendar in Switzerland.
 const seasons=[
  [[.75,0,0],[.70,0,0],[.65,0,0]],
  [[.60,0,0],[.45,0,.10],[.30,.03,.25]],
  [[.20,.06,.45],[.10,.12,.65],[.03,.16,.85]],
  [[0,.18,1],[0,.20,1],[0,.18,1]],
  [[0,.16,1],[0,.14,1],[0,.12,1]],
  [[0,.10,1],[0,.08,1],[0,.06,1]],
  [[0,.06,1],[0,.05,1],[0,.05,1]],
  [[0,.05,1],[0,.03,.9],[0,0,.75]],
  [[0,0,.55],[0,0,.35],[0,0,.15]],
  [[0,0,.08],[.02,0,0],[.06,0,0]],
  [[.12,0,0],[.22,0,0],[.34,0,0]],
  [[.45,0,0],[.60,0,0],[.75,0,0]]
 ];
 let seasonKey='';
 function refreshSeason(){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',month:'numeric',day:'numeric'}).formatToParts(new Date()),month=Number(parts.find(p=>p.type==='month').value)-1,segment=Math.min(2,Math.floor((Number(parts.find(p=>p.type==='day').value)-1)/10)),key=month+':'+segment;
 if(key===seasonKey)return;seasonKey=key;
 const [snow,flowers,green]=seasons[month][segment],snowCount=Math.round(32*snow),flowerCount=Math.round(32*flowers),types=Array.from({length:32},(_,i)=>i<snowCount?'snow':i<snowCount+flowerCount?'flower':'leaf');for(let i=31;i>0;i--){const j=Math.floor(range(0,i+1));[types[i],types[j]]=[types[j],types[i]];}layer.replaceChildren();
 for(let i=0;i<32;i++){
  const type=types[i],extra=i>=21,leftSide=extra?i%2===1:i<10,duration=type==='snow'?range(26,46):range(19,37),leaf=document.createElement('span');leaf.className='autumn-leaf seasonal-'+type;
  const values={left:(extra?(leftSide?range(.2,5):range(95,99.8)):(leftSide?range(.2,17):range(82,98)))+'%',mobileLeft:(extra?(leftSide?range(-.5,2):range(97,100)):(leftSide?range(-1,5):range(94,99)))+'%',size:(type==='snow'?range(5,10):type==='flower'?range(12,19):range(19,37))+'px',duration:duration+'s',delay:-range(0,duration)+'s',start:range(-180,180)+'deg',spin:range(-220,220)+'deg',drift1:range(-20,24)+'px',drift2:range(-28,28)+'px',drift3:range(-18,24)+'px',sway:range(3,9)+'px',swayTime:range(4,9)+'s',alpha:type==='snow'?range(.15,.30):type==='flower'?range(.16,.30):range(.25,.45),hue:(type==='leaf'?green*70+range(-15,15):type==='flower'?range(-22,28):0)+'deg'};
  if(center)values.left=range(45,55)+'%';
  for(const [name,value]of Object.entries(values))leaf.style.setProperty('--'+name,value);
  const img=document.createElement('img');img.src=new URL(type==='snow'?'season-snow.svg':type==='flower'?'season-flower.svg':shapes[Math.floor(range(0,shapes.length))],base).href;img.alt='';img.width=type==='leaf'?96:32;img.height=type==='leaf'?128:32;img.decoding='async';leaf.append(img);layer.append(leaf);
 }
 }
 refreshSeason();setInterval(refreshSeason,3600000);
 document.body.append(layer);let visible=parent===window||!window.frameElement?.hidden;
 const pause=()=>{const covered=main&&['notes-open','timebox-open','weight-open','atlas-open'].some(c=>document.body.classList.contains(c));const off=document.documentElement.dataset.dankiLeaves==='off';layer.hidden=covered||off;layer.classList.toggle('paused',!visible||document.hidden||covered||off);};
 if(main)new MutationObserver(pause).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('danki-leaves-change',pause);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSeason();pause();});window.addEventListener('temponotes-visibility',event=>{visible=!!event.detail;pause();});window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&['danki-notes-visibility','danki-timebox-visibility'].includes(event.data?.type)){visible=!!event.data.visible;pause();}});pause();
})();
