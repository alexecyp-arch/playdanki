(()=>{
 const root='danki:game-month:v1:';
 const deviceKey='danki:game-month-device:v1';
 const monthKey=date=>date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
 const label=date=>date.toLocaleDateString('en-US',{month:'long',year:'numeric'}).toUpperCase();
 function periods(now=new Date()){
  return [now,new Date(now.getFullYear(),now.getMonth()-1,1)];
 }
 function record(game){
  try{
   let device=localStorage.getItem(deviceKey);
   if(!device){device=crypto.randomUUID();localStorage.setItem(deviceKey,device);}
   const key=root+game+':'+monthKey(new Date())+':'+device;
   const saved=Number(localStorage.getItem(key));
   localStorage.setItem(key,String((Number.isSafeInteger(saved)&&saved>=0?saved:0)+1));
   (parent===window?document:parent.document).dispatchEvent(new Event('danki-progress'));
  }catch{}
 }
 function roundCount(game,month){
  const prefix=root+game+':'+month+':';
  let total=0;
  try{
   for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(!key?.startsWith(prefix))continue;
    const n=Number(localStorage.getItem(key));
    if(Number.isSafeInteger(n)&&n>=0)total+=n;
   }
  }catch{}
  return total;
 }
 function sumDays(days,month,score){
  let total=0;
  for(const [key,value] of Object.entries(days||{})){
   if(!key.startsWith(month+'-'))continue;
   const n=score(value);
   if(Number.isSafeInteger(n)&&n>=0)total+=n;
  }
  return total;
 }
 function show(container,{game,days,score=Number,now=new Date()}){
  if(!container)return;
  container.replaceChildren();
  for(const date of periods(now)){
   const row=document.createElement('div'),month=monthKey(date);
   const count=game?roundCount(game,month):sumDays(days,month,score);
   const caption=document.createElement('strong');caption.textContent=label(date);
   const value=document.createElement('span');value.textContent=count.toLocaleString('en-US')+(game?(count===1?' PLAY':' PLAYS'):(count===1?' CARD':' CARDS'));
   row.append(caption,value);container.append(row);
  }
 }
 window.DankiMonths={record,show};
})();
