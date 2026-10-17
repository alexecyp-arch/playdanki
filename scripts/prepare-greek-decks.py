"""Select the final Greek deck from prepare-greek-content.py candidates."""
import sys,json,re,hashlib,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
DATA=Path(sys.argv[1]).resolve()
def normal(s):return re.sub(r'[^\w\s]','',unicodedata.normalize('NFC',s).lower()).strip()
overrides={}
for l in (ROOT/'src/greek-word-overrides.tsv').read_text(encoding='utf8').splitlines():
 if l.strip():a,b=l.split('\t');overrides[a]=b
excluded={'τρεις','τέσσερις','μερικοί','κος','καλύτερος','χειρότερος','υψηλότατος','όντας','παν','χρόνια','είναι'}
words=[];wordmeta=[];seen=set()
for w,en,f in json.loads((DATA/'word-candidates.json').read_text(encoding='utf8')):
 if w in excluded or normal(w) in seen:continue
 en=overrides.get(w,en)
 # Keep grammatical explanatory prose out of compact cards.
 if len(en)>48 or re.search(r'\b(?:suggesting|pertaining|relating|Expresses|expression|One\x27s|units of|proportional|pronoun|conjugation)\b',en):continue
 en=re.sub(r'^(?:a|an|the) ','',en) if en not in {'a','an','the'} else en
 if en.startswith('I ') and w not in {'μακάρι'}:en=en[2:]
 words.append([w,en]);wordmeta.append({'word':w,'frequency':f,'rank':len(words),'dictionary_url':'https://en.wiktionary.org/wiki/'+w+'#Greek','overridden':w in overrides});seen.add(normal(w))
 if len(words)==5000:break
sentence_overrides={}
for l in (ROOT/'src/greek-sentence-overrides.tsv').read_text(encoding='utf8').splitlines():
 if l.strip():a,b=l.split('\t');sentence_overrides[a]=b
sentences=[];sentmeta=[];seen=set()
for r in json.loads((DATA/'sentence-candidates.json').read_text(encoding='utf8')):
 if not r['count'] or normal(r['greek']) in seen:continue
 # Keep ordinary greetings but omit incomplete noises and bare alphabet names.
 if len(r['greek'].strip(' .!;?'))<3:continue
 english=sentence_overrides.get(r['greek'],r['english'])
 sentences.append([r['greek'],english]);seen.add(normal(r['greek']))
 sentmeta.append({**{k:r[k] for k in ['greek_id','english_id','greek_author','english_author','count']},'rank':len(sentences),'greek':r['greek'],'english':english,'original_english':r['english'],'modified':english!=r['english']})
 if len(sentences)==1000:break
assert len(words)==5000 and len(sentences)==1000
assert len({normal(w) for w,en in words})==5000
assert len({normal(g) for g,en in sentences})==1000
assert all(en and g and '\ufffd' not in g+en for g,en in words+sentences)
assert all(wordmeta[i]['frequency']>=wordmeta[i+1]['frequency'] for i in range(4999))
assert all(sentmeta[i]['count']>=sentmeta[i+1]['count'] for i in range(999))
for name,value in [('greek-words.json',words),('greek-sentences.json',sentences)]:
 (ROOT/'src'/name).write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
urls={
 'frequency.txt':('https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/el/el_full.txt','Hermit Dave / FrequencyWords; OpenSubtitles2018 word counts','CC BY-SA 4.0'),
 'kaikki.jsonl':('https://kaikki.org/dictionary/Greek/kaikki.org-dictionary-Greek.jsonl','English Wiktionary contributors, extracted by Tatu Ylonen / Kaikki / Wiktextract','CC BY-SA 4.0'),
 'wikdict.tei':('https://download.wikdict.com/dictionaries/tei/recommended/ell-eng.tei','Greek Wiktionary contributors via DBnary; Karl Bartel / WikDict; TEI edition 2025.11.21','CC BY-SA 3.0 Unported'),
 'sentences.csv':('https://raw.githubusercontent.com/orgtre/top-open-subtitles-sentences/main/bld/top_sentences/el_top_sentences.csv','orgtre / top-open-subtitles-sentences; OpenSubtitles2018 occurrence counts','Frequency statistics; no subtitle text reused from this source'),
 'ell_sentences_detailed.tsv.bz2':('https://downloads.tatoeba.org/exports/per_language/ell/ell_sentences_detailed.tsv.bz2','Tatoeba sentence authors listed in sentence_attribution','CC BY 2.0 FR'),
 'eng_sentences_detailed.tsv.bz2':('https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences_detailed.tsv.bz2','Tatoeba sentence authors listed in sentence_attribution','CC BY 2.0 FR'),
 'ell-eng_links.tsv.bz2':('https://downloads.tatoeba.org/exports/per_language/ell/ell-eng_links.tsv.bz2','Tatoeba directly linked translations','CC BY 2.0 FR')}
sources=[]
for fn,(url,credit,license) in urls.items():
 b=(DATA/fn).read_bytes();sources.append({'filename':fn,'url':url,'credit':credit,'license':license,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
manifest={'retrieved':'2026-10-16','language':'Modern Greek','words':5000,'sentences':1000,'schema':'Each deck record is [Greek, English].','word_ranking':'Descending aggregated OpenSubtitles2018 form counts, mapped to dictionary headwords; ambiguous forms apportioned. Capitalization variants are added. This is a selected-corpus estimate, not a universal frequency ranking.','sentence_ranking':'Descending observed OpenSubtitles2018 counts for selected directly linked Tatoeba sentence pairs; capitalization/punctuation variants are added. No generated or unobserved sentences are needed.','license_notes':'Adapted dictionary-derived word deck: CC BY-SA 4.0. WikDict input is CC BY-SA 3.0 (forward-compatible adaptation). Tatoeba sentence text: CC BY 2.0 FR; per-sentence authors and IDs below. Statistics do not replace underlying text licenses.','licenses':{'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 3.0 Unported':'https://creativecommons.org/licenses/by-sa/3.0/','CC BY 2.0 FR':'https://creativecommons.org/licenses/by/2.0/fr/'},'sources':sources,'word_attribution':wordmeta,'sentence_attribution':sentmeta,'quality':'Automatic dictionary/POS/form filtering and editorial corrections to selected common labels; not a native-speaker certification or a manual review of every sense. Greek verbs use ordinary present first-person dictionary forms. One plain common English sense is displayed; other meanings may exist.'}
(ROOT/'src/greek-sources.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print(json.dumps({'words':len(words),'sentences':len(sentences),'first20words':words[:20],'first20sentences':sentences[:20],'last_sentence_count':sentmeta[-1]['count']},ensure_ascii=False))
