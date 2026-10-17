function createAimTarget({field,target,dot,startDot,prompt,onStart,onHit,onMiss,blocked,ignore='.navigation,.tracker,.again',minHeight=250,travel=130}){
  let enabled=false,phase='red',lastPoint=null;
  function placeStart(){
    const word=prompt.getBoundingClientRect(),parent=startDot.offsetParent;
    if(!parent)return;
    const bounds=parent.getBoundingClientRect();
    startDot.style.left=(word.left+word.width/2-bounds.left)+'px';
    startDot.style.top=(word.bottom+12+startDot.offsetHeight/2-bounds.top)+'px';
  }
  function reserveSpace(){field.style.minHeight=Math.max(minHeight,target.offsetHeight+travel)+'px'}
  function place(){
    if(!enabled)return;
    if(phase==='red'){placeStart();return}
    target.style.left='0px';target.style.top='0px';
    reserveSpace();
    const bounds=field.getBoundingClientRect(),width=Math.max(0,field.clientWidth-target.offsetWidth),height=Math.max(0,field.clientHeight-target.offsetHeight);
    const radius=dot.offsetWidth/2,dx=target.offsetWidth/2,dy=dot.offsetTop+radius;
    let x=0,y=0,point;
    for(let tries=0;tries<80;tries++){
      x=Math.random()*width;y=Math.random()*height;point={x:bounds.left+x+dx,y:bounds.top+y+dy};
      if(!lastPoint||Math.hypot(point.x-lastPoint.x,point.y-lastPoint.y)>=60)break;
      if(tries===79){const corners=[[0,0],[width,0],[0,height],[width,height]];[x,y]=corners.sort((a,b)=>Math.hypot(bounds.left+b[0]+dx-lastPoint.x,bounds.top+b[1]+dy-lastPoint.y)-Math.hypot(bounds.left+a[0]+dx-lastPoint.x,bounds.top+a[1]+dy-lastPoint.y))[0];point={x:bounds.left+x+dx,y:bounds.top+y+dy}}
    }
    target.style.left=x+'px';target.style.top=y+'px';lastPoint=point;
  }
  document.addEventListener('click',event=>{
    if(!enabled||blocked()||event.detail===0||event.button!==0||event.target.closest(ignore))return;
    const current=phase==='red'?startDot:dot,bounds=current.getBoundingClientRect(),radius=bounds.width/2;
    if(Math.hypot(event.clientX-bounds.left-radius,event.clientY-bounds.top-bounds.height/2)>radius){onMiss();return}
    if(phase==='red'){phase='white';startDot.hidden=true;target.hidden=false;place();onStart?.();return}
    lastPoint={x:bounds.left+radius,y:bounds.top+bounds.height/2};onHit();
  });
  for(const sphere of [startDot,dot])sphere.addEventListener('keydown',event=>{event.preventDefault()});
  window.addEventListener('resize',place);
  return {
    show(){
      enabled=true;phase='red';field.hidden=false;target.hidden=false;target.style.visibility='hidden';reserveSpace();target.hidden=true;target.style.visibility='';startDot.hidden=false;placeStart();
    },
    hide(){enabled=false;startDot.hidden=true;target.hidden=true;field.hidden=true},
    place
  };
}
