export const weekdays=['SUN','MON','TUE','WED','THU','FRI','SAT'];
export function localDay(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
export function occurrences(schedules,now){
 const date=new Date(now),day=localDay(date),createdAt=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),expiresAt=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime();
 return schedules.filter(s=>s.days.includes(date.getDay())&&s.dismissedOn!==day).map(s=>({id:'eternal:'+s.id+':'+day,eternalId:s.id,body:s.body,createdAt,expiresAt}));
}
export function validSchedule(body,days){return typeof body==='string'&&!!body.trim()&&body.trim().length<=10000&&Array.isArray(days)&&days.length>0&&days.length<=7&&new Set(days).size===days.length&&days.every(d=>Number.isInteger(d)&&d>=0&&d<=6);}
