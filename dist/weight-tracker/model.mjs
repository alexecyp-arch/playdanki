export const KG_PER_LB=0.45359237;
export function kilograms(value,unit){const n=Number(value),kg=unit==='LB'?n*KG_PER_LB:n;return Number.isFinite(kg)&&kg>0&&kg<=1000?kg:null;}
export function weight(kg,unit){return unit==='LB'?kg/KG_PER_LB:kg;}
export function chartData(entries,unit='KG',targetKg=null){
 const points=entries.filter(p=>Number.isFinite(p.kg)&&p.kg>0&&Number.isFinite(p.time)).map(p=>({...p,value:weight(p.kg,unit)})).sort((a,b)=>a.time-b.time||String(a.id).localeCompare(String(b.id)));
 const target=Number.isFinite(targetKg)&&targetKg>0?weight(targetKg,unit):null;
 if(!points.length)return {points,target,x:[Date.now()-3600000,Date.now()],y:target===null?[0,100]:[target,target+(unit==='LB'?22:10)]};
 let min=Infinity,max=-Infinity;for(const p of points){min=Math.min(min,p.value);max=Math.max(max,p.value);}
 const pad=Math.max(unit==='LB'?1:.5,(max-min)*.12),first=points[0].time,last=points.at(-1).time;
 return {points,target,x:first===last?[first-1800000,last+1800000]:[first,last],y:[target!==null&&target<=min?target:Math.max(0,min-pad),Math.max(max,target??max)+pad]};
}

export function weeklyChange(entries,selectedId,unit='KG'){
 const points=entries.filter(p=>Number.isFinite(p.kg)&&p.kg>0&&Number.isFinite(p.time));
 const selected=points.find(p=>p.id===selectedId),latest=points.reduce((last,p)=>!last||p.time>last.time?p:last,null);
 if(!selected||!latest||latest.time<=selected.time)return null;
 return weight(latest.kg-selected.kg,unit)*604800000/(latest.time-selected.time);
}

export function estimatedTargetTime(entries,selectedId,targetKg){
 if(!Number.isFinite(targetKg)||targetKg<=0)return null;
 const points=entries.filter(p=>Number.isFinite(p.kg)&&p.kg>0&&Number.isFinite(p.time)),selected=points.find(p=>p.id===selectedId),latest=points.reduce((last,p)=>!last||p.time>last.time?p:last,null);
 if(!selected||!latest||latest.time<=selected.time)return null;
 const remaining=targetKg-latest.kg;if(remaining===0)return latest.time;
 const rate=(latest.kg-selected.kg)/(latest.time-selected.time),delay=remaining/rate;
 if(!Number.isFinite(delay)||delay<0)return null;
 const estimate=latest.time+delay;return Number.isFinite(estimate)&&Math.abs(estimate)<=8640000000000000?estimate:null;
}

// Average same-day readings first, then smooth daily changes over a 25-day window.
// This prevents many readings on one day from outweighing the other days.
export function forecastTargetTime(entries,targetKg,now=Date.now()){
 if(!Number.isFinite(targetKg)||targetKg<=0)return null;
 const end=new Date(now);end.setHours(0,0,0,0);const start=new Date(end);start.setDate(start.getDate()-24);
 const days=new Map();
 for(const p of entries){if(!Number.isFinite(p.kg)||p.kg<=0||!Number.isFinite(p.time)||p.time<start.getTime()||p.time>now)continue;const date=new Date(p.time);date.setHours(0,0,0,0);const day=date.getTime(),v=days.get(day)||{time:day,sum:0,count:0};v.sum+=p.kg;v.count++;days.set(day,v);}
 const points=[...days.values()].sort((a,b)=>a.time-b.time).map(p=>({time:p.time,kg:p.sum/p.count}));
 if(points.length<2)return null;
 let rate=null;const alpha=2/26;
 for(let i=1;i<points.length;i++){const gap=Math.round((points[i].time-points[i-1].time)/86400000),change=(points[i].kg-points[i-1].kg)/gap;const a=1-Math.pow(1-alpha,gap);rate=rate===null?change:a*change+(1-a)*rate;}
 const latest=points.at(-1),remaining=targetKg-latest.kg;
 if(Math.abs(remaining)<.000001)return latest.time;
 if(Math.abs(rate)<.000001||remaining/rate<=0)return null;
 const estimate=latest.time+remaining/rate*86400000;
 return Number.isFinite(estimate)&&estimate>=now&&estimate<=8640000000000000?estimate:null;
}
