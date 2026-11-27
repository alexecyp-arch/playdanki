import {chartData} from './model.mjs';
import {sleepChartData,formatSleepDuration,sleepDay} from './sleep.mjs';
const namespace='http://www.w3.org/2000/svg';
const numberFormat=new Intl.NumberFormat(undefined,{maximumFractionDigits:1});
const entryDateTime=new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
const timeFormat=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',hour12:false});
export function draw(svg,entries,unit,{selectedId=null,onSelect=()=>{},targetKg=null}={}){
 const data=chartData(entries,unit,targetKg);
 if(!data.points.length&&data.target===null)data.y=[0,10];
 const interval=data.y[1]/6;
 const magnitude=10**Math.floor(Math.log10(interval));
 const step=[1,2,5,10].map(n=>n*magnitude).find(n=>n>=interval);
 data.y=[0,Math.ceil(data.y[1]/step)*step];
 const today=Date.now();
 data.x[1]=Math.max(data.x[1],today);
 drawSeries(svg,data,{unit,axis:'WEIGHT ('+unit+')',selectedId,onSelect,step,today});
}
function drawSeries(svg,data,{unit,axis,step,today,daily=false,selectedId=null,onSelect=null}){
 const width=svg.clientWidth;
 if(!width)return;
 const height=window.innerWidth>600?Math.max(260,window.innerHeight-255):Math.max(260,Math.min(420,width*.48));
 const left=58,right=width-22,top=25,bottom=height-55;
 const x=t=>left+(t-data.x[0])/(data.x[1]-data.x[0])*(right-left),y=v=>bottom-(v-data.y[0])/(data.y[1]-data.y[0])*(bottom-top);
 const contents=document.createDocumentFragment();
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';
 const add=(tag,attrs={},text)=>{const e=document.createElementNS(namespace,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;contents.append(e);return e;};
 const number=n=>numberFormat.format(Number(n.toFixed(1)));
 const valueLabel=n=>axis==='SLEEP (HOURS)'?formatSleepDuration(n):number(n)+' '+unit;
 for(let value=data.y[0];value<=data.y[1];value+=step){const py=y(value);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#c4c8cf','stroke-width':1.5,class:'chart-grid'});add('text',{x:left-8,y:py+4,'text-anchor':'end',class:'chart-y-tick'},number(value));}
 add('line',{x1:left,x2:left,y1:top,y2:bottom,stroke:'#fff','stroke-width':2,class:'chart-axis'});add('line',{x1:left,x2:right,y1:bottom,y2:bottom,stroke:'#fff','stroke-width':2,class:'chart-axis'});
 if(data.target!==null){const py=y(data.target),kind=daily?'daily':'weight';add('line',{x1:left,x2:right,y1:py,y2:py,stroke:daily?'#ff626b':'#92e0b1','stroke-width':2.5,'stroke-opacity':1,'stroke-dasharray':'5 5',class:kind+'-target-line'});add('text',{x:right-5,y:py-8,'text-anchor':'end',class:kind+'-target-label'},'TARGET '+number(data.target)+' '+unit);}
 const span=data.x[1]-data.x[0],ticks=daily?Math.min(span/86400000,width<500?2:4):width<500?2:4;
 const dateFormat=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',...(span>31536000000?{year:'numeric'}:{}),...(daily?{timeZone:'UTC'}:{})});
 const dateLabel=time=>dateFormat.format(time).toUpperCase();
 for(let i=0;i<=ticks;i++){
  const elapsed=span*i/ticks,time=data.x[0]+(daily?Math.round(elapsed/86400000)*86400000:elapsed);
  const label=!daily&&span<86400000?timeFormat.format(time):dateLabel(time);
  if(Math.abs(x(time)-x(today))<48)continue;
  add('text',{x:x(time),y:bottom+21,'text-anchor':i===0?'start':i===ticks?'end':'middle'},label);
 }
 add('text',{x:x(today),y:bottom+21,fill:'#ff626b','text-anchor':x(today)>right-27?'end':x(today)<left+27?'start':'middle',class:'chart-today'},'TODAY');
 add('text',{x:(left+right)/2,y:height-8,'text-anchor':'middle'},daily?'DAY':'TIME');
 add('text',{transform:`translate(14 ${(top+bottom)/2}) rotate(-90)`,'text-anchor':'middle'},axis);
 if(data.points.length>1)add('polyline',{points:data.points.map(p=>x(p.time)+','+y(p.value)).join(' '),fill:'none',stroke:'#fff','stroke-width':3.5,'stroke-linejoin':'round','stroke-linecap':'round'});
 const latest=data.points.at(-1);
 for(const p of data.points){
  const label=valueLabel(p.value)+' · '+(daily?dateLabel(p.time):entryDateTime.format(p.time)),selected=p.id===selectedId;
  const group=add('g',{'aria-label':label,'data-entry':p.id,class:daily?'protein-point':'weight-point',...(onSelect?{role:'button',tabindex:0,'aria-pressed':String(selected)}:{})});
  for(const attrs of [{cx:x(p.time),cy:y(p.value),r:14,fill:'transparent'},{cx:x(p.time),cy:y(p.value),r:p===latest?(selected?8:7):selected?5:3,fill:selected?'#a9c7ff':p===latest?'#92e0b1':'#fff',...(p===latest?{stroke:'var(--danki-bg, #071e48)','stroke-width':2}:{})}]){const circle=document.createElementNS(namespace,'circle');for(const [k,v]of Object.entries(attrs))circle.setAttribute(k,v);group.append(circle);}
  const title=document.createElementNS(namespace,'title');title.textContent=label;group.append(title);
  if(onSelect){group.addEventListener('click',()=>onSelect(p.id));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)onSelect(p.id);}});}
 }
 if(latest){
  const px=x(latest.time),py=y(latest.value);
  const targetNearby=data.target!==null&&Math.abs(py-y(data.target))<24;
  const labelY=targetNearby&&py+20<bottom?py+20:py-12;
  const labelRight=daily&&px-left<82;
  add('text',{x:px+(labelRight?12:-12),y:labelY,'text-anchor':labelRight?'start':'end',class:'weight-latest-label','pointer-events':'none'},valueLabel(latest.value));
 }
 svg.replaceChildren(contents);
}

export function drawSleep(svg,days,{target=null,now=Date.now(),selectedId=null,onSelect=null}={}){
 const data=sleepChartData(days,target,now);
 const max=data.y[1];
 const step=max<=5?.5:max<=12?1:2;
 data.y[1]=Math.ceil(max/step)*step;
 drawSeries(svg,data,{unit:'HOURS',axis:'SLEEP (HOURS)',daily:true,step,today:Date.parse(sleepDay(now)),selectedId,onSelect});
}
