# Standard-library-only content preparation; see italian-content.md.
import pathlib,json,re,collections,math
import sys
D=pathlib.Path(sys.argv[1]).resolve()
freq={}
for line in (D/'frequency.txt').read_text(encoding='utf8').splitlines():
 try:w,c=line.rsplit(' ',1);freq[w]=int(c)
 except:pass
morph=collections.defaultdict(set);base=collections.defaultdict(set)
for line in (D/'morphit.txt').read_text(encoding='utf-8-sig').splitlines():
 try:w,l,p=line.split('\t');p=p.split(':')[0].split('-')[0]
 except:continue
 if p in {'NPR','SYM','PON','SENT'}:continue
 morph[w].add(l);base[l].add(p)
lf=collections.Counter()
for w,c in freq.items():
 lemmas=morph.get(w)
 if lemmas:
  den=sum(math.sqrt(max(1,freq.get(l,0))) for l in lemmas)
  for l in lemmas:lf[l]+=c*math.sqrt(max(1,freq.get(l,0)))/den
 elif w in base:lf[w]+=c
K=json.loads((D/'kaikki-candidates.json').read_text(encoding='utf8'));C=json.loads((D/'candidates.json').read_text(encoding='utf8'))
reject={'obsolete','archaic','rare','dated','form-of','pejorative','offensive','vulgar','derogatory','historical','dialectal'}
mp={'VER':'verb','AUX':'verb','NOUN':'noun','ADJ':'adj','ADV':'adv','PRE':'prep','PRO':'pron','CON':'conj','DET':'det','INT':'intj','NUM':'num'}
rows=[];missing=[]
for w,of in lf.most_common():
 senses=next((r[4] for r in C if r[0]==w),[])
 if of<100:continue
 ks=K.get(w,[]);poss={mp.get(p,p) for p in base[w]}
 clean=[]
 for r in ks:
  if r['pos'] in {'name','character','symbol','suffix','prefix','interfix'}:continue
  # Infinitives get verb sense; remove participles used only as form-of adjective.
  if w.endswith(('are','ere','ire','rre','rsi')) and any(k['pos']=='verb' for k in ks) and r['pos']!='verb':continue
  for i,s in enumerate(r.get('senses',[])):
   if s.get('form_of') or s.get('alt_of') or reject&set(s.get('tags',[])):continue
   g=s.get('glosses',[''])[-1]
   if not g:continue
   if re.search(r'\b(?:inflection|singular|plural|participle|alternative form|obsolete form|feminine of|masculine of|apocopic|superlative of|comparative of)\b',g,re.I):continue
   clean.append((r['pos'] in poss,r['pos'],i,g))
 if not clean:missing.append(w);continue
 # Prefer morph-it base POS; for bare verbs earlier rule handles homographs.
 clean.sort(key=lambda q:(not q[0],q[2]));_,p,i,g=clean[0]
 g=re.sub(r'\([^()]*\)','',g)
 for _ in range(3):g=re.sub(r'\([^()]*\)','',g)
 g=re.sub(r'\[[^]]*\]','',g).strip();g=g.split(';')[0].strip();g=g.split(',')[0].strip();g=re.sub(r'^to ','',g)
 g=re.sub(r'^(?:a|an) ','',g);g=g.rstrip('.!')
 if len(g)>55 or len(g.split())>8 or re.search(r'[()\[\]�]',g) or re.search(r'\b(?:synonym|used|denotes|especially|chiefly|literally|literary|coordinate|Category|alternative|diminutive|augmentative)\b',g,re.I):
  # A dictionary translation may be used only when attested within this definition.
  opts=[t for s in senses for t in s['translations'] if re.fullmatch(r'[A-Za-z][A-Za-z\x27 -]{0,45}',t) and re.search(r'\b'+re.escape(t)+r'\b',g,re.I)]
  if opts:g=min(opts,key=len)
  else:missing.append(w);continue
 rows.append([w,g,p,round(lf[w],3)])
rows.sort(key=lambda r:(-r[3],r[0]));(D/'kaikki-selected.json').write_text(json.dumps(rows,ensure_ascii=False),encoding='utf8');(D/'review-kaikki.tsv').write_text('\n'.join(f'{i+1}\t{r[0]}\t{r[1]}\t{r[2]}' for i,r in enumerate(rows)),encoding='utf8');print(len(rows),len(missing));print(rows[:30])
