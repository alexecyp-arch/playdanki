export const KG_PER_LB=0.45359237;
export function kilograms(value,unit){const n=Number(value),kg=unit==='LB'?n*KG_PER_LB:n;return Number.isFinite(kg)&&kg>0&&kg<=1000?kg:null;}
export function weight(kg,unit){return unit==='LB'?kg/KG_PER_LB:kg;}
export function chartData(entries,unit='KG'){
 const points=entries.filter(p=>Number.isFinite(p.kg)&&p.kg>0&&Number.isFinite(p.time)).map(p=>({...p,value:weight(p.kg,unit)})).sort((a,b)=>a.time-b.time||String(a.id).localeCompare(String(b.id)));
 if(!points.length)return {points,x:[Date.now()-3600000,Date.now()],y:[0,100]};
 let min=Infinity,max=-Infinity;for(const p of points){min=Math.min(min,p.value);max=Math.max(max,p.value);}
 const pad=Math.max(unit==='LB'?1:.5,(max-min)*.12),first=points[0].time,last=points.at(-1).time;
 return {points,x:first===last?[first-1800000,last+1800000]:[first,last],y:[Math.max(0,min-pad),max+pad]};
}
