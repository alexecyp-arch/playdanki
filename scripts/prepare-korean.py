"""Build Korean dictionary-form words and 40 Hangul sound cards from documented files.
Usage: python scripts/prepare-korean.py <external-data-folder>
No network requests or third-party Python packages are needed for this step.
"""
import collections, hashlib, html, json, pathlib, re, sys, unicodedata

ROOT=pathlib.Path(__file__).resolve().parent.parent
DATA=pathlib.Path(sys.argv[1])
def write(name,value):
    (ROOT/'src'/name).write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
def normalize(s):return unicodedata.normalize('NFC',s).strip()
ranks={}
for p in DATA.glob('*.html'):
    for li in re.findall(r'<li[^>]*>(.*?)</li>',p.read_text(encoding='utf8'),re.S):
        text=html.unescape(re.sub('<[^>]+>','',li))
        m=re.match(r'(\d+)\.\s*([가-힣]+)\s*-',text)
        if m:ranks[m[2]]=min(ranks.get(m[2],999999),int(m[1]))
allowed={'noun','verb','adj','adv','pron','det','num','conj','intj','counter','particle'}
excluded={'form-of','archaic','obsolete','dialectal','North-Korea','historical','rare','dated','uncommon','nonstandard'}
dictionary=collections.defaultdict(list)
attested=collections.defaultdict(list)
for line in (DATA/'dictionary.jsonl').open(encoding='utf8'):
    entry=json.loads(line);word=entry['word']
    if word not in ranks or entry['pos'] not in allowed:continue
    for sense in entry.get('senses',[]):
        if sense.get('form_of') or excluded.intersection(sense.get('tags',[])):continue
        if sense.get('glosses'):attested[word].append({'english':'','pos':entry['pos'],'id':sense.get('id'),'raw':sense['glosses'][-1]})
        for raw in sense.get('glosses',[])[-1:]:
            if re.search(r'\b(?:form of|spelling of|causative of|hanja|hanmun|conjugation|abbreviation|initialism|letter of|name of the|various idiomatic|forms certain|used as an element|after certain)\b',raw,re.I):continue
            gloss=re.sub(r'\([^)]*\)','',raw);gloss=re.sub(r'^to\s+','',gloss)
            gloss=re.sub(r'\s+',' ',gloss).strip(' .,;:').split(';')[0].split(',')[0].strip()
            gloss=re.sub(r'^(?:a|an|the)\s+','',gloss)
            if gloss and len(gloss)<=65 and len(gloss.split())<=10 and re.fullmatch(r"[A-Za-z0-9 '’/\-]+",gloss):
                dictionary[word].append({'english':gloss,'pos':entry['pos'],'id':sense.get('id'),'raw':raw})
overrides={}
for line in ((ROOT/'src/korean-word-overrides.tsv').read_text(encoding='utf8')+'\n'+((ROOT/'src/korean-review-overrides.tsv').read_text(encoding='utf8') if (ROOT/'src/korean-review-overrides.tsv').exists() else '')).splitlines():
    if line and not line.startswith('#'):
        w,en=line.split('\t');overrides[w]=en
exclusions=set((ROOT/'src/korean-word-exclusions.txt').read_text(encoding='utf8').splitlines())
cards=[];attributions=[];review=[]
for word,rank in sorted(ranks.items(),key=lambda pair:(pair[1],pair[0])):
    if not dictionary[word] and word in overrides and attested[word]:dictionary[word]=attested[word]
    if word in exclusions or not dictionary[word]:continue
    source=dictionary[word][0];meaning=overrides.get(word,source['english'])
    cards.append([word,meaning,rank]);attributions.append({'word':word,'rank':rank,'sense':source['id'],'edited':word in overrides})
    review.append({'word':word,'english':meaning,'rank':rank,'source':source['raw'],'options':list(dict.fromkeys(x['english'] for x in dictionary[word]))})
    if len(cards)==5000:break
assert len(cards)==5000,('insufficient sourced headwords',len(cards),len(ranks))
assert len({c[0] for c in cards})==5000
write('korean-words.json',cards)
(DATA/'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding='utf8')

# Modern letters: 14 basic consonants, 10 basic vowels, 5 tense consonants,
# and 11 compound vowels. Romanization labels are short learning aids.
letters=[
('ㄱ','g / k'),('ㄴ','n'),('ㄷ','d / t'),('ㄹ','r / l'),('ㅁ','m'),('ㅂ','b / p'),('ㅅ','s'),('ㅇ','silent initially / ng finally'),('ㅈ','j'),('ㅊ','ch (aspirated)'),('ㅋ','k (aspirated)'),('ㅌ','t (aspirated)'),('ㅍ','p (aspirated)'),('ㅎ','h'),
('ㅏ','a'),('ㅑ','ya'),('ㅓ','eo'),('ㅕ','yeo'),('ㅗ','o'),('ㅛ','yo'),('ㅜ','u'),('ㅠ','yu'),('ㅡ','eu'),('ㅣ','i'),
('ㄲ','kk (tense)'),('ㄸ','tt (tense)'),('ㅃ','pp (tense)'),('ㅆ','ss (tense)'),('ㅉ','jj (tense)'),
('ㅐ','ae'),('ㅒ','yae'),('ㅔ','e'),('ㅖ','ye'),('ㅘ','wa'),('ㅙ','wae'),('ㅚ','oe'),('ㅝ','wo'),('ㅞ','we'),('ㅟ','wi'),('ㅢ','ui')]
initial='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';medial='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
final=['','ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
weights=collections.Counter()
for line in (DATA/'frequency.txt').read_text(encoding='utf8').splitlines():
    token,count=line.rsplit(' ',1);count=int(count)
    for c in token:
        if '가'<=c<='힣':
            syllable=ord(c)-0xac00
            weights[initial[syllable//588]]+=count;weights[medial[(syllable%588)//28]]+=count
            for letter in final[syllable%28]:weights[letter]+=count
hangul=[[symbol,sound,max(1,weights[symbol])] for symbol,sound in letters]
assert len(hangul)==len({c[0] for c in hangul})==40
write('korean-hangul.json',hangul)
downloads=[]
for p in sorted(DATA.iterdir()):
    if p.suffix=='.html' or p.name in ['dictionary.jsonl','frequency.txt']:
        url=('https://kaikki.org/dictionary/Korean/kaikki.org-dictionary-Korean.jsonl' if p.name=='dictionary.jsonl' else 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/ko/ko_50k.txt' if p.name=='frequency.txt' else 'https://en.wiktionary.org/wiki/Appendix:Basic_Korean_Vocabulary_List'+('' if p.stem=='basic' else '/Above_10,000' if p.stem=='10000' else '/'+p.stem))
        downloads.append({'filename':p.name,'url':url,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
write('korean-sources.json',{'retrieved':'2026-10-16','words':5000,'symbols':40,'dailySymbolGoal':500,'wordRanking':'First 5,000 supported unique modern dictionary headwords in the Basic Korean Vocabulary List order; homographs merged. A selected learner-list ranking, not a universal usage ranking.','wordLicense':'Wiktionary contributors, CC BY-SA 4.0. Adapted English glosses; source entry is https://en.wiktionary.org/wiki/<word>#Korean. History at the same URL with action=history. Dictionary extracted by Kaikki/Wiktextract.','hangulSources':['https://www.korean.go.kr/eng_hangeul/principle/001.html','https://www.korean.go.kr/front_eng/roman/roman_01.do'],'symbolPractice':'All 40 letters first, then weighted review to 500. Weights count letters inside syllables of the OpenSubtitles Korean surface-token frequency list, including final consonants. Romanization is an approximation; sounds depend on context.','frequencyLicense':'FrequencyWords CC BY-SA 4.0; https://github.com/hermitdave/FrequencyWords','downloads':downloads,'entries':attributions,'editorialReview':'Automated exclusion of inflections/nonmodern senses; explicit common-word gloss corrections. Complete deck is not native-speaker certified.'})
print(json.dumps({'rankedHeadwords':len(ranks),'supported':sum(bool(v) for v in dictionary.values()),'cards':len(cards),'symbols':len(hangul),'maxRank':cards[-1][2]}))
