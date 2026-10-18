export const docs=new Map(),auth={currentUser:null};let listener;export let fail=false;
export function reset(){docs.clear();auth.currentUser=null;listener=null;fail=false}
export function setFail(value){fail=value}
export function initializeApp(){return {}}export function getAuth(){return auth}export function getFirestore(){return {}}
export const browserLocalPersistence={};export async function setPersistence(){}
export function onAuthStateChanged(a,cb){listener=cb;queueMicrotask(()=>cb(a.currentUser))}
export async function become(user){auth.currentUser=user;await listener(user)}
export class GoogleAuthProvider{}
export async function signInWithPopup(){await become({uid:'alice',email:'alice@example.test'})}
export async function signOut(){await become(null)}
export function doc(db,...parts){return parts.join('/')}
export async function getDoc(ref){if(fail)throw Error('offline');return {exists:()=>docs.has(ref),data:()=>docs.get(ref)}}
export function serverTimestamp(){return 'server-time'}
export async function runTransaction(db,fn){if(fail)throw Error('offline');return fn({get:getDoc,set:(ref,value)=>docs.set(ref,value)})}
