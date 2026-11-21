export function endOfDay(now){const d=new Date(now);return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();}
export function dayDeadline(expiresAt){const d=new Date(expiresAt);return d.getHours()===0&&d.getMinutes()===0&&d.getSeconds()===0&&d.getMilliseconds()===0?expiresAt:endOfDay(expiresAt);}
export function nextDay(expiresAt){const d=new Date(expiresAt);d.setDate(d.getDate()+1);return d.getTime();}
export const orderKey=id=>typeof id==='string'?id.replace(/^(eternal:[0-9a-f-]{36}):\d{4}-\d{2}-\d{2}$/i,'$1'):'';
export const validOrder=ids=>Array.isArray(ids)&&ids.length<=3000&&new Set(ids).size===ids.length&&ids.every(id=>typeof id==='string'&&/^(?:[0-9a-f-]{36}|eternal:[0-9a-f-]{36})$/i.test(id));
export function finishOrder(clicked,current){return [...new Set([...clicked,...current])];}

// Count calendar days inclusively; a midnight deadline belongs to the day ending.
export function remainingDaysRoman(expiresAt,now){
 const day=value=>{const d=new Date(value);return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;};
 let count=Math.max(1,day(expiresAt-1)-day(now)+1),label='';
 for(const [value,mark] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(count>=value){label+=mark;count-=value;}
 return label;
}
