(()=>{'use strict';
 const key=text=>text.normalize('NFKC').toLowerCase().replaceAll('−','-').replace(/[^\p{L}\p{N}+\-*/%=<>]/gu,'');
 function options(answer,wrongAnswers){
  const seen=new Set([key(answer)]),wrong=[];
  for(const text of wrongAnswers||[]){if(typeof text!=='string'||!text.trim()||seen.has(key(text)))continue;seen.add(key(text));wrong.push(text);}
  if(wrong.length<2)throw Error('Two distinct distractors are required');
  for(let i=wrong.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
  const choices=[{text:answer,correct:true},...wrong.slice(0,2).map(text=>({text,correct:false}))];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
 }
 function render(container,choices,lang,onAnswer){
  container.replaceChildren();container.classList.add('quiz-choices');container.classList.toggle('quiz-prose',choices.some(choice=>choice.text.length>45));
  for(const choice of choices){const button=document.createElement('button');button.type='button';button.className='word-choice';button.textContent=choice.text;button.lang=lang;button.addEventListener('click',()=>onAnswer(button,choice.correct));container.append(button);}
 }
 function totals(state){const value=state.quiz||{};return {correct:Number.isSafeInteger(value.correct)&&value.correct>=0?value.correct:0,wrong:Number.isSafeInteger(value.wrong)&&value.wrong>=0?value.wrong:0};}
 function record(state,correct){state.quiz=totals(state);state.quiz[correct?'correct':'wrong']++;}
 function label(state){const {correct,wrong}=totals(state);return (correct+wrong?Math.round(1000*correct/(correct+wrong))/10+'%':'—')+' CORRECT';}
 globalThis.DankiQuiz=Object.freeze({key,options,render,totals,record,label});
})();
