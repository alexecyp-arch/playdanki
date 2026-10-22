// Store only a note ID, never note text, under its Google account's own key.
export const validSelectionId=id=>typeof id==='string'&&/^(?:[0-9a-f-]{36}|eternal:[0-9a-f-]{36}:\d{4}-\d{2}-\d{2})$/i.test(id);
export function createSelection(storage,uid,currentUid){
 const key='danki:note-selection:v1:'+uid;
 const valid=validSelectionId;
 return {
  get(){if(currentUid()!==uid)return null;try{const id=storage.getItem(key);return valid(id)?id:null;}catch{return null;}},
  set(id){if(currentUid()!==uid||id!==null&&!valid(id))return;try{if(id===null)storage.removeItem(key);else storage.setItem(key,id);}catch{}}
 };
}
