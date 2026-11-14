import {orderKey} from './daily-notes.mjs?v=5f6d4221c68c';
// Explicit ordering changes display order only, never expiry or note text.
export function orderNotes(notes,order=[]){
 const ranks=new Map((Array.isArray(order)?order:[]).map((id,i)=>[id,i]));
 return [...notes].sort((a,b)=>(ranks.get(orderKey(a.id))??Infinity)-(ranks.get(orderKey(b.id))??Infinity)||a.expiresAt-b.expiresAt||b.createdAt-a.createdAt||b.id.localeCompare(a.id));
}
