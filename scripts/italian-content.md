Italian decks

The normal site build uses checked-in JSON only: no network, dictionary runtime,
or new dependencies. Runtime schemas:

- italian-words.json: 5,000 unique [Italian, English, POS, estimated lemma count].
- italian-sentences.json: 1,000 unique [Italian, English, occurrence count, corpus rank].

English comes first in the shared site UI, although these source arrays keep the
same native-first storage convention as the existing language decks. Both sides
appear together. There are no incorrect answers or generated distractors.

Content preparation (Python standard library only)

Download the exact input files listed in src/italian-sources.json into an external
input folder. The Kaikki input is a local gzip copy of the linked JSONL; either
compress it with gzip or supply the downloaded JSONL under that gzip filename
using gzip compression. The upstream uncompressed SHA-256 is recorded separately.
Then run these stages in order:

    python scripts/prepare-italian-candidates.py <input-folder>
    python scripts/prepare-italian-dictionary.py <input-folder>
    python scripts/prepare-italian-select.py <input-folder>
    python scripts/prepare-italian-decks.py <input-folder>
    python scripts/prepare-italian-provenance.py <input-folder>

The initial WikDict candidate stage also selects 1,100 sentence references;
only the first 1,000 surviving directly bilingual matches enter the final deck.
The intermediate JSON and review TSV files stay in the input folder.

Ranking and editing

Italian word forms are grouped into Morph-it dictionary lemmas. Where a form has
several possible lemmas, its frequency is divided in proportion to the square
root of each lemma's own surface frequency. This reduces rare homograph inflation
without pretending to have sentence context. No proper names, conjugation-only
cards or adjective participles are used. Independent dictionary nouns such as
letto (bed), stato (state) and fatto (fact) remain. Essential articles/pronouns
remain separate when they have useful distinct Italian spellings.

Definitions come chiefly from the English Wiktionary extraction at Kaikki.org.
WikDict can supply a short translation only if it appears in the selected
English Wiktionary gloss. Meaning choices are simplified by the checked-in word
overrides. Regional/obsolete senses, malformed entries and subtitle noise are
filtered. All 5,000 final displayed word pairs and all 1,000 sentence pairs were
editorially reviewed; this does not claim native-speaker certification. The
overrides preserve 90 clarified sentence translations and hundreds of glossary
corrections. Short meanings intentionally do not cover every sense of a word.

Sentences follow OpenSubtitles2018 counts, with direct sentence pairs from the
ManyThings/Tatoeba archive. There are no made-up phrase permutations or padding.
The original English, both Tatoeba sentence IDs and contributor names, source
count, corpus rank, and whether the displayed English was edited are retained in
src/italian-sentence-sources.json. Some Italian forms have both polite-second-
person and third-person readings; the selected English shows one valid reading,
with (formal) where needed. Words and sentences reflect the selected subtitle
corpus; they are not a universal ranking of all Italian speech or writing.

Licenses and attribution

- FrequencyWords content: Hermit Dave and contributors, CC BY-SA 4.0.
- Morph-it! 0.4.8: Marco Baroni and Eros Zanchetta, 2004-2009; dual licensed
  CC BY-SA 2.0 / LGPL. The CC BY-SA 2.0 route applies to derived lemma analysis.
- English Wiktionary contributors via Tatu Ylonen / Wiktextract / Kaikki.org:
  CC BY-SA 4.0. The source manifest supplies headword and author-history URL
  templates for attribution and links to the full upstream extraction.
- WikDict edition 2025.11.21: Karl Bartel, Wiktionary contributors and DBnary;
  CC BY-SA 3.0. Used only as a supplemental translation reference.
- Tatoeba contributors / CK at ManyThings: CC BY 2.0 France as marked in each
  reused pair. The mirror is the unchanged 2020-08-23 archive, with source/license
  notices intact; newer upstream downloads may produce different selections.
- orgtre's sentence count list retains the underlying OPUS/OpenSubtitles2018
  corpus terms. It supplies counts; translations are the licensed Tatoeba pairs.

Component terms are preserved separately; these notices do not relicense the
entire website under a single dictionary license. No images, audio, corpus
subtitles or runtime network services are added.
