# German common-word game: 1,200 cards

Reviewed 13 November 2026. The archived 5,000-card dictionary source is unchanged.
The active learner deck is rebuilt by `select-german-words.mjs`.

## Evidence and selection

The primary evidence is the Leibniz Institute for the German Language's
Lexical Explorer, using FOLK **private conversation** counts from its public
Categories table: https://www.owid.de/lexex/ . This historical extract must not
be described as the complete latest FOLK release. Public/institutional speech
counts are not used in the ordering.

The secondary check is Hermit Dave's FrequencyWords German OpenSubtitles2018
list: https://github.com/hermitdave/FrequencyWords . Every teaching headword
must also occur among its 10,000 highest-frequency written word forms. This
is independent evidence of common dialogue use, not another recording of the
same conversations. Subtitle counts and private-conversation counts are not
added, since the corpora have different sizes.

The dated factual snapshot, source addresses and hashes are checked into
`german-frequency-snapshot.json`. The original secondary file was
`content/2018/de/de_50k.txt`; only its first 10,000 word/count/rank facts are
retained here. FrequencyWords code is MIT; content is CC BY-SA 4.0, attributed
to Hermit Dave and the OPUS/OpenSubtitles contributors. Retain this attribution
and source manifest with adaptations. No transcript sentences are copied.

`german-frequency-rules.mjs` documents the normalization and exclusions.
Personal/place names, incomplete stems, foreign fragments and reviewed
transcription artefacts are excluded. FOLK's existing lexicographic filter is
used, with explicit exceptions for productive numerals and normal spoken forms
such as `raus`, `dran`, `Handy` and `Job`.

Inflections and selected variants are grouped into teaching headwords. Case
homographs share one card; this count is not a sense-specific frequency.
Common contractions such as `im`, `zum`, `beim` remain separate usable words.
New and corrected English meanings are recorded in
`src/german-common-overrides.tsv`, including corrections for homographs such
as Ei/ei, Rücken/rücken and Arm/arm.

The selection contains the top 1,199 eligible normalized headwords by recorded
private-conversation count, plus `sich`. That essential reflexive pronoun is
not a standalone lemma in this extract's pronoun lemmatization, but is
independently verified at OpenSubtitles word-form rank 46. It is an explicit
teaching exception, not an invented FOLK count. Ties sort alphabetically.

Surviving previous words retain their card positions. Vacant slots are filled
in selected frequency order, then the remaining words fill positions
1,001–1,200. The existing private progress key and saved cursor are retained.
Historical practice/accuracy records are not erased or relabelled.

## Limits and checks

There is no single scientifically provable universal top 1,200 of everyday
German. Speaker, region, setting, age, and the decision to count forms or
headwords all change the ranking. FOLK includes particular private activities;
subtitles contain fiction. This is a reproducible corpus-checked common-word
selection, not a claim of perfect rank for every German speaker today.

Build output `german/frequency-audit.json` supplies each word's meaning,
observed variants, conversation count and independent subtitle rank/count.
The game does not download this audit at startup.

Run `node scripts/build.mjs`, `node scripts/check-german-frequency.mjs`,
`node scripts/check-lazy-words.mjs`, and
`node scripts/check-loading-security.mjs`. These check the full selection,
the independent corpus evidence, exact count, duplicate/name exclusions,
reviewed homographs, the 32-word initial seed and the lazy-loaded 1,200-card
deck. Browser checks additionally verify the enlarged count, advancing beyond
the former 1,000-card boundary and retaining a saved cursor on reload.
