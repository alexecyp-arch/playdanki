Additional language cards — 16 October 2026

Spanish, Italian and Modern Greek each provide 5,000 distinct base-word
cards and 1,000 short sentence cards. Korean provides 5,000 dictionary-form
word cards and 40 Hangul letters: 24 basic letters, five tense consonants
and eleven compound vowels. English or the romanized sound is above; the
target-language text is below. Both appear in the same render, with the
existing fixed text sizes, keyboard advance and phone-only Next Card.

The normal build is offline and dependency-free:

    node scripts/build.mjs
    node scripts/export-offline.mjs <output-folder>

`build-languages.mjs` validates all 23,040 new source cards for counts,
unique native text, nonempty bilingual labels and valid Hangul weights.
It emits small two-column word/sentence payloads into dist/languages and
retains the source manifests. These decks load only when selected; the
first German screen does not download all new languages. The standalone
offline export embeds every new deck and needs no language requests.

Korean source preparation:

    python scripts/prepare-korean.py <external-source-folder>

Required files, URLs and SHA-256 values are in src/korean-sources.json.
The Basic Korean Vocabulary List supplies the ranked learner headwords.
Kaikki/Wiktextract's English Wiktionary extraction supplies English
senses; grammatical/obsolete/inflected entries are filtered and common
meanings are simplified in src/korean-word-overrides.tsv. The published
manifest retains sense IDs and marks edited labels. These are selected
corpus/learner-list rankings, not universal frequency rankings. The full
Korean word deck is not native-speaker certified.

Hangul follows the National Institute of Korean Language's modern letter
inventory and Revised Romanization. Sound labels are approximate learning
aids: some sounds vary between syllable-initial and final positions. The
first 40 cards cover every letter in basic-to-compound teaching order.
The remaining 460 repeat letters in proportion to observed letter counts
inside the OpenSubtitles Korean frequency list's syllables. All letters
are covered even if a rare letter receives no additional reviews. Review
order is stable for a local date and changes the next day. The Hangul
cursor resets daily; previous dates stay in history. Replay preserves
practice totals. Korean words use the existing German word-deck policy:
position continues, while each date has its own practice count.

Each new deck has its own browser-storage key. Existing keys, counts,
earlier accuracy records, arithmetic settings and course progress stay
unchanged. LANGUAGES holds only language cards; GAMES holds Programming,
QUANT, Economics, Arithmetic and Trivia. Both menus block advancement
while open, including within embedded games.

Checks:

    node scripts/check-languages-browser.mjs
    node scripts/check-study-browser.mjs

The new browser checks cover deck loading, both visible texts, independent
counts, fixed type sizes, keyboard/phone advance, menu and history guards,
Hangul coverage/weighted review/daily reset, replay, download retry, phone
menu fit and the fully offline language export.
