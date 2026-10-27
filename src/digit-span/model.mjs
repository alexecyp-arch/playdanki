export const START_LENGTH=5, DIGIT_MS=500, GAP_MS=500;
// Woods et al. (2011), Experiment 2: ML median 7, SD 1.03; n=763, ages 18–65.
// A median-centred normal approximation, not published empirical percentile ranks.
export const BENCHMARK={median:7,sd:1.03,n:763};
export function estimatedPercentile(span){
 if(!Number.isSafeInteger(span)||span<START_LENGTH)return null;
 const z=(span-BENCHMARK.median)/BENCHMARK.sd;
 if(z===0)return 50;
 const x=Math.abs(z)/Math.SQRT2,t=1/(1+.3275911*x);
 const erf=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);
 return 50*(1+Math.sign(z)*erf);
}
export function percentileLabel(span){const p=estimatedPercentile(span);if(p===null)return 'PERCENTILE UNAVAILABLE';if(p>99)return '>99TH ESTIMATED PERCENTILE';if(p<1)return '<1ST ESTIMATED PERCENTILE';const n=Math.round(p),s=n%100>=11&&n%100<=13?'TH':({1:'ST',2:'ND',3:'RD'}[n%10]||'TH');return n+s+' ESTIMATED PERCENTILE';}
export function randomSequence(length,random=()=>{const b=new Uint8Array(1);do{crypto.getRandomValues(b);}while(b[0]>=250);return b[0]%10;}){return Array.from({length},()=>String(random())).join('');}
export function createRun({schedule=setTimeout,cancel=clearTimeout,sequence=randomSequence,onChange=()=>{}}={}){
 let timer=null,epoch=0,state={phase:'idle',length:START_LENGTH,achieved:0,digit:'',answer:''},target='';
 const emit=()=>onChange({...state,...(state.phase==='over'?{solution:target}:{})});
 const stop=()=>{epoch++;if(timer!==null)cancel(timer);timer=null;};
 const later=(fn,ms)=>{const current=epoch;timer=schedule(()=>{timer=null;if(current===epoch)fn();},ms);};
 function round(){stop();target=sequence(state.length);state={...state,phase:'showing',digit:'',answer:''};emit();let index=0;function show(){state.digit=target[index++];emit();later(()=>{state.digit='';if(index===target.length){state.phase='recall';emit();}else{emit();later(show,GAP_MS);}},DIGIT_MS);}later(show,GAP_MS);}
 return {
  start(){stop();state={phase:'idle',length:START_LENGTH,achieved:0,digit:'',answer:''};round();},
  resume(){if(state.phase==='paused')round();},
  input(answer){if(state.phase!=='recall')return;state.answer=answer.replace(/[^0-9]/g,'').slice(0,state.length);if(state.answer.length===state.length){state.phase='checking';emit();later(()=>{if(state.answer!==target){state.phase='over';emit();return;}state.achieved=state.length;state.length++;state.phase='correct';emit();later(round,1000);},500);}else emit();},
  pause(){if(!['showing','recall','checking','correct'].includes(state.phase))return;stop();state={...state,phase:'paused',digit:'',answer:''};emit();},
  dispose(){stop();},
  snapshot(){return {...state};}
 };
}
