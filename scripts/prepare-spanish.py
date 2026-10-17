"""Rebuild the Spanish decks from the source files recorded in spanish-sources.json."""
import csv, hashlib, json, re, sys, unicodedata, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

ROOT=Path(__file__).resolve().parent.parent
DATA=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT.parent/'data/spanish'
SRC=ROOT/'src'
def norm(s):return re.sub(r'[^\w\s]','',unicodedata.normalize('NFC',s).casefold()).strip()
def sentence_key(s):return (norm(s),'?' in s)
def clean(s):
    # Keep a short dictionary gloss, never an inflection/form-of definition.
    if re.search(r'\b(?:form of|participle of|plural of|feminine of|singular of|spelling of|inflection of|alternative form|obsolete|archaic|misspelling|pronunciation spelling)\b',s,re.I):return ''
    while re.search(r'\([^()]*\)|\[[^\[\]]*\]',s):s=re.sub(r'\([^()]*\)|\[[^\[\]]*\]','',s)
    s=re.sub(r'\bto\s+(?=[a-z])','',s.strip())
    s=re.sub(r'\s+',' ',s).strip(' ,;:')
    s=s.split(';')[0].strip()
    return s if len(s)<=65 and len(s.split())<=10 and re.fullmatch(r"[A-Za-z' ,?/-]+",s) else ''

dictionary=defaultdict(list)
for block in (DATA/'es-en.data').read_text(encoding='utf8').split('_____\n'):
    if not block.strip():continue
    lines=block.strip().splitlines();word=lines[0];pos=None
    for line in lines[1:]:
        if line.startswith('pos: '):pos=line[5:]
        elif line.startswith('  gloss: '):dictionary[(word,pos)].append(line[9:])
ns={'t':'http://www.tei-c.org/ns/1.0'}
wikdict=defaultdict(list)
for entry in ET.parse(DATA/'wikdict.tei').findall('.//t:entry',ns):
    w=entry.findtext('t:form/t:orth','',ns);pos=entry.findtext('t:gramGrp/t:pos','',ns)
    for q in entry.findall('.//t:cit[@type="trans"][@{http://www.w3.org/XML/1998/namespace}lang="en"]/t:quote',ns):
        t=clean(''.join(q.itertext()))
        if t:wikdict[(w,pos)].append(t)

overrides={}
for line in (SRC/'spanish-word-overrides.tsv').read_text(encoding='utf8').splitlines():
    if line and not line.startswith('#'):
        w,en=line.split('|');overrides[w]=en
exclusions=set((SRC/'spanish-word-exclusions.txt').read_text(encoding='utf8').splitlines())
spellings={'éste':'este','ése':'ese','aquél':'aquel','sólo':'solo'}
frequencies={};raw=[]
for rank,row in enumerate(csv.DictReader((DATA/'lemma-frequency.csv').open(encoding='utf8')),1):
    w=row['spanish'];pos=row['pos'];count=int(row['count']);canonical=spellings.get(w,w)
    if canonical in exclusions or (len(w)==1 and w not in {'a','e','o','u','y'}) or not re.fullmatch(r'[a-záéíóúüñ]+(?:[- ][a-záéíóúüñ]+)*',w):continue
    if pos in {'prop','letter','suffix','prefix','participle','part','phrase','none'} and w not in overrides:continue
    if pos=='v' and not re.search(r'(?:ar|er|ir|ír)(?:se)?$',w):continue
    if pos=='adj' and re.search(r'(?:ado|ido)$',w) and any((w[:-3]+ending,'v') in dictionary for ending in ['ar','er','ir','ír']) and w not in overrides:continue
    candidates=[t for s in dictionary.get((w,pos),[]) if (t:=clean(s))]
    if not candidates:candidates=wikdict.get((w,pos),[])
    if not candidates and w not in overrides:continue
    en=overrides.get(w,candidates[0] if candidates else '')
    if not en or re.search(r'\b(?:pronoun|article|prepositional|masculine|feminine|indicates|denotes|expresses|substitutes|refers|used to|Senses|letter:)\b',en,re.I):continue
    # Keep reflexive verbs in their usable dictionary form.
    canonical={'arrepentir':'arrepentirse','suicidar':'suicidarse','esforzar':'esforzarse','atrever':'atreverse','fugar':'fugarse','desmayar':'desmayarse','arrodillar':'arrodillarse'}.get(canonical,canonical)
    if canonical in frequencies:
        # Merge homographs into a single card while preserving their frequencies.
        frequencies[canonical][4]+=count
        continue
    frequencies[canonical]=[canonical,en if en=='I' else en.lower(),pos,rank,count]
    raw.append({'word':w,'pos':pos,'glosses':dictionary.get((w,pos),[]),'chosen':en})
# The lemma source pools object clitics/possessives into subject pronouns and
# omits several high-frequency function words. Split those using its matching
# original token-count file; do not teach 'ella' as if it meant the article 'la'.
token_rows=[line.rsplit(None,1) for line in (DATA/'merged-frequency.txt').read_text(encoding='utf8').splitlines()]
tokens={w:int(c) for w,c in token_rows}
token_ranks={w:i+1 for i,(w,c) in enumerate(token_rows)}
core={
    'el':('the','art',['el','la','los','las']),
    'ella':('she / her','pron',['ella','ellas']),
    'él':('he / him','pron',['él','ellos']),
    'yo':('I','pron',['yo']),
    'tú':('you','pron',['tú']),
    'nosotros':('we','pron',['nosotros','nosotras']),
    'mío':('mine','determiner',['mío','mía','míos','mías']),
    'tuyo':('yours','determiner',['tuyo','tuya','tuyos','tuyas']),
    'suyo':('his / hers / theirs','determiner',['suyo','suya','suyos','suyas']),
    'no':('no / not','adv',['no']),
    'un':('a / an','art',['un','una','unos','unas']),
    'uno':('one','num',['uno']),
    'mi':('my','determiner',['mi','mis']),
    'tu':('your','determiner',['tu','tus']),
    'su':('his / her / its / their','determiner',['su','sus']),
    'me':('me','pron',['me']),
    'te':('you (object)','pron',['te']),
    'nos':('us / ourselves','pron',['nos']),
    'os':('you (plural object, Spain)','pron',['os']),
    'le':('to him / to her','pron',['le','les']),
    'lo':('it / him (object)','pron',['lo']),
    'mí':('me (after a preposition)','pron',['mí']),
    'ti':('you (after a preposition)','pron',['ti']),
    'muy':('very','adv',['muy']),
    'nada':('nothing','pron',['nada']),
    'ni':('neither / nor','conj',['ni']),
    'mamá':('mom','n',['mamá']),
}
for w,(en,pos,forms) in core.items():
    count=sum(tokens.get(f,0) for f in forms)
    assert count>0,w
    frequencies[w]=[w,en,pos,token_ranks[w],count]
words=sorted(frequencies.values(),key=lambda r:(-r[4],r[3],r[0]))[:5000]
assert len(words)==5000,len(words)
assert len({norm(r[0]) for r in words})==5000
(DATA/'word-audit.json').write_text(json.dumps(raw,ensure_ascii=False,indent=1),encoding='utf8')
(DATA/'word-review.txt').write_text('\n'.join(f'{i+1}. {r[0]} | {r[1]} | {r[2]}' for i,r in enumerate(words)),encoding='utf8')
(SRC/'spanish-words.json').write_text(json.dumps(words,ensure_ascii=False,separators=(',',':')),encoding='utf8')

pairs=defaultdict(list)
for line in zipfile.ZipFile(DATA/'tatoeba.zip').read('spa.txt').decode('utf-8-sig').splitlines():
    a=line.split('\t')
    if len(a)==3:pairs[norm(a[1])].append(a)
excluded_names=re.compile(r'\b(?:Tom|Mary|John|Jack|Joe|Mike|Frank|Bob|Bill|Jimmy|James|David|Peter|Paul|Michael|Danny|Tony|Steve|Kate|Sarah|Susan|Lisa|Jenny|Sean|Luke|Phil|Jake|Walter|Alex|Johnny|George|Charlie|Sam|Harry|Jerry|Jim|Ben|Maggie|Eddie|Nancy|Henry|Max|Mark)\b',re.I)
sentence_overrides={}
sf=SRC/'spanish-sentence-overrides.tsv'
if sf.exists():
    for line in sf.read_text(encoding='utf8').splitlines():
        if line and not line.startswith('#'):
            es,en=line.split('|');sentence_overrides[sentence_key(es)]=en
sentences=[];attributions=[];seen=set()
for rank,r in enumerate(csv.DictReader((DATA/'sentences.csv').open(encoding='utf8')),1):
    es=unicodedata.normalize('NFC',r['sentence']);key=norm(es)
    if key in seen or excluded_names.search(es) or not 1<=len(es.split())<=10 or len(es)>85:continue
    options=[p for p in pairs[key] if not excluded_names.search(p[0]) and len(p[0])<=100 and len(p[0].split())<=15 and ('?' in es)==('?' in p[1])]
    if not options:continue
    en,source_es,attr=min(options,key=lambda p:(len(p[0]),p[0]))
    # Source pairs supply correct Spanish punctuation; corpus supplies rank only.
    es=source_es;edited=sentence_key(es) in sentence_overrides;en=sentence_overrides.get(sentence_key(es),en)
    sentences.append([es,en,rank,int(r['count'])]);seen.add(key)
    attributions.append({'spanish':es,'english':en,'subtitle_rank':rank,'subtitle_count':int(r['count']),'attribution':attr,'translation_edited':edited})
    if len(sentences)==1000:break
assert len(sentences)==1000,len(sentences)
assert len({norm(r[0]) for r in sentences})==1000
(SRC/'spanish-sentences.json').write_text(json.dumps(sentences,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(DATA/'sentence-review.txt').write_text('\n'.join(f'{i+1}. {r[0]} | {r[1]}' for i,r in enumerate(sentences)),encoding='utf8')
urls={'lemma-frequency.csv':'https://raw.githubusercontent.com/doozan/spanish_data/master/frequency.csv','merged-frequency.txt':'https://raw.githubusercontent.com/doozan/spanish_data/master/es_merged_50k.txt','es-en.data':'https://raw.githubusercontent.com/doozan/spanish_data/master/es-en.data','wikdict.tei':'https://download.wikdict.com/dictionaries/tei/recommended/spa-eng.tei','sentences.csv':'https://raw.githubusercontent.com/orgtre/top-open-subtitles-sentences/main/bld/top_sentences/es_top_sentences.csv','tatoeba.zip':'https://www.manythings.org/anki/spa-eng.zip'}
manifest={'retrieved':'2026-10-16','word_schema':['Spanish','English','part_of_speech','source_lemma_or_token_rank','combined_frequency'],'sentence_schema':['Spanish','English','source_sentence_rank','occurrence_count'],'word_licenses':['CC BY-SA 3.0: FrequencyWords/Doozan lemma frequencies','CC BY-SA: Wiktionary dictionary extracts via Doozan (upstream README does not specify version; preserve Wiktionary attribution and share-alike terms)','CC BY-SA 3.0: WikDict dictionary extracts, as specified in spa-eng.tei availability header'],'sentence_license':'CC BY 2.0 France: Tatoeba contributors, via ManyThings.org/anki; corpus occurrence counts from orgtre/OpenSubtitles2018','ranking_note':'Corpus-based frequency among eligible unique dictionary headwords and bilingual sentences; not a universal frequency ranking. Homograph counts combined. Core clitics, possessives and omitted function words corrected/split with matching original token counts. Only existing corpus-matched bilingual sentences, no generated padding.','sources':[{'filename':n,'url':u,'bytes':(DATA/n).stat().st_size,'sha256':hashlib.sha256((DATA/n).read_bytes()).hexdigest()} for n,u in urls.items()],'sentence_attributions':attributions}
(SRC/'spanish-sources.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps({'words':len(words),'sentences':len(sentences),'eligibleWords':len(frequencies),'firstWords':words[:20],'firstSentences':sentences[:20]},ensure_ascii=False))
