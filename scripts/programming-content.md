# Programming course

The plan in `src/programming/curriculum-plan.json` was designed before the deck.
The ten `lessons-N.txt` files contain 500 authored micro-lessons in teaching order.
Each line contains nine fields separated by `¦`:

`subject | term | definition | purpose | example | result | mistake | fix | check`

The displayed delimiter above is illustrative; the real delimiter is `¦` so
JavaScript operators and terminal pipelines can appear inside an example.
`card-overrides.json` adds direct comparisons, tool choices and code bug
questions at selected fixed positions without changing the 5,000-card count.
Examples beginning with JS, PY, HTML, CSS, PS or SQL are code; NOTE is a plain
project scenario. Literal `\n` becomes a code line break. Examples are displayed
as text, never executed by the game.

`node scripts/generate-programming.mjs` produces 5,000 structured cards by
revisiting each micro-lesson from ten angles. Repetition is deliberate. Every
question has authored subject matter; there are no numbered placeholders.
The generator checks the 50 lessons per band, IDs, unique questions and exact
subject totals. Weeks 1–8 contain 97 new cards and weeks 9–52 contain 96.
`node scripts/build.mjs` rebuilds the complete website and the course.

The initial per-card fields in cards.json are merged with each browser's
personal record at runtime. The separate localStorage key is
`programming5000:v1`. Other games' storage keys are not changed.
Completed new cards never reset by calendar week or date. Questions, code and
answers appear together. Space or Enter records one ungraded practice
and presents the next card. Course boundaries do not interrupt study. Replay
starts at card 1 while preserving 100% total course progress.

The browser stores new practice in `timesSkipped`, `lastPracticed`, daily
`studyDays` and each curriculum part's `skipped` total. Earlier KNOW / DON'T
KNOW ratings, review dates, correct days and mastery states are preserved.
The older rating scheduler remains readable for compatibility; the current
interface does not use grading or automatic due-review interruptions.

Modern browsers coordinate course writes with the Web Locks API. A saved
presentation token prevents counting the same presentation twice. Read or
write failures use temporary session progress with a visible notice and do
not delete unreadable stored data. New course data loads only when Programming
is opened. Offline export embeds the data in programming.html.

Primary technical references checked during content review are listed in
`src/programming/sources.json`. The original curriculum uses simplified
examples, not copied documentation. Runtime-dependent speech, extension and
packaging examples explicitly require testing the intended environment.
