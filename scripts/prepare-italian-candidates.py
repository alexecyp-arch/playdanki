# Standard-library-only content preparation; see italian-content.md.
import pathlib,xml.etree.ElementTree as ET,collections,json,re,math,csv,zipfile,unicodedata
import sys
D=pathlib.Path(sys.argv[1]).resolve()
ns={'t':'http://www.tei-c.org/ns/1.0'}
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
  for l in lemmas:lf[l]+=c/len(lemmas)
 elif w in base:lf[w]+=c
eng={}
for line in (D/'englishFrequency.txt').read_text(encoding='utf8').splitlines():w,c=line.rsplit(' ',1);eng[w]=int(c)
dct=collections.defaultdict(list)
for e in ET.parse(D/'wikdict.tei').findall('.//t:entry',ns):
 w=e.findtext('t:form/t:orth','',ns);p=e.findtext('t:gramGrp/t:pos','',ns)
 for s in e.findall('t:sense',ns):
  tt=[''.join(q.itertext()).strip() for q in s.findall('t:cit[@type="trans"][@{http://www.w3.org/XML/1998/namespace}lang="en"]/t:quote',ns)]
  if tt:dct[w].append({'pos':p,'translations':tt})
mp={'VER':'v','AUX':'v','NOUN':'n','ADJ':'adj','ADV':'adv','PRE':'prep','PRO':'pron','CON':'conj','DET':'determiner','INT':'interjection','NUM':'num'}
can=[]
for w,c in lf.most_common():
 if not re.fullmatch(r'[a-zàèéìòóù]+(?:[-\'][a-zàèéìòóù]+)*',w) or w not in dct:continue
 senses=dct[w];bp=base[w]
 # Only true dictionary infinitives or non-verbal base words.
 if bp <= {'VER','AUX'} and not w.endswith(('are','ere','ire','rre','rsi','arsi','ersi','irsi')):continue
 senses=[s for s in senses if s['pos']!='pn']
 if not senses:continue
 posset={mp.get(p,p) for p in bp}
 matched=[s for s in senses if s['pos'] in posset] or senses
 choices=[]
 for i,s in enumerate(matched):
  for t in s['translations']:
   t=re.sub(r'\([^)]*\)|\[[^]]*\]','',t).strip();t=re.sub(r'^to ','',t)
   if not re.fullmatch(r'[A-Za-z][A-Za-z\x27 -]*',t) or len(t)>48 or len(t.split())>5:continue
   choices.append((i,t,s['pos']))
 if not choices:continue
 def score(x):
  i,t,p=x;tokens=t.lower().split();return -i*1.5+sum(math.log10(eng.get(q,1)+1) for q in tokens)/len(tokens)-.2*(len(tokens)-1)
 _,t,p=max(choices,key=score)
 can.append([w,t,p,round(c,3),matched])
 if len(can)==5500:break
(D/'candidates.json').write_text(json.dumps(can,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(D/'review-words.tsv').write_text('\n'.join(f'{i+1}\t{r[0]}\t{r[1]}\t{r[2]}' for i,r in enumerate(can)),encoding='utf8')
def norm(s):return re.sub(r'[^\w\s]','',unicodedata.normalize('NFC',s).casefold()).strip()
pairs=collections.defaultdict(list);z=zipfile.ZipFile(D/'tatoeba.zip');print(z.namelist())
for line in z.read('ita.txt').decode('utf-8-sig').splitlines():
 f=line.split('\t')
 if len(f)==3:pairs[norm(f[1])].append(f)
exclude=re.compile(r'\b(?:Tom|Mary|John|Jack|Joe|Mike|Frank|Bob|Bill|Jimmy|James|David|Peter|Paul|Michael|Danny|Tony|Steve|Kate|Sarah|Susan|Lisa|Jenny|Sean|Luke|Phil|Jake|Walter|Alex|Johnny|George|Charlie|Sam|Harry|Jerry|Jim|Ben|Maggie|Eddie|Nancy|Henry|Max|Marc|Mark|Merda|Cazzo|Stronzo|Puttana|Vaffanculo)\b',re.I)
out=[];seen=set()
for rank,r in enumerate(csv.DictReader((D/'sentences.csv').open(encoding='utf8')),1):
 it=r['sentence'];k=norm(it);tokens=re.findall(r'[A-Za-zÀ-ÿ]+',it)
 if k in seen or not 2<=len(tokens)<=10 or len(it)>85 or exclude.search(it) or not re.fullmatch(r'[A-Za-zÀ-ÿ ,’\x27\-]+[.!?]',it):continue
 opts=[p for p in pairs[k] if len(p[0])<=95 and len(p[0].split())<=15 and it.endswith('?')==p[0].endswith('?') and not exclude.search(p[0])]
 if not opts:continue
 en,_,attr=min(opts,key=lambda p:(len(p[0]),p[0]));out.append([it,en,int(r['count']),rank,attr]);seen.add(k)
 if len(out)==1100:break
(D/'sentence-candidates.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(D/'review-sentences.tsv').write_text('\n'.join(f'{i+1}\t{r[0]}\t{r[1]}' for i,r in enumerate(out)),encoding='utf8')
print('words',len(can),'sentences',len(out));print(can[:20]);print(out[:20])
