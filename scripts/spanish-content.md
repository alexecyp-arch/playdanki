Spanish content

The normal website build reads the checked-in Spanish JSON files and does not
download anything. Spanish words contain 5,000 unique native headwords;
Spanish sentences contain 1,000 unique native phrases/sentences. Both values
on each card are displayed at once by the shared flashcard interface.

Rebuild content with Python's standard library:

    python scripts/prepare-spanish.py <source-folder>

The source filenames, URLs, retrieval date and SHA-256 hashes are recorded in
src/spanish-sources.json. The source-folder normally lives outside the source
checkout at ../data/spanish. This is a content-preparation tool, not a runtime
dependency.

Words: Doozan's frequency.csv supplies Spanish dictionary lemmas with inflected
forms aggregated, derived from FrequencyWords/OpenSubtitles counts. The
matching es_merged_50k.txt token counts correct several upstream errors around
object pronouns, possessives and omitted high-frequency words. For example,
the upstream frequency list pools article la into ella; the script separates
the article and pronoun rather than teaching ella as the second most common
word. Homographs share one card and their eligible counts are combined.
Infinitive verbs are used; inflected-only forms, participial adjective forms,
letter names, proper names, spelling variants and subtitle artifacts are
filtered. Common nouns which also happen to match a verb form remain as nouns.
Essential reflexive verbs retain -se in their displayed headword.

English labels start with Wiktionary/Doozan dictionary senses, with WikDict
as a fallback. src/spanish-word-overrides.tsv makes common senses simpler
and corrects obscure or wrong first-sense choices. Word cards use the schema
[Spanish, English, part-of-speech, upstream lemma-or-token rank, count].
Ordering uses descending combined count; original rank is retained for audit.

Sentences: all 1,000 pairs are real, existing bilingual pairs from
ManyThings.org/anki's selected Tatoeba corpus. No generated permutations or
untranslated padding are used. Pairs must match a native sentence in
orgtre/top-open-subtitles-sentences' Spanish OpenSubtitles2018 count list.
Questions must match question punctuation; source bilingual punctuation is
preserved. Names and overly long entries are filtered. Each surviving native
sentence appears once, ordered by descending source occurrence count.
The schema is [Spanish, English, source subtitle rank, occurrence count].

src/spanish-sentence-overrides.tsv records reviewed simpler translations and
corrections of ambiguous/misleading upstream pairs, such as ¿Me tomas el pelo?
as Are you kidding me? Each included pair's original Tatoeba IDs and contributor
names are retained in src/spanish-sources.json. Edited translations are marked.

Licenses: frequency data retains its CC BY-SA 3.0 attribution to FrequencyWords
and Doozan; dictionary extracts retain Wiktionary/WikDict attribution and
CC BY-SA terms. Sentence text retains CC BY 2.0 France attribution to the
individual Tatoeba contributors and ManyThings.org/anki. Counts are corpus
statistics, separate from the bilingual text. These source terms do not
replace each other or assign a blanket license to the website code.

This is a corpus-based ranking of selected eligible vocabulary, not a claim
that one universal ranking exists for every country or type of conversation.
Dictionary and corpus samples received an editorial review with explicit
corrections; this is not a native-speaker certification of every sense.
