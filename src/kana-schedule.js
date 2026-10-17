(()=>{'use strict';
let cachedDay='',cachedOrder;
function randomFor(day){let seed=2166136261;for(const c of day)seed=Math.imul(seed^c.charCodeAt(0),16777619);return ()=>{seed+=0x6D2B79F5;let n=Math.imul(seed^seed>>>15,1|seed);n^=n+Math.imul(n^n>>>7,61|n);return ((n^n>>>14)>>>0)/4294967296}}
function shuffle(list,random){for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
function repeats(cards,indices,count){const total=indices.reduce((sum,i)=>sum+Math.max(1,cards[i][2]),0),parts=indices.map(i=>{const quota=count*Math.max(1,cards[i][2])/total;return {i,count:Math.floor(quota),remainder:quota%1}});let left=count-parts.reduce((sum,p)=>sum+p.count,0);for(const p of [...parts].sort((a,b)=>b.remainder-a.remainder||a.i-b.i)){if(left===0)break;p.count++;left--}return parts.flatMap(p=>Array(p.count).fill(p.i))}
globalThis.kanaPracticeOrder=(cards,day)=>{if(cachedDay===day)return cachedOrder;const random=randomFor(day),first=shuffle(cards.map((_,i)=>i),random),review=[];for(const script of ['hiragana','katakana'])review.push(...repeats(cards,cards.map((c,i)=>c[3]===script?i:-1).filter(i=>i>=0),204));cachedDay=day;cachedOrder=first.concat(shuffle(review,random));return cachedOrder};
let hangulDay='',hangulOrder;
globalThis.hangulPracticeOrder=(cards,day)=>{if(hangulDay===day)return hangulOrder;const indices=cards.map((_,i)=>i),review=repeats(cards,indices,500-cards.length);hangulDay=day;hangulOrder=indices.concat(shuffle(review,randomFor('hangul:'+day)));return hangulOrder};
})();
