import sys
import csv, io, json, re, math, unicodedata, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict

ROOT=Path(__file__).resolve().parent.parent
DATA=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'data/french'
ns={'t':'http://www.tei-c.org/ns/1.0'}
def norm(s):
    return re.sub(r'[^\w\s]', '', unicodedata.normalize('NFC',s).casefold()).strip()
def clean(s):
    s=re.sub(r'\([^)]*\)|\[[^]]*\]','',s)
    s=re.sub(r'^to\s+','',s,flags=re.I)
    return re.sub(r'\s+',' ',s).strip(' ,;:')
english={}
for line in (DATA/'englishFrequency.txt').read_text(encoding='utf8').splitlines():
    w,c=line.rsplit(' ',1);english[w.casefold()]=int(c)
dictionary=defaultdict(list)
tree=ET.parse(DATA/'wikdict.tei')
for entry in tree.findall('.//t:entry',ns):
    word=entry.findtext('t:form/t:orth','',ns)
    pos=entry.findtext('t:gramGrp/t:pos','',ns)
    for sense in entry.findall('t:sense',ns):
        quotes=[clean(''.join(q.itertext())) for q in sense.findall('t:cit[@type="trans"][@{http://www.w3.org/XML/1998/namespace}lang="en"]/t:quote',ns)]
        definition=' '.join(' '.join(d.itertext()) for d in sense.findall('.//t:def',ns))
        if quotes:dictionary[word.casefold()].append({'pos':pos,'translations':quotes,'definition':definition})
(DATA/'dictionary.json').write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')),encoding='utf8')
posmap={'NOM':'n','VER':'v','AUX':'v','ADJ':'adj','ADV':'adv','PRE':'prep','PRO':'pron','CON':'conj','ART':'article','ONO':'interjection'}
rows=list(csv.DictReader((DATA/'lexique.txt').open(encoding='utf8'),delimiter='\t'))
frequencies=defaultdict(dict)
invalid=0
for r in rows:
    lemma=r['lemme']
    try:frequency=float(r['freqlemfilms2'])
    except (ValueError,TypeError):invalid+=1;continue
    if not lemma or not re.fullmatch(r'[a-zàâäéèêëîïôöùûüÿœæç]+(?:[-’\'][a-zàâäéèêëîïôöùûüÿœæç]+)*',lemma) or frequency<=0:continue
    pos=posmap.get(r['cgram'].split(':')[0],r['cgram'])
    frequencies[lemma][pos]=max(frequency,frequencies[lemma].get(pos,0))
def value(t):
    toks=re.findall(r"[a-z]+(?:'[a-z]+)?",t.casefold())
    return sum(math.log10(english.get(w,1)+1) for w in toks)/max(1,len(toks))-.15*max(0,len(toks)-1)
candidate_words=[];missing=[]
for lemma,by_pos in sorted(frequencies.items(),key=lambda r:(-sum(r[1].values()),r[0])):
    pos=max(by_pos,key=by_pos.get)
    senses=dictionary.get(lemma.casefold(),[])
    matched=[s for s in senses if s['pos']==pos] or senses
    choices=list(dict.fromkeys(t for s in matched for t in s['translations'] if t and len(t)<=48 and len(t.split())<=6 and not re.search(r'[0-9;:/{}]|^\W|^(?:sb|sth)\.?$',t) and re.fullmatch(r"[A-Za-z' -]+",t)))
    if not choices:
        missing.append([lemma,pos,sum(by_pos.values())]);continue
    first={t:min(i for i,s in enumerate(matched) if t in s['translations']) for t in choices}
    best=max(choices,key=lambda t:value(t)-.2*first[t])
    aliases=list(dict.fromkeys(t for s in senses for t in s['translations'] if t and len(t)<65))
    candidate_words.append({'word':lemma,'english':best,'pos':pos,'aliases':aliases,'frequency':round(sum(by_pos.values()),6),'senses':matched})
    if len(candidate_words)>=5400:break
(DATA/'word-candidates.json').write_text(json.dumps(candidate_words,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(DATA/'missing-words.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2),encoding='utf8')

print(json.dumps({'wordCandidates':len(candidate_words),'missingWords':len(missing),'malformedLexiqueRows':invalid}))
