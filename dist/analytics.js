// Public Cloudflare site token. No note text, weights, account IDs or game answers are sent.
(()=>{'use strict';
const config={"enabled":true,"token":"1d4e0a1d51cb49489ce609080503b47d"},key='danki:analytics:exclude:v1',params=new URLSearchParams(location.search);
let excluded=params.get('analytics')==='off';
try{if(excluded)localStorage.setItem(key,'1');if(params.get('analytics')==='on')localStorage.removeItem(key);excluded=excluded||localStorage.getItem(key)==='1';}catch{}
const automated=navigator.webdriver||/HeadlessChrome|GPTBot|ChatGPT|OAI-SearchBot|ClaudeBot|Playwright|Puppeteer/i.test(navigator.userAgent||'');
if(!config.enabled||!config.token||excluded||automated||window.top!==window||!['playdanki.com','www.playdanki.com'].includes(location.hostname)||/^\/(temponotes|weight-tracker|timebox)(\/|$)/.test(location.pathname))return;
const script=document.createElement('script');script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';script.setAttribute('data-cf-beacon',JSON.stringify({token:config.token,spa:false}));document.head.append(script);
})();
