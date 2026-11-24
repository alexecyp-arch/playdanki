import {books,saveBook,fileId,rememberFile,reopenFile,forgetFile} from './library.js';
import {prepareReading, rateValue, markWpm, playbackRate, speechBatch, wordCount, estimatedSeconds, durationLabel} from './model.js?v=4';

const $ = id => document.getElementById(id);
let state = {id:0,sentences:[],pages:[],index:0,offset:0,status:'idle',rate:2.5,title:'Selected text',error:'',locked:false,words:0,revision:0};
let pending = null;
let wordOffsets = [0];
let generation = 0;
let utterance = null;
let voice = null;
let documentId;
let renderedPage;
let activeNode;
let sentenceNodes=[];
let renderToken = 0;
let autoScroll = true;
let manualReveal = null;
let lastProgress = 0;
let currentBookId = null;
let lastSavedPosition = "";
let expectedBook = null;
let openGeneration = 0;
const windows = /Windows/i.test(navigator.userAgent);
const mobile = navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const engine = windows && !mobile ? (/Edg\//.test(navigator.userAgent) ? 'edge' : /Chrome\//.test(navigator.userAgent) ? 'chrome' : 'other') : 'other';
const calibrationKey = 'danki-mark-pace-v1';
let chromeCalibration = 1;
let paceChecked = false;
try {
  const saved = Number(localStorage.getItem(calibrationKey));
  if (saved>=.75 && saved<=1.38) chromeCalibration=saved;
} catch {}
function matchChromePace(words,seconds) {
  if(words<65 || seconds<=0)return;
  const measured=60*words/seconds;
  if(measured<220 || measured>680)return;
  const ratio=markWpm(2.5)/measured;
  paceChecked=Math.abs(ratio-1)<=.05;
  if(paceChecked)return;
  chromeCalibration=Math.max(.75,Math.min(1.38,chromeCalibration*ratio));
  try { localStorage.setItem(calibrationKey,chromeCalibration); } catch {}
}


function showError(message='') {
  $('error').textContent = message;
  $('error').hidden = !message;
}
function indexWords() {
  wordOffsets = [0];
  for (const text of state.sentences) wordOffsets.push(wordOffsets.at(-1) + wordCount(text));
}
function currentPageNumber() {
  return state.pages.findIndex(page => state.index >= page.start && state.index < page.end) + 1;
}
function snapshot(full=false) {
  const current = state.sentences[state.index] || '';
  const readWords = (wordOffsets[state.index] || 0) + wordCount(current.slice(0,state.offset));
  const remainingWords = state.status === 'done' ? 0 : Math.max(0,state.words-readWords);
  const result = {
    ...state,
    count:state.sentences.length,
    remainingWords,
    pageCount:state.pages.length,
    pageNumber:currentPageNumber(),
    pending:pending ? {title:pending.title,words:pending.words} : null
  };
  if (!full) { delete result.sentences; delete result.pages; }
  return result;
}
function publish(full=false) {
  state.revision++;
  render(snapshot(full));
}
function cancelSpeech() {
  generation++;
  if (utterance) {
    utterance.onstart = null;
    utterance.onboundary = null;
    utterance.onend = null;
    utterance.onerror = null;
    utterance = null;
  }
  window.speechSynthesis?.cancel();
}
function fail(message) {
  cancelSpeech();
  state.status='error';state.locked=false;state.error=message;
  publish();
}
function findMarkVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  if (mobile || !windows) {
    return voices.find(v => v.localService && /^en[-_]US$/i.test(v.lang)) ||
      voices.find(v => v.localService && /^en/i.test(v.lang)) ||
      voices.find(v => v.localService) || (mobile ? voices.find(v => v.default && /^en/i.test(v.lang)) : null);
  }
  return voices.find(v => /\bMicrosoft Mark\b/i.test(v.name) && (!v.lang || /^en[-_]US$/i.test(v.lang))) ||
         voices.find(v => /\bMicrosoft Mark\b/i.test(v.name));
}
async function ensureVoice(token) {
  for (let attempt=0; attempt<25 && token===generation; attempt++) {
    voice = findMarkVoice();
    if (voice) return voice;
    await new Promise(resolve => setTimeout(resolve,120));
  }
  return null;
}
async function speak() {
  cancelSpeech();
  if (!state.sentences.length) return;
  const token = generation;
  state.error='';state.status='playing';state.locked=true;
  publish();
  const selected = await ensureVoice(token);
  if (token !== generation) return;
  if (!selected) {
    fail(/Windows/i.test(navigator.userAgent) ? 'Microsoft Mark is unavailable in this browser. Try Edge on Windows with Microsoft Mark installed.' : 'No compatible device voice is available. Check your speech settings.');
    return;
  }
  playChunk(token);
}
function playChunk(token) {
  if (token !== generation) return;
  const matchDesktop=engine==='chrome' && state.rate===2.5;
  const remaining = state.sentences[state.index].slice(state.offset);
  const length = remaining.length > 220 ? Math.max(1, remaining.lastIndexOf(' ', 220) > 100 ? remaining.lastIndexOf(' ', 220) : 220) : remaining.length;
  const chunk = mobile ? {
    text:remaining.slice(0,length), marks:[{start:0,index:state.index,offset:state.offset}],
    nextIndex:length===remaining.length?state.index+1:state.index,
    nextOffset:length===remaining.length?0:state.offset+length
  } : speechBatch(state.sentences,state.index,state.offset,matchDesktop&&!paceChecked?1050:2800);
  let markIndex = 0;
  const u = new SpeechSynthesisUtterance(chunk.text);
  utterance = u;
  u.voice = voice;
  u.lang = voice.lang || 'en-US';
  const preset = state.rate;
  u.rate = playbackRate(preset,engine,matchDesktop?chromeCalibration:1);
  let startedAt;
  u.onstart = () => { startedAt = performance.now(); };
  u.volume = 1;
  u.onboundary = event => {
    if (token !== generation || event.charIndex < 0) return;
    if (event.name && event.name !== 'word' && !event.charLength) return;
    while (markIndex+1 < chunk.marks.length && chunk.marks[markIndex+1].start <= event.charIndex) markIndex++;
    const mark = chunk.marks[markIndex];
    if (!mark) return;
    const changed = state.index !== mark.index;
    state.index = mark.index;
    state.offset = Math.min(state.sentences[state.index].length, mark.offset + event.charIndex - mark.start);
    const now=performance.now();
    const refresh=now-lastProgress>700;
    if (refresh) lastProgress=now;
    if (changed) publish();
    else if (refresh) render(snapshot());
  };
  u.onerror = event => {
    if (token === generation) fail(event.error || 'Windows could not read this text. Press Play to retry.');
  };
  u.onend = () => {
    if (token !== generation) return;
    const seconds = (performance.now() - startedAt) / 1000;
    const words = wordCount(chunk.text);
    if (matchDesktop && words >= 12 && seconds > 0 && seconds < words * 1.5) matchChromePace(words,seconds);
    state.offset = chunk.nextOffset;
    if (chunk.nextIndex < state.sentences.length) {
      state.index = chunk.nextIndex;
      publish();
      playChunk(token);
    } else {
      state.index = state.sentences.length-1;
      state.status='done';state.locked=false;utterance=null;
      publish();
    }
  };
  speechSynthesis.speak(u);
}
function startIndexForPage(pages,page){
  if(!pages?.length)return 0;
  let p=Math.max(1,Math.min(pages.length,Number(page)||1));
  if(pages[p-1].start<pages[p-1].end)return pages[p-1].start;
  for(let distance=1;distance<pages.length;distance++){
    const after=p-1+distance,before=p-1-distance;
    if(after<pages.length&&pages[after].start<pages[after].end)return pages[after].start;
    if(before>=0&&pages[before].start<pages[before].end)return pages[before].start;
  }
  return 0;
}
async function startDocument(doc) {
  pending=null;
  cancelSpeech();
  currentBookId=doc.bookId||null;lastSavedPosition="";
  const fallback=startIndexForPage(doc.pages||[],doc.startPage||1);
  const page=doc.pages?.[doc.startPage-1];
  const index=page && Number.isInteger(doc.startIndex) && doc.startIndex>=page.start && doc.startIndex<page.end ? doc.startIndex : fallback;
  state={...state,id:Math.max(Date.now(),state.id+1),sentences:doc.items,pages:doc.pages||[],words:doc.words,index,offset:0,status:'paused',locked:true,title:doc.title,error:''};
  paceChecked=false;
  indexWords();
  publish(true);
  if (doc.bookId) { manualReveal=index;revealPage(); }
  else await speak();
}
async function command(type, values={}) {
  try {
    switch(type) {
      case 'load': {
        const {items,pages}=prepareReading(values.text,values.pages);
        const doc={items,pages,words:items.reduce((sum,text)=>sum+wordCount(text),0),title:String(values.title||'Selected text').slice(0,160),bookId:values.bookId||null,startPage:Number(values.startPage)||1,startIndex:values.startIndex};
        if (state.locked && !doc.bookId) { pending=doc; publish(); break; }
        await startDocument(doc); break;
      }
      case 'start-pending':
        if (!pending) break;
        if (state.locked) throw Error('Press Stop before starting the new text.');
        await startDocument(pending); break;
      case 'dismiss-pending': pending=null; publish(); break;
      case 'toggle':
        if (state.status==='playing') { cancelSpeech();state.status='paused';publish(); }
        else { if(state.status==='done'){state.index=0;state.offset=0;} await speak(); }
        break;
      case 'stop':
        cancelSpeech();state.index=0;state.offset=0;state.status=state.sentences.length?'paused':'idle';state.locked=false;state.error='';publish();break;
      case 'page':
      case 'jump': {
        if (!state.sentences.length) break;
        let index=Number(values.index);
        if (type==='page') {
          const page=Number(values.page);
          if (!Number.isInteger(page)||page<1||page>state.pages.length) throw Error('Choose a page from 1 to '+state.pages.length+'.');
          const range=state.pages[page-1];
          if (range.start===range.end) throw Error('Page '+page+' has no readable text. Choose another page.');
          index=range.start;
        }
        if (!Number.isInteger(index)) throw Error('Invalid sentence.');
        state.index=Math.max(0,Math.min(state.sentences.length-1,index));state.offset=0;
        await speak();break;
      }
      case 'rate':
        state.rate=rateValue(values.rate);saveSettings();if(state.status==='playing')await speak();else publish();break;
      case 'clear':
        cancelSpeech();pending=null;currentBookId=null;lastSavedPosition="";state={...state,id:Math.max(Date.now(),state.id+1),sentences:[],pages:[],words:0,index:0,offset:0,status:'idle',locked:false,title:'Selected text',error:''};indexWords();publish(true);break;
      default: throw Error('Unknown command.');
    }
    return snapshot();
  } catch(error) {
    showError(error.message);
    return {error:error.message};
  }
}

function render(s) {
  if (!s) return;
  $('play').dataset.playing=String(s.status==='playing');
  $('play').textContent=s.status==='playing'?'Pause':s.status==='done'?'Replay':'Play';
  for (const id of ['play','previous','next','stop','clear']) $(id).disabled=!s.count;
  $('previous').disabled=!s.count||s.index===0;
  $('next').disabled=!s.count||s.index>=s.count-1;
  $('stop').disabled=!s.count&&!s.locked;
  $('rate').value=String(s.rate);
  $('status').textContent=s.count?`${s.status==='playing'?'Reading':s.status==='done'?'Finished':s.status==='error'?'Voice unavailable':'Paused'} · ${s.index+1} / ${s.count}`:'Ready';
  $('empty').hidden=!!s.count;
  $('estimate').textContent=s.words?`≈ ${durationLabel(estimatedSeconds(s.remainingWords??s.words,s.rate,engine))} remaining · ${durationLabel(estimatedSeconds(s.words,s.rate,engine))} total`:'Estimated time —';
  $('page-nav').hidden=!s.pageCount;
  $('page-label').textContent=`Page ${s.pageNumber||1} of ${s.pageCount||1}`;
  $('page-number').max=s.pageCount||1;
  if(document.activeElement!==$('page-number'))$('page-number').value=s.pageNumber||1;
  const position=s.pageNumber+':'+s.index;
  if (currentBookId && s.pageNumber && position!==lastSavedPosition) {
    lastSavedPosition=position;
    const book=books()[currentBookId];
    if(book)try { saveBook(currentBookId,{...book,page:s.pageNumber,index:s.index}); }catch {}
  }
  $('pending').hidden=!s.pending;
  $('pending-label').textContent=s.pending?`New text · ${s.pending.words.toLocaleString()} words${s.locked?' · Stop current reading first':''}`:'';
  $('read-pending').disabled=!!s.locked;
  showError(s.error);
  const pageToRender=s.count>20000&&s.pageCount ? s.pageNumber : 0;
  if(documentId!==s.id||renderedPage!==pageToRender){
    documentId=s.id;renderedPage=pageToRender;manualReveal=null;
    renderSentences(state.sentences,state.pages,pageToRender);
  }
  highlight();
}
function scrollSentence(node){
  if(!node)return;
  const pane=$('reading'),box=node.getBoundingClientRect(),frame=pane.getBoundingClientRect();
  if(box.top<frame.top+16||box.bottom>frame.bottom-16)pane.scrollTop+=box.top-frame.top-(pane.clientHeight-Math.min(box.height,pane.clientHeight))/2;
}
function followSentence(){if(autoScroll)scrollSentence(activeNode);}
function revealPage(){if(manualReveal!==null){const node=sentenceNodes[manualReveal];if(node){scrollSentence(node);manualReveal=null;}}}
function highlight(){
  const next=sentenceNodes[state.index];
  if(next===activeNode)return;
  activeNode?.removeAttribute('aria-current');activeNode=next;activeNode?.setAttribute('aria-current','true');followSentence();
}
function renderSentences(items,pages,pageNumber){
  const token=++renderToken;$('text').replaceChildren();activeNode=null;sentenceNodes=[];
  // Keep large PDFs responsive by rendering the selected page on demand.
  const page = pageNumber ? pages[pageNumber-1] : null;
  let index=page?.start??0;
  const stop=page?.end??items.length;
  const starts=new Map(pages.flatMap((p,i)=>p.end>p.start?[[p.start,i+1]]:[]));
  $('reading').scrollTop=0;
  function batch(){
    if(token!==renderToken)return;
    const fragment=document.createDocumentFragment(),end=Math.min(index+200,stop);
    for(;index<end;index++){
      if(starts.has(index)){const label=document.createElement('div');label.className='page-marker';label.textContent='Page '+starts.get(index);fragment.append(label);}
      const b=document.createElement('button');b.dataset.index=index;b.textContent=items[index];sentenceNodes[index]=b;fragment.append(b,document.createTextNode(' '));
    }
    $('text').append(fragment);highlight();revealPage();if(index<stop)setTimeout(batch,0);
  }
  batch();
}
function updateAutoScroll(){$('auto-scroll').setAttribute('aria-pressed',String(autoScroll));$('auto-scroll').textContent='Auto-scroll: '+(autoScroll?'On':'Off');}
function saveSettings() {
  try { localStorage.setItem('danki-book-settings',JSON.stringify({speed:state.rate,autoScroll})); } catch {}
}
function loadSettings() {
  let saved={};
  try { saved=JSON.parse(localStorage.getItem('danki-book-settings')||'{}'); } catch {}
  state.rate=rateValue(saved.speed??2.5);autoScroll=saved.autoScroll!==false;updateAutoScroll();
}
function refreshBooks() {
  const list=$('books-list');list.replaceChildren();
  for (const [id,book] of Object.entries(books())) {
    const row=document.createElement('div');row.className='book-row';
    const open=document.createElement('button');open.className='book-open';open.textContent=book.name;open.title='Page '+book.page;
    open.onclick=()=>{closeBooksMenu();openSavedBook(id,book);};
    const remove=document.createElement('button');remove.className='book-remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+book.name);
    remove.onclick=()=>{try{saveBook(id,null);forgetFile(id);if(currentBookId===id)currentBookId=null;refreshBooks();}catch(error){showError(error.message);}};
    row.append(open,remove);list.append(row);
  }
}
function closeBooksMenu(){$('books-menu').hidden=true;$('books-button').setAttribute('aria-expanded','false');}
function toggleBooksMenu(){
  if(!$('books-menu').hidden){closeBooksMenu();return;}
  refreshBooks();$('books-menu').hidden=false;$('books-button').setAttribute('aria-expanded','true');
}
async function pickPdf(id=null) {
  expectedBook=id;
  if (window.showOpenFilePicker) {
    try {
      const [handle]=await showOpenFilePicker({types:[{description:'PDF',accept:{'application/pdf':['.pdf']}}]});
      await loadPdf(await handle.getFile(),handle,id);
      return;
    } catch(error) { if(error.name==='AbortError')return; }
  }
  $('file').click();
}
async function openSavedBook(id,book) {
  const file=await reopenFile(id);
  if(file){await loadPdf(file,null,id);return;}
  showError('Select '+book.name+' to resume from page '+book.page+'.');
  await pickPdf(id);
}

for(let rate=1;rate<=5;rate+=.25){const option=document.createElement('option');option.value=rate;option.textContent=`${rate}×`;$('rate').append(option);}
$('books-button').onclick=toggleBooksMenu;
$('add-book').onclick=()=>{closeBooksMenu();pickPdf();};
document.addEventListener('click',event=>{if(!$('books-menu').hidden&&!event.target.closest('.books-wrap'))closeBooksMenu();});
$('auto-scroll').onclick=()=>{autoScroll=!autoScroll;updateAutoScroll();followSentence();saveSettings();};
$('play').onclick=()=>command('toggle');
$('stop').onclick=()=>command('stop');
$('clear').onclick=()=>command('clear');
$('previous').onclick=()=>command('jump',{index:state.index-1});
$('next').onclick=()=>command('jump',{index:state.index+1});
$('rate').onchange=()=>command('rate',{rate:$('rate').value});
$('text').onclick=event=>{const b=event.target.closest('[data-index]');if(b)command('jump',{index:Number(b.dataset.index)});};
$('read-paste').onclick=async()=>{const result=await command('load',{text:$('paste').value,title:'Pasted text'});if(result&&!result.error)$('paste').closest('details').open=false;};
$('read-pending').onclick=()=>command('start-pending');
$('dismiss-pending').onclick=()=>command('dismiss-pending');
$('page-nav').onsubmit=async event=>{event.preventDefault();const result=await command('page',{page:Number($('page-number').value)});if(result&&!result.error){manualReveal=result.index;revealPage();}};
async function loadPdf(file,handle=null,expected=null){
  if(!file)return;
  if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){showError('Choose a PDF file.');return;}
  if(file.size>100*1024*1024){showError('Choose a PDF smaller than 100 MB.');return;}
  const generation=++openGeneration;
  showError('');
  try{
    const id=await fileId(file);
    if(expected && id!==expected)throw Error('Choose the original PDF to resume this book.');
    if(generation!==openGeneration)return;
    const {readPdf}=await import('./pdf.js?v=3');
    await readPdf(file,{
      progress:text=>{if(generation===openGeneration)$('pdf-status').textContent=text;},
      read:async(title,pages)=>{
        if(generation!==openGeneration)return;
        const saved=books()[id]||{name:file.name,page:1,index:0};
        try { saveBook(id,saved); } catch {}
        await rememberFile(id,file,handle);
        if(generation===openGeneration)await command('load',{title,pages,bookId:id,startPage:saved.page,startIndex:saved.index});
      }
    });
  }catch(error){if(generation===openGeneration){showError(error.message);$('pdf-status').textContent='';}}
}
$('pdf').onclick=()=>pickPdf();
$('file').onchange=()=>{loadPdf($('file').files[0],null,expectedBook);expectedBook=null;$('file').value='';};
document.addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect='copy';document.body.classList.add('dragging');});
document.addEventListener('dragleave',event=>{if(!event.relatedTarget)document.body.classList.remove('dragging');});
document.addEventListener('drop',event=>{event.preventDefault();document.body.classList.remove('dragging');loadPdf(event.dataTransfer.files[0]);});
window.addEventListener('pagehide',cancelSpeech);

loadSettings();
window.speechSynthesis?.getVoices();
render(snapshot(true));
