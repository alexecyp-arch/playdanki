import sys
import json, re, unicodedata, csv, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent; DATA=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'data/french'; SRC=ROOT/'src'
normalizations={'oeil':'œil','coeur':'cœur','noeud':'nœud','oeuvre':'œuvre','oeuf':'œuf','boeuf':'bœuf','choeur':'chœur','soeur':'sœur','voeu':'vœu','moeurs':'mœurs','manoeuvre':'manœuvre','foetus':'fœtus','oesophage':'œsophage','oedème':'œdème','coeur-de-pigeon':'cœur-de-pigeon','oeuvrer':'œuvrer','manoeuvrer':'manœuvrer','clef':'clé','papi':'papy','évènement':'événement','media':'média','allo':'allô','nouvel':'nouveau','vieil':'vieux','heu':'euh','bijoux':'bijou','cieux':'ciel','mesdemoiselles':'demoiselle','soûler':'saouler','baseball':'base-ball'}
def clean_french(s):
    s=re.sub(r'^Ca\b','Ça',s)
    s=re.sub(r'^A (?=l\'aide|plus|bientôt|terre|vos ordres|vous|ton avis|tout à l\'heure|moi|demain)','À ',s)
    s=s.replace('Bien sur','Bien sûr').replace('bien sur','bien sûr')
    s=re.sub(r"(S'il (?:te|vous)) plait",r"\1 plaît",s)
    s=re.sub(r'^Ecoute','Écoute',s)
    s=s.replace("Qu'est ce ","Qu'est-ce ").replace('Excusez moi','Excusez-moi')
    return s
def norm(s):return re.sub(r'[^\w\s]','',unicodedata.normalize('NFC',clean_french(s)).casefold()).strip()
overrides={}
for line in (SRC/'french-word-overrides.tsv').read_text(encoding='utf8').splitlines():
    if not line.strip() or line.startswith('#'):continue
    w,en,pos,*extra=line.split('|');overrides[normalizations.get(w,w)]=[en,pos,(extra[0].split(';') if extra else [])]
excluded=set()
exclude_file=SRC/'french-word-exclusions.txt'
if exclude_file.exists():excluded={s.strip() for s in exclude_file.read_text(encoding='utf8').splitlines() if s.strip() and not s.startswith('#')}
words={}
# Omit verb participles used as adjectives; noun homographs such as été (summer)
# and reçu (receipt) remain independent dictionary headwords.
verb_participles=set()
for row in csv.DictReader((DATA/'lexique.txt').open(encoding='utf8'),delimiter='\t'):
    if row['cgram']=='VER' and 'par:pas' in row['infover'] and row['ortho']!=row['lemme']:
        verb_participles.add(row['ortho'])
for r in json.loads((DATA/'word-candidates.json').read_text(encoding='utf8')):
    word=normalizations.get(r['word'],r['word'])
    if word in excluded or (r['pos']=='adj' and word in verb_participles and word!='parfait'):continue
    en=r['english'];en=en if en=='I' else en.lower()
    pos=r['pos'];aliases=r['aliases']
    if word in overrides:en,pos,extra=overrides[word];aliases=[*aliases,*extra]
    aliases=list(dict.fromkeys([en,*(a if a=='I' else a.lower() for a in aliases)]))
    if pos=='v':word={'enfuir':"s'enfuir",'méfier':'se méfier','marrer':'se marrer','moquer':'se moquer','suicider':'se suicider','approprier':"s'approprier",'remarier':'se remarier','ressaisir':'se ressaisir'}.get(word,word)
    entry=[word,en,pos,aliases,r['frequency']]
    if word not in words or words[word][4]<entry[4]:words[word]=entry
for w,pos,freq in json.loads((DATA/'missing-words.json').read_text(encoding='utf8')):
    word=normalizations.get(w,w)
    if word in overrides and word not in words and word not in excluded:
        en,pos,extra=overrides[word]
        if pos=='v':word={'enfuir':"s'enfuir",'méfier':'se méfier','marrer':'se marrer','moquer':'se moquer','suicider':'se suicider','approprier':"s'approprier",'remarier':'se remarier','ressaisir':'se ressaisir'}.get(word,word)
        words[word]=[word,en,pos,list(dict.fromkeys([en,*extra])),freq]
words=sorted(words.values(),key=lambda r:(-r[4],r[0]))[:5000]
assert len(words)==5000
(SRC/'french-words.json').write_text(json.dumps(words,ensure_ascii=False,separators=(',',':')),encoding='utf8')
sentences=json.loads((DATA/'sentence-candidates.json').read_text(encoding='utf8'))
sentence_overrides={};so=SRC/'french-sentence-overrides.tsv'
if so.exists():
    for line in so.read_text(encoding='utf8').splitlines():
        if not line.strip() or line.startswith('#'):continue
        fr,en=line.split('|');sentence_overrides[norm(fr)]=en
sentence_exclusions=set();sf=SRC/'french-sentence-exclusions.txt'
if sf.exists():sentence_exclusions={norm(s) for s in sf.read_text(encoding='utf8').splitlines() if s.strip() and not s.startswith('#')}
unique_sentences={}
for r in sentences:
    original=r['french'];r['french']=clean_french(original)
    if r['french']!=original:r['source_french']=original
    key=norm(r['french'])
    if key not in sentence_exclusions and key not in unique_sentences:unique_sentences[key]=r
sentences=list(unique_sentences.values())[:1000]
for r in sentences:
    r['english']=sentence_overrides.get(norm(r['french']),r['english'])
assert len(sentences)==1000
assert all(r['english'].strip() for r in sentences),[r['french'] for r in sentences if not r['english'].strip()]
stop={'i','you','he','she','it','we','they','me','him','her','us','them','a','an','the','am','is','are','be','been','being','do','does','did','have','has','had','to','of','in','on','at','and','or','that','this','there','here','s','m','ll','re','t','can','could','would','should','will','not','no','yes','your','my','his','our','their'}
def content(s):return set(re.findall(r'[a-z]+',s.lower()))-stop
deck=[];sources=[]
for i,r in enumerate(sentences):
    valid={norm(t) for t in r['alternatives']};valid.add(norm(r['english']))
    tokens=content(r['english']);wrong=None
    for offset in range(1,len(sentences)):
        other=sentences[(i+offset*137)%len(sentences)]['english']
        if norm(other) not in valid and not (tokens & content(other)):
            wrong=other;break
    assert wrong and norm(wrong)!=norm(r['english']),r
    deck.append([r['french'],r['english'],wrong,r['count']])
    sources.append({'french':r['french'],**({'source_french':r['source_french']} if 'source_french' in r else {}),'subtitle_rank':r['rank'],'count':r['count'],'attribution':r['attribution'],'translation_edited':norm(r['french']) in sentence_overrides})
(SRC/'french-sentences.json').write_text(json.dumps(deck,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(SRC/'french-sentence-sources.json').write_text(json.dumps(sources,ensure_ascii=False,separators=(',',':')),encoding='utf8')
print(json.dumps({'frenchWords':len(words),'frenchSentences':len(deck),'wordEdits':len(overrides),'sentenceEdits':len(sentence_overrides),'firstWords':words[:8],'firstSentences':deck[:5]},ensure_ascii=False))
