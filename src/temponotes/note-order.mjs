// Selection is private page memory; it never changes expiry or writes note data.
export function orderNotes(notes,selected){
 return [...notes].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected)||a.expiresAt-b.expiresAt||b.createdAt-a.createdAt||b.id.localeCompare(a.id));
}
