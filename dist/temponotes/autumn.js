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
  [[0,0,.9],[0,0,.8],[0,0,.65]],
  [[0,0,.60],[.02,0,.45],[.06,0,.30]],
  [[.12,0,.22],[.22,0,.14],[.34,0,.08]],
  [[.45,0,0],[.60,0,0],[.75,0,0]]
 ];
 const mobile=window.matchMedia('(max-width:760px), (max-height:500px) and (pointer:coarse)');
 let seasonKey='',accents=[],mobileAccentTick=0;
 function refreshSeason(){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()),month=Number(parts.find(p=>p.type==='month').value)-1,segment=Math.min(2,Math.floor((Number(parts.find(p=>p.type==='day').value)-1)/10)),day=Number(parts.find(p=>p.type==='day').value),key=month+':'+day;
 if(key===seasonKey)return;seasonKey=key;
 const fraction=(day-1-segment*10)/(segment===2?new Date(Number(parts.find(p=>p.type==='year').value),month+1,0).getDate()-20:10),next=segment<2?seasons[month][segment+1]:seasons[(month+1)%12][0],[snow,flowers,green]=seasons[month][segment].map((v,i)=>v+(next[i]-v)*fraction);
 const particleCount=mobile.matches?16:32,edgeStart=mobile.matches?10:21,leftSplit=mobile.matches?5:10;
 const windDirection=Math.random()<.5?-1:1;
 const snowCount=Math.round(particleCount*snow),flowerCount=Math.round(particleCount*flowers),types=Array.from({length:particleCount},(_,i)=>i<snowCount?'snow':i<snowCount+flowerCount?'flower':'leaf');for(let i=types.length-1;i>0;i--){const j=Math.floor(range(0,i+1));[types[i],types[j]]=[types[j],types[i]];}layer.replaceChildren();accents=[];const greenFlags=Array.from({length:particleCount-snowCount-flowerCount},(_,i)=>i<Math.round((particleCount-snowCount-flowerCount)*green));for(let i=greenFlags.length-1;i>0;i--){const j=Math.floor(range(0,i+1));[greenFlags[i],greenFlags[j]]=[greenFlags[j],greenFlags[i]];}let leafIndex=0;
 for(let i=0;i<types.length;i++){
  const type=types[i],extra=i>=edgeStart,leftSide=extra?i%2===1:i<leftSplit,duration=type==='snow'?range(26,46):range(19,37),leaf=document.createElement('span');leaf.className='autumn-leaf seasonal-'+type;
  const values={left:(extra?(leftSide?range(.2,5):range(95,99.8)):(leftSide?range(.2,17):range(82,98)))+'%',mobileLeft:(extra?(leftSide?range(-.5,2):range(97,100)):(leftSide?range(-1,5):range(94,99)))+'%',size:(type==='snow'?range(5,10):type==='flower'?range(12,19):range(19,37))+'px',duration:duration+'s',delay:-range(0,duration)+'s',start:range(-180,180)+'deg',spin:range(-220,220)+'deg',drift1:range(-20,24)+'px',drift2:range(-28,28)+'px',drift3:range(-18,24)+'px',sway:range(3,9)+'px',swayTime:range(4,9)+'s',alpha:type==='snow'?range(.15,.30):type==='flower'?range(.16,.30):range(.25,.45),hue:(type==='leaf'?(greenFlags[leafIndex++]?range(70,100):range(-18,18)):type==='flower'?range(-22,28):0)+'deg'};
  if(center)values.left=range(45,55)+'%';
  if(type==='leaf'){
   const windCount=Math.round(leafIndex*.65);
   if(windCount>Math.round((leafIndex-1)*.65)){
    const drift=windDirection*(mobile.matches?range(22,36):range(35,65));
    // Center the drift on the original position so edge leaves stay visible.
    values.left='calc('+values.left+' + '+(-drift/2)+'px)';
    values.mobileLeft='calc('+values.mobileLeft+' + '+(-drift/2)+'px)';
    values.drift1=(drift*.32)+'px';
    values.drift2=(drift*.66)+'px';
    values.drift3=drift+'px';
   }else if((leafIndex-windCount)%5<2){
    leaf.setAttribute('data-gust','');
    values['gust-distance']=range(4,8)+'vw';
   }
  }
  const tumbles=type==='leaf'&&leafIndex%5===3;
  if(tumbles){
   values['tumble-time']=range(4,8)+'s';
   values['tumble-turn']=Math.random()<.5?'1turn':'-1turn';
  }
  for(const [name,value]of Object.entries(values))leaf.style.setProperty('--'+name,value);
  const img=document.createElement('img');img.src=new URL(type==='snow'?'season-snow.svg':type==='flower'?'season-flower.svg':shapes[Math.floor(range(0,shapes.length))],base).href;img.alt='';img.width=type==='leaf'?96:32;img.height=type==='leaf'?128:32;img.decoding='async';
  if(tumbles){
   const turn=document.createElement('span'),mesh=document.createElement('span');
   turn.className='leaf-turn';
   mesh.className='leaf-mesh';
   mesh.style.setProperty('--leaf-art','url("'+img.src+'")');
   // Two halves along the stem, each with five connected folds across the blade.
   for(let half=0;half<2;half++){
    const section=document.createElement('span');
    section.className='leaf-half';
    for(let fold=0;fold<5;fold++){
     const panel=document.createElement('span');
     panel.className='leaf-fold';
     section.append(panel);
    }
    mesh.append(section);
   }
   turn.append(img,mesh);
   leaf.append(turn);
  }else leaf.append(img);
  layer.append(leaf);
 }
 }

 const seasonalItems={"pumpkin":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22%23bd682e%22%20d%3D%22M16%2028c-16%200-16%2033%203%2034h28c19-1%2019-34%203-34-10-8-24-8-34%200Z%22%2F%3E%3Cpath%20stroke%3D%22%2350694b%22%20stroke-width%3D%226%22%20d%3D%22m34%2025%203-15%22%2F%3E%3Cpath%20fill%3D%22%23402b23%22%20d%3D%22m19%2039%208-5%202%2010Zm29%200-8-5-2%2010ZM25%2051h18l-5%206h-8Z%22%2F%3E%3C%2Fsvg%3E","acorn":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22%23a5754d%22%20d%3D%22M19%2032h34c0%2020-17%2031-17%2031S19%2052%2019%2032Z%22%2F%3E%3Cpath%20fill%3D%22%235d473a%22%20d%3D%22M14%2034c1-23%2042-23%2044%200Z%22%2F%3E%3Cpath%20stroke%3D%22%235d473a%22%20stroke-width%3D%225%22%20d%3D%22m36%2020%204-10%22%2F%3E%3C%2Fsvg%3E","ghost":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22%23d4dce1%22%20d%3D%22M18%2058V28a18%2018%200%200%201%2036%200v30l-9-7-9%208-9-8Z%22%2F%3E%3Cellipse%20cx%3D%2229%22%20cy%3D%2230%22%20rx%3D%223%22%20ry%3D%225%22%20fill%3D%22%2345525f%22%2F%3E%3Cellipse%20cx%3D%2243%22%20cy%3D%2230%22%20rx%3D%223%22%20ry%3D%225%22%20fill%3D%22%2345525f%22%2F%3E%3C%2Fsvg%3E","penguin":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cellipse%20cx%3D%2236%22%20cy%3D%2236%22%20rx%3D%2221%22%20ry%3D%2228%22%20fill%3D%22%23253747%22%2F%3E%3Cellipse%20cx%3D%2236%22%20cy%3D%2243%22%20rx%3D%2214%22%20ry%3D%2219%22%20fill%3D%22%23d7e1e6%22%2F%3E%3Ccircle%20cx%3D%2229%22%20cy%3D%2224%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Ccircle%20cx%3D%2243%22%20cy%3D%2224%22%20r%3D%223%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20fill%3D%22%23ce9a4b%22%20d%3D%22m30%2030%206%208%206-8ZM22%2062h12v5H19Zm16%200h12l3%205H38Z%22%2F%3E%3Cpath%20fill%3D%22%239b6267%22%20d%3D%22M19%2035h34v6H19Z%22%2F%3E%3C%2Fsvg%3E","bauble":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2242%22%20r%3D%2222%22%20fill%3D%22%23a04e62%22%2F%3E%3Cpath%20stroke%3D%22%23c8ad69%22%20stroke-width%3D%224%22%20fill%3D%22none%22%20d%3D%22M19%2043q17%2013%2034%200M29%2020v-8h14v8M36%2012V4%22%2F%3E%3Ccircle%20cx%3D%2229%22%20cy%3D%2232%22%20r%3D%225%22%20fill%3D%22%23e5d8c4%22%2F%3E%3C%2Fsvg%3E","snowman":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2249%22%20r%3D%2219%22%20fill%3D%22%23d6e0e6%22%2F%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2223%22%20r%3D%2213%22%20fill%3D%22%23e0e9eb%22%2F%3E%3Cpath%20fill%3D%22%237d637f%22%20d%3D%22M20%2031h32v7H20Zm21%207h7v15h-7Z%22%2F%3E%3Cpath%20fill%3D%22%23bb8d5b%22%20d%3D%22m36%2023%2012%204-12%202Z%22%2F%3E%3Ccircle%20cx%3D%2231%22%20cy%3D%2220%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2220%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2246%22%20r%3D%222%22%2F%3E%3Ccircle%20cx%3D%2235%22%20cy%3D%2255%22%20r%3D%222%22%2F%3E%3C%2Fsvg%3E","butterfly":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22%23a487b5%22%20d%3D%22M34%2033C5-6-9%2044%2029%2042%200%2053%2024%2077%2035%2046c11%2031%2035%207%206-4C79%2044%2065-6%2036%2033Z%22%2F%3E%3Cpath%20stroke%3D%22%2378937e%22%20stroke-width%3D%224%22%20d%3D%22M35%2030v25m0-25-8-10m8%2010%208-10%22%2F%3E%3C%2Fsvg%3E","flower":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cg%20fill%3D%22%23bca9b9%22%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2218%22%20r%3D%2212%22%2F%3E%3Ccircle%20cx%3D%2253%22%20cy%3D%2231%22%20r%3D%2212%22%2F%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2251%22%20r%3D%2212%22%2F%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2251%22%20r%3D%2212%22%2F%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%2231%22%20r%3D%2212%22%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2235%22%20r%3D%2211%22%20fill%3D%22%23c8b06d%22%2F%3E%3C%2Fsvg%3E","sun":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cg%20stroke%3D%22%23c7a455%22%20stroke-width%3D%224%22%3E%3Cpath%20d%3D%22M36%203v10m0%2046v10M3%2036h10m46%200h10M12%2012l8%208m32%2032%208%208M12%2060l8-8m32-32%208-8%22%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%2236%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%23c6aa65%22%2F%3E%3C%2Fsvg%3E","shell":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22%23b69b91%22%20d%3D%22M36%2063%2010%2032C3%205%2022%205%2026%2015c2-15%2018-15%2020%200%204-10%2023-10%2016%2017Z%22%2F%3E%3Cpath%20stroke%3D%22%238b7b82%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20d%3D%22m36%2059-10-40m10%2040%2010-40m-10%2040V14m0%2045-21-30m21%2030%2021-30%22%2F%3E%3C%2Fsvg%3E"};
 const extraItems={
  bat:'<path fill="#796494" d="M8 22q13 11 22 2l6 8 6-8q9 9 22-2l-5 22-10-5-13 13-13-13-10 5z"/>',
  mushroom:'<path fill="#e3c6a5" d="M29 35h14l5 24H24z"/><path fill="#bb6656" d="M10 36a26 23 0 0 1 52 0z"/><path fill="#eed3b1" d="M22 24h6v5h-6zm18-5h7v6h-7zm9 11h6v4h-6z"/>',
  apple:'<path fill="#bf5755" d="M36 29C7 10 9 62 29 61l7-3 7 3c20 1 22-51-7-32z"/><path stroke="#9b7556" stroke-width="4" d="m36 30 2-17"/><path fill="#819858" d="M38 21q3-13 18-12-3 13-18 12z"/>',
  mitten:'<path fill="#b15e77" d="M22 52V19a12 12 0 0 1 24 0v16l6-7q10-6 9 5l-12 19z"/><rect x="21" y="49" width="30" height="11" rx="2" fill="#e7c6c1"/>',
  gift:'<path fill="#9d5d7c" d="M13 26h46v33H13z"/><path fill="#d8b779" d="M32 26h8v33h-8z"/><path fill="none" stroke="#d8b779" stroke-width="4" d="M36 26c-31-1-14-26 0 0 14-26 31-1 0 0z"/>',
  ski:'<path fill="none" stroke="#91b7c6" stroke-linecap="round" stroke-width="6" d="m18 55 30-40M29 62l30-40"/><path stroke="#cc9572" stroke-width="3" d="M15 20l35 38M25 13l35 38"/>',
  tulip:'<path stroke="#8ba76b" stroke-width="5" d="M36 29v33"/><path fill="#8ba76b" d="M36 57Q17 56 18 41q15 2 18 16z"/><path fill="#cd7991" d="M19 16l9 6 8-9 8 9 9-6v13a17 17 0 0 1-34 0z"/>',
  bee:'<ellipse cx="29" cy="24" rx="10" ry="13" fill="#bbcbdc"/><ellipse cx="44" cy="24" rx="10" ry="13" fill="#bbcbdc"/><ellipse cx="36" cy="41" rx="22" ry="12" fill="#d6ad64"/><path stroke="#6a5245" stroke-width="6" d="M28 31v20m12-21v22"/>',
  bird:'<path fill="#81a8b9" d="M10 44l13-4q2-22 19-21 13 0 13 13l9 4-11 5q-10 21-31 11z"/><path fill="#547686" d="M25 39q13-9 21 0-9 15-21 0z"/><circle cx="48" cy="28" r="2" fill="#343841"/>',
  kite:'<path fill="#bb769b" d="m36 8 20 21-20 24-20-24z"/><path fill="#87b5bc" d="m36 8 20 21H36z"/><path fill="none" stroke="#d5bd9b" stroke-width="2" d="M36 53q17 0 7 11"/>',
  strawberry:'<path fill="#c96e75" d="M16 29q20-14 40 0c0 13-14 30-20 32-6-2-20-19-20-32z"/><path fill="#84a36b" d="m23 23 11 3 2-12 3 12 11-3-14 11z"/><path stroke="#f1cf9d" stroke-width="2" d="m26 37 1 3m17-3 1 3m-9 7 1 3"/>',
  umbrella:'<path fill="#7ca6c4" d="M9 36a27 23 0 0 1 54 0q-9-6-18 0-9-6-18 0-9-6-18 0z"/><path fill="none" stroke="#d6bfa4" stroke-width="3" d="M36 13v43q0 11 9 7 3-2 3-6"/>'
 };
 for(const [name,art] of Object.entries(extraItems)){
  seasonalItems[name]='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">'+art+'</svg>');
 }
 let lastAccent='';
 function dropAccent(){
  const month=Number(seasonKey.split(':')[0]),day=Number(seasonKey.split(':')[1]);
  const options=month===9||month===10&&day<=7?['pumpkin','acorn','ghost','bat','mushroom','apple']:month===8||month===10?['acorn','pumpkin','mushroom','apple','umbrella']:month===11?['penguin','bauble','snowman','mitten','gift','ski']:month<2?['penguin','snowman','mitten','ski']:month<5?['butterfly','flower','tulip','bee','bird','kite','umbrella']:['sun','shell','butterfly','bee','bird','kite','strawberry','umbrella'];
  const choices=options.filter(item=>item!==lastAccent);
  lastAccent=choices[Math.floor(range(0,choices.length))];
  if(accents.length>=3)accents.shift().remove();const leaf=document.createElement('span');leaf.className='autumn-leaf seasonal-accent';
  const left=Math.random()<.5,values={left:(left?range(2,14):range(86,98))+'%',mobileLeft:(left?range(0,3):range(94,98))+'%',size:range(25,36)+'px',duration:range(18,22)+'s',delay:'0s',start:range(-30,30)+'deg',spin:range(-75,75)+'deg',drift1:range(-10,10)+'px',drift2:range(-12,12)+'px',drift3:range(-9,9)+'px',sway:'3px',swayTime:'6s',alpha:range(.16,.23),hue:'0deg'};
  for(const [key,value]of Object.entries(values))leaf.style.setProperty('--'+key,value);leaf.style.animationIterationCount='1';const img=document.createElement('img');img.src=seasonalItems[lastAccent];img.alt='';img.width=img.height=72;leaf.append(img);leaf.onanimationend=()=>{leaf.remove();accents=accents.filter(n=>n!==leaf);};layer.append(leaf);accents.push(leaf);
 }

 refreshSeason();setInterval(refreshSeason,3600000);
 mobile.addEventListener('change',()=>{seasonKey='';mobileAccentTick=0;refreshSeason();});
 document.body.append(layer);let visible=parent===window||!window.frameElement?.hidden;
 const pause=()=>{const covered=main&&['notes-open','timebox-open','weight-open','atlas-open'].some(c=>document.body.classList.contains(c));const off=document.documentElement.dataset.dankiLeaves==='off';layer.hidden=covered||off;layer.classList.toggle('paused',!visible||document.hidden||covered||off);};
 if(main)new MutationObserver(pause).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('danki-leaves-change',pause);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSeason();pause();});window.addEventListener('temponotes-visibility',event=>{visible=!!event.detail;pause();});window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&['danki-notes-visibility','danki-timebox-visibility'].includes(event.data?.type)){visible=!!event.data.visible;pause();}});
 setInterval(()=>{
  if(!layer.hidden&&!document.hidden&&visible&&(!mobile.matches||++mobileAccentTick%2===0))dropAccent();
 },7500);
 pause();
})();
