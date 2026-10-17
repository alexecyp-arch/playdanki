# Standard-library-only content preparation; see italian-content.md.
import pathlib,json,re,unicodedata
import sys
D=pathlib.Path(sys.argv[1]).resolve();S=pathlib.Path(__file__).resolve().parent.parent/'src'
O={}
for l in (S/'italian-word-overrides.tsv').read_text(encoding='utf-8-sig').splitlines():
 if l and not l.startswith('#'):w,e,p=l.split('|');O[w]=(e,p)
X={l for l in (S/'italian-word-exclusions.txt').read_text(encoding='utf-8-sig').splitlines() if l and not l.startswith('#')}
rows=json.loads((D/'kaikki-selected.json').read_text(encoding='utf8'));by={r[0]:r for r in rows}
# Frequency preserved from the same morphological aggregation for skipped editorial headwords.
import math,collections
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

for w,(e,p) in O.items():by[w]=[w,e,p,round(lf.get(w,0),3)]
part=set()
for l in (D/'morphit.txt').read_text(encoding='utf-8-sig').splitlines():
 f=l.split('\t')
 if len(f)==3 and f[2].startswith('VER:') and 'part' in f[2] and f[0]!=f[1]:part.add(f[0])
rows=[]
for r in by.values():
 w,e,p,c=r
 if w in X or p=='adj' and w in part:continue
 if len(e.split())>7 or re.search(r'\b(?:compound of|Latin script|Italian form|inflection of|diminutive of|augmentative of|superlative of|alternative|obsolete|coordinate|Indicates|person|masculine|feminine|plural|singular)\b',e,re.I):continue
 e=re.sub(r'\s+',' ',e).strip()
 if not e or '�' in e:continue
 rows.append([w,e,p,c])
rows.sort(key=lambda r:(-r[3],r[0]));rows=rows[:5000]
assert len(rows)==5000 and len({r[0] for r in rows})==5000
(S/'italian-words.json').write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(D/'final-review.tsv').write_text('\n'.join(f'{i+1}\t{r[0]}\t{r[1]}' for i,r in enumerate(rows)),encoding='utf8')
O={}
for l in (S/'italian-sentence-overrides.tsv').read_text(encoding='utf-8-sig').splitlines():
 if l and not l.startswith('#'):w,e=l.split('|');O[w]=e
sn=json.loads((D/'sentence-candidates.json').read_text(encoding='utf8'))[:1000];out=[];at=[]
for w,e,c,r,a in sn:out.append([w,O.get(w,e),c,r]);at.append({'italian':w,'source_english':e,'attribution':a,'frequency':c,'source_rank':r,'translation_edited':w in O})
assert len(out)==1000 and len({r[0] for r in out})==1000
(S/'italian-sentences.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(S/'italian-sentence-sources.json').write_text(json.dumps(at,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print('words',len(rows),'sentences',len(out),'overrides',len(O));print(rows[:20])

