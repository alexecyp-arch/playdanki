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
