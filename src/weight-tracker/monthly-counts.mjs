export function monthKey(date=new Date()){
 return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
}
const validMonth=key=>/^\d{4}-(0[1-9]|1[0-2])$/.test(key);
export function counterTotal(counter,month,ytd,today=monthKey()){
 if(!ytd)return counter.months[month]??0;
 const year=month.slice(0,4),last=year===today.slice(0,4)?today:year+'-12';
 return Object.entries(counter.months).reduce((sum,[key,value])=>
  key.startsWith(year+'-')&&key<=last?sum+value:sum,0);
}
function decode(value){
 try {
  const data=JSON.parse(value);
  return Array.isArray(data)?data.filter(item=>typeof item.id==='string'&&typeof item.name==='string'&&item.months&&typeof item.months==='object').map(item=>({
   id:item.id,name:item.name,
   months:Object.fromEntries(Object.entries(item.months).filter(([key,n])=>validMonth(key)&&Number.isInteger(n)&&n>0&&n<=999999))
  })):[];
 } catch { return []; }
}
export function createMonthlyStore({auth,db,sdk,uid,onChange}){
 const ref=sdk.doc(db,'users',uid,'progress','monthly-counts');
 let active=true,ready=false,revision=-1;
 const owner=()=>active&&auth.currentUser?.uid===uid;
 function receive(rows,synced,rev){
  if(!owner())return;
  ready=synced;
  if(rev>=revision){revision=rev;onChange(rows,ready);}
 }
 const stop=sdk.onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
  if(!owner()||snapshot.metadata?.hasPendingWrites)return;
  const data=snapshot.exists()?snapshot.data():null;
  receive(decode(data?.value),!snapshot.metadata?.fromCache,data?.revision??0);
 },()=>{if(owner()){ready=false;onChange(null,false);}});
 async function update(change){
  if(!owner()||!ready)throw Error('WAIT FOR SYNC');
  const result=await sdk.runTransaction(db,async tx=>{
   if(!owner())throw Error('SIGN IN');
   const snap=await tx.get(ref);
   if(!owner())throw Error('SIGN IN');
   const data=snap.exists()?snap.data():null;
   const rows=change(decode(data?.value)),rev=(data?.revision??0)+1;
   tx.set(ref,{value:JSON.stringify(rows),revision:rev,version:1,updatedAt:sdk.serverTimestamp()});
   return {rows,rev};
  });
  receive(result.rows,true,result.rev);
 }
 return {
  add(label){
   const name=label.trim(),id=crypto.randomUUID();
   return update(rows=>{
    if(!name||name.length>64)throw Error('ENTER A NAME UP TO 64 CHARACTERS');
    if(rows.some(row=>row.name.toLowerCase()===name.toLowerCase()))throw Error('COUNTER ALREADY EXISTS');
    return [...rows,{id,name,months:{}}];
   });
  },
  adjust(id,month,delta){
   return update(rows=>{
    if(!validMonth(month)||month>monthKey()||![1,-1,10,-10].includes(delta))throw Error('INVALID COUNT');
    const row=rows.find(item=>item.id===id);
    if(!row)throw Error('COUNTER NOT FOUND');
    const value=Math.max(0,(row.months[month]??0)+delta);
    if(value>999999)throw Error('COUNT LIMIT REACHED');
    if(value)row.months[month]=value;
    else delete row.months[month];
    return rows;
   });
  },
  dispose(){active=false;stop();}
 };
}
export function mountMonthlyCounts({auth,db,sdk}){
 const $=id=>document.getElementById('monthly-'+id);
 const form=$('form'),name=$('name'),status=$('status'),list=$('list');
 let store,rows=[],month=monthKey(),ytd=false,synced=false,busy=false,epoch=0;
 const unavailable=()=>busy||!synced||!navigator.onLine;
 function render(){
  const [year,m]=month.split('-').map(Number),current=monthKey();
  $('period').textContent=ytd?year+' YTD':new Date(year,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('ytd').setAttribute('aria-pressed',String(ytd));
  $('next').disabled=ytd?year>=Number(current.slice(0,4)):month>=current;
  $('prev').disabled=year<=1900&&(ytd||m===1);
  $('new').disabled=$('save').disabled=unavailable();
  const focused=document.activeElement?.dataset?.countAction;
  const focusId=document.activeElement?.dataset?.counter;
  list.replaceChildren();
  for(const row of rows){
   const item=document.createElement('article');item.className='monthly-counter';
   const heading=document.createElement('h3');heading.textContent=row.name;
   const count=document.createElement('output');const value=counterTotal(row,month,ytd,current);
   count.textContent=value.toLocaleString('en-US');count.setAttribute('aria-label',row.name+' count');
   const controls=document.createElement('div');controls.className='monthly-counter-controls';
   const adjust=(delta,label,symbol)=>{
    const button=document.createElement('button');button.type='button';button.textContent=symbol;
    button.dataset.counter=row.id;button.dataset.countAction=String(delta);
    button.setAttribute('aria-label',label+' '+row.name);
    if(Math.abs(delta)===10)button.className='monthly-ten';
    button.disabled=unavailable()||(delta<0?value===0:value+delta>999999);
    button.onclick=()=>save(()=>store.adjust(row.id,month,delta),()=>restoreFocus={id:row.id,delta:String(delta)});
    return button;
   };
   if(ytd)controls.append(count);
   else controls.append(
    adjust(-10,'Subtract ten from','−10'),adjust(-1,'Subtract one from','−'),count,
    adjust(1,'Add one to','+'),adjust(10,'Add ten to','+10')
   );
   item.append(heading,controls);list.append(item);
  }
  const focus=restoreFocus??(focused?{id:focusId,delta:focused}:null);
  if(focus&&!busy){
   const button=[...list.querySelectorAll('button')].find(b=>b.dataset.counter===focus.id&&b.dataset.countAction===focus.delta);
   if(button)button.focus({preventScroll:true});
   restoreFocus=null;
  }
 }
 let restoreFocus=null;
 async function save(action,done=()=>{}){
  if(unavailable()||!store)return;
  const ticket=epoch;busy=true;status.textContent='';render();
  try{await action();if(ticket===epoch)done();}
  catch(error){if(ticket===epoch)status.textContent=!navigator.onLine?'OFFLINE':error.code?'COULD NOT SAVE. TRY AGAIN.':error.message;}
  finally{if(ticket===epoch){busy=false;render();}}
 }
 function shift(delta){
  const [year,m]=month.split('-').map(Number);
  const next=ytd?(year+delta)+'-'+String(m).padStart(2,'0'):monthKey(new Date(year,m-1+delta,1));
  month=next>monthKey()?monthKey():next;
  render();
 }
 $('prev').onclick=()=>shift(-1);
 $('next').onclick=()=>shift(1);
 $('ytd').onclick=()=>{ytd=!ytd;render();};
 $('new').onclick=()=>{form.hidden=!form.hidden;if(!form.hidden)name.focus();};
 form.onsubmit=event=>{event.preventDefault();save(()=>store.add(name.value),()=>{name.value='';form.hidden=true;$('new').focus();});};
 window.addEventListener('online',render);
 window.addEventListener('offline',render);
 function clear(){
  epoch++;store?.dispose();store=null;rows=[];month=monthKey();ytd=false;synced=busy=false;restoreFocus=null;
  name.value='';form.hidden=true;status.textContent='';$('panel').hidden=true;render();
 }
 function open(user){
  const ticket=epoch;
  $('panel').hidden=false;
  store=createMonthlyStore({auth,db,sdk,uid:user.uid,onChange:(data,ready)=>{
   if(ticket!==epoch)return;
   if(data)rows=data;
   synced=ready;render();
  }});
  render();
 }
 return {clear,open};
}
