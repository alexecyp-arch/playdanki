import {chartData} from './model.mjs?v=af7da9fe98e5';
const namespace='http://www.w3.org/2000/svg';
export function draw(svg,entries,unit,{selectedId=null,onSelect=()=>{},targetKg=null}={}){
 const width=Math.max(300,Math.round(svg.clientWidth||800)),height=window.innerWidth>600?Math.max(260,window.innerHeight-255):Math.max(260,Math.min(420,width*.48)),left=58,right=width-22,top=25,bottom=height-55;
 const data=chartData(entries,unit,targetKg),x=t=>left+(t-data.x[0])/(data.x[1]-data.x[0])*(right-left),y=v=>bottom-(v-data.y[0])/(data.y[1]-data.y[0])*(bottom-top);
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';
 const add=(tag,attrs={},text)=>{const e=document.createElementNS(namespace,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const number=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
 for(let i=0;i<=4;i++){const value=data.y[0]+(data.y[1]-data.y[0])*i/4,py=y(value);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#29446f'});add('text',{x:left-8,y:py+4,'text-anchor':'end'},number(value));}
 add('line',{x1:left,x2:left,y1:top,y2:bottom,stroke:'#a9bddc'});add('line',{x1:left,x2:right,y1:bottom,y2:bottom,stroke:'#a9bddc'});
 if(data.target!==null){const py=y(data.target);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#92e0b1','stroke-width':2,'stroke-dasharray':'7 5',class:'weight-target-line'});add('text',{x:right-5,y:py-8,'text-anchor':'end',class:'weight-target-label'},'TARGET '+number(data.target)+' '+unit);}
 const span=data.x[1]-data.x[0],ticks=width<500?2:4;
 for(let i=0;i<=ticks;i++){const time=data.x[0]+span*i/ticks,px=x(time),date=new Date(time);const label=span<86400000?date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):date.toLocaleDateString(undefined,{day:'2-digit',month:'short',...(span>31536000000?{year:'numeric'}:{})}).toUpperCase();add('text',{x:px,y:bottom+21,'text-anchor':i===0?'start':i===ticks?'end':'middle'},label);}
 add('text',{x:(left+right)/2,y:height-8,'text-anchor':'middle'},'TIME');
 add('text',{transform:`translate(14 ${(top+bottom)/2}) rotate(-90)`,'text-anchor':'middle'},'WEIGHT ('+unit+')');
 if(data.points.length>1)add('polyline',{points:data.points.map(p=>x(p.time)+','+y(p.value)).join(' '),fill:'none',stroke:'#fff','stroke-width':2,'stroke-linejoin':'round'});
 for(const p of data.points){
  const label=number(p.value)+' '+unit+' · '+new Date(p.time).toLocaleString().toUpperCase(),selected=p.id===selectedId;
  const group=add('g',{role:'button',tabindex:0,'aria-label':label,'aria-pressed':String(selected),'data-entry':p.id,class:'weight-point'});
  for(const attrs of [{cx:x(p.time),cy:y(p.value),r:14,fill:'transparent'},{cx:x(p.time),cy:y(p.value),r:selected?5:3,fill:selected?'#a9c7ff':'#fff'}]){const circle=document.createElementNS(namespace,'circle');for(const [k,v]of Object.entries(attrs))circle.setAttribute(k,v);group.append(circle);}
  const title=document.createElementNS(namespace,'title');title.textContent=label;group.append(title);
  group.addEventListener('click',()=>onSelect(p.id));group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)onSelect(p.id);}});
 }
}
