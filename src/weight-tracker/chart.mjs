import {bodyMassIndex,chartData} from './model.mjs';
import {sleepChartData,formatSleepDuration,sleepDay} from './sleep.mjs';
const namespace='http://www.w3.org/2000/svg';
const numberFormat=new Intl.NumberFormat(undefined,{maximumFractionDigits:1});
const entryDateTime=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
const dayMs=86400000;
const dateFormat=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const monthFormat=new Intl.DateTimeFormat('en-GB',{month:'short',year:'numeric',timeZone:'UTC'});
const bmiColor='#ff9b42';
const dateLabel=time=>dateFormat.format(time).toUpperCase();
function localChartTime(time){
 const date=new Date(time);
 const day=Date.UTC(date.getFullYear(),date.getMonth(),date.getDate());
 return day+((date.getHours()*60+date.getMinutes())*60+date.getSeconds())*1000-dayMs/2;
}
function tickStep(max,minimum=0){
 const interval=(max-minimum)/6;
 const magnitude=10**Math.floor(Math.log10(interval));
 return [1,2,5,10].map(n=>n*magnitude).find(n=>n>=interval);
}
function extrema(points){
 if(!points.length)return [];
 let low=points[0],high=low;
 for(const point of points){
  if(point.value<=low.value)low=point;
  if(point.value>=high.value)high=point;
 }
 return low.value===high.value?[[low,'LOW / HIGH']]:[[low,'LOW'],[high,'HIGH']];
}
export function clearChart(svg){
 const scroll=svg.parentElement;
 for(const axis of scroll.parentElement.querySelectorAll('.log-scale'))axis.replaceChildren();
 scroll.nextElementSibling.setAttribute('hidden','');
 scroll.removeAttribute('tabindex');
 scroll.scrollLeft=0;
 svg.replaceChildren();
 svg.style.removeProperty('width');
}
export function draw(svg,entries,unit,{selectedId=null,onSelect=()=>{},targetKg=null,heightM=null}={}){
 const data=chartData(entries,unit,targetKg);
 if(!data.points.length&&data.target===null)data.y=[0,10];
 const step=tickStep(data.y[1]);
 data.y=[0,Math.ceil(data.y[1]/step)*step];
 const today=Date.parse(sleepDay());
 const bmiByDay=new Map();
 for(const point of data.points){
  const day=Date.parse(sleepDay(point.time));
  point.plotTime=localChartTime(point.time);
  const value=bodyMassIndex(point.kg,heightM);
  if(value!==null)bmiByDay.set(day,{day,time:point.plotTime,value});
 }
 const bmi=heightM!==null?[...bmiByDay.values()]:null;
 drawSeries(svg,data,{unit,axis:'WEIGHT ('+unit+')',selectedId,onSelect,step,today,bmi});
}
function drawSeries(svg,data,{unit,axis,step,today,daily=false,selectedId=null,onSelect=null,bmi=null}){
 const scroll=svg.parentElement;
 if(!scroll.clientWidth)return;
 const leftScale=scroll.previousElementSibling,rightScale=scroll.nextElementSibling;
 const atEnd=scroll.scrollWidth-scroll.clientWidth-scroll.scrollLeft<4;
 rightScale.toggleAttribute('hidden',bmi===null);
 const first=data.points[0],latest=data.points.at(-1);
 const firstDay=first?(daily?first.time:Date.parse(sleepDay(first.time))):today;
 const lastDay=Math.max(today,latest?(daily?latest.time:Date.parse(sleepDay(latest.time))):today);
 const start=Math.min(firstDay,lastDay-2*dayMs);
 const dayCount=(lastDay-start)/dayMs+1;
 const width=Math.max(scroll.clientWidth,dayCount*18+12);
 const height=window.innerWidth>600?Math.max(260,window.innerHeight-255):Math.max(260,Math.min(420,scroll.parentElement.clientWidth*.48));
 const left=6,right=width-6,top=25,bottom=height-55;
 const x=t=>left+((t-start)/dayMs+.5)/dayCount*(right-left),y=v=>bottom-(v-data.y[0])/(data.y[1]-data.y[0])*(bottom-top);
 const pointX=p=>x(p.plotTime??p.time);
 const contents=document.createDocumentFragment(),leftTicks=document.createDocumentFragment(),rightTicks=document.createDocumentFragment();
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';svg.style.width=width+'px';
 for(const scale of [leftScale,rightScale]){
  scale.style.height=height+'px';
  if(scale.clientWidth)scale.setAttribute('viewBox',`0 0 ${scale.clientWidth} ${height}`);
 }
 const add=(tag,attrs={},text,parent=contents)=>{const e=document.createElementNS(namespace,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;parent.append(e);return e;};
 const number=n=>numberFormat.format(Number(n.toFixed(1)));
 const valueLabel=n=>axis==='SLEEP (HOURS)'?formatSleepDuration(n):number(n)+' '+unit;
 const occupied=[];
 function pointLabel(px,py,label,className,size,preferBelow=false){
  const textWidth=label.length*size*.66;
  const preferredX=px-left<textWidth+12?px+12:px-12-textWidth;
  const alternateX=preferredX>px?px-12-textWidth:px+12;
  const above=py-9,below=py+size+6;
  const rows=preferBelow?[below,above]:[above,below];
  let box;
  for(const baseline of [...rows,above-size-4,below+size+4]){
   for(const xpos of [preferredX,alternateX]){
    const l=Math.max(left,Math.min(xpos,right-textWidth)),r=l+textWidth;
    const y=Math.max(size+2,Math.min(baseline,bottom-2)),t=y-size,b=y+3;
    box={l,r,t,b,y};
    if(occupied.some(other=>l<other.r+3&&r>other.l-3&&t<other.b+2&&b>other.t-2))continue;
    occupied.push(box);
    return add('text',{x:l,y,class:className,'pointer-events':'none'},label);
   }
  }
  return add('text',{x:box.l,y:box.y,class:className,'pointer-events':'none'},label);
 }
 const leftWidth=leftScale.clientWidth;
 for(let i=0;i<=Math.round(data.y[1]/step);i++){const value=i*step,py=y(value);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#c4c8cf','stroke-width':1.5,class:'chart-grid'});add('text',{x:leftWidth-3,y:py+4,'text-anchor':'end',class:'chart-y-tick'},number(value),leftTicks);}
 add('line',{x1:left,x2:left,y1:top,y2:bottom,stroke:'#fff','stroke-width':2,class:'chart-axis'});add('line',{x1:left,x2:right,y1:bottom,y2:bottom,stroke:'#fff','stroke-width':2,class:'chart-axis'});
 if(data.target!==null){const py=y(data.target),kind=daily?'daily':'weight';add('line',{x1:left,x2:right,y1:py,y2:py,stroke:daily?'#ff626b':'#92e0b1','stroke-width':2.5,'stroke-opacity':1,'stroke-dasharray':'5 5',class:kind+'-target-line'});add('text',{x:right-5,y:py-8,'text-anchor':'end',class:kind+'-target-label'},'TARGET '+number(data.target)+' '+unit);}
 let monthRight=-Infinity;
 for(let time=start;time<=lastDay;time+=dayMs){
  const px=x(time),date=new Date(time),day=date.getUTCDate();
  add('line',{x1:px,x2:px,y1:bottom,y2:bottom+4,stroke:'#8994a5'});
  const label=add('text',{x:px,y:bottom+15,'text-anchor':'middle','data-date':date.toISOString().slice(0,10),class:time===today?'chart-day-label chart-today':'chart-day-label'},day);
  add('title',{},dateLabel(time)+(time===today?' · TODAY':''),label);
  if((time===start||day===1)&&px>=monthRight){
   add('text',{x:Math.min(px,right-48),y:bottom+30,class:'chart-month-label','data-month':date.toISOString().slice(0,7)},monthFormat.format(date).toUpperCase());
   monthRight=px+50;
  }
 }
 add('text',{transform:`translate(13 ${(top+bottom)/2}) rotate(-90)`,'text-anchor':'middle'},axis,leftTicks);
 if(data.points.length>1)add('polyline',{points:data.points.map(p=>pointX(p)+','+y(p.value)).join(' '),fill:'none',stroke:'#fff','stroke-width':3.5,'stroke-linejoin':'round','stroke-linecap':'round'});
 let bmiY;
 if(bmi!==null){
  const max=bmi.reduce((highest,p)=>Math.max(highest,p.value),26);
  const bmiStep=Math.max(1,tickStep(max,18)),steps=Math.ceil((max-18)/bmiStep);
  bmiY=value=>bottom-(Math.max(18,value)-18)/(steps*bmiStep)*(bottom-top);
  add('line',{x1:1,x2:1,y1:top,y2:bottom,stroke:bmiColor,'stroke-width':2},undefined,rightTicks);
  add('text',{x:rightScale.clientWidth/2,y:17,'text-anchor':'middle',class:'bmi-axis-label bmi-axis-heading'},'BMI',rightTicks);
  for(let i=0;i<=steps;i++){
   const value=18+i*bmiStep,py=bmiY(value);
   add('line',{x1:1,x2:5,y1:py,y2:py,stroke:bmiColor},undefined,rightTicks);
   add('text',{x:8,y:py+4,class:'bmi-y-tick bmi-axis-label'},number(value),rightTicks);
  }
  if(bmi.length>1)add('polyline',{class:'bmi-line',points:bmi.map(p=>x(p.time)+','+bmiY(p.value)).join(' '),fill:'none',stroke:bmiColor,'stroke-width':2.5,'stroke-linejoin':'round','stroke-linecap':'round'});
  for(const p of bmi){
   const title=dateLabel(p.day)+' · BMI '+p.value.toFixed(1);
   const dot=add('circle',{class:'bmi-point',cx:x(p.time),cy:bmiY(p.value),r:3.5,fill:bmiColor,'data-bmi':p.value,'data-date':new Date(p.day).toISOString().slice(0,10),'aria-label':title});
   add('title',{},title,dot);
  }
 }
 for(const p of data.points){
  const label=valueLabel(p.value)+' · '+(daily?dateLabel(p.time):entryDateTime.format(p.time)),selected=p.id===selectedId;
  const group=add('g',{'aria-label':label,'data-entry':p.id,class:daily?'protein-point':'weight-point',...(onSelect?{role:'button',tabindex:0,'aria-pressed':String(selected)}:{})});
  for(const attrs of [{cx:pointX(p),cy:y(p.value),r:14,fill:'transparent'},{cx:pointX(p),cy:y(p.value),r:p===latest?(selected?8:7):selected?5:3,fill:selected?'#a9c7ff':p===latest?'#92e0b1':'#fff',...(p===latest?{stroke:'var(--danki-bg, #071e48)','stroke-width':2}:{})}]){const circle=document.createElementNS(namespace,'circle');for(const [k,v]of Object.entries(attrs))circle.setAttribute(k,v);group.append(circle);}
  const title=document.createElementNS(namespace,'title');title.textContent=label;group.append(title);
  if(onSelect){group.addEventListener('click',()=>onSelect(p.id));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)onSelect(p.id);}});}
 }
 if(latest){
  const px=pointX(latest),py=y(latest.value);
  const targetNearby=data.target!==null&&Math.abs(py-y(data.target))<24;
  pointLabel(px,py,valueLabel(latest.value),'weight-latest-label',13,targetNearby&&py+20<bottom);
 }
 const latestBmi=bmi?.at(-1);
 if(latestBmi){
  pointLabel(x(latestBmi.time),bmiY(latestBmi.value),'BMI '+latestBmi.value.toFixed(1),'bmi-latest-label',13);
 }
 if(!daily){
  for(const [point,name] of extrema(data.points)){
   pointLabel(pointX(point),y(point.value),name+' '+valueLabel(point.value),'weight-extreme-label',8);
  }
  for(const [point,name] of extrema(bmi??[])){
   pointLabel(x(point.time),bmiY(point.value),name+' '+point.value.toFixed(1),'bmi-extreme-label',8);
  }
 }
 svg.replaceChildren(contents);
 leftScale.replaceChildren(leftTicks);rightScale.replaceChildren(rightTicks);
 if(width>scroll.clientWidth)scroll.tabIndex=0;
 else scroll.removeAttribute('tabindex');
 if(atEnd)scroll.scrollLeft=scroll.scrollWidth;
}

export function drawSleep(svg,days,{target=null,now=Date.now(),selectedId=null,onSelect=null}={}){
 const data=sleepChartData(days,target,now);
 const max=data.y[1];
 const step=max<=5?.5:max<=12?1:2;
 data.y[1]=Math.ceil(max/step)*step;
 drawSeries(svg,data,{unit:'HOURS',axis:'SLEEP (HOURS)',daily:true,step,today:Date.parse(sleepDay(now)),selectedId,onSelect});
}
