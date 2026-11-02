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

// Recent, outlier-resistant regression. Each calendar day has one vote;
// Prefer the last week; allow fourteen days only when recent logging is sparse.
export function forecastTargetTime(entries,targetKg,now=Date.now()){
 if(!Number.isFinite(targetKg)||targetKg<=0)return null;
 const dayNumber=t=>{const d=new Date(t);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;},today=dayNumber(now),groups=new Map();
 for(const p of entries){if(!Number.isFinite(p.kg)||p.kg<=0||!Number.isFinite(p.time)||p.time>now)continue;const age=today-dayNumber(p.time);if(age<0||age>13)continue;const values=groups.get(age)||[];values.push(p.kg);groups.set(age,values);}
 const median=v=>{const a=[...v].sort((a,b)=>a-b),m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2;};
 let points=[...groups].map(([age,v])=>({x:-age,y:median(v),w:Math.pow(2,-age/3.5)})).sort((a,b)=>a.x-b.x);
 const recent=points.filter(p=>p.x>=-6);if(recent.length>=3&&recent.at(-1).x-recent[0].x>=4)points=recent;
 if(points.length<3||points.at(-1).x-points[0].x<4||points.at(-1).x < -7)return null;
 const slopes=[];for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)slopes.push((points[j].y-points[i].y)/(points[j].x-points[i].x));
 let slope=median(slopes),intercept=median(points.map(p=>p.y-slope*p.x));
 for(let pass=0;pass<4;pass++){
  const residuals=points.map(p=>p.y-(intercept+slope*p.x)),centre=median(residuals),scale=Math.max(.05,1.4826*median(residuals.map(r=>Math.abs(r-centre))));
  const weights=points.map((p,i)=>p.w*Math.min(1,1.5*scale/Math.max(.000001,Math.abs(residuals[i]-centre)))),total=weights.reduce((a,b)=>a+b,0),mx=points.reduce((v,p,i)=>v+weights[i]*p.x,0)/total,my=points.reduce((v,p,i)=>v+weights[i]*p.y,0)/total;
  const variance=points.reduce((v,p,i)=>v+weights[i]*(p.x-mx)**2,0);if(variance<.000001)return null;
  slope=points.reduce((v,p,i)=>v+weights[i]*(p.x-mx)*(p.y-my),0)/variance;intercept=my-slope*mx;
 }
 const remaining=targetKg-intercept;if(Math.abs(remaining)<.005)return now;
 if(Math.abs(slope)<.01||remaining/slope<=0)return null;
 const estimate=now+remaining/slope*86400000;
 return Number.isFinite(estimate)&&estimate<=now+730*86400000?estimate:null;
}
