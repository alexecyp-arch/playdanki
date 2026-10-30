export const weekdays=['SUN','MON','TUE','WED','THU','FRI','SAT'];
export function localDay(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
export function occurrences(schedules,now,adjustments={}){
 const date=new Date(now),day=localDay(date),createdAt=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),expiresAt=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime();
 const enabled=schedules.filter(s=>s.days.length>0);
 const result=enabled.filter(s=>s.days.includes(date.getDay())&&s.dismissedOn!==day).map(s=>({id:'eternal:'+s.id+':'+day,eternalId:s.id,body:s.body,createdAt,expiresAt}));
 for(const [id,until] of Object.entries(adjustments)){const match=/^eternal:([0-9a-f-]{36}):(\d{4}-\d{2}-\d{2})$/i.exec(id);if(!match||!Number.isSafeInteger(until))continue;const existing=result.find(n=>n.id===id);if(existing)existing.expiresAt=until;else if(until>now){const schedule=enabled.find(s=>s.id===match[1]);if(schedule&&schedule.dismissedOn!==match[2])result.push({id,eternalId:schedule.id,body:schedule.body,createdAt:new Date(match[2]+'T00:00:00').getTime(),expiresAt:until});}}
 const active=new Map();
 for(const note of result.filter(n=>n.expiresAt>now).sort((a,b)=>a.createdAt-b.createdAt)){const prior=active.get(note.eternalId);if(prior)prior.expiresAt=Math.max(prior.expiresAt,note.expiresAt);else active.set(note.eternalId,note);}
 return [...active.values()];
}
export function validSchedule(body,days){return typeof body==='string'&&!!body.trim()&&body.trim().length<=10000&&Array.isArray(days)&&days.length<=7&&new Set(days).size===days.length&&days.every(d=>Number.isInteger(d)&&d>=0&&d<=6);}
