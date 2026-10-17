(function(root){'use strict';
const TOTAL=5000,num=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=0?Math.min(v,max):0;
function create(){return{version:1,cursor:0,completed:0,round:1,current:null,cards:{},practiceDays:{}}}
function normalize(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1)throw Error('Invalid saved course');
 const s=create();s.cursor=num(raw.cursor,TOTAL);s.completed=Math.max(s.cursor,num(raw.completed,TOTAL));s.round=Math.max(1,num(raw.round));
 if(raw.current&&raw.current.id===s.cursor+1&&typeof raw.current.token==='string'&&raw.current.token&&s.cursor<TOTAL)s.current={id:raw.current.id,token:raw.current.token};
 for(const [key,r]of Object.entries(raw.cards||{})){if(!/^\d+$/.test(key)||+key<1||+key>TOTAL||!r||typeof r!=='object')continue;s.cards[key]={timesSeen:num(r.timesSeen),timesCorrect:0,timesWrong:0,masteryState:'unrated',lastReviewed:Number.isFinite(r.lastReviewed)&&r.lastReviewed>=0?r.lastReviewed:null,nextReview:null}}
 for(const [day,n]of Object.entries(raw.practiceDays||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(day)&&num(n))s.practiceDays[day]=num(n);
 return s;
}
function present(s,token){if(s.cursor>=TOTAL){s.current=null;return null}if(!s.current||s.current.id!==s.cursor+1)s.current={id:s.cursor+1,token:token()};return s.current}
function dayKey(now){const d=new Date(now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function advance(s,token,now){if(!s.current||s.current.token!==token||s.current.id!==s.cursor+1)return false;const id=s.current.id,r=s.cards[id]||{timesSeen:0};s.cards[id]={timesSeen:num(r.timesSeen)+1,timesCorrect:0,timesWrong:0,masteryState:'unrated',lastReviewed:now,nextReview:null};const day=dayKey(now);s.practiceDays[day]=(s.practiceDays[day]||0)+1;s.cursor++;s.completed=Math.max(s.completed,s.cursor);s.current=null;return true}
function replay(s){if(s.cursor!==TOTAL)return false;s.cursor=0;s.round++;s.current=null;return true}
function stats(s,deck){const totalReviewed=Object.values(s.cards).reduce((n,r)=>n+r.timesSeen,0),subjects={};for(const c of deck){const r=subjects[c.subject]||(subjects[c.subject]={total:0,completed:0,reviewed:0});r.total++;if(c.id<=s.completed)r.completed++;r.reviewed+=s.cards[c.id]?.timesSeen||0}return{completed:s.completed,remaining:TOTAL-s.completed,totalProgress:100*s.completed/TOTAL,totalReviewed,subjects,accuracy:null,mastered:null,weak:null}}
const api={TOTAL,create,normalize,present,advance,replay,stats,dayKey};root.QuantCourse=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis==='object'?globalThis:this);
