// An account change or unmount cancels any pending confirmation.
export function confirmDelete(message,signal){
 if(signal?.aborted)return Promise.resolve(false);
 return new Promise(resolve=>{
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='delete-confirm';dialog.setAttribute('aria-labelledby','delete-confirm-title');
  dialog.innerHTML='<h2 id="delete-confirm-title">CONFIRM DELETE</h2><p></p><div><button type="button" data-cancel autofocus>CANCEL</button><button type="button" data-delete>DELETE</button></div>';
  dialog.querySelector('p').textContent=message;
  let settled=false;const visibility=event=>{if(event.type==='visibilitychange'?document.hidden:event.detail===false)finish(false);};
  const finish=value=>{if(settled)return;settled=true;window.removeEventListener('temponotes-visibility',visibility);document.removeEventListener('visibilitychange',visibility);signal?.removeEventListener('abort',abort);dialog.close();dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true});resolve(value);},abort=()=>finish(false);
  dialog.addEventListener('click',event=>{event.stopPropagation();if(event.target.closest('[data-delete]'))finish(true);else if(event.target.closest('[data-cancel]')||event.target===dialog)finish(false);});
  dialog.addEventListener('keydown',event=>event.stopPropagation());dialog.addEventListener('cancel',event=>{event.preventDefault();event.stopPropagation();finish(false);});
  signal?.addEventListener('abort',abort,{once:true});window.addEventListener('temponotes-visibility',visibility);document.addEventListener('visibilitychange',visibility);document.body.append(dialog);dialog.showModal();
 });
}
