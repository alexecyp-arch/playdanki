# Modern Greek content

The build inputs are `src/greek-words.json` (5,000 unique headwords) and
`src/greek-sentences.json` (1,000 unique everyday utterances). Each record is
exactly `[Greek, English]`. They contain real dictionary entries and genuine
bilingual examples, with no generated sentence permutations or count padding.

Greek uses the same study interface as the other languages. Modern Greek verbs
normally use the present first-person dictionary form (for example, είμαι / be),
because the language has no ordinary modern infinitive. Past/person forms are
mapped to their headwords rather than deliberately added as extra cards. Common
independent adjective/noun meanings can remain. Exact normalized headword and
sentence duplicates are rejected. Some different Greek words share an English
meaning; these are separate words, not duplicates.

Word ranking is an estimate from Hermit Dave's OpenSubtitles2018 Greek counts.
Capitalization variants are added. Kaikki/Wiktextract supplies Modern Greek
headwords, senses, and inflection evidence. Implausible bare endings/articles
from malformed extracted tables are filtered; explicit form-of relations and
known irregular forms help combine frequencies. Ambiguous forms divide their
count among plausible lemmas, rather than multiplying the count. WikDict
provides an independent bilingual translation reference. Only dictionary-backed
ordinary headwords are selected; archaic, obsolete, dialect-only and pure
inflected entries are filtered. Short dictionary labels are simplified with
`src/greek-word-overrides.tsv`.

Sentence text is directly linked Greek/English Tatoeba data, with contributor
names and both sentence IDs retained in `src/greek-sources.json`. Selection uses
the observed Greek OpenSubtitles2018 sentence counts from orgtre's frequency
statistics, adding punctuation/capitalization variants. All selected 1,000
sentences have observed counts; no lexical-score fallback is used in the final
deck. Common one-word utterances such as greetings belong in this deck.
Proper-name-heavy examples and movie violence/profanity are skipped to favor
ordinary everyday conversation. Some simple English labels are corrected in
`src/greek-sentence-overrides.tsv`; the source English is retained and each
modification marked in the manifest.

These are selected-corpus frequency rankings, not a claim that a universal list
of the 5,000/1,000 most common items exists. Dictionary/POS checks and editorial
corrections do not amount to a native-speaker certification or a manual review
of every possible sense. A compact card displays one useful meaning; many words
have others.

The manifest records exact URLs, SHA-256 values, byte sizes, source editions,
licenses, word ranks/frequencies, and sentence-level attribution. Keep it with
the published decks. Wiktionary/Kaikki-derived adaptations use CC BY-SA 4.0;
the WikDict TEI input specifically states CC BY-SA 3.0 and is adapted forward
under CC BY-SA 4.0. Tatoeba sentences retain CC BY 2.0 FR and their individual
authors. The frequency-statistics inputs do not grant a replacement license
over the underlying sentence text; that text comes from Tatoeba.

Rebuild content with the seven external inputs named in the manifest in an
external directory, then run:

    python scripts/prepare-greek-content.py ../data/greek
    python scripts/prepare-greek-decks.py ../data/greek

The ordinary website build uses the checked-in JSON files and needs no source
downloads or extra runtime dependencies. The large raw data is outside the
website source and is not shipped.
