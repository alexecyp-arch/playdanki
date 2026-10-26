import assert from 'node:assert/strict';
import {confirmDelete} from '../src/temponotes/confirm-delete.js';
let active,focusCount=0;
class Dialog extends EventTarget{open=false;isConnected=true;message={textContent:''};setAttribute(){}querySelector(){return this.message;}close(){this.open=false;}remove(){this.isConnected=false;}showModal(){this.open=true;}}
globalThis.window=new EventTarget();const document=new EventTarget();Object.assign(document,{hidden:false,activeElement:{isConnected:true,focus(){focusCount++;}},createElement:()=>new Dialog(),body:{append(dialog){active=dialog;}}});globalThis.document=document;
const click=selector=>{const e=new Event('click',{bubbles:true});Object.defineProperty(e,'target',{value:{closest:s=>s===selector}});active.dispatchEvent(e);};
let pending=confirmDelete('DELETE THIS NOTE?');assert(active.open);assert.equal(active.message.textContent,'DELETE THIS NOTE?');click('[data-cancel]');assert.equal(await pending,false);assert(!active.isConnected);
pending=confirmDelete('DELETE THIS NOTE?');const escape=new Event('cancel',{cancelable:true});active.dispatchEvent(escape);assert(escape.defaultPrevented);assert.equal(await pending,false);
pending=confirmDelete('DELETE THIS NOTE?');click('[data-delete]');assert.equal(await pending,true);
const controller=new AbortController();pending=confirmDelete('DELETE THIS NOTE?',controller.signal);controller.abort();assert.equal(await pending,false,'Sign-out/unmount cancels pending deletion');assert(!active.isConnected);assert.equal(await confirmDelete('DELETE',controller.signal),false);
pending=confirmDelete('DELETE THIS NOTE?');window.dispatchEvent(new CustomEvent('temponotes-visibility',{detail:false}));assert.equal(await pending,false,'Leaving the page cancels deletion');
pending=confirmDelete('DELETE THIS NOTE?');document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(await pending,false,'Hiding the tab cancels deletion');assert.equal(focusCount,6);
console.log('In-site confirmation checks passed: explicit delete only, cancel, Escape, focus restore, account disposal and page/tab hiding.');
