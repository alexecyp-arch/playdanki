"""Build attested Modern Greek decks from the externally downloaded sources.

Usage: python scripts/prepare-greek-content.py ../data/greek
"""
import sys,json,re,unicodedata,math,collections,csv,bz2,hashlib
from pathlib import Path
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
DATA=Path(sys.argv[1]).resolve()
def norm(s):return unicodedata.normalize('NFC',s).lower().strip()
def bare(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn')
def key(s):return re.sub(r'[^\w\s]','',norm(s))
def isgreek(s):return bool(re.fullmatch(r'[α-ωάέήίόύώϊϋΐΰ]+',s))
freq={}
for l in (DATA/'frequency.txt').read_text(encoding='utf8').splitlines():
 try:w,n=l.rsplit(' ',1);fw=norm(w);freq[fw]=freq.get(fw,0)+int(n)
 except ValueError:pass
entries=collections.defaultdict(list)
for l in (DATA/'kaikki.jsonl').open(encoding='utf8'):
 e=json.loads(l)
 if e.get('lang_code')=='el':entries[norm(e['word'])].append(e)
bad={'archaic','obsolete','dated','rare','dialectal','historical','polytonic','form-of','alt-of','participle'}
allowed={'noun','verb','adj','adv','article','pron','prep','conj','particle','intj','num','det'}
bases={};formmap=collections.defaultdict(set)
for w,es in entries.items():
 if not isgreek(w):continue
 for e in es:
  if e['pos'] not in allowed:continue
  senses=[s for s in e.get('senses',[]) if not (set(s.get('tags',[]))&bad) and not s.get('form_of') and not s.get('alt_of')]
  if not senses:continue
  bases.setdefault(w,[]).append((e,senses))
  for f in e.get('forms',[]):
   if f.get('source') not in ['declension','conjugation'] and not set(f.get('tags',[]))&{'nominative','genitive','accusative','vocative','present','past','imperfect','indicative','imperative','dependent'}:continue
   fw=norm(f.get('form',''))
   # Some extracted Greek tables accidentally contain bare endings/articles.
   # Only accept table forms with a plausible stem; explicit form-of links below
   # still cover irregular inflections such as είπα -> λέω.
   plausible=(len(fw)>=max(3,len(w)-4) and bare(fw)[:2]==bare(w)[:2]) or e['pos'] in {'article','pron','det'}
   if isgreek(fw) and plausible and not set(f.get('tags',[]))&{'rare','archaic','obsolete','dialectal','polytonic','table-tags','inflection-template','participle'}:formmap[fw].add(w)
# Explicit inflected entries provide additional form-to-lemma evidence.
for w,es in entries.items():
 for e in es:
  for s in e.get('senses',[]):
   for target in s.get('form_of',[]):
    tw=norm(target['word'])
    if tw in bases and isgreek(w):formmap[w].add(tw)
ns={'t':'http://www.tei-c.org/ns/1.0'};translations=collections.defaultdict(list)
for e in ET.parse(DATA/'wikdict.tei').findall('.//t:entry',ns):
 raw=e.findtext('t:form/t:orth','',ns)
 if raw!=raw.lower():continue
 w=norm(raw);pos=e.findtext('t:gramGrp/t:pos','',ns)
 for q in e.findall('.//t:cit[@type="trans"][@{http://www.w3.org/XML/1998/namespace}lang="en"]/t:quote',ns):
  t=''.join(q.itertext()).strip();t=re.sub(r'^to ','',t)
  if re.fullmatch(r"[A-Za-z][A-Za-z '’\-]*",t) and len(t)<=48 and len(t.split())<=6:translations[w].append(t)
counts=collections.Counter()
irregular={'είμαι':['είσαι','είναι','είμαστε','είστε','ήμουν','ήσουν','ήταν','ήμασταν','ήσασταν','ήσαν'],'λέω':['είπα','είπες','είπε','είπαμε','είπατε','είπαν','πω','πεις','πει','πούμε','πείτε','πουν'],'βλέπω':['είδα','είδες','είδε','είδαμε','είδατε','είδαν','δω','δεις','δει','δούμε','δείτε','δουν']}
for w,forms in irregular.items():
 for f in forms:formmap[f]={w}
for fw,n in freq.items():
 targets=formmap.get(fw,set())
 if fw in bases:targets=targets|{fw}
 if fw in bases and any(e['pos'] in {'prep','conj','particle','intj','adv'} for e,s in bases[fw]):targets={fw}
 # Ambiguous forms are apportioned, avoiding multiplying corpus counts.
 if targets:
  for w in targets:counts[w]+=n/len(targets)
words=[]
for w,n in counts.most_common():
 if w not in bases or not translations[w]:continue
 t=translations[w][0]
 # English Wiktionary's first ordinary sense is usually clearer than the
 # bilingual list's alphabetically unrelated senses. Retain short plain glosses.
 for e,ss in bases[w]:
  g=ss[0].get('glosses',[''])[0]
  g=re.sub(r'\([^)]*\)','',g).strip();g=re.split(r'[,;:]',g)[0].strip()
  g=re.sub(r'^to ','',g)
  if re.fullmatch(r"[A-Za-z][A-Za-z '’\-]*",g) and len(g)<=42 and len(g.split())<=5 and not re.search(r'\b(?:form|alternative|plural|singular|participle|abbreviation|letter|inflection|synonym)\b',g,re.I):t=g;break
 words.append([w,t,round(n,3)])
(DATA/'word-candidates.json').write_text(json.dumps(words,ensure_ascii=False,indent=1),encoding='utf8')
# Use genuine directly linked, attributed bilingual Tatoeba sentences.
links=collections.defaultdict(set)
for l in bz2.open(DATA/'ell-eng_links.tsv.bz2','rt',encoding='utf8'):
 a,b=l.strip().split('\t');links[a].add(b)
def detailed(lang,ids=None):
 out={}
 for l in bz2.open(DATA/f'{lang}_sentences_detailed.tsv.bz2','rt',encoding='utf8'):
  r=l.rstrip('\n').split('\t')
  if len(r)>=4 and (ids is None or r[0] in ids):out[r[0]]=r
 return out
greek=detailed('ell',set(links));english=detailed('eng',{b for bs in links.values() for b in bs})
sentence_freq=collections.Counter()
for r in csv.DictReader((DATA/'sentences.csv').open(encoding='utf8')):
 sentence_freq[key(r['sentence'])]+=int(r['count'])
name_re=re.compile(r'\b(?:Tom|Mary|John|Boston|Australia|France|French|Japanese|Jack|Mike|Bob|Peter|Alice|Bill|John|Tommy|Nancy|Betty|Jane|English|Japan|Smith|Germany|America)\b')
candidates=[];seen=set()
for gid,r in greek.items():
 g=unicodedata.normalize('NFC',r[2]);k=key(g);tokens=re.findall(r'[α-ωάέήίόύώϊϋΐΰ]+',norm(g))
 if k in seen or not 1<=len(tokens)<=10 or len(g)>92 or re.search('[A-Za-z0-9]',g):continue
 opts=[]
 for eid in links[gid]:
  er=english.get(eid)
  if not er:continue
  en=er[2]
  if name_re.search(en) or not 1<=len(en.split())<=14 or len(en)>100 or not re.fullmatch(r"[A-Za-z ,.!?'’\-;:]+",en):continue
  if re.search(r'\b(?:fuck|shit|bitch|bastard|asshole|kill|shoot|murder|gun|rape|piss|slut|whore|damn|dick|cock)\w*\b',en,re.I):continue
  # Discard proper-name-heavy examples and a few corpus transcription noises.
  if any(t[0].isupper() for t in re.findall(r'[A-Za-z]+',en)[1:] if t not in ['I']):continue
  opts.append((en,eid,er[3]))
 if not opts:continue
 en,eid,author=min(opts,key=lambda x:(len(x[0]),x[0]))
 observed=sentence_freq.get(k,0)
 lexical=math.exp(sum(math.log(freq.get(t,1)) for t in tokens)/len(tokens))/math.sqrt(len(tokens))
 candidates.append({'greek':g,'english':en,'count':observed,'lexical_score':round(lexical,3),'greek_id':gid,'english_id':eid,'greek_author':r[3],'english_author':author})
 seen.add(k)
candidates.sort(key=lambda x:(-bool(x['count']),-x['count'],-x['lexical_score'],x['greek']))
(DATA/'sentence-candidates.json').write_text(json.dumps(candidates,ensure_ascii=False,indent=1),encoding='utf8')
print(json.dumps({'word_candidates':len(words),'sentence_candidates':len(candidates),'sentences_with_observed_counts':sum(bool(x['count']) for x in candidates)},ensure_ascii=False))
