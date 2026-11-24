export const MAX_TEXT = 1500000;
export function sentences(text, limit = MAX_TEXT) {
  text = String(text || '').replace(/\r/g, '').replace(/[\t ]+/g, ' ').trim();
  if (!text) throw Error('No readable text found.');
  if (text.length > limit) throw Error('This text is too long. Please read a smaller section (up to 1.5 million characters).');
  const parts = [];
  const segmenter = new Intl.Segmenter('en-US', {granularity:'sentence'});
  for (const paragraph of text.split(/\n\s*\n/)) {
    for (const {segment} of segmenter.segment(paragraph.replace(/\n/g, ' '))) {
      const value = segment.trim();
      if (!value) continue;
      if (parts.length && /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|e\.g|i\.e)\.$/i.test(parts.at(-1))) parts[parts.length-1] += ' ' + value;
      else parts.push(value);
    }
  }
  return parts;
}
export function markVoice(voices) {
  return voices.find(v => /\bMicrosoft Mark\b/i.test(v.voiceName) && !v.remote && (!v.lang || /^en[-_]US$/i.test(v.lang)));
}
export function prepareReading(text,pageTexts) {
  if(!Array.isArray(pageTexts))return {items:sentences(text),pages:[]};
  if(!pageTexts.length || pageTexts.some(page=>typeof page!=='string'))throw Error('Invalid PDF pages.');
  const items=[],pages=[];
  for(const page of pageTexts){
    const start=items.length;
    if(page.trim())for(const sentence of sentences(page, Infinity))items.push(sentence);
    pages.push({start,end:items.length});
  }
  if(!items.length)throw Error('This PDF has no selectable text. Scanned image PDFs need OCR first.');
  return {items,pages};
}
export function rateValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw Error('Choose a speed from 1× to 5×.');
  return Math.max(1, Math.min(5, Math.round(n * 4) / 4));
}
// Chrome's chrome.tts rate scale is not the same as the Web Speech API rate scale
// used by this Windows app. The original extension was measured at roughly
// 173 WPM at Chrome rate 1, 333 WPM at rate 5, and 460 WPM at rate 8.
// Convert the displayed 1–5x setting into that extension target WPM first,
// then express it as a Web Speech multiplier relative to Mark's normal 173 WPM.
function extensionWpm(value) {
  const rate=rateValue(value)*2;
  return rate<=5?
    173*Math.pow(rate,Math.log(333/173)/Math.log(5)):
    333*Math.pow(rate/5,Math.log(460/333)/Math.log(8/5));
}
// Empirical Windows-app correction: the previous Web Speech mapping read the
// same calibration paragraph in 25 s versus 20 s in the Chrome extension.
// That is 80% of the target speaking speed, so multiply the Web Speech rate
// by 25% (20/25 speed ratio inverted) to match the extension.
export function nativeRate(value) { return extensionWpm(value)/173*1.25; }
export function selectionKey(tabId, text) {
  let hash = 2166136261;
  for (let i=0;i<text.length;i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `${tabId}:${text.length}:${hash >>> 0}`;
}
export function speechChunk(text, offset) {
  let end = Math.min(text.length, offset + 2800);
  if (end < text.length) { const space = text.lastIndexOf(' ', end); if (space > offset) end = space; }
  return {text:text.slice(offset,end), end};
}
export function speechBatch(items,index,offset=0) {
  let text='';const marks=[];
  while(index<items.length){
    const remaining=items[index].length-offset;
    if(text && text.length+1+remaining>2800)break;
    const chunk=speechChunk(items[index],offset);
    if(text)text+=' ';
    marks.push({start:text.length,index,offset});text+=chunk.text;
    if(chunk.end<items[index].length){offset=chunk.end;break;}
    index++;offset=0;
    if(text.length>=2800)break;
  }
  return {text,marks,nextIndex:index,nextOffset:offset};
}
export function wordCount(text) {
  return (String(text).match(/[\p{L}\p{N}]+(?:['’.\-][\p{L}\p{N}]+)*/gu) || []).length;
}
// Mark on the desktop app runs in Edge. The same browser speech-rate number
// produces different speeds in Chrome, so translate through measured WPM.
const desktopMark = [[1,278],[2.5,430],[5,595]];
const chromeMark = [[2.406,278],[3.875,346],[5.8,430],[7,480],[8,536],[10,595]];
function interpolate(points, x) {
  for (let i=1;i<points.length;i++) {
    const [left,y1]=points[i-1], [right,y2]=points[i];
    if (x<=right) return y1+(y2-y1)*Math.max(0,x-left)/(right-left);
  }
  return points.at(-1)[1];
}
export function playbackRate(value, engine) {
  if (engine!=='chrome') return nativeRate(value);
  const target=interpolate(desktopMark,rateValue(value));
  return interpolate(chromeMark.map(([rate,wpm])=>[wpm,rate]),target);
}
export function estimatedSeconds(words, rate, engine, measuredWpm) {
  const wpm=measuredWpm || (engine==='other' ? extensionWpm(rate) : interpolate(desktopMark,rateValue(rate)));
  return Math.max(0,words)*60/wpm;
}
export function durationLabel(seconds) {
  const total=Math.max(0,Math.ceil(seconds)),hours=Math.floor(total/3600),minutes=Math.floor(total%3600/60),rest=total%60;
  return hours?`${hours}h ${minutes}m`:minutes?`${minutes}m ${rest}s`:`${rest}s`;
}
