(()=>{'use strict';
const config=JSON.parse(document.getElementById('support-config').textContent),menu=document.getElementById('support-menu'),note=document.getElementById('support-note');
if(!config.enabled&&!config.preview)return;
function valid(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(u.hostname==='revolut.me'||u.hostname==='revolut.com'||u.hostname.endsWith('.revolut.com'))}catch{return false}}
const links=[...menu.querySelectorAll('[data-amount]')];
if(!config.preview&&links.some(a=>!valid(config.amountUrls?.[a.dataset.amount]||config.genericUrl)))return;
menu.hidden=false;
for(const link of links){
 const amount=link.dataset.amount,url=config.amountUrls?.[amount]||config.genericUrl;
 if(config.preview){link.setAttribute('aria-disabled','true');link.addEventListener('click',e=>e.preventDefault());continue}
 link.href=url;link.target='_blank';link.rel='noopener noreferrer';
 link.addEventListener('click',()=>{note.textContent=config.amountUrls?.[amount]?'Continue on Revolut to review your payment.':'Enter $'+amount+' USD on Revolut. You choose the amount there.'});
}
note.textContent=config.preview?'Preview — payment link not connected.':config.genericUrl?'Choose an amount, then enter it on Revolut.':'Choose an amount. Continue on Revolut to pay.';
})();
