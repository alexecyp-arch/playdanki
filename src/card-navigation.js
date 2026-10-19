(()=>{'use strict';
 const controls='button,a,input,textarea,select,summary,[contenteditable="true"],.games-menu,.navigation,#account-bar,.tracker,#tracker,#history,#stats,[role="dialog"]';
 function canTap(event){return !event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&event.button===0&&matchMedia('(pointer:coarse),(max-width:600px)').matches&&!event.target.closest?.(controls)&&!window.getSelection()?.toString();}
 function install({next,previous,enabled}){document.getElementById('previous-card').addEventListener('click',previous);document.addEventListener('click',event=>{if(enabled()&&canTap(event))next();},true);}
 window.StudyNavigation={canTap,install};
})();
