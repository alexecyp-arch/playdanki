// Selection changes display order only; it never changes expiry or note data.
export function orderNotes(notes,selected){
 return [...notes].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected)||a.expiresAt-b.expiresAt||b.createdAt-a.createdAt||b.id.localeCompare(a.id));
}
