import {chartData} from './model.mjs?v=ebba773338b1';
import {calorieChartData} from './calories.mjs?v=ebba773338b1';
const namespace='http://www.w3.org/2000/svg';
export function draw(svg,entries,unit,{selectedId=null,onSelect=()=>{},targetKg=null}={}){
 const data=chartData(entries,unit,targetKg);
 if(!data.points.length&&data.target===null)data.y=[0,10];
 data.y=[Math.floor(data.y[0]),Math.ceil(data.y[1])];
 drawSeries(svg,data,{unit,axis:'WEIGHT ('+unit+')',selectedId,onSelect,step:1});
}
export function drawCalories(svg,days,target,now=Date.now()){
 drawSeries(svg,calorieChartData(days,target,now),{unit:'KCAL',axis:'CALORIES',step:100});
}
function drawSeries(svg,data,{unit,axis,step,selectedId=null,onSelect=null}){
 const calories=step===100,width=Math.max(296,Math.round(svg.clientWidth||800));
 const naturalHeight=window.innerWidth>600?Math.max(260,window.innerHeight-255):Math.max(260,Math.min(420,width*.48));
 const height=calories?Math.max(naturalHeight,80+(data.y[1]-data.y[0])/step*16):naturalHeight;
 const left=58,right=width-22,top=25,bottom=height-55;
 const x=t=>left+(t-data.x[0])/(data.x[1]-data.x[0])*(right-left),y=v=>bottom-(v-data.y[0])/(data.y[1]-data.y[0])*(bottom-top);
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';
 const add=(tag,attrs={},text)=>{const e=document.createElementNS(namespace,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const number=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
 for(let value=data.y[0];value<=data.y[1];value+=step){const py=y(value);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#29446f'});add('text',{x:left-8,y:py+4,'text-anchor':'end',class:'chart-y-tick'},number(value));}
 add('line',{x1:left,x2:left,y1:top,y2:bottom,stroke:'#a9bddc'});add('line',{x1:left,x2:right,y1:bottom,y2:bottom,stroke:'#a9bddc'});
 if(data.target!==null){const py=y(data.target),kind=calories?'calorie':'weight';add('line',{x1:left,x2:right,y1:py,y2:py,stroke:calories?'#ff626b':'#92e0b1','stroke-width':calories?2:1.5,'stroke-opacity':calories?1:.48,'stroke-dasharray':'5 5',class:kind+'-target-line'});add('text',{x:right-5,y:py-8,'text-anchor':'end',class:kind+'-target-label'},'TARGET '+number(data.target)+' '+unit);}
 const span=data.x[1]-data.x[0],ticks=calories?Math.min(span/86400000,width<500?2:4):width<500?2:4;
 const dateLabel=time=>new Date(time).toLocaleDateString('en-GB',{day:'2-digit',month:'short',...(span>31536000000?{year:'numeric'}:{}),...(calories?{timeZone:'UTC'}:{})}).toUpperCase();
 for(let i=0;i<=ticks;i++){
  const elapsed=span*i/ticks,time=data.x[0]+(calories?Math.round(elapsed/86400000)*86400000:elapsed);
  const label=!calories&&span<86400000?new Date(time).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):dateLabel(time);
  add('text',{x:x(time),y:bottom+21,'text-anchor':i===0?'start':i===ticks?'end':'middle'},label);
 }
 add('text',{x:(left+right)/2,y:height-8,'text-anchor':'middle'},calories?'DAY':'TIME');
 add('text',{transform:`translate(14 ${(top+bottom)/2}) rotate(-90)`,'text-anchor':'middle'},axis);
 if(data.points.length>1)add('polyline',{points:data.points.map(p=>x(p.time)+','+y(p.value)).join(' '),fill:'none',stroke:'#fff','stroke-width':2,'stroke-linejoin':'round'});
 const latest=data.points.at(-1);
 for(const p of data.points){
  const label=number(p.value)+' '+unit+' · '+(calories?dateLabel(p.time):new Date(p.time).toLocaleString('en-GB')),selected=p.id===selectedId;
  const group=add('g',{'aria-label':label,'data-entry':p.id,class:calories?'calorie-point':'weight-point',...(onSelect?{role:'button',tabindex:0,'aria-pressed':String(selected)}:{})});
  for(const attrs of [{cx:x(p.time),cy:y(p.value),r:14,fill:'transparent'},{cx:x(p.time),cy:y(p.value),r:p===latest?(selected?8:7):selected?5:3,fill:selected?'#a9c7ff':p===latest?'#92e0b1':'#fff',...(p===latest?{stroke:'var(--danki-bg, #071e48)','stroke-width':2}:{})}]){const circle=document.createElementNS(namespace,'circle');for(const [k,v]of Object.entries(attrs))circle.setAttribute(k,v);group.append(circle);}
  const title=document.createElementNS(namespace,'title');title.textContent=label;group.append(title);
  if(onSelect){group.addEventListener('click',()=>onSelect(p.id));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)onSelect(p.id);}});}
 }
 if(latest){
  const px=x(latest.time),py=y(latest.value);
  const targetNearby=data.target!==null&&Math.abs(py-y(data.target))<24;
  const labelY=targetNearby&&py+20<bottom?py+20:py-12;
  const labelRight=calories&&px-left<82;
  add('text',{x:px+(labelRight?12:-12),y:labelY,'text-anchor':labelRight?'start':'end',class:'weight-latest-label','pointer-events':'none'},number(latest.value)+' '+unit);
 }
}
