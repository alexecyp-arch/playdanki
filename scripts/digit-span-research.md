# Digit Span reference and percentile model

Reference game inspected 2026-10-20: https://digit-span.com/
Its inline presentation loop waits 500 ms, displays one random digit (0–9) for 500 ms, clears it, then waits another 500 ms before the next digit. The last digit clears directly into recall. Repeated digits and leading zeroes are possible. PlayDanki uses this cadence, original code, and its existing indigo theme. It starts at 5 and ends on the first incorrect complete response.

Study: Woods DL et al. (2011), *Improving digit span assessment of short-term verbal memory*, Journal of Clinical and Experimental Neuropsychology 33(1):101–111. DOI: 10.1080/13803395.2010.493149. https://pmc.ncbi.nlm.nih.gov/articles/PMC2978794/

Experiment 2 tested 763 adults aged 18–65. Its longest correctly reported forward list across 14 trials (ML) had a median of 7 digits, mean 6.77 and SD 1.03 (Table 6 and Figure 1 discussion). These are longest-list scores, not summed WAIS trial scores. Its other metrics have different medians and must not be mixed with ML.

The game explicitly displays a **rough, median-based normal approximation**, `100 * Phi((achieved - 7) / 1.03)`. This deliberately anchors 7 digits to the estimated 50th percentile requested by the user. The study does not publish this formula. Its observed distribution was positively skewed; this symmetric model is not its empirical percentile table. Values above 99 are displayed as >99th, rather than spurious tail precision. Below 5 is unmeasured because the game starts at 5, so no percentile is assigned on a first-round failure.

Important limits are visible in the result's collapsed PERCENTILE INFO panel: the study used spoken lists and 14 trials, while this game uses visual digits and one-error termination. These differences, age and practice prevent treating this estimate as a validated population rank for the custom game. It is not an IQ score or the percentage of people who can pass a given length. No visitor data, ranks, or scores are uploaded or collected by the new game.

Checks: `node scripts/check-digit-span.mjs` exercises timing using a fake clock, correct and wrong runs, leading zeroes, editing, ignored presentation inputs, pause cancellation, restart, censoring and percentile bounds. Browser QA covers menu integration, numeric input/keypad, game-over rendering, phone layout and existing navigation.
