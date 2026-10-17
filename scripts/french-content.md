French content

The checked-in JSON decks are the normal build inputs. Running
`node scripts/build.mjs` checks all 5,000 headwords and 1,000 sentences and
builds the site without downloads or dependencies.

For a reproducible content rebuild, put the five upstream files in an external
folder, using the filenames and SHA-256 checksums in
`src/french-source-manifest.json`. Then run, in order:

    python scripts/prepare-french-words.py <input-folder>
    python scripts/select-french-sentences.py <input-folder>
    python scripts/write-french-decks.py <input-folder>
    node scripts/build.mjs

Lexique 3.83 supplies subtitle lemma frequencies. Repeated entries for the
same lemma and part of speech use their maximum lemma frequency; frequencies
across parts of speech are added. The highest-ranked dictionary headwords
come first. Alphabet fragments and unsupported entries are filtered. Verb
headwords use infinitives, with essential reflexive pronouns retained; past
participles used as adjectives are omitted. Independent noun meanings remain.
Canonical spellings merge forms such as oeil/œil and clef/clé.

WikDict provides dictionary senses and alternate meanings. The overrides file
supplies the final simple English labels. All 5,000 displayed word pairs were
reviewed; this is an editorial review, not a native-speaker certification.

The short sentence candidates follow OpenSubtitles2018 occurrence counts.
Tatoeba pairs are starting references when available; the English labels are
reviewed and simplified in `src/french-sentence-overrides.tsv`. Bare noun
fragments, subtitle noises, spelling duplicates and names are removed. The
first 1,000 surviving sentences come first by descending source count.
`src/french-sentence-sources.json` retains source counts, source spellings when
changed, and each reused Tatoeba pair's contributor names and identifiers.

This is a ranking of the selected corpus's ordinary vocabulary and phrases,
not a universal ranking across every type of speech and writing. Source files
and their terms are described in `src/credits.txt`; licenses apply to each
component, not as a single replacement license for the collection.

The historical incorrect sentence choices remain in the source format.
The current aim game displays only each record's correct English label.
