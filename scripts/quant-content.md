# QUANT

The course contains exactly 5,000 cards from 500 original authored micro-skills. Each skill has ten views: meaning, purpose, rule, intuition, worked example, error spotting, comparison, assumption checks, practical application and transfer. Repetition has a teaching purpose; every question is unique after cross-subject terminology is qualified by context.

Source records are in `src/quant/{practical,statistics,probability-calculus,research}.mjs`. `AUTHORING.md` defines the schema. The generator checks field completeness, exact subject quotas, monotonic difficulty, earlier prerequisites, question uniqueness, source references and placeholder exclusions. It interleaves subjects while respecting each authored prerequisite edge. Difficulty bands are internal metadata; the visible course has no calendar or lesson groups.

The weights are statistics30%, probability15%, arithmetic10%, EV/Kelly/decisions10%, papers10%, calculus10%, applications7%, models4%, product2%, information2%. The course starts with percent and includes EV at card41. The first500 cover foundational risk and statistics; the last1000 focus on combined judgment, evidence, costs, dependence and model uncertainty.

Run `node scripts/build.mjs`, `node scripts/test-quant.mjs`, and browser checks with the static preview running. The course is loaded only when selected, keeping the main page and other games light. The offline exporter embeds the full Quant bank in `quant.html`.

Current user-directed flow: question and answer are both visible immediately. Space or Enter advances one card; repeats are ignored. Phones have a small Next Card button at the bottom, hidden on computers. There are no aiming targets, choice boxes, reveal/rating controls or keyboard hints. Font sizes depend only on viewport, never on card length.

Storage key `quant5000:v1` is separate from all other games. Progress never resets by date. Completion is cumulative across replays; per-card `timesSeen` records cards practiced by advancing, while correct/wrong/mastery/due-date fields stay unrated because the user removed grading. The stats panel shows completion, remaining cards, total practice, topic coverage and calendar history. It explicitly displays accuracy/mastery as not rated rather than inventing a score. Authored recurrence replaces wrong-answer/due-card scheduling in this ungraded mode.

Web Locks and persisted presentation tokens reject stale simultaneous advances. A blocked or corrupt store falls back to session memory without deleting the original data. Future source changes retain the separate progress key and stable IDs.
