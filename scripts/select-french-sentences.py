import sys
import csv,json,re,unicodedata,zipfile
from pathlib import Path
from collections import defaultdict
ROOT=Path(__file__).resolve().parent.parent;DATA=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'data/french'
def norm(s):return re.sub(r'[^\w\s]','',unicodedata.normalize('NFC',s).casefold()).strip()
pairs=defaultdict(list);z=zipfile.ZipFile(DATA/'tatoeba.zip')
for line in z.read('fra.txt').decode('utf-8-sig').splitlines():
    fields=line.split('\t')
    if len(fields)==3:pairs[norm(fields[1])].append(fields)
excluded=re.compile(r'\b(?:Tom|Mary|John|Jack|Joe|Mike|Frank|Bob|Bill|Jimmy|James|David|Peter|Paul|Michael|Danny|Tony|Steve|Kate|Sarah|Susan|Lisa|Jenny|Sean|Luke|Phil|Jake|Walter|Alex|Johnny|George|Charlie|Sam|Harry|Jerry|Jim|Ben|Maggie|Eddie|Nancy|Henry|Henri|Max|Marc|Mark|Merde|Putain|Bordel|Foutu|Connard|Salope|Salaud)\b',re.I)
out=[];seen=set()
for rank,r in enumerate(csv.DictReader((DATA/'sentences.txt').open(encoding='utf8')),1):
    fr=unicodedata.normalize('NFC',r['sentence']).strip();key=norm(fr)
    tokens=re.findall(r'[A-Za-zÀ-ÿœŒ]+',fr)
    if key in seen or not 2<=len(tokens)<=9 or len(fr)>76 or excluded.search(fr) or not re.fullmatch(r'[A-Za-zÀ-ÿœŒ ,’\'\-]+[.!?]',fr):continue
    options=[p for p in pairs[key] if len(p[0])<=85 and len(p[0].split())<=13 and fr.endswith('?')==p[0].endswith('?') and not excluded.search(p[0])]
    en,_,attribution=min(options,key=lambda p:(len(p[0]),p[0])) if options else ('',fr,'Original English translation; French prompt from the OpenSubtitles2018 frequency list.')
    out.append({'french':fr,'english':en,'count':int(r['count']),'rank':rank,'attribution':attribution,'alternatives':list(dict.fromkeys(p[0] for p in options))})
    seen.add(key)
    if len(out)==1150:break
assert len(out)==1150
(DATA/'sentence-candidates.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps({'selected':len(out),'bilingualMatches':sum(bool(r['english']) for r in out)},ensure_ascii=False))
