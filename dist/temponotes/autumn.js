(()=>{'use strict';
 const layer=document.createElement('div');layer.className='autumn-leaves';layer.setAttribute('aria-hidden','true');
 const leaves=[['2%','29px','38s','-8s','22%'],['6%','23px','44s','-29s','68%'],['92%','27px','41s','-18s','38%'],['96%','22px','35s','-3s','79%'],['4%','25px','46s','-37s','46%'],['94%','24px','43s','-33s','57%']];
 for(const [left,size,duration,delay,rest]of leaves){const leaf=document.createElement('span');leaf.className='autumn-leaf';for(const [name,value]of Object.entries({left,size,duration,delay,rest}))leaf.style.setProperty('--'+name,value);const img=document.createElement('img');img.src=new URL('autumn-leaf.svg',document.currentScript.src).href;img.alt='';img.width=96;img.height=128;img.decoding='async';leaf.append(img);layer.append(leaf);}
 document.body.append(layer);let visible=parent===window||!window.frameElement?.hidden;
 const pause=()=>layer.classList.toggle('paused',!visible||document.hidden);
 document.addEventListener('visibilitychange',pause);window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='danki-notes-visibility'){visible=!!event.data.visible;pause();}});pause();
})();
