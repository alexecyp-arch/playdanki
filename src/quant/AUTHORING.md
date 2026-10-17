# QUANT source authoring

This is an original 5,000-card continuous course. Ten deliberately different card perspectives develop each of 500 micro-skills. Bands are internal difficulty metadata only; there are no timed groups or calendar resets.

Use ES modules exporting an array as the default export. Each author owns one file. Records must have:

```
{
 key: 'unique-kebab-key', band: 1, subject: 'statistics', topic: 'Descriptive statistics', concept: 'Mean',
 meaning: 'A simple, precise definition.',
 why: 'A concrete practical use, distinct from the definition.',
 rule: 'The formula or operational rule, with symbols explained.',
 intuition: 'A clear small example or mental picture, distinct from the other fields.',
 example: ['An easy worked question?', 'Answer with calculation and units.'],
 error: ['A specific false claim or flawed action. What is wrong?', 'Correction and reason.'],
 compare: ['A useful distinction or second numeric example?', 'Precise answer.'],
 validate: ['What assumption or evidence must be checked?', 'Clear check and its consequence.'],
 apply: ['A realistic business, research, trading or everyday problem?', 'Short, correct solution.'],
 extend: ['A slightly harder transfer or combined judgement question?', 'Answer, assumptions and reasoning.'],
 formula: '', // Actual formula if appropriate, otherwise empty.
 prerequisites: [], // Other key names; use only earlier-band or earlier-in-file concepts.
 sourceIds: ['nist'],
 checks: [{expression:'(20+40)/2', value:30}] // Optional but strongly encouraged for numeric examples.
}
```

The six question/answer pairs are fully authored original content, not numbered filler. Make all ten perspectives teach different things. Keep language simple and answers short, usually 1–3 sentences. Every quantitative answer needs enough arithmetic to verify it, with clear percentages, percentage points, currency and units. Round explicitly. Never imply guaranteed returns, an estimated edge is certain, a p-value is a hypothesis probability, a confidence interval is a posterior probability, or correlation proves causation.

Source IDs should point to primary/reference sources, with a companion export `sources` as an array of `{id,title,url,note}` if adding a source not already in the common manifest. Verify niche/statistical/financial facts through current primary sources. Do not copy sources verbatim.

Subject quotas by internal difficulty band (1–10):

| Subject | Per band | Total skills | Cards |
| --- | --- | --- | --- |
| statistics | 15 | 150 | 1500 |
| probability | 8 in odd bands, 7 in even bands | 75 | 750 |
| arithmetic | 5 | 50 | 500 |
| decisions | 5 | 50 | 500 |
| papers | 5 | 50 | 500 |
| calculus | 5 | 50 | 500 |
| applications | 3 in odd bands, 4 in even bands | 35 | 350 |
| models | 2 | 20 | 200 |
| product | 1 | 10 | 100 |
| information | 1 | 10 | 100 |

Absolute beginners first. Every band builds on earlier bands. Introduce practical intuition before notation and formulas. First 500 cards must cover percentages, expected value, odds, mean, median, variance/SD, base rates, conditional probability, sample size, risk/reward and drawdowns. Advanced bands emphasize careful judgment and assumptions, not only harder arithmetic. Use later practical examples to revisit earlier concepts.

Interface: simultaneous question and correct answer, one Space/Enter to advance. No targets, reveal, Next button, rating controls, weeks, or daily resets. Skipping counts as practice and never as correctness or proven mastery. Retain requested per-card review fields for storage compatibility, but never invent ratings.
