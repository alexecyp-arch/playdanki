# Standard-library-only content preparation; see italian-content.md.
import pathlib,gzip,json,collections,re
import sys
D=pathlib.Path(sys.argv[1]).resolve();words=set()
for line in (D/'morphit.txt').read_text(encoding='utf-8-sig').splitlines():
 try:w,l,p=line.split('\t')
 except:continue
 if re.fullmatch(r'[a-zàèéìòóù]+(?:[-\x27][a-zàèéìòóù]+)*',l):words.add(l)
out=collections.defaultdict(list)
with gzip.open(D/'kaikki-Italian.jsonl.gz','rt',encoding='utf8') as f:
 for line in f:
  r=json.loads(line)
  if r['word'] in words:out[r['word']].append({'pos':r['pos'],'senses':[{k:v for k,v in s.items() if k in {'glosses','tags','form_of','alt_of'}} for s in r.get('senses',[])]})
(D/'kaikki-candidates.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8');print('lemmas',len(out))
