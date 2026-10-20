import {chartData} from './model.mjs?v=e199140e9862';
const namespace='http://www.w3.org/2000/svg';
export function draw(svg,entries,unit){
 const width=Math.max(300,Math.round(svg.clientWidth||800)),height=Math.max(260,Math.min(420,width*.48)),left=58,right=width-22,top=25,bottom=height-55;
 const data=chartData(entries,unit),x=t=>left+(t-data.x[0])/(data.x[1]-data.x[0])*(right-left),y=v=>bottom-(v-data.y[0])/(data.y[1]-data.y[0])*(bottom-top);
 svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.style.height=height+'px';
 const add=(tag,attrs={},text)=>{const e=document.createElementNS(namespace,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;svg.append(e);return e;};
 const number=n=>Number(n.toFixed(1)).toLocaleString(undefined,{maximumFractionDigits:1});
 for(let i=0;i<=4;i++){const value=data.y[0]+(data.y[1]-data.y[0])*i/4,py=y(value);add('line',{x1:left,x2:right,y1:py,y2:py,stroke:'#29446f'});add('text',{x:left-8,y:py+4,'text-anchor':'end'},number(value));}
 add('line',{x1:left,x2:left,y1:top,y2:bottom,stroke:'#a9bddc'});add('line',{x1:left,x2:right,y1:bottom,y2:bottom,stroke:'#a9bddc'});
 const span=data.x[1]-data.x[0],ticks=width<500?2:4;
 for(let i=0;i<=ticks;i++){const time=data.x[0]+span*i/ticks,px=x(time),date=new Date(time);const label=span<86400000?date.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',hour12:false}):date.toLocaleDateString(undefined,{day:'2-digit',month:'short',...(span>31536000000?{year:'numeric'}:{})}).toUpperCase();add('text',{x:px,y:bottom+21,'text-anchor':i===0?'start':i===ticks?'end':'middle'},label);}
 add('text',{x:(left+right)/2,y:height-8,'text-anchor':'middle'},'TIME');
 add('text',{transform:`translate(14 ${(top+bottom)/2}) rotate(-90)`,'text-anchor':'middle'},'WEIGHT ('+unit+')');
 if(data.points.length>1)add('polyline',{points:data.points.map(p=>x(p.time)+','+y(p.value)).join(' '),fill:'none',stroke:'#fff','stroke-width':2,'stroke-linejoin':'round'});
 for(const p of data.points){const dot=add('circle',{cx:x(p.time),cy:y(p.value),r:3,fill:'#fff'}),title=document.createElementNS(namespace,'title');title.textContent=number(p.value)+' '+unit+' · '+new Date(p.time).toLocaleString().toUpperCase();dot.append(title);}
}
