// Original worked examples; bands describe difficulty, never calendar periods.
export const sources = [
  {id:'quant-stat-nist',title:'NIST/SEMATECH e-Handbook of Statistical Methods',url:'https://www.itl.nist.gov/div898/handbook/',note:'Reference checks for descriptive statistics, sampling, intervals, tests and diagnostics.'},
  {id:'quant-stat-asa',title:'American Statistical Association statement on p-values',url:'https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf',note:'Primary professional statement; p-value interpretation and limits.'},
  {id:'quant-stat-cochrane',title:'Cochrane Handbook, Chapter 10: Analysing data and undertaking meta-analyses',url:'https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10',note:'Reference checks for effect measures, synthesis, heterogeneity and prediction intervals.'},
  {id:'quant-stat-bh',title:'Benjamini and Hochberg (1995), Controlling the False Discovery Rate',url:'https://www.math.tau.ac.il/~ybenja/MyPapers/benjamini_hochberg1995.pdf',note:'Original multiple-testing procedure; examples are independently authored.'},
  {id:'quant-stat-holm',title:'Holm (1979), A Simple Sequentially Rejective Multiple Test Procedure',url:'https://doi.org/10.2307/4615733',note:'Original step-down familywise-error procedure.'},
  {id:'quant-stat-causal',title:'Hernan and Robins, Causal Inference: What If',url:'https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/',note:'Author-hosted text; confounding, selection, causal assumptions and sensitivity.'},
  {id:'quant-stat-estimation',title:'Statlect: Point estimation',url:'https://www.statlect.com/fundamentals-of-statistics/point-estimation',note:'Author-written reference for estimator bias, consistency and efficiency.'},
  {id:'quant-stat-mixed',title:'Penn State STAT 502: Random Effects and Introduction to Mixed Models',url:'https://online.stat.psu.edu/stat502/Lesson06',note:'University reference for variance components and mixed models.'},
  {id:'quant-stat-survival',title:'Penn State STAT 509: Objectives, Endpoints, and Estimation',url:'https://online.stat.psu.edu/stat509/Lesson06',note:'University reference for event-time outcomes and censoring.'},
  {id:'quant-stat-discrete',title:'Penn State STAT 504: Analysis of Discrete Data',url:'https://online.stat.psu.edu/stat504/',note:'University reference for risks, odds, counts and categorical analyses.'},
  {id:'quant-stat-panel',title:'Stata: Interpreting the intercept in the fixed-effects model',url:'https://www.stata.com/support/faqs/statistics/intercept-in-fixed-effects-model/',note:'Official model documentation; fixed/within versus random-effects assumptions.'},
  {id:'quant-stat-robust',title:'Stata: Robust inference for linear models',url:'https://www.stata.com/features/overview/robust-inference-for-linear-models/',note:'Official reference for heteroskedasticity- and cluster-robust standard errors.'},
  {id:'quant-stat-cluster',title:'Abadie, Athey, Imbens and Wooldridge: When Should You Adjust Standard Errors for Clustering?',url:'https://arxiv.org/abs/1710.02926',note:'Primary methodological research; uncertainty depends on sampling and assignment design.'},
  {id:'quant-stat-regression',title:'Penn State STAT 501: Regression Methods',url:'https://online.stat.psu.edu/stat501/',note:'University reference checks for residuals, assumptions and multicollinearity.'},
  {id:'quant-stat-km',title:'Stanford STAT331: Kaplan-Meier estimator',url:'https://web.stanford.edu/~lutian/coursepdf/unit5.pdf',note:'University reference for risk sets, product-limit estimation and independent censoring.'},
  {id:'quant-stat-missing',title:'van Buuren and Groothuis-Oudshoorn: mice, Multivariate Imputation by Chained Equations',url:'https://www.jstatsoft.org/article/view/v045i03',note:'Primary software/methods paper for imputation models and diagnostics.'},
  {id:'quant-stat-rubin',title:'mice reference: Combine estimates by pooling rules',url:'https://amices.org/mice/reference/pool.html',note:'Author-maintained reference for Rubin variance pooling and model inputs.'},
  {id:'quant-stat-equivalence',title:'JASP: Frequentist and Bayesian Equivalence Testing',url:'https://jasp-stats.org/2020/06/02/frequentist-and-bayesian-equivalence-testing-in-jasp/',note:'Official statistical software reference for two one-sided equivalence tests.'},
  {id:'quant-stat-noninferiority',title:'FDA: Non-Inferiority Clinical Trials',url:'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/non-inferiority-clinical-trials',note:'Primary guidance checked for statistical margins and interpretation; all examples are hypothetical.'},
  {id:'quant-stat-scoring',title:'Gneiting and Raftery: Strictly Proper Scoring Rules, Prediction, and Estimation',url:'https://sites.stat.washington.edu/people/raftery/Research/PDF/Gneiting2007jasa.pdf',note:'Primary paper checked for probabilistic forecast evaluation and Brier scoring.'}
];

const records = [];
function s(band,key,topic,concept,meaning,why,rule,intuition,pairs,opt={}) {
  records.push({key:`stat-${key}`,band,subject:'statistics',topic,concept,meaning,why,rule,intuition,
    example:pairs[0],error:pairs[1],compare:pairs[2],validate:pairs[3],apply:pairs[4],extend:pairs[5],
    formula:opt.formula||'',prerequisites:(opt.pre||[]).map(k=>`stat-${k}`),
    sourceIds:opt.sources||['quant-stat-nist'],checks:opt.checks||[]});
}

// 1: Describe a small dataset before drawing conclusions.
s(1,'observation','Data basics','Observation','One recorded value or event.','Define what each row counts.','Choose one unit, such as one person or one trade.','One receipt is one purchase observation.',[
 ['Five people each report one age. How many observations?','5 observations.'],
 ['One user clicks ten times. Is this ten different users?','No. Ten clicks can come from one user.'],
 ['What differs between a user and a click as a data unit?','A user is a person; a click is an event.'],
 ['What must be clear before counting rows?','What each row represents, including duplicate records.'],
 ['A store has 12 receipts but 9 customers. How many purchases?','12 purchases; customer count is 9.'],
 ['Why can repeated rows for one person distort a user average?','That person receives more weight than people with fewer rows.']
]);
s(1,'population-sample','Data basics','Population and sample','The population is the group of interest; a sample is the part observed.','Separate the target group from available data.','Name the population before collecting a sample.','Tasting a spoonful samples the soup.',[
 ['You survey 20 of 200 employees. What is the sample?','The 20 surveyed employees.'],
 ['Twenty surveyed workers are all workers everywhere. What is wrong?','A sample does not become the whole target population.'],
 ['In that survey, what is the population?','The 200 employees, if that is the stated target.'],
 ['What must a survey report besides its sample size?','Who was eligible and how people were selected.'],
 ['You inspect 50 of 1,000 parts. What fraction was inspected?','50/1,000 = 5%.'],
 ['Can a sample of one country describe every country automatically?','No. Different populations may behave differently.']
],{pre:['observation'],checks:[{expression:'50/1000*100',value:5}]});
s(1,'variable-types','Data basics','Variable','A characteristic that can differ across observations.','Choose summaries that fit the data.','Numbers measure amounts; categories label groups.','Age measures an amount; eye color names a category.',[
 ['Is purchase price a numerical variable?','Yes; its numerical size has meaning.'],
 ['Average the category codes 1=red, 2=blue. Why is this misleading?','The codes are labels; their average is not a color.'],
 ['How do counts differ from measurements?','Counts are discrete; measurements can vary continuously.'],
 ['What should you check for a numerical variable?','Its units and the meaning of missing or impossible values.'],
 ['A product costs €8 and another €12. What is their average price?','(8 + 12)/2 = €10.'],
 ['Is a postal code quantitative because it uses digits?','Usually no; it labels a place rather than measuring an amount.']
],{pre:['observation'],checks:[{expression:'(8+12)/2',value:10}]});
s(1,'frequency','Data basics','Frequency','How many times a value or category appears.','See common outcomes without reading every row.','Count each occurrence using the chosen data unit.','A tally mark records one occurrence.',[
 ['Results are A, B, A, A. What is the frequency of A?','3 occurrences.'],
 ['A appears three times, so its frequency is 75. What is confused?','Frequency is 3; relative frequency is 75%.'],
 ['What differs between frequency and total sample size?','Frequency counts a category; sample size counts all observations.'],
 ['What should category counts sum to when categories are exclusive and complete?','The total number of observations.'],
 ['Out of 20 orders, 6 are returned. What is the return frequency?','6 returns.'],
 ['Why must overlapping categories be marked clearly?','One observation can count in several categories, so totals may exceed the sample size.']
],{pre:['variable-types']});
s(1,'mean','Descriptive statistics','Mean','The sum of values divided by their count.','Find average spending, time or return.','Add all values, then divide by how many values there are.','Share the total equally among the observations.',[
 ['What is the mean of 2, 4 and 6?','(2 + 4 + 6)/3 = 4.'],
 ['For 2, 4 and 6, someone divides 12 by 2. What is wrong?','There are 3 values, so divide by 3.'],
 ['Mean of €5 and €15 versus total spending?','Mean = €10; total = €20.'],
 ['What should you check before averaging measurements?','That their units and definitions match.'],
 ['Three delivery times are 10, 20 and 30 minutes. Average?','60/3 = 20 minutes.'],
 ['Four trades total €80 profit. What is mean profit per trade?','80/4 = €20, including every trade in that total.']
],{pre:['variable-types'],formula:'mean = sum of values / number of values',checks:[{expression:'(2+4+6)/3',value:4},{expression:'80/4',value:20}]});
s(1,'median','Descriptive statistics','Median','The middle value after sorting the data.','Describe a typical value when a few extremes distort the mean.','Sort first; choose the middle value for an odd count.','Line up people by height; the middle person marks the median.',[
 ['What is the median of 1, 9 and 2?','Sort to 1, 2, 9; median = 2.'],
 ['Take the middle listed value of 1, 9, 2. What is wrong?','The values must be sorted first.'],
 ['For 1, 2, 9, how do mean and median differ?','Mean = 4; median = 2.'],
 ['When can a median be especially useful?','When the distribution is skewed or has extreme values.'],
 ['Pay values are €10, €12, €100. What is the median?','€12; the large value does not pull the median to €40.67.'],
 ['Why report both mean and median spending?','Their difference can reveal that a few large purchases pull the mean upward.']
],{pre:['mean'],checks:[{expression:'(1+2+9)/3',value:4}]});
s(1,'mode','Descriptive statistics','Mode','The most frequent value or category.','Identify a popular product or common response.','Find the largest frequency; ties can produce several modes.','The biggest stack of tally marks identifies the mode.',[
 ['What is the mode of 2, 2, 3 and 7?','2, appearing twice.'],
 ['The mode must be the largest value. What is wrong?','The mode is the most frequent value, not the largest.'],
 ['What is the mode of red, blue, red?','Red; a mode works for categories too.'],
 ['What should you report if two values tie for highest frequency?','Both modes, rather than inventing one winner.'],
 ['Sizes sold: S=5, M=12, L=8. Which size is the mode?','M, with 12 sales.'],
 ['Can every dataset have a uniquely useful mode?','No. Ties or all-distinct values may leave no useful single mode.']
],{pre:['frequency']});
s(1,'range','Descriptive statistics','Range','The maximum minus the minimum.','Get a quick measure of spread.','Subtract the smallest value from the largest.','The range spans the two ends of a row of measurements.',[
 ['What is the range of 3, 7 and 10 meters?','10 − 3 = 7 meters.'],
 ['For 3, 7, 10, the range is 10+3. What is wrong?','Range uses subtraction, not addition.'],
 ['Can 1, 2, 10 and 1, 9, 10 have the same range?','Yes. Both ranges are 9, despite different interior values.'],
 ['What can strongly change the range?','One extreme value or measurement error.'],
 ['Daily sales range from €80 to €150. What is the range?','150 − 80 = €70.'],
 ['Why is range alone a poor description of typical variability?','It uses only the two extremes and ignores the other values.']
],{pre:['variable-types'],formula:'range = maximum − minimum',checks:[{expression:'10-3',value:7}]});
s(1,'variance-intuition','Spread and uncertainty','Variance intuition','A measure of squared distance from the mean.','Separate stable results from widely scattered results.','Find distances from the mean, square them, then average for a full population.','Squaring prevents positive and negative distances from cancelling.',[
 ['Population values are 2 and 4. Mean 3: what are squared distances?','(2−3)² = 1 and (4−3)² = 1.'],
 ['Average signed distances from the mean to measure spread. Why does that fail?','They cancel to zero even when values differ.'],
 ['Which is more spread out: 4,4 or 2,6?','2,6; both means are 4, but only that pair varies.'],
 ['What must you distinguish before dividing squared distances?','A full population versus a sample estimate; their denominators differ.'],
 ['A full population is 0 and 10. Mean 5: what is its variance?','(25 + 25)/2 = 25 squared units.'],
 ['What does variance zero mean?','All values are identical; their distances from the mean are zero.']
],{pre:['mean'],formula:'population variance = average squared distance from the mean',checks:[{expression:'(25+25)/2',value:25}]});
s(1,'sd-intuition','Spread and uncertainty','Standard deviation intuition','The square root of variance, measured in the original units.','Describe spread in units such as euros or meters.','Take the positive square root of variance.','Undo the squaring to return to the measurement scale.',[
 ['Variance is 25 euros squared. What is standard deviation?','√25 = €5.'],
 ['Standard deviation of €5 means every value is €5 from the mean. Why wrong?','It summarizes spread; individual distances differ.'],
 ['Same mean, SD €2 versus €20: which has more spread?','The €20 SD group.'],
 ['What else matters before treating SD as a risk summary?','Distribution shape and extreme outcomes.'],
 ['A full population is 8 and 12 meters. What is its SD?','Mean 10; variance 4; SD = 2 meters.'],
 ['Does small SD guarantee no large loss?','No. Rare extreme losses may be absent from the observed sample.']
],{pre:['variance-intuition'],formula:'SD = √variance',checks:[{expression:'Math.sqrt(25)',value:5},{expression:'Math.sqrt(((8-10)**2+(12-10)**2)/2)',value:2}]});
s(1,'sample-size','Sampling basics','Sample size','The number of observations in a sample.','Judge how much evidence an average or rate uses.','Report n with the estimate; also check how data were collected.','One coin toss tells less than many well-collected tosses.',[
 ['A survey receives 40 usable answers. What is n?','n = 40.'],
 ['A million biased answers guarantees a correct estimate. What is wrong?','More data reduces some random error, not systematic bias.'],
 ['Is 1 win from 1 trade as informative as 1,000 from 1,000?','No; both observed rates are 100%, but their uncertainty differs.'],
 ['What should be checked beyond the row count?','Independence, selection and missing observations.'],
 ['A sample has 15 buyers and 35 non-buyers. What is n?','15 + 35 = 50.'],
 ['Why might 100 trades from one day offer less evidence than 100 diverse days?','Trades within one day can share the same market conditions.']
],{pre:['population-sample'],checks:[{expression:'15+35',value:50}]});
s(1,'observed-rate','Data basics','Observed rate','The number of observed events divided by the number of eligible opportunities.','Measure conversion, returns or trade wins.','Use a denominator that matches the event definition.','Count the slices eaten out of all available slices.',[
 ['8 of 40 visitors buy. What is the observed conversion rate?','8/40 = 20%.'],
 ['8 purchases divided by 8 buyers gives visitor conversion. What is wrong?','The denominator must include all eligible visitors.'],
 ['Why do 2/10 and 200/1,000 both give 20%?','They have the same proportion but different amounts of evidence.'],
 ['What must be checked when comparing two rates?','The same event, eligibility rules and measurement window.'],
 ['12 returns among 300 orders: return rate?','12/300 = 4%.'],
 ['Can a rate above 100% ever occur?','Yes for repeated events per opportunity, but not a proportion of exclusive successes.']
],{pre:['frequency','sample-size'],formula:'observed proportion = events / eligible observations',checks:[{expression:'8/40*100',value:20},{expression:'12/300*100',value:4}]});
s(1,'outlier','Descriptive statistics','Outlier','A value unusually far from the rest.','Spot errors or important extreme events.','Investigate the cause before deciding how to handle it.','One very tall tower stands apart from nearby houses.',[
 ['Values are 9, 10, 11, 100. Which deserves investigation?','100, because it is far from the others.'],
 ['Delete every surprising value automatically. Why is that unsafe?','A surprising value may be genuine and important.'],
 ['Which changes more after adding €1,000 to many small purchases: mean or median?','Usually the mean; the exact change depends on the dataset.'],
 ['What should you check before removing an outlier?','Measurement, data entry and a rule set independently of the desired result.'],
 ['A price recorded as €999 instead of €9.99 is confirmed. What action?','Correct the documented entry error and record the correction.'],
 ['Why retain a genuine trading crash in a risk study?','Removing it would hide a real loss and understate tail risk.']
],{pre:['mean','median']});
s(1,'correlation-intuition','Association basics','Correlation intuition','A summary of how two measured variables move together.','Notice patterns worth explaining or testing.','Look at paired measurements; association alone does not establish cause.','Two lines can rise together without one pushing the other.',[
 ['Hotter days have more ice-cream sales. What pattern is shown?','A positive association between temperature and sales.'],
 ['Ice-cream sales cause sunburn because both rise together. What is wrong?','A shared cause such as hot weather can raise both.'],
 ['What differs between positive and negative association?','Positive: higher with higher; negative: higher with lower.'],
 ['What graph helps check an association between two numbers?','A scatterplot of paired values.'],
 ['Price rises while units sold tend to fall. What direction?','Negative association, without proving price caused the change.'],
 ['Why compare similar seasons when studying sales and temperature?','Season may affect both variables and confuse the relationship.']
],{pre:['variable-types']});
s(1,'uncertainty','Sampling basics','Statistical uncertainty','Limited knowledge because observations and assumptions are incomplete.','Avoid treating a noisy estimate as an exact fact.','Report the estimate with its evidence and uncertainty.','A small flashlight reveals only part of a large room.',[
 ['A trader wins 6 of 10 trades. Is the true win chance known exactly?','No. The observed rate is 60%; the long-run chance remains uncertain.'],
 ['The sample mean is €20, so the population mean must be €20. What is wrong?','A sample estimate can differ from the population value.'],
 ['What differs between uncertainty and observed spread?','Spread describes variation in values; uncertainty describes limited knowledge.'],
 ['What can an honest estimate disclose?','Sample size, collection method, assumptions and a suitable uncertainty interval.'],
 ['Two shops estimate demand from 5 versus 500 random customers. Which often has less sampling uncertainty?','The 500-customer sample, if collection quality and conditions are comparable.'],
 ['Can more precise data still support a wrong causal claim?','Yes. Precision cannot repair a flawed causal assumption.']
],{pre:['sample-size','observed-rate']});

// 2: Compare centers, tails and distributions using explicit conventions.
s(2,'weighted-mean','Descriptive statistics','Weighted mean','An average that gives observations different amounts of influence.','Combine groups without treating unequal groups as equally large.','Multiply each value by its weight; divide by the sum of weights.','A larger classroom contributes more pupils to the school average.',[
 ['10 sales average €20 and 30 sales average €40. Combined mean?','(10×20 + 30×40)/40 = €35.'],
 ['Average €20 and €40 to combine unequal groups. What is wrong?','That gives the groups equal weight instead of weighting their sizes.'],
 ['With equal weights, how does a weighted mean compare with the ordinary mean?','They are identical.'],
 ['What must the weights represent?','The intended influence, such as counts, probabilities or justified precision weights.'],
 ['A grade is 60% exam at 80 and 40% project at 90. Overall score?','0.6×80 + 0.4×90 = 84.'],
 ['Group averages use different outcome definitions. Can weighting fix this?','No. Their definitions must first be made comparable.']
],{pre:['mean'],formula:'weighted mean = Σ(w×x) / Σw',checks:[{expression:'(10*20+30*40)/40',value:35},{expression:'.6*80+.4*90',value:84}]});
s(2,'even-median','Descriptive statistics','Median with an even count','The average of the two middle sorted values under the usual convention.','Summarize samples without a single middle observation.','For even n, average positions n/2 and n/2+1 after sorting.','Two central seats straddle the middle of an even row.',[
 ['Median of 2, 4, 10, 20?','(4 + 10)/2 = 7.'],
 ['Choose 4 as the median of four sorted values. What is omitted?','The other middle value, 10, must also be used.'],
 ['For 2,4,10,20, what is the mean versus median?','Mean = 9; median = 7.'],
 ['What should be checked when software reports a quantile?','Its interpolation convention, especially for a small sample.'],
 ['Sorted incomes are €1,000, €1,200, €1,800, €8,000. Median?','(1,200 + 1,800)/2 = €1,500.'],
 ['Must the median be an observed value?','No. An even-sample median may lie between two observed values.']
],{pre:['median'],checks:[{expression:'(4+10)/2',value:7},{expression:'(2+4+10+20)/4',value:9}]});
s(2,'percentile','Descriptive statistics','Percentile','A threshold locating a specified share of ordered values.','Describe high latencies or unusually large outcomes.','The 90th percentile marks roughly 90% at or below it; ties and conventions matter.','A percentile labels a position along a sorted line.',[
 ['A latency p90 is 200 ms. What does this describe?','Roughly 90% of measured latencies are at or below 200 ms.'],
 ['p90 of 200 ms means average latency is 200 ms. Why wrong?','A percentile is an ordered threshold, not an average.'],
 ['Which shows a slower tail more clearly: median or p99 latency?','p99 focuses on the slowest roughly 1%; the median describes the middle.'],
 ['What affects percentile comparison across tools?','Sample size, ties, interpolation and the measurement window.'],
 ['Exactly 95 of 100 requests finish within 500 ms. What share exceeds 500 ms?','5/100 = 5%.'],
 ['Why is a p99 estimate unstable from only 20 requests?','Very few observations inform that extreme tail.']
],{pre:['median','observed-rate']});
s(2,'iqr','Descriptive statistics','Interquartile range','The difference between the 75th and 25th percentiles.','Summarize the spread of the central half of a distribution.','IQR = Q3 − Q1.','Measure the middle section of the sorted row, ignoring distant ends.',[
 ['Q1 is €10 and Q3 is €30. What is IQR?','€30 − €10 = €20.'],
 ['IQR describes the full range of all observations. Why wrong?','It describes the central half, not both extremes.'],
 ['Why can IQR remain small when one extreme value grows?','A distant extreme may leave the middle quartiles unchanged.'],
 ['What should be specified for quartiles in small samples?','The method used to select or interpolate them.'],
 ['Q1=12 meters and Q3=18 meters. Central spread?','IQR = 6 meters.'],
 ['Does an IQR of zero prove all observations are equal?','No. The central half can be tied while the tails differ.']
],{pre:['percentile'],formula:'IQR = Q3 − Q1',checks:[{expression:'30-10',value:20}]});
s(2,'histogram','Descriptive statistics','Histogram','A plot grouping numerical values into intervals.','Reveal concentration, skew and multiple clusters.','Use ordered bins; disclose their widths and what bar heights represent.','Stack observations into neighboring numerical buckets.',[
 ['10 observations fall in a price bin. What is that bin’s count?','10 observations.'],
 ['Unequal-width histogram bars are compared by count-height alone. What can mislead?','Wide bins naturally collect more values; density bars use area to show share.'],
 ['How does a histogram differ from a category bar chart?','Histogram bins represent numerical intervals with an order.'],
 ['What should you vary to check whether a shape is real?','Bin widths and boundaries; one arbitrary choice can hide patterns.'],
 ['A histogram has peaks near €5 and €50. What might explain this?','Two customer groups; inspect the underlying data before deciding.'],
 ['Can one histogram prove the population has two distinct groups?','No. Sample noise and bin choices can create apparent peaks.']
],{pre:['frequency','variable-types']});
s(2,'right-skew','Distribution shape','Right skew','A distribution with a longer tail toward larger values.','Understand why mean spending may exceed typical spending.','Inspect the shape; rare large values often pull the mean upward.','Most houses are small, with a few very tall towers.',[
 ['Values 1,1,2,2,14 have which conspicuous tail?','A right tail toward 14.'],
 ['Right skew means most values are large. Why wrong?','It means the longer tail extends toward large values.'],
 ['For 1,1,2,2,14, mean versus median?','Mean = 20/5 = 4; median = 2.'],
 ['What should accompany a mean for strongly right-skewed data?','A median, tail percentiles and preferably a plot.'],
 ['Most users spend €0–€10; a few spend €1,000. What summary may better describe a typical user?','The median, with the mean also reported for total-revenue questions.'],
 ['Does positive skew guarantee mean exceeds median for every possible distribution?','No. That ordering is a common pattern, not a universal theorem.']
],{pre:['mean','median','histogram'],sources:['quant-stat-nist'],checks:[{expression:'(1+1+2+2+14)/5',value:4}]});
s(2,'left-skew','Distribution shape','Left skew','A distribution with a longer tail toward smaller values.','Interpret scores or capped measurements with a low tail.','Find which side has the longer tail, not which side has most observations.','Many high scores with a few very low scores form a left tail.',[
 ['Scores are 10,80,90,90,100. Which tail is longer?','The left tail, toward 10.'],
 ['A left-skewed distribution must contain negative numbers. Why wrong?','Tail direction is about relative position, not the sign of values.'],
 ['For 10,80,90,90,100, mean versus median?','Mean = 74; median = 90.'],
 ['What can produce an artificial left tail?','A ceiling that compresses high scores; inspect the measurement scale.'],
 ['Most exam scores are near the maximum with a few low scores. Likely skew?','Left skew; check the full distribution.'],
 ['Can shifting every value upward change the skew direction?','No. Adding a constant shifts location but preserves shape.']
],{pre:['right-skew'],checks:[{expression:'(10+80+90+90+100)/5',value:74}]});
s(2,'relative-frequency','Data basics','Relative frequency','A category’s count divided by the total count.','Compare samples of different sizes.','Divide category frequency by n; multiply by 100 for a percentage.','A slice’s share of the whole pie.',[
 ['A occurs 9 times in 30 observations. Relative frequency?','9/30 = 30%.'],
 ['Group A has more successes, so its rate is higher. Why can this fail?','It may also have many more observations.'],
 ['20/100 versus 30/200: which observed rate is higher?','20% versus 15%; the first is 5 percentage points higher.'],
 ['What should complete exclusive category shares sum to?','100%, allowing for rounding.'],
 ['2 complaints from 50 orders versus 3 from 100. Compare rates.','4% versus 3%; the first is 1 percentage point higher.'],
 ['Is an observed 30% frequency automatically the true future probability?','No. Sampling uncertainty and changing conditions matter.']
],{pre:['frequency','observed-rate'],checks:[{expression:'9/30*100',value:30},{expression:'2/50*100',value:4}]});
s(2,'sample-variance','Spread and uncertainty','Sample variance','An estimate of population variance using squared deviations and n−1.','Estimate population spread from a sample.','s² = sum of squared deviations from the sample mean divided by n−1.','The mean was fitted from the same data, costing one degree of freedom.',[
 ['Sample values are 2 and 4. What is s²?','Mean 3; (1+1)/(2−1) = 2.'],
 ['Use n−1 for a sample of one value. What fails?','The denominator is zero; sample variance cannot be estimated that way.'],
 ['For values 2,4, sample variance versus full-population variance?','Sample estimate 2; full-population variance 1.'],
 ['When is this estimator unbiased for population variance?','For independent, identically distributed observations with finite variance.'],
 ['Sample 1,2,3 has mean 2. What is sample variance?','(1+0+1)/(3−1) = 1.'],
 ['Is sample SD exactly unbiased because sample variance is unbiased?','No. Taking a square root is nonlinear; sample SD has its own bias.']
],{pre:['variance-intuition','sample-size'],formula:'s² = Σ(x − mean)² / (n − 1)',checks:[{expression:'(1+1)/(2-1)',value:2},{expression:'(1+0+1)/(3-1)',value:1}]});
s(2,'population-sd','Spread and uncertainty','Population standard deviation','Spread of a specified full population in its original units.','Distinguish descriptive population spread from a sample estimate.','Compute the population mean, divide squared deviations by N, then take the square root.','Measure every object in the box rather than estimating from a handful.',[
 ['A full population has values 0,0,4,4. What is SD?','Mean 2; variance 4; SD = 2.'],
 ['Divide a full-population squared sum by N−1. What changes?','You calculate the sample-style estimate instead of that population’s variance.'],
 ['A full population doubles every value. What happens to SD?','SD doubles; variance quadruples.'],
 ['What should be established before calling a spread measure population SD?','That the observed set is the complete population being described.'],
 ['Add €10 to every payment. What happens to payment SD?','It is unchanged; all distances from the mean stay the same.'],
 ['Can historical population SD describe future market risk perfectly?','No. A complete historical dataset is still not the full set of future outcomes.']
],{pre:['sd-intuition','sample-variance'],formula:'σ = √[Σ(x − μ)² / N]',checks:[{expression:'Math.sqrt((4+4+4+4)/4)',value:2}]});
s(2,'z-score','Descriptive statistics','Z-score','Distance from the mean measured in standard deviations.','Compare positions on different measurement scales.','z = (value − mean)/SD; SD must be positive.','Count how many standard-sized steps a value lies from the center.',[
 ['Value 70, mean 50, SD 10. What is z?','(70−50)/10 = 2.'],
 ['z=2 always means exactly the 97.5th percentile. Why wrong?','That percentile needs a normal-distribution assumption; z alone is a rescaling.'],
 ['What does a negative z-score indicate?','A value below the mean.'],
 ['What is required to turn z into a normal tail probability?','A justified normal model, not only a computed mean and SD.'],
 ['Latency 80 ms, mean 100 ms, SD 10 ms. z-score?','(80−100)/10 = −2.'],
 ['Can z-scores be computed when SD is zero?','No. The formula would divide by zero.']
],{pre:['population-sd'],formula:'z = (x − mean) / SD',checks:[{expression:'(70-50)/10',value:2},{expression:'(80-100)/10',value:-2}]});
s(2,'robust-center','Descriptive statistics','Robust summary','A summary less affected by a small number of extreme observations.','Describe typical outcomes while checking sensitivity to extremes.','Compare mean with median and spread with IQR.','A center anchored by the middle moves less when one tail stretches.',[
 ['Prices 10,10,10,1,000: mean and median?','Mean = €257.50; median = €10.'],
 ['A robust statistic makes bad data harmless. Why wrong?','It reduces some extreme-value influence but cannot repair all errors or bias.'],
 ['When may the mean remain the useful target despite skew?','When total revenue or average cost per unit is the decision target.'],
 ['What should a robust analysis avoid?','Silently changing the target or discarding inconvenient valid observations.'],
 ['You report typical purchase size in a highly skewed shop. What pair helps?','Median for the typical purchase; mean for revenue per purchase.'],
 ['What does a large mean–median gap suggest checking?','Skew, mixed groups, unusual values and data-quality problems.']
],{pre:['iqr','outlier'],checks:[{expression:'(10+10+10+1000)/4',value:257.5}]});
s(2,'paired-data','Study design','Paired measurements','Two related measurements linked to the same unit or a matched pair.','Measure individual changes without losing the pairing.','Compute each pair’s difference before summarizing changes.','Each person carries their own before-and-after comparison.',[
 ['One user’s time falls from 12 to 9 minutes. Change after−before?','9−12 = −3 minutes.'],
 ['Shuffle before and after values among people. What is lost?','Their within-person connection and the paired-change information.'],
 ['Paired versus independent groups: what is different?','Paired observations are linked; independent groups have unrelated units.'],
 ['What must be checked before using a paired analysis?','Correct matching and independence across pairs.'],
 ['Two users change by −2 and −6 minutes. Mean change?','(−2−6)/2 = −4 minutes.'],
 ['Does a before–after improvement by itself prove the intervention caused it?','No. Time trends, regression to the mean and other changes can explain it.']
],{pre:['mean','observation'],checks:[{expression:'(-2-6)/2',value:-4}]});
s(2,'sample-proportion','Descriptive statistics','Sample proportion','The observed fraction meeting a defined binary condition.','Estimate conversion or an event chance from a sample.','p-hat = successes/n, with each observation counted once.','Color the successes among n separate boxes.',[
 ['24 of 80 visitors subscribe. What is p-hat?','24/80 = 0.30 = 30%.'],
 ['Count three purchases by one visitor as three successful visitors. What is wrong?','A visitor-based proportion allows only one success indicator per visitor.'],
 ['What is the non-subscriber proportion when subscription is 30%?','70%, if those two categories are exhaustive.'],
 ['What should be checked before extrapolating the sample proportion?','Sampling method, dependence and whether the future population matches.'],
 ['A fair coin shows 7 heads in 10 tosses. Observed head proportion?','70%; this does not change the fair coin’s true 50% chance.'],
 ['Can p-hat=0 from ten observations prove the true event chance is zero?','No. Rare events can be missed in a small sample.']
],{pre:['observed-rate','uncertainty'],formula:'p-hat = successes / n',checks:[{expression:'24/80',value:.3}]});
s(2,'covariance-intuition','Association basics','Covariance intuition','Whether paired deviations from their means tend to share a sign.','See whether two quantities tend to vary together.','Multiply paired deviations; same signs contribute positively.','Two swings moving together have matching above/below-center positions.',[
 ['Both values in a pair are above their means. Sign of their deviation product?','Positive.'],
 ['Covariance 10 proves a stronger relationship than covariance 2 in other units. Why wrong?','Covariance changes with units; raw sizes are not directly comparable.'],
 ['One deviation is +3 and the other −2. Product?','−6, a negative contribution.'],
 ['What must be preserved when calculating covariance?','The correct pairing of the two variables.'],
 ['Stock A and B often both rise or both fall relative to their means. Covariance direction?','Usually positive; calculate it using paired returns.'],
 ['Why can independent risks diversify better than strongly positive-covariance risks?','Their deviations are less likely to move together, under the assumed model.']
],{pre:['mean','paired-data','correlation-intuition'],checks:[{expression:'3*(-2)',value:-6}]});

// 3: Understand how collection and repeated sampling shape uncertainty.
s(3,'random-sample','Sampling','Simple random sample','A sample chosen so every equally sized subset of the population has the same chance.','Reduce selection driven by convenience or preference.','Sample from a complete list using a random procedure.','Draw names from a well-mixed hat without favoring particular names.',[
 ['Choose 10 names randomly from 100 eligible names. Is this random sampling?','Yes, if every size-10 subset has equal selection chance.'],
 ['Survey whoever volunteers and call it random. What is wrong?','Volunteering creates a self-selected sample.'],
 ['Random sample versus random treatment assignment: difference?','Sampling selects people; assignment allocates treatments among selected people.'],
 ['What can undermine a random draw from a list?','An incomplete list, nonresponse or later exclusions.'],
 ['A customer list omits cash buyers. Can random selection from it describe all buyers automatically?','No. The sampling frame misses cash buyers.'],
 ['Why does randomness help estimate sampling uncertainty?','Known random selection supplies a probability model for repeated samples.']
],{pre:['population-sample','sample-size']});
s(3,'selection-bias','Sampling','Selection bias','A systematic difference caused by who enters the data.','Avoid generalizing from a distorted sample.','Compare inclusion mechanisms with the target population.','A net with large holes misses small fish.',[
 ['Survey only premium customers about average customer income. Main concern?','Premium users may have systematically different income.'],
 ['Ten times more premium-only responses removes selection bias. Why wrong?','It can narrow random error while leaving the same selection problem.'],
 ['Selection bias versus random sampling error?','Selection bias is systematic; sampling error fluctuates across samples.'],
 ['What should you inspect to assess selection bias?','Eligibility, recruitment, exclusions and differences from nonparticipants.'],
 ['An app surveys only users who stayed six months. Which group is missing?','Users who left earlier; satisfaction may be overstated.'],
 ['Can weighting always correct an excluded population?','No. Missing groups or unmeasured selection factors may remain uncorrectable.']
],{pre:['random-sample']});
s(3,'nonresponse','Sampling','Nonresponse bias','Bias when responders differ from eligible nonresponders in relevant ways.','Assess survey credibility beyond the response count.','Report response rates and investigate patterns in missing responses.','The quiet seats in a meeting may hold different opinions.',[
 ['80 of 200 invited people reply. Response rate?','80/200 = 40%.'],
 ['All respondents were selected randomly, so nonresponse cannot bias results. Why wrong?','Response itself can be selective.'],
 ['Does a low response rate prove a large bias?','No. Bias depends on how responders and nonresponders differ.'],
 ['What comparison may reveal nonresponse patterns?','Known characteristics of responders versus the full eligible group.'],
 ['Unhappy users are less likely to answer. Likely effect on observed satisfaction?','It may overstate satisfaction.'],
 ['Can a 90% response rate still be biased?','Yes, if the missing 10% differs enough on the target outcome.']
],{pre:['selection-bias'],checks:[{expression:'80/200*100',value:40}]});
s(3,'independent-observations','Sampling','Independent observations','Observations whose random outcomes do not inform one another under the model.','Use an uncertainty calculation that matches the data structure.','Check for repeated users, shared groups and serial dependence.','Separate coin tosses differ from many readings of one frozen coin.',[
 ['Ten measurements of the same patient: ten independent patients?','No. Repeated measurements can be related.'],
 ['A million rows always means a million independent units. Why wrong?','Rows may share users, days, hospitals or market shocks.'],
 ['Can zero correlation alone prove independence?','No. Variables may have a nonlinear dependence.'],
 ['What should an analyst identify before estimating uncertainty?','The independent units and any clustering or time dependence.'],
 ['Users are randomized, but clicks are analyzed as independent. What correction is needed?','Account for clicks clustered within each user.'],
 ['Why can ignoring positive dependence make intervals too narrow?','It overstates the independent information in the sample.']
],{pre:['paired-data','covariance-intuition']});
s(3,'representativeness','Sampling','Representative evidence','Data that support inference to the stated target population.','Judge whether a result can travel beyond its sample.','Check coverage and selection, not just demographic similarity or size.','A clear picture of one room is not a picture of the whole building.',[
 ['One city supplies all respondents for a national survey. Main issue?','Other areas may differ and are not directly represented.'],
 ['A sample matches age averages, so it is representative in every way. Why wrong?','Other measured and unmeasured selection differences may remain.'],
 ['Can a small probability sample outperform a huge convenience sample?','Yes, for the target population when the selection design is sound.'],
 ['What defines whether a sample is useful?','The target question and population, together with the collection design.'],
 ['Study participants are young athletes; users are older adults. What must be assessed?','Whether the measured relationship generalizes to the older group.'],
 ['Why can randomization strengthen internal validity without ensuring generalizability?','It balances assigned groups within the recruited sample, not all target populations.']
],{pre:['selection-bias','random-sample']});
s(3,'sampling-distribution','Sampling','Sampling distribution','The distribution of a statistic across repeated samples from the same model.','Understand uncertainty in an estimated mean or rate.','Imagine repeatedly sampling n observations and recomputing the statistic.','Many baskets from the same orchard yield slightly different average sizes.',[
 ['Repeated samples produce means 9,10,11. What varies here?','The sample means, forming a sampling distribution.'],
 ['The sampling distribution is the histogram of individual measurements. Why wrong?','It describes a statistic across samples, not values within one sample.'],
 ['Data SD versus SD of repeated sample means?','Data SD describes individuals; SD of means is the standard error.'],
 ['What must stay specified in a sampling-distribution model?','The population model, sampling design, sample size and statistic.'],
 ['You simulate 1,000 samples of 100 users and compute conversion each time. What do the results estimate?','The sampling distribution of conversion for n=100.'],
 ['Does simulation from a biased model repair that model?','No. It describes uncertainty conditional on the chosen model.']
],{pre:['mean','sample-proportion','uncertainty']});
s(3,'se-mean','Sampling','Standard error of a mean','The standard deviation of the mean’s sampling distribution.','Quantify precision of an estimated average.','For independent identically distributed data, estimate SE with s/√n.','Averaging many independent noisy readings steadies the estimate.',[
 ['Sample SD=20 and n=100. Estimated SE of the mean?','20/√100 = 2.'],
 ['SD=20 means the mean’s SE is always 20. Why wrong?','The mean averages observations; its SE also depends on n.'],
 ['What differs between SD and SE in a delivery study?','SD is variation among deliveries; SE is uncertainty in the mean.'],
 ['What assumptions support s/√n?','Independent, identically distributed observations with finite variance.'],
 ['Payment SD is €30 across 900 independent payments. Estimated mean SE?','30/√900 = €1.'],
 ['If data are highly dependent, is s/√n automatically valid?','No. Dependence changes the variance of the mean.']
],{pre:['sampling-distribution','sample-variance','independent-observations'],formula:'SE(mean) ≈ s / √n',checks:[{expression:'20/Math.sqrt(100)',value:2},{expression:'30/Math.sqrt(900)',value:1}]});
s(3,'se-proportion','Sampling','Standard error of a proportion','The spread of estimated proportions across repeated samples.','Assess uncertainty in conversion or a win rate.','For independent binary trials, estimated SE = √[p-hat(1−p-hat)/n].','Near 50%, binary outcomes create more sampling variation than near the extremes.',[
 ['p-hat=50%, n=100. Estimated SE?','√(0.5×0.5/100) = 0.05 = 5 percentage points.'],
 ['SE 5 percentage points means the estimate is certainly within 5 points. Why wrong?','SE summarizes sampling spread, not a guaranteed error bound.'],
 ['At equal n, which has larger binomial variance: p=0.5 or p=0.1?','p=0.5; 0.25 exceeds 0.09.'],
 ['When can the simple normal-interval approximation be poor?','With small samples or proportions near 0 or 1.'],
 ['Observed conversion 20% with n=400. Estimated SE?','√(0.2×0.8/400) = 0.02 = 2 percentage points.'],
 ['Observed p-hat=0 gives estimated SE=0. Does it prove certainty?','No. That plug-in formula is unreliable at the boundary; use a suitable interval.']
],{pre:['sample-proportion','sampling-distribution'],formula:'SE(p-hat) ≈ √[p-hat(1−p-hat)/n]',checks:[{expression:'Math.sqrt(.5*.5/100)',value:.05},{expression:'Math.sqrt(.2*.8/400)',value:.02}]});
s(3,'fourfold-sample','Sampling','Square-root sample-size rule','With stable independent variance, standard error scales as 1/√n.','Budget the sample needed for better precision.','Multiply n by four to halve SE.','Four equally good measurements buy two times the precision, not four.',[
 ['SE=4 at n=100. Approximate SE at n=400?','4×√(100/400) = 2.'],
 ['Doubling n halves SE. What is wrong?','Doubling multiplies SE by 1/√2, about 0.707.'],
 ['What n multiplier reduces SE to one third?','9, because √9=3.'],
 ['What must remain comparable for this rule?','Outcome variance, independence and collection design.'],
 ['You want SE to fall from 6 to 2. Starting n=200: new n?','200×(6/2)² = 1,800.'],
 ['Can nine times the sample remove a selection bias?','No. This rule addresses random uncertainty, not systematic bias.']
],{pre:['se-mean','se-proportion'],formula:'SE(new) / SE(old) = √[n(old)/n(new)]',checks:[{expression:'4*Math.sqrt(100/400)',value:2},{expression:'200*(6/2)**2',value:1800}]});
s(3,'law-large-numbers','Sampling','Law of large numbers','Under suitable conditions, an average approaches its expected value as sample size grows.','Understand why repeated evidence can stabilize estimates.','For independent identically distributed observations with finite mean, averages converge to that mean.','Many small random pushes tend to balance in the average.',[
 ['Does more fair-coin tossing tend to stabilize the head fraction near 50%?','Yes, under the usual independent-toss model.'],
 ['After five heads, tails is due to restore balance. Why wrong?','Independent next-toss probability remains 50%; no balancing debt exists.'],
 ['Stable average versus stable total: difference?','The average can stabilize while the total keeps growing and fluctuating.'],
 ['What can defeat a simple long-run-average argument?','Changing distributions, dependence or a missing finite expectation.'],
 ['A game has true EV €2 per independent play. What does the law suggest about average profit?','It approaches €2 over many plays, without guaranteeing any finite run.'],
 ['Does the law guarantee that a positive-EV strategy avoids ruin?','No. Interim losses, stake size and dependence still matter.']
],{pre:['mean','independent-observations']});
s(3,'central-limit','Sampling','Central limit theorem','Under suitable conditions, a standardized sample mean becomes approximately normal as n grows.','Build approximate inference even when individual data are not normal.','The basic version requires independent identically distributed data with finite nonzero variance.','Different shaped small noises can combine into a bell-shaped average.',[
 ['Must individual purchase prices be normal for their mean to become approximately normal?','No, under the theorem’s conditions and a sufficiently large sample.'],
 ['n=30 guarantees normality for every dataset. Why wrong?','Required sample size depends on tails, skew and dependence.'],
 ['CLT versus law of large numbers?','LLN concerns convergence of averages; CLT describes their scaled fluctuations.'],
 ['What should you inspect before a normal approximation for a mean?','Dependence, heavy tails, extreme skew and effective sample size.'],
 ['Highly skewed purchases have finite variance. Why might more observations be needed?','A few large purchases can keep the mean’s sampling distribution skewed.'],
 ['Does the CLT make the raw observations normally distributed?','No. It concerns averages or sums after suitable scaling.']
],{pre:['sampling-distribution','law-large-numbers','variance-intuition']});
s(3,'cluster-sample','Sampling','Clustered sample','Observations collected in related groups such as schools or households.','Avoid overstating information from many related observations.','Use the sampling groups in design and uncertainty calculations.','Many leaves from one tree tell less about a forest than leaves from many trees.',[
 ['100 pupils come from two schools. What are the clusters?','The two schools.'],
 ['Every pupil is independent because each has a separate name. Why wrong?','Pupils share school-level influences.'],
 ['100 pupils in two schools versus 100 pupils in 50 schools: same information?','Not generally; cluster dependence and the target estimand matter.'],
 ['What limits cluster-robust inference with only two clusters?','Too few independent groups for reliable usual approximations.'],
 ['A treatment is assigned by store. At what level must assignment be respected?','The store level, including in the uncertainty analysis.'],
 ['Why can adding more clusters improve precision more than adding rows within existing clusters?','New clusters often add more independent information.']
],{pre:['independent-observations','random-sample']});
s(3,'stratified-sample','Sampling','Stratified sample','A sample drawn within distinct population groups.','Ensure small important groups are included and improve precision.','Sample within strata; weight results back to population shares when needed.','Take some fruit from each orchard section, not only the nearest rows.',[
 ['A survey samples urban and rural residents separately. What are the strata?','Urban and rural population groups.'],
 ['Oversample a small group then average everyone equally for a population result. Why can this mislead?','The group receives too much population weight.'],
 ['Strata versus clusters: basic distinction?','Strata organize separate sampling across groups; clusters collect related units within sampled groups.'],
 ['What weights are needed after unequal sampling fractions?','Weights reflecting selection probabilities or population shares.'],
 ['Population is 80% A and 20% B; rates 10% and 30%. Overall rate?','0.8×10% + 0.2×30% = 14%.'],
 ['Can stratifying on age alone remove all survey bias?','No. Nonresponse, coverage and other relevant differences may remain.']
],{pre:['weighted-mean','random-sample'],checks:[{expression:'.8*.1+.2*.3',value:.14}]});
s(3,'finite-population','Sampling','Finite population correction','A reduction in sampling variance when sampling much of a finite population without replacement.','Avoid overestimating random uncertainty when many eligible units are observed.','Multiply σ/√n by √[(N−n)/(N−1)] for a simple random sample mean.','Drawing half the box leaves less unseen variation than sampling with replacement.',[
 ['N=101 and n=26. What is the correction factor?','√(75/100) ≈ 0.866.'],
 ['Apply a finite-population correction to repeated draws with replacement. Why wrong?','The usual correction requires sampling without replacement.'],
 ['What is the sampling uncertainty from observing all N units?','Zero for that finite-population quantity, excluding measurement errors.'],
 ['What target must be clear before applying this correction?','The finite population, rather than a changing future superpopulation.'],
 ['A census measures every current employee. Is future employee behavior known exactly?','No. Zero current sampling error does not remove future or measurement uncertainty.'],
 ['Why is the correction near 1 when n is tiny relative to N?','Removing a few units barely changes the unobserved finite population.']
],{pre:['se-mean','random-sample'],formula:'FPC = √[(N−n)/(N−1)]',checks:[{expression:'Math.sqrt((101-26)/(101-1))',value:Math.sqrt(.75)}]});
s(3,'bootstrap','Sampling','Bootstrap','Resampling observed data to approximate an estimator’s sampling variation.','Estimate uncertainty when an analytic SE is difficult.','Resample n units with replacement, recompute the statistic, and repeat.','Create many new baskets by drawing from the observed basket.',[
 ['Can one row appear twice in the same ordinary bootstrap sample?','Yes. Sampling is with replacement.'],
 ['Bootstrap recreates missing population groups automatically. Why wrong?','It resamples only the observed data and cannot repair selection bias.'],
 ['Bootstrap versus taking a fresh real-world sample?','Bootstrap reuses data; fresh sampling gathers new information.'],
 ['What should be resampled with clustered observations?','Independent clusters or a method respecting the dependence structure.'],
 ['You need uncertainty for median spending. What can a bootstrap do?','Recompute the median across resamples to approximate its variation.'],
 ['Why can a bootstrap fail for rare extreme risks in a tiny sample?','Unobserved extremes cannot appear in ordinary resampling; validity also depends on the statistic.']
],{pre:['sampling-distribution','cluster-sample'],sources:['quant-stat-nist']});

// 4: Estimate population quantities and interpret interval procedures.
s(4,'parameter-statistic','Estimation','Parameter and statistic','A parameter describes a population; a statistic is computed from sample data.','Separate unknown targets from their observed estimates.','Use μ for a population mean and x-bar for a sample mean.','The target is the whole lake; the measurement comes from a bucket.',[
 ['A sample of 100 users averages €12. Is €12 a statistic?','Yes. It is the computed sample mean.'],
 ['The sample average is the true population parameter by definition. Why wrong?','They are different quantities and may differ numerically.'],
 ['What differs between p and p-hat?','p is a population probability; p-hat is an observed sample proportion.'],
 ['What must be stated before estimating a parameter?','The population, outcome definition and target quantity.'],
 ['A survey estimates national support at 42%. What is the target parameter?','The support proportion in the stated national population.'],
 ['Can a full-population calculation be a known parameter?','Yes, for that explicitly defined finite population.']
],{pre:['population-sample','sampling-distribution']});
s(4,'point-estimate','Estimation','Point estimate','One numerical guess for an unknown population quantity.','Provide a concise estimate while recognizing its uncertainty.','Report the target, estimation rule and uncertainty alongside the number.','One pin marks a likely location but not the full possible area.',[
 ['55 of 100 respondents support a proposal. Point estimate of support?','55/100 = 55%.'],
 ['A point estimate has no uncertainty because it is one number. Why wrong?','One number summarizes an estimate, not certainty.'],
 ['Point estimate versus interval estimate?','One value versus a range produced by an uncertainty procedure.'],
 ['What should be checked when comparing point estimates?','Comparable targets, populations and collection designs.'],
 ['Mean delivery time is estimated as 25 minutes from 40 deliveries. What else should be reported?','Sample size, sampling method and a suitable uncertainty interval.'],
 ['Why can two equally sized studies give different point estimates?','Random sampling variation, different populations or different biases.']
],{pre:['parameter-statistic']});
s(4,'estimator-bias','Estimation','Estimator bias','The difference between an estimator’s expected value and its target.','Identify systematic estimation error under a specified model.','Bias = E[estimate] − parameter.','Repeated arrows centered away from the target show bias.',[
 ['True mean is 10; an estimator averages 12 over repeated samples. Bias?','12−10 = +2.'],
 ['One estimate differs from truth, so the estimator is biased. Why wrong?','Bias is a repeated-sampling property, not one realized error.'],
 ['Can an unbiased estimator be wrong in an individual sample?','Yes. Its errors average to zero; each estimate can differ.'],
 ['What must be specified when discussing bias?','The target parameter and the model or sampling mechanism.'],
 ['A survey systematically misses low-spending users. What concern arises?','Its estimated mean spending may be biased upward.'],
 ['Why might a slightly biased method still be useful?','It can substantially reduce variance and total prediction or estimation error.']
],{pre:['point-estimate','sampling-distribution'],sources:['quant-stat-estimation'],formula:'bias = E[estimator] − parameter',checks:[{expression:'12-10',value:2}]});
s(4,'estimator-variance','Estimation','Estimator variance','How much an estimator fluctuates across repeated samples.','Compare the stability of estimation rules.','Compute variance across the estimator’s sampling distribution.','Arrows scattered widely show variance even if their center is correct.',[
 ['Estimator A has SE 2 and B has SE 3. Their variances?','A: 4; B: 9, in squared target units.'],
 ['Low variance guarantees the estimate is accurate. Why wrong?','A stable estimator can remain systematically biased.'],
 ['Bias versus variance: what differs?','Bias shifts the average estimate; variance spreads estimates around their average.'],
 ['What must be held comparable to compare estimator variances?','The target, data-generating conditions and sample size.'],
 ['Two unbiased methods have variances 4 and 9. Which is more precise under that model?','The variance-4 method.'],
 ['Can a selected subgroup create a precise but misleading population estimate?','Yes. Small sampling variance does not remove selection bias.']
],{pre:['estimator-bias','se-mean'],sources:['quant-stat-estimation'],checks:[{expression:'2**2',value:4},{expression:'3**2',value:9}]});
s(4,'consistency','Estimation','Consistent estimator','An estimator that approaches its target as sample size grows under its assumptions.','Ask whether collecting more data can make the estimate converge to truth.','Consistency concerns the large-sample limit, not only finite-sample bias.','A narrowing beam can still point incorrectly unless its center also converges.',[
 ['For iid data with finite mean, is the sample mean consistent for the population mean?','Yes, by the law of large numbers.'],
 ['Always use the first observation, regardless of n. Does more data make that consistent?','Generally no. The rule ignores the extra information.'],
 ['Does unbiasedness automatically imply consistency?','No. An unbiased estimator’s variance need not shrink as n grows.'],
 ['What can break consistency of a sample average for the intended population?','A changing target, persistent selection bias or violated sampling assumptions.'],
 ['Estimate a mean as x-bar+1/n. What happens to the added bias?','It approaches zero; with a consistent x-bar, the estimator is consistent.'],
 ['Is consistency a promise that the estimate is good at n=20?','No. It is an asymptotic property, not a small-sample guarantee.']
],{pre:['law-large-numbers','estimator-bias','estimator-variance'],sources:['quant-stat-estimation']});
s(4,'efficiency','Estimation','Estimator efficiency','Precision relative to alternative estimators under a stated model and comparison class.','Choose methods that use information well.','Within comparable unbiased estimators, smaller variance means greater efficiency.','Two tools can hit the same center but one scatters less.',[
 ['Unbiased A has variance 4; B has variance 8. Which is more efficient here?','A, with 50% less variance under the stated conditions.'],
 ['One estimator is best for every distribution because it is efficient under normality. Why wrong?','Efficiency is model-dependent.'],
 ['How can efficiency differ from robustness?','Efficiency emphasizes precision under a model; robustness tolerates model departures.'],
 ['What must accompany an efficiency claim?','The assumed model, sample size and class of competing estimators.'],
 ['A mean is efficient under a clean normal model. Outliers appear: what should change?','Check sensitivity and consider robust methods appropriate to the target.'],
 ['Why not compare a biased estimator using variance alone?','Its bias also contributes to total estimation error.']
],{pre:['estimator-variance','robust-center'],sources:['quant-stat-estimation'],checks:[{expression:'(8-4)/8*100',value:50}]});
s(4,'mse','Estimation','Mean squared error','The expected squared distance between an estimate and the true target.','Balance systematic error and sampling fluctuation.','MSE = variance + bias², when these quantities exist.','Both a shifted center and a wide scatter increase missed-target distance.',[
 ['Variance=4 and bias=3. What is MSE?','4 + 3² = 13.'],
 ['Unbiased always means lowest MSE. Why wrong?','A biased estimator can reduce variance enough to have lower MSE.'],
 ['A: bias 0, variance 9. B: bias 1, variance 4. Lower MSE?','B: 5 versus A: 9.'],
 ['What loss definition does MSE assume?','Squared errors; another decision cost can favor another estimator.'],
 ['A revenue forecast has bias €2 and variance 9 euros squared. MSE?','9 + 4 = 13 euros squared.'],
 ['Why can shrinkage improve MSE?','It accepts some bias to reduce noisy estimate variation.']
],{pre:['estimator-bias','estimator-variance'],sources:['quant-stat-estimation'],formula:'MSE = variance + bias²',checks:[{expression:'4+3**2',value:13},{expression:'4+1**2',value:5}]});
s(4,'confidence-coverage','Confidence intervals','95% confidence interval','An interval procedure with 95% repeated-sampling coverage under its assumptions.','Express uncertainty without treating the sample estimate as exact.','Over repeated valid samples, about 95% of constructed intervals contain the fixed parameter.','Repeated nets catch the same fixed target about 95 times in 100.',[
 ['What does 95% refer to in a frequentist confidence interval?','The long-run coverage of the interval-producing procedure.'],
 ['This realized interval gives a 95% probability that the fixed parameter lies inside. What is wrong?','That posterior-probability interpretation is not the standard frequentist meaning.'],
 ['95% CI versus the middle 95% of individual observations?','A CI targets a parameter; an observation range describes individual values.'],
 ['When can nominal 95% coverage fail?','With biased selection, wrong models, dependence or unaccounted analysis choices.'],
 ['A valid procedure is repeated 1,000 times. Expected number covering the parameter?','About 950; not necessarily exactly 950.'],
 ['Does an interval including zero prove an effect is absent?','No. It indicates that zero and other included values remain compatible with that procedure.']
],{pre:['sampling-distribution','point-estimate'],checks:[{expression:'.95*1000',value:950}]});
s(4,'normal-mean-ci','Confidence intervals','Mean interval with known population SD','A normal-theory interval around a sample mean using a known σ.','Quantify mean uncertainty when the population spread is known and assumptions fit.','For 95%, use mean ± 1.96×σ/√n under the normal model.','A margin stretches on each side of the sample mean.',[
 ['Mean=100, known σ=20, n=100. Approximate 95% CI?','SE=2; margin=3.92; interval [96.08, 103.92].'],
 ['Use known-σ critical values when σ was estimated from five observations. Why questionable?','The extra uncertainty in estimated SD is not handled by that formula.'],
 ['With the same σ and n, how does a 99% CI compare?','It is wider because its critical value is larger.'],
 ['What conditions make this formula exact?','Independent normal observations and genuinely known population SD.'],
 ['SE=€3 and mean=€40. Approximate 95% interval?','€40 ± €5.88, or [€34.12, €45.88].'],
 ['Can a narrow mean CI rule out large variation in individual outcomes?','No. It describes the mean’s precision, not individual spread.']
],{pre:['se-mean','confidence-coverage','central-limit'],formula:'95% mean CI = mean ± 1.96×σ/√n',checks:[{expression:'1.96*20/Math.sqrt(100)',value:3.92},{expression:'1.96*3',value:5.88}]});
s(4,'t-mean-ci','Confidence intervals','Student t interval for a mean','A mean interval using estimated sample SD and a t critical value.','Include uncertainty from estimating population spread.','mean ± t*×s/√n; degrees of freedom are n−1 for one normal sample.','Small samples need a wider safety margin for uncertain spread.',[
 ['Mean=5, s=2, n=25, t*=2.064. 95% margin?','2.064×2/√25 = 0.8256.'],
 ['Use 1.96 automatically for every tiny-sample mean interval. What is omitted?','The t distribution accounts for estimating SD under the normal model.'],
 ['As degrees of freedom grow, how does t approach normal critical values?','The extra tail width decreases.'],
 ['What matters especially for a small-sample t interval?','Independent normal observations, with no serious outlier problem.'],
 ['Using mean 5 and margin 0.8256, give the interval.','[4.1744, 5.8256], about [4.17, 5.83].'],
 ['Does t automatically solve extreme skew or dependence?','No. Its small-sample validity still relies on its assumptions.']
],{pre:['sample-variance','normal-mean-ci'],formula:'mean CI = mean ± t*×s/√n',checks:[{expression:'2.064*2/Math.sqrt(25)',value:.8256}]});
s(4,'wilson-interval','Confidence intervals','Wilson interval for a proportion','A binomial proportion interval that behaves better near boundaries than a simple Wald interval.','Avoid zero-width certainty after observing no events.','Wilson center = (p-hat+z²/(2n))/(1+z²/n); its margin includes z²/(4n²).','Move the estimate slightly inward while allowing uncertainty in both directions.',[
 ['No events in n=10. Using z=1.96, Wilson 95% upper bound?','3.8416/(10+3.8416) ≈ 27.75%; lower bound 0%.'],
 ['Zero observed events means a valid 95% interval is [0%,0%]. Why wrong?','A rare event could still occur; the plug-in Wald interval fails at that boundary.'],
 ['Wilson interval versus exact binomial interval?','Both handle boundaries, but use different constructions and coverage properties.'],
 ['What data model does the usual Wilson formula require?','Independent binary trials with a common success probability.'],
 ['If no defects were found in 10 parts, can you promise defect-free production?','No. The sample is compatible with substantial uncertainty.'],
 ['Why does a Wilson interval not repair missing high-risk customers?','Its uncertainty calculation does not correct selection bias.']
],{pre:['se-proportion','confidence-coverage'],formula:'center=(p-hat+z²/(2n))/(1+z²/n); margin=z√[p-hat(1−p-hat)/n+z²/(4n²)]/(1+z²/n)',checks:[{expression:'1.96**2/(10+1.96**2)*100',value:27.75401687666166}]});
s(4,'interval-width','Confidence intervals','Confidence interval width','The size of the range supplied by an interval procedure.','Compare estimate precision under similar assumptions.','Width = upper bound − lower bound; precision is not absence of bias.','A narrow beam shows a smaller range, but can still point at the wrong place.',[
 ['CI [12,18] versus [14,16]: widths?','6 versus 2; the second is 66.7% narrower.'],
 ['A narrower CI proves the estimate is closer to truth. Why wrong?','A biased analysis can produce a narrow interval around the wrong target.'],
 ['What happens to width when confidence rises with the same data?','It generally increases.'],
 ['What should be matched before comparing interval widths?','The estimand, confidence level, units and method assumptions.'],
 ['A rate interval is [8%,12%]. What is its width?','4 percentage points.'],
 ['Why distinguish practical uncertainty from statistical precision?','A very precise estimate can still be too small to matter economically.']
],{pre:['confidence-coverage','fourfold-sample'],checks:[{expression:'18-12',value:6},{expression:'(6-2)/6*100',value:66.66666666666666}]});
s(4,'prediction-interval','Confidence intervals','Prediction interval','An interval for a future observation rather than the population mean.','Plan for individual delivery times, costs or risks.','For one future iid normal observation: mean ± t*×s×√(1+1/n).','Predicting one new item needs room for both estimation error and its own variation.',[
 ['Known normal mean=100, SD=10. Approximate central 95% range for a new value?','100 ± 19.6, or [80.4,119.6].'],
 ['Use the mean’s tiny CI as a range for individual customers. What is wrong?','It omits individual variation.'],
 ['Why is a prediction interval usually wider than a mean CI?','It includes future-observation variation as well as estimation uncertainty.'],
 ['What must be checked before predicting a future observation?','Comparable future conditions, model shape and dependence.'],
 ['Mean delivery time is known precisely but deliveries vary widely. Which interval helps staffing for one delivery?','A prediction interval, not only the mean CI.'],
 ['Does a historical prediction interval guarantee 95% coverage after a regime change?','No. Its model and population assumptions may no longer apply.']
],{pre:['normal-mean-ci','t-mean-ci'],formula:'normal-model prediction interval = mean ± t*×s×√(1+1/n)',checks:[{expression:'1.96*10',value:19.6}]});
s(4,'paired-interval','Confidence intervals','Interval for a paired mean change','A mean interval applied to within-pair differences.','Estimate before–after changes while respecting matching.','Compute differences d; use mean(d) ± t*×SD(d)/√n pairs.','Compare each runner with their own earlier time.',[
 ['Mean change=−2, change SD=4, n=16, t*=2.131. Margin?','2.131×4/4 = 2.131.'],
 ['Use the SD of before measurements instead of change SD. Why wrong?','Paired uncertainty depends on the variation in differences.'],
 ['Why can pairing improve precision?','Related baseline differences may cancel within each pair.'],
 ['What independence is required in a usual paired t interval?','Independence across pairs; within-pair dependence is intentional.'],
 ['Mean change −2 with margin 2.131. Does the interval exclude zero?','No. [−4.131,0.131] includes zero.'],
 ['Does a paired interval isolate a causal treatment effect without a control group?','No. Other time-related changes can affect the differences.']
],{pre:['paired-data','t-mean-ci'],formula:'paired CI = mean(d) ± t*×s(d)/√n',checks:[{expression:'2.131*4/Math.sqrt(16)',value:2.131}]});
s(4,'two-mean-se','Confidence intervals','Difference between independent means','An estimated difference with uncertainty from both groups.','Compare average outcomes without treating either group mean as exact.','SE(diff) = √(sA²/nA + sB²/nB) for independent groups.','Two uncertain measurements contribute to uncertainty in their gap.',[
 ['Both groups: s=10, n=100. SE of their mean difference?','√(100/100+100/100) = √2 ≈ 1.414.'],
 ['Subtract the two SEs to get the difference’s SE. Why wrong?','Independent variances add; standard errors do not subtract.'],
 ['How does paired analysis differ from this formula?','Paired analysis uses the SD of matched differences and their covariance.'],
 ['What assumption is essential for the independent-group formula?','Independence between groups; unequal-variance t inference may use Welch’s method.'],
 ['Difference=5, SE≈1.414. Approximate large-sample 95% interval?','5 ± 2.772, about [2.23,7.77].'],
 ['If the groups share households, is the independent-group SE automatic?','No. Shared-group dependence must be accounted for.']
],{pre:['se-mean','t-mean-ci','independent-observations'],formula:'SE(A−B) = √(sA²/nA + sB²/nB)',checks:[{expression:'Math.sqrt(10**2/100+10**2/100)',value:Math.sqrt(2)}]});

// 5: Test specified claims without turning thresholds into certainty.
s(5,'null-alternative','Hypothesis testing','Null and alternative hypotheses','Competing statistical claims specified before seeing the relevant result.','Define what a test can and cannot answer.','State the parameter and comparison, such as H0: difference=0 versus H1: difference≠0.','A test asks how surprising the result would be under a named starting model.',[
 ['You test whether two conversion rates differ. A common null?','Their population conversion-rate difference is zero.'],
 ['The null is whatever claim sounds uninteresting. Why wrong?','It must be a precise testable statistical claim.'],
 ['No-effect null versus an economic minimum-effect claim?','Zero difference differs from a requirement that the effect exceeds a useful threshold.'],
 ['What must be specified before choosing a test?','The estimand, null, alternative and sampling model.'],
 ['A shop asks whether average wait exceeds 10 minutes. What alternative fits?','H1: population mean wait >10 minutes.'],
 ['Can testing a zero difference tell whether a feature is profitable?','Not alone; profitability also needs effect size, costs and uncertainty.']
],{pre:['parameter-statistic','confidence-coverage'],sources:['quant-stat-asa','quant-stat-nist']});
s(5,'p-value','Hypothesis testing','P-value','Under the null and model assumptions, the probability of a test statistic at least as extreme as observed.','Assess compatibility of data with a specified null model.','Interpret p conditional on the null; do not reverse it into a hypothesis probability.','Ask how often that model would produce a result this extreme or more.',[
 ['A valid test gives p=0.03. What probability is being described?','A 3% probability of a statistic at least this extreme under the null and assumptions.'],
 ['p=0.03 means a 3% probability that the null is true. Why wrong?','It conditions on the null being true; it does not assign the null a probability.'],
 ['Does smaller p necessarily mean a larger effect?','No. Sample size and variability also influence p.'],
 ['What must be checked before trusting a reported p-value?','The model, design and all analysis or stopping choices.'],
 ['A tiny effect has p=0.0001 in a huge sample. What else matters?','Its magnitude, interval, costs and practical importance.'],
 ['Does p=0.6 prove there is no effect?','No. The test may be imprecise, and many effects can remain compatible with the data.']
],{pre:['null-alternative','sampling-distribution'],sources:['quant-stat-asa']});
s(5,'alpha','Hypothesis testing','Significance level alpha','A prespecified bound on a test’s Type I error rate under its assumptions.','Choose a false-rejection tolerance before testing.','For a valid single test, reject when p≤alpha under the planned rule.','Set the alarm threshold before hearing the alarm.',[
 ['Alpha=0.05 and p=0.02 in a valid planned test. Decision?','Reject that null by the stated 5% rule.'],
 ['Alpha=5% means every rejected claim has a 5% chance of being false. Why wrong?','Alpha is a conditional false-rejection rate under a true null.'],
 ['At fixed design, what does lowering alpha usually do to power?','It lowers power unless sample size or other design features change.'],
 ['What must be included in the testing rule?','One/two-sided choice, multiplicity and stopping rules.'],
 ['Alpha=1% and p=2%. Is the result rejected by that rule?','No, because 2% exceeds 1%.'],
 ['Can choosing alpha after seeing p preserve its intended error control?','Not generally; that data-dependent choice changes the procedure.']
],{pre:['p-value'],sources:['quant-stat-nist','quant-stat-asa']});
s(5,'type-one','Hypothesis testing','Type I error','Rejecting a null hypothesis that is true.','Understand a false alarm in statistical testing.','Its rate is controlled by alpha for a valid prespecified test.','An alarm rings even though there is no fire.',[
 ['A truly ineffective feature is declared effective by a null test. Which error?','Type I error.'],
 ['A Type I error is failing to detect a real effect. Why wrong?','That describes Type II error.'],
 ['Under 100 true nulls at alpha=5%, expected false rejections?','100×0.05 = 5, if each test is valid; independence is not needed for this expectation.'],
 ['What can raise false alarms above the advertised rate?','Unplanned repeated testing, selective reporting or invalid assumptions.'],
 ['You screen many useless trading indicators and keep one passing p<0.05. Main concern?','Multiple testing can select a chance false positive.'],
 ['Does a 5% error rate mean exactly one error every twenty tests?','No. It is a long-run probability, not a fixed schedule.']
],{pre:['alpha'],checks:[{expression:'100*.05',value:5}]});
s(5,'type-two','Hypothesis testing','Type II error','Failing to reject a null when the specified alternative is true.','Recognize missed effects caused by weak evidence.','Beta depends on effect size, variability, sample size and the testing rule.','A quiet alarm misses a real fire.',[
 ['A real improvement exists, but the test fails to reject zero. Which error?','Type II error for that alternative.'],
 ['Not significant means the null was proven true. Why wrong?','The test may have missed a real effect.'],
 ['What is beta if power is 80% for a stated alternative?','20%, because beta = 1−power.'],
 ['What effect must be named when reporting beta?','The alternative effect size being evaluated.'],
 ['A study could detect only large gains. It finds no significance. What remains possible?','Smaller useful gains may still be present.'],
 ['Why can a costly false negative justify a different study design?','Higher power or a different decision rule can reduce missed useful effects.']
],{pre:['type-one'],formula:'beta = 1 − power',checks:[{expression:'1-.8',value:.2}]});
s(5,'power','Hypothesis testing','Statistical power','The chance a planned test rejects the null when a specified alternative is true.','Plan a study that can detect a useful effect.','Power = 1−beta; specify the effect and design assumptions.','A sensitive detector is more likely to notice a real signal.',[
 ['Power is 80% for a 2-point lift. What does that mean?','An 80% rejection chance if that true lift and the design assumptions hold.'],
 ['80% power means an 80% probability this significant finding is true. Why wrong?','Power conditions on a specified true alternative, not on significance.'],
 ['Same design: is power usually higher for a larger true effect?','Yes, because it is easier to distinguish from the null.'],
 ['What inputs belong in a power calculation?','Effect size, variance or baseline rate, alpha, sample size and design.'],
 ['A 20-person study has low power for a small effect. What helps?','Increase informative sample size or reduce noise with a sound design.'],
 ['Why not use observed post-hoc power to replace the effect CI?','It adds little beyond the observed test result and does not resolve uncertainty.']
],{pre:['type-two','fourfold-sample']});
s(5,'one-sided','Hypothesis testing','One-sided test','A test targeting an effect in a prespecified direction.','Test a directional claim when the opposite direction has a different decision meaning.','Choose the direction before viewing the relevant data.','Put the alarm in one direction before you know where the signal goes.',[
 ['H1: mean delay >10 minutes. Is this one-sided?','Yes; it targets delay above 10.'],
 ['Choose the favorable side after seeing the estimate. Why wrong?','It changes the false-positive rate from the planned procedure.'],
 ['What does a lower-tail alternative test?','Whether the parameter is below the null threshold.'],
 ['What should be justified for a one-sided choice?','The scientific or decision reason for that direction, before testing.'],
 ['A safety analysis cares about either harm or benefit. Is a favorable-only test enough?','No. Opposite-direction effects also need appropriate examination.'],
 ['Can a one-sided result support a claim in the opposite direction?','No; that requires a suitable separately specified analysis.']
],{pre:['null-alternative','alpha']});
s(5,'two-sided','Hypothesis testing','Two-sided test','A test for departures in either direction from the null.','Detect increases or decreases without selecting a direction after looking.','Under a symmetric normal test, use both tails for an alternative of nonzero difference.','Watch both ends of a seesaw.',[
 ['H1: mean differs from 10. What type of test?','Two-sided.'],
 ['A two-sided p is always exactly twice any one-sided p. Why too broad?','That relation depends on the test, direction and distribution.'],
 ['For a symmetric standard-normal test with |z|=1.96, approximate two-sided p?','About 5%; each tail contributes about 2.5%.'],
 ['What must remain unchanged after seeing an unexpected sign?','The prespecified alternative and testing procedure.'],
 ['A feature can raise or lower churn. Which alternative naturally captures both?','A two-sided difference from zero.'],
 ['Why is p=0.049 versus 0.051 not a large evidence jump?','The values are nearly identical; a threshold creates a decision label, not a discontinuity in evidence.']
],{pre:['one-sided','p-value'],sources:['quant-stat-nist','quant-stat-asa']});
s(5,'z-test','Hypothesis testing','Standardized test statistic','A null-centered estimate divided by its null standard error.','Measure distance from the null in uncertainty units.','z = (estimate−null value)/SE under a valid standard-normal approximation.','Count how many noise-sized steps separate the estimate from the null.',[
 ['Estimate=12, null=10, SE=1. What is z?','(12−10)/1 = 2.'],
 ['z=2 means the effect is twice the average outcome. Why wrong?','It is twice the SE away from the null, not twice the outcome.'],
 ['Same effect difference, smaller SE: what happens to |z|?','It increases.'],
 ['What justifies comparison with normal critical values?','The null distribution or an appropriate approximation.'],
 ['Difference=0.02 and SE=0.01. Standardized statistic?','z=2; the difference is 2 percentage points if rates are proportions.'],
 ['Why can huge n make a tiny effect produce a large z?','SE decreases while the nonzero effect remains.']
],{pre:['z-score','se-mean','null-alternative'],formula:'z = (estimate − null value) / SE',checks:[{expression:'(12-10)/1',value:2},{expression:'.02/.01',value:2}]});
s(5,'t-vs-z','Hypothesis testing','t versus z inference','t inference includes uncertainty from estimated SD in the basic normal-mean problem.','Choose a reference distribution that matches the estimation procedure.','A one-sample normal-mean t statistic uses (mean−μ0)/(s/√n), with n−1 degrees of freedom.','Uncertain noise size requires heavier reference tails.',[
 ['A normal sample has n=10 and unknown SD. One-sample t degrees of freedom?','10−1 = 9.'],
 ['Use z because the outcome is measured accurately. Why wrong?','The choice depends on sampling and estimated variance, not instrument precision alone.'],
 ['With larger degrees of freedom, how does t compare with z?','t approaches the standard normal distribution.'],
 ['What assumption is important for exact small-sample t inference?','Independent normal observations.'],
 ['Mean=11, null=10, s=2, n=16. What is t?','1/(2/4) = 2, with 15 degrees of freedom.'],
 ['Why is an arbitrary “n≥30 means z” rule insufficient?','Tail shape, dependence and variance estimation still matter.']
],{pre:['t-mean-ci','z-test'],formula:'t = (mean − μ0)/(s/√n)',checks:[{expression:'(11-10)/(2/Math.sqrt(16))',value:2}]});
s(5,'absence-evidence','Hypothesis testing','Absence of evidence','A failure to detect an effect, which need not demonstrate its absence.','Avoid ruling out benefits or harms from an imprecise study.','Inspect the interval and the effects it can still accommodate.','A dim flashlight failing to show an object does not prove the room is empty.',[
 ['Effect CI is [−10,15]. Does it establish no meaningful effect?','No. It includes substantial effects in both directions.'],
 ['p>0.05 proves equivalence. What is wrong?','Equivalence needs a planned margin and a suitable interval or test.'],
 ['CI [−0.1,0.1] versus [−10,10]: which gives stronger precision near zero?','The narrow interval, under valid comparable assumptions.'],
 ['What must be defined before claiming practical equivalence?','A justified smallest important difference or equivalence margin.'],
 ['A trial cannot rule out a large harm. Should “not significant” settle safety?','No. The remaining plausible harm matters.'],
 ['Can a study support little practical effect without proving exact zero?','Yes, when a valid precise interval excludes meaningful effects.']
],{pre:['confidence-coverage','power','interval-width']});
s(5,'practical-significance','Effect sizes','Practical significance','Whether an effect is large enough to matter for a real decision.','Link statistical evidence to costs, benefits and outcomes.','Compare effect size and uncertainty with a prespecified useful threshold.','A ruler can detect a millimeter change even when a bridge needs meters.',[
 ['A huge study detects a €0.01 gain per sale. Is it automatically valuable?','No. Volume, implementation cost and uncertainty determine value.'],
 ['p<0.001 proves a result is important. What is wrong?','A p-value does not measure effect size or importance.'],
 ['Statistical versus clinical significance?','Statistical evidence concerns a model; clinical importance concerns meaningful patient outcomes.'],
 ['What inputs make an effect economically meaningful?','Absolute effect, scale of use, costs, risks and uncertainty.'],
 ['A feature gains €0.01 on 1 million sales but costs €20,000. Net effect before other costs?','€10,000−€20,000 = −€10,000.'],
 ['Why can a nonsignificant large estimate still warrant further study?','It may be useful but too uncertain to act on confidently.']
],{pre:['p-value','absence-evidence'],sources:['quant-stat-asa'],checks:[{expression:'.01*1000000-20000',value:-10000}]});
s(5,'effect-size','Effect sizes','Effect size','The magnitude of a difference or association.','Compare what changed, rather than only whether a test crossed a threshold.','Report units or a clear standardized scale and uncertainty.','Measure how far a door moved, not only whether its movement was detected.',[
 ['Mean sales rise from €100 to €110. Absolute effect?','€10 per observation.'],
 ['Report only p=0.01 and omit the estimated difference. What is missing?','The size, units and uncertainty of the effect.'],
 ['10% relative increase versus 10 percentage-point increase?','Relative change uses the baseline; percentage points subtract two percentages.'],
 ['What should accompany an effect estimate?','Its interval, target population and outcome definition.'],
 ['Conversion rises from 10% to 12%. Absolute and relative effects?','+2 percentage points; +20% relative.'],
 ['Can equal standardized effects imply equal business value?','No. Baseline levels, units, costs and populations can differ.']
],{pre:['practical-significance'],checks:[{expression:'(.12-.1)/.1*100',value:20}]});
s(5,'cohens-d','Effect sizes','Cohen’s d','A mean difference divided by a chosen within-group SD scale.','Compare differences measured on different numerical scales.','For a basic two-group d, divide the mean difference by pooled within-group SD.','Express the gap in typical within-group spread units.',[
 ['Means 60 and 50; pooled SD=10. What is d?','(60−50)/10 = 1.'],
 ['d=1 means a 100% improvement. Why wrong?','It means one pooled SD of difference, not a relative percentage increase.'],
 ['Same mean gap with twice the pooled SD: what happens to d?','d is halved.'],
 ['What should be checked before interpreting d?','SD definition, group comparability, distribution and the direction of subtraction.'],
 ['A 2-point gap on a scale with pooled SD 8: d?','2/8 = 0.25.'],
 ['Why should generic labels such as “small” not decide value?','A standardized effect’s importance depends on context and concrete outcomes.']
],{pre:['effect-size','sd-intuition'],sources:['quant-stat-cochrane','quant-stat-nist'],formula:'d = (meanA − meanB) / pooled within-group SD',checks:[{expression:'(60-50)/10',value:1},{expression:'2/8',value:.25}]});
s(5,'planned-threshold','Study design','Prespecified meaningful threshold','A decision boundary chosen for practical relevance before inspecting the result.','Keep economic decisions from following whichever estimate looks favorable.','Define the smallest useful effect, costs and analysis plan in advance.','Mark the finish line before starting the race.',[
 ['A feature needs at least +1 percentage point conversion to cover costs. What is its useful threshold?','A 1-percentage-point absolute gain.'],
 ['Change the useful threshold from 2 points to 0.1 after seeing a small effect. What is the concern?','The standard was selected to favor the result.'],
 ['Useful-effect threshold versus alpha?','One measures practical magnitude; alpha sets statistical false-alarm tolerance.'],
 ['What evidence should justify a meaningful threshold?','Costs, benefits, risks and stakeholder outcomes.'],
 ['Estimated lift=0.8 points, CI [0.1,1.5], useful threshold=1. Is useful benefit established?','No. The interval includes gains below and above 1 point.'],
 ['Why revisit the threshold transparently if costs genuinely change?','A real decision change is possible, but it must not be hidden as a prespecified standard.']
],{pre:['practical-significance','effect-size','alpha']});

// 6: Interpret effect measures and associations without confusing them with causes.
s(6,'absolute-risk','Effect measures','Absolute risk difference','The difference between two event probabilities.','State how many extra or fewer events an effect represents.','Risk difference = riskA − riskB; percentage risks give percentage-point differences.','Compare the actual sizes of two slices, not just their ratio.',[
 ['Hypothetical event risks are 3% and 2%. Absolute difference?','1 percentage point, or 10 events per 1,000 people.'],
 ['A rise from 2% to 3% is a 1% relative increase. Why wrong?','It is +1 percentage point and +50% relative.'],
 ['Same relative reduction at 20% versus 2% baseline: same absolute benefit?','No. A 50% reduction gives 10 versus 1 percentage point.'],
 ['What must match when comparing risks?','Outcome definition, follow-up period and relevant populations.'],
 ['A hypothetical treatment lowers risk from 10% to 8%. Fewer events per 1,000?','20 fewer: (0.10−0.08)×1,000.'],
 ['Why can an identical relative effect have different practical value?','Baseline risk changes the absolute number of events affected.']
],{pre:['effect-size','sample-proportion'],sources:['quant-stat-cochrane','quant-stat-discrete'],formula:'risk difference = riskA − riskB',checks:[{expression:'(.1-.08)*1000',value:20}]});
s(6,'risk-ratio','Effect measures','Risk ratio','One event probability divided by another.','Compare proportional risk while keeping the baseline visible.','RR = riskA/riskB, where the denominator risk is positive.','Ask how many times one slice fits inside the other.',[
 ['Risk A=4%, B=2%. What is RR?','4%/2% = 2.'],
 ['RR=2 means an increase of 2 percentage points in every setting. Why wrong?','The absolute change depends on baseline risk.'],
 ['RR=0.7 means what relative change versus the denominator group?','30% lower risk.'],
 ['What must accompany RR for practical interpretation?','Baseline risk, absolute difference and follow-up time.'],
 ['Baseline risk 10%, RR=1.5. New risk?','15%, a 5-percentage-point absolute increase.'],
 ['Does an observational RR of 2 prove the exposure doubles causal risk?','No. Confounding, selection and measurement can affect it.']
],{pre:['absolute-risk'],sources:['quant-stat-cochrane','quant-stat-discrete'],formula:'RR = riskA / riskB',checks:[{expression:'.04/.02',value:2},{expression:'.1*1.5',value:.15}]});
s(6,'odds-ratio','Effect measures','Odds ratio','A ratio of odds, where odds = probability/(1−probability).','Interpret case-control and logistic-model associations correctly.','OR = [pA/(1−pA)]/[pB/(1−pB)].','Odds compare events with non-events, rather than events with everyone.',[
 ['pA=20%, pB=10%. What is OR?','(0.20/0.80)/(0.10/0.90) = 2.25.'],
 ['OR=2.25 means risk is exactly 2.25 times higher. Why wrong?','Odds ratios differ from risk ratios, especially for common outcomes.'],
 ['For pA=20%, pB=10%, what is RR?','2, compared with OR 2.25.'],
 ['When may OR approximate RR?','When outcomes are sufficiently rare in the compared groups.'],
 ['Baseline p=50%, OR=2. What is the comparison probability?','Baseline odds 1; new odds 2; p=2/(1+2)=66.7%.'],
 ['Why cannot case-control sampling usually estimate population risk directly?','The sampled case/control proportions are set by design, not population prevalence.']
],{pre:['risk-ratio'],sources:['quant-stat-discrete','quant-stat-cochrane'],formula:'odds=p/(1−p); OR=oddsA/oddsB',checks:[{expression:'(.2/.8)/(.1/.9)',value:2.25},{expression:'2/(1+2)*100',value:66.66666666666666}]});
s(6,'nnt','Effect measures','Number needed to treat','The reciprocal of an absolute risk reduction over a specified time.','Translate a hypothetical benefit into an easily pictured event count.','NNT = 1/ARR, using probability units, and usually round upward.','How many people need the intervention for one additional prevented event on average?',[
 ['Hypothetical risk falls from 10% to 8%. What is NNT?','1/0.02 = 50 over the stated follow-up.'],
 ['Use a 20% relative reduction as 0.20 in the NNT formula. Why wrong?','NNT uses absolute risk reduction, here 0.02.'],
 ['ARR 1% versus 2%: NNT values?','100 versus 50.'],
 ['What must always accompany an NNT?','Outcome, follow-up time, baseline risk and uncertainty.'],
 ['Hypothetical ARR=3%. Rounded-up NNT?','1/0.03≈33.33, so 34.'],
 ['If the risk-difference CI includes zero, why is one finite NNT misleading?','The compatible effects include no benefit and possibly harm; reciprocal limits can diverge.']
],{pre:['absolute-risk'],sources:['quant-stat-cochrane'],formula:'NNT = 1 / absolute risk reduction',checks:[{expression:'1/.02',value:50},{expression:'Math.ceil(1/.03)',value:34}]});
s(6,'hazard-ratio','Effect measures','Hazard ratio','A ratio of instantaneous event rates among those still at risk.','Read time-to-event results without treating hazards as cumulative probabilities.','A constant HR assumes proportional hazards; interpret the time scale and model.','Compare each group’s event pace among people still event-free.',[
 ['Under proportional hazards, HR=0.7 means what hazard difference?','30% lower instantaneous hazard in the numerator group.'],
 ['HR=0.7 guarantees 30% fewer total events at every time. Why wrong?','Hazards and cumulative risks are different quantities.'],
 ['Risk ratio versus hazard ratio?','RR compares cumulative event probabilities; HR compares instantaneous event rates.'],
 ['What assumption supports one constant Cox-model HR?','Proportional hazards over the modeled time, plus other model and censoring assumptions.'],
 ['Survival curves cross. What concern arises about one constant HR?','The relative hazard may change over time; one number can hide that pattern.'],
 ['Why report absolute survival probabilities alongside HR?','They show the event burden and practical magnitude at useful times.']
],{pre:['risk-ratio','prediction-interval'],sources:['quant-stat-survival','quant-stat-cochrane'],formula:'HR(t) = hazardA(t) / hazardB(t)'});
s(6,'pearson','Association','Pearson correlation','Standardized covariance measuring a linear relationship.','Compare linear co-movement on a unit-free scale.','r = covariance/(SDx×SDy), for positive SDs; r ranges from −1 to 1.','A tight straight cloud has |r| near 1.',[
 ['What does r=−0.8 describe?','A strong negative linear association, not proof of causation.'],
 ['r=0.8 means 80% of outcomes are caused by x. Why wrong?','Correlation is not a causal percentage.'],
 ['What happens to r if x is converted from meters to centimeters?','Nothing, for a positive linear unit conversion.'],
 ['What should accompany a Pearson correlation?','A scatterplot, sample size, outlier checks and uncertainty.'],
 ['x values 1,2,3 and y values 2,4,6. Pearson r?','+1: a perfect increasing straight-line relationship.'],
 ['Can one extreme paired point strongly alter r?','Yes. Pearson correlation can be sensitive to influential observations.']
],{pre:['covariance-intuition','population-sd','correlation-intuition'],formula:'r = cov(x,y)/(SDx×SDy)'});
s(6,'spearman','Association','Spearman rank correlation','Pearson correlation computed on ranks, with ties handled appropriately.','Measure monotonic association without requiring a straight-line scale.','Rank both variables and correlate the ranks.','Compare who stands first, second and third rather than their exact distances.',[
 ['Both variables rank three people in the same order. Spearman correlation?','+1, if there are no ties.'],
 ['Spearman detects every kind of dependence. Why wrong?','It measures monotonic association and can miss non-monotonic patterns.'],
 ['Increasing curved relationship: Pearson versus Spearman?','Spearman can be 1 even when Pearson is below 1.'],
 ['What should be checked when many values tie?','The rank convention and appropriate inference with ties.'],
 ['A ranking is exactly reversed without ties. Spearman correlation?','−1, a perfect reversal of ranks.'],
 ['Does using ranks remove all selection or causal problems?','No. Rank transformation does not fix study design.']
],{pre:['pearson','percentile'],formula:'Spearman r = Pearson correlation of the ranks'});
s(6,'covariance-formula','Association','Sample covariance','A paired-deviation measure of how two variables vary together.','Calculate dependence contributions in portfolios or paired data.','Sample cov = Σ[(x−meanx)(y−meany)]/(n−1).','Matching positive and negative deviations add; opposing deviations subtract.',[
 ['Pairs (1,2),(3,4). What is sample covariance?','Means 2 and 3; (1+1)/(2−1)=2.'],
 ['Multiply deviations from unpaired rows. What is wrong?','Covariance requires the original pairing.'],
 ['Multiply x by 10. What happens to covariance with y?','It multiplies by 10; correlation stays the same for positive scaling.'],
 ['What units does covariance carry?','The product of the variables’ units, such as meters×euros.'],
 ['If covariance is 6, SDx=2 and SDy=3, what is r?','6/(2×3)=1.'],
 ['Why can sample covariance be unstable for tail-heavy returns?','A few extreme paired deviations can dominate its value.']
],{pre:['covariance-intuition','sample-variance','pearson'],formula:'sample cov(x,y) = Σ[(x−meanx)(y−meany)]/(n−1)',checks:[{expression:'(1+1)/(2-1)',value:2},{expression:'6/(2*3)',value:1}]});
s(6,'zero-correlation','Association','Zero correlation and nonlinear dependence','No linear association need not mean no relationship.','Avoid discarding curved patterns after one coefficient.','Inspect the scatterplot and the substantive form of the relationship.','A U-shaped road has no single upward or downward straight slope.',[
 ['x=−1,0,1 and y=x². Pearson correlation?','0, although y is completely determined by x.'],
 ['r=0 proves independence. What is wrong?','Nonlinear dependence may still exist.'],
 ['When can zero covariance imply independence?','For a jointly normal pair, but not generally.'],
 ['What diagnostic is essential before concluding no relationship?','A paired-data plot and relevant nonlinear checks.'],
 ['Temperature extremes both reduce sales. Why might linear correlation be weak?','The pattern can be inverted-U-shaped rather than monotonic.'],
 ['Can rank correlation also miss a symmetric U-shape?','Yes. Increasing then decreasing patterns may cancel.']
],{pre:['pearson','spearman','independent-observations']});
s(6,'measurement-attenuation','Measurement','Attenuation from measurement error','Classical independent noise can reduce an observed association toward zero.','Avoid confusing noisy measurements with absence of a relationship.','Under a classical model, observed r = true r×√(reliabilityX×reliabilityY).','A blurred photograph hides a pattern without removing the underlying objects.',[
 ['True r=0.8, both reliabilities=0.64. Expected observed r under the classical model?','0.8×√(0.64×0.64)=0.512.'],
 ['Measurement error always only weakens association. Why too broad?','Nonclassical or correlated errors can distort it in other directions.'],
 ['Precision of a large sample versus reliability of measurement?','More rows can estimate a noisy association precisely without fixing measurement noise.'],
 ['What assumptions support the attenuation formula?','Appropriate classical errors, independent of true values and of each other.'],
 ['A short noisy questionnaire gives weak correlation. What should be checked?','Its reliability and whether it measures the intended construct.'],
 ['Why is blindly correcting r for guessed reliability risky?','A wrong reliability or error model can exaggerate the corrected association.']
],{pre:['pearson','uncertainty'],sources:['quant-stat-estimation','quant-stat-nist'],formula:'r(observed) = r(true)×√(reliabilityX×reliabilityY), under a classical error model',checks:[{expression:'.8*Math.sqrt(.64*.64)',value:.512}]});
s(6,'regression-mean','Association','Regression to the mean','Extreme noisy measurements tend to be less extreme on remeasurement.','Avoid crediting an intervention for ordinary statistical reversion.','Compare with a suitable control or account for selection on extreme baseline values.','The tallest wave is unlikely to be followed by an equally tall wave.',[
 ['You select users after unusually slow days. Their next day improves. One possible explanation?','Regression to the mean, even without an intervention.'],
 ['Every extreme result must reverse completely next time. Why wrong?','Regression to the mean is a statistical tendency, not a deterministic rule.'],
 ['A genuinely high ability versus one unusually high noisy score?','Persistent ability can remain high while transient noise fades.'],
 ['What design helps distinguish intervention effects from regression to the mean?','A comparable randomized control selected using the same baseline rule.'],
 ['Worst-performing stores improve after coaching, with no control. What concern?','Their selected low baseline may partly recover without coaching.'],
 ['Does regression to the mean prove market prices always mean-revert profitably?','No. Asset prices, returns and selected noisy estimates are different targets.']
],{pre:['correlation-intuition','sampling-distribution']});
s(6,'confounding','Causal reasoning','Confounding','A noncausal path that mixes an exposure–outcome association with other influences.','Avoid treating an association as a causal effect.','Use design and a causal model to identify relevant common causes.','A third hand moves both objects you thought were pushing each other.',[
 ['Exercise and health are associated; income affects both. What role may income play?','A confounder, if it is a common cause of exposure and outcome.'],
 ['Adjust for every recorded variable to remove confounding. Why unsafe?','Some variables are mediators or colliders and can create bias.'],
 ['Random treatment assignment versus observational comparison?','Random assignment breaks baseline treatment selection in expectation; observational data need stronger assumptions.'],
 ['What should justify a confounder adjustment set?','Substantive causal knowledge, timing and a defensible causal diagram.'],
 ['Premium customers spend more after a feature. Why compare their pre-feature characteristics?','Income or prior engagement may explain both uptake and spending.'],
 ['Does adjusting measured age eliminate all confounding?','No. Unmeasured or poorly measured common causes may remain.']
],{pre:['correlation-intuition','selection-bias'],sources:['quant-stat-causal']});
s(6,'collider','Causal reasoning','Collider bias','Bias that can arise from conditioning on a common effect of two variables.','Avoid introducing associations through filters or inappropriate controls.','A collider has arrows entering it from two variables; conditioning can open a noncausal path.','Selecting only admitted students can trade off wealth and ability in the selected group.',[
 ['Ability and wealth both influence admission. Is admission a collider in that simple diagram?','Yes: ability → admission ← wealth.'],
 ['Controlling admission always removes bias. Why wrong?','Conditioning on the common effect can create an association between its causes.'],
 ['Confounder versus collider in a simple three-node graph?','Confounder is a common cause; collider is a common effect.'],
 ['What must be known before deciding whether to control a variable?','Its causal role and the question being estimated.'],
 ['You analyze only hospitalized people when two causes affect hospitalization. Main selection concern?','Hospitalization can be a collider, distorting the causes’ association.'],
 ['Is the direction of collider bias always negative?','No. It depends on the causal mechanism and relationships.']
],{pre:['confounding'],sources:['quant-stat-causal']});
s(6,'simpson','Association','Simpson’s paradox','An aggregate association can reverse the direction seen within groups.','Check whether group mix hides or reverses comparisons.','Compare within relevant strata and choose weights consistent with the target.','Different mixtures of easy and hard tasks can reverse the overall leaderboard.',[
 ['A wins 9/10 easy and 20/100 hard; B wins 80/100 easy and 1/10 hard. Within-group winner?','A: 90%>80% on easy; 20%>10% on hard.'],
 ['A is better in both groups, so its overall observed rate must be higher. Why wrong?','Different group weights can reverse the aggregate rate.'],
 ['What are overall rates in that example?','A=29/110≈26.4%; B=81/110≈73.6%.'],
 ['What determines whether stratifying is appropriate?','The target comparison and causal roles of the grouping variables.'],
 ['Standardize both to 50% easy and 50% hard. Rates?','A=55%; B=45%.'],
 ['Should every aggregate reversal be “fixed” by controlling the group?','No. A grouping variable could be a mediator or collider; the causal question matters.']
],{pre:['weighted-mean','confounding','collider'],sources:['quant-stat-causal','quant-stat-discrete'],checks:[{expression:'29/110*100',value:26.36363636363636},{expression:'81/110*100',value:73.63636363636364},{expression:'.5*.9+.5*.2',value:.55}]});
s(6,'effect-modification','Association','Effect modification','An effect can differ across subgroups or contexts.','Avoid assuming one average applies equally to everyone.','Estimate subgroup contrasts and test their difference directly with uncertainty.','The same umbrella helps more in heavy rain than in a light drizzle.',[
 ['Treatment gains are 5 points in A and 1 in B. Difference in estimated effects?','4 points, before considering uncertainty.'],
 ['Significant in A and nonsignificant in B proves different effects. Why wrong?','You must assess the difference between effects directly.'],
 ['Effect modification versus confounding?','Modification describes different effects; confounding distorts a causal comparison.'],
 ['What should be checked for a subgroup claim?','Prespecification, sample sizes, interaction uncertainty and multiple testing.'],
 ['A feature boosts new-user retention but not established-user retention. What should be estimated?','The interaction between feature assignment and user group.'],
 ['Why can effect modification depend on the scale?','A constant risk ratio can coexist with different absolute risk differences.']
],{pre:['effect-size','two-mean-se','confounding'],sources:['quant-stat-causal','quant-stat-cochrane'],checks:[{expression:'5-1',value:4}]});

// 7: Account for selection, repeated testing and realistic study power.
s(7,'multiple-testing','Multiple testing','Multiplicity','Testing or selecting among many possibilities creates more opportunities for chance findings.','Avoid treating the best of many results as a single planned test.','Define the family of claims and account for the search process.','More lottery tickets create more chances to see an unusual winning number.',[
 ['100 valid true-null tests each use alpha=5%. Expected false positives?','100×5% = 5.'],
 ['Five expected false positives means exactly five will occur. Why wrong?','Expectation is an average over repeated experiments, not a fixed count.'],
 ['Does independence matter for the expected count of false positives?','Not for summing valid individual false-positive probabilities.'],
 ['What must be counted besides the displayed final test?','Outcomes, subgroups, models and other tried analyses.'],
 ['You try 200 trading indicators and report one p=0.03. What is missing?','The search family and a procedure that accounts for selection.'],
 ['Can a later genuinely independent confirmation test help?','Yes, when the hypothesis and confirmation procedure are fixed before new data.']
],{pre:['type-one','alpha'],sources:['quant-stat-nist','quant-stat-asa'],checks:[{expression:'100*.05',value:5}]});
s(7,'familywise-error','Multiple testing','Familywise error rate','The probability of at least one false rejection in a specified testing family.','Control false alarms across a set of confirmatory claims.','For m independent true nulls at alpha, FWER=1−(1−alpha)^m.','Ask whether any alarm rang falsely across the entire building.',[
 ['20 independent true-null tests at alpha=5%. FWER?','1−0.95^20≈64.2%.'],
 ['Every test uses 5%, so the whole family has 5% error. Why wrong?','Several tests create several opportunities for a false rejection.'],
 ['FWER versus expected false-positive count?','FWER is a probability of any error; expected count averages the number of errors.'],
 ['What must be clear before controlling FWER?','Which hypotheses belong to the family.'],
 ['Two independent true-null tests each use 5%. Chance of at least one false rejection?','1−0.95²=9.75%.'],
 ['Is the independent formula valid for strongly dependent tests?','Not generally; use a valid method or dependence model.']
],{pre:['multiple-testing'],formula:'independent true-null FWER = 1 − (1−alpha)^m',checks:[{expression:'(1-.95**20)*100',value:64.15140775914581},{expression:'(1-.95**2)*100',value:9.750000000000004}]});
s(7,'false-discovery-rate','Multiple testing','False discovery rate','The expected proportion of false rejections among all rejections, with zero when none are rejected.','Manage error in large exploratory discovery sets.','FDR=E[V/max(R,1)], where V is false rejections and R all rejections.','Ask what share of reported discoveries is false on average, rather than whether any are false.',[
 ['A realized set has 2 false among 20 discoveries. Its false-discovery proportion?','2/20=10%; FDR is the expectation across repetitions.'],
 ['FDR control at 5% guarantees at most 5% false findings in every run. Why wrong?','It controls an expected proportion, not every realized set.'],
 ['FDR versus FWER?','FDR allows some false discoveries on average; FWER limits the chance of even one.'],
 ['What happens to the proportion when no hypotheses are rejected?','It is defined as zero.'],
 ['A genomic screen makes many discoveries. Which error target may be appropriate?','FDR, with justified assumptions and independent follow-up.'],
 ['Can a 5% FDR be interpreted as each selected claim having a 5% chance of being false?','No. It is a procedure-level aggregate expectation.']
],{pre:['familywise-error'],sources:['quant-stat-bh'],formula:'FDR = E[V / max(R,1)]',checks:[{expression:'2/20*100',value:10}]});
s(7,'bonferroni','Multiple testing','Bonferroni correction','A familywise-error rule testing m claims at alpha/m each.','Give a simple conservative protection across planned tests.','Reject an individual null only when its valid p≤alpha/m.','Divide the family’s false-alarm budget among its alarms.',[
 ['Alpha=0.05 with 10 tests. Individual threshold?','0.05/10=0.005.'],
 ['Bonferroni requires independent tests. Why wrong?','Its familywise-error bound does not require independence.'],
 ['p=0.004 in a 10-test 5% family: rejected by Bonferroni?','Yes, because 0.004≤0.005.'],
 ['What is still required even after correcting?','Valid individual p-values and an honestly defined testing family.'],
 ['A family has 20 tests and p=0.01. Pass 5% Bonferroni?','No. Threshold=0.0025.'],
 ['Why can Bonferroni have low power for many strongly related tests?','The bound can be conservative and makes each individual threshold very small.']
],{pre:['familywise-error'],sources:['quant-stat-nist'],formula:'individual threshold = family alpha / m',checks:[{expression:'.05/10',value:.005},{expression:'.05/20',value:.0025}]});
s(7,'holm','Multiple testing','Holm step-down correction','A sorted-p procedure controlling familywise error while improving on simple Bonferroni.','Gain power without discarding familywise protection.','Sort p-values; compare p(i) with alpha/(m−i+1), stopping at the first failure.','Start with the strictest gate and relax gates only after earlier ones pass.',[
 ['m=3, alpha=.05, p=.01,.03,.04. Which pass Holm?','Only .01: .01≤.0167, but .03>.025, so stop.'],
 ['After the second Holm test fails, accept the third because .04<.05. Why wrong?','Holm stops rejecting at the first failure.'],
 ['Holm versus Bonferroni under valid p-values?','Holm also controls FWER and is never less powerful.'],
 ['What ordering is required?','Sort p-values from smallest to largest.'],
 ['For m=4 and alpha=.05, what is the first threshold?','0.05/4=0.0125.'],
 ['Does Holm fix a p-value obtained from undisclosed optional stopping?','No. Its inputs must themselves be valid.']
],{pre:['bonferroni'],sources:['quant-stat-holm'],formula:'Holm threshold at ordered rank i = alpha/(m−i+1)',checks:[{expression:'.05/4',value:.0125}]});
s(7,'benjamini-hochberg','Multiple testing','Benjamini–Hochberg procedure','A sorted-p step-up method for controlling FDR under suitable dependence conditions.','Find signals in large screens with a stated discovery-error target.','Find largest k with p(k)≤(k/m)q; reject all ordered p-values through k.','The final passing rank sets the discovery cutoff.',[
 ['m=5, q=.05, p=.001,.01,.03,.2,.6. How many BH rejections?','3; rank-3 threshold is .03 and later ranks fail.'],
 ['BH always controls FDR under any dependence structure. Why wrong?','Its guarantee needs independence or suitable positive-dependence conditions.'],
 ['BH’s target q versus Bonferroni’s alpha?','q controls expected false-discovery proportion; Bonferroni controls FWER.'],
 ['What must be checked before applying standard BH?','Valid p-values, the family and the relevant dependence assumptions.'],
 ['m=100, q=.05, rank i=10. What is its BH comparison threshold?','(10/100)×.05=.005.'],
 ['Why may an arbitrary-dependent screen need another procedure?','The usual BH proof may not apply; a more conservative valid adjustment can be needed.']
],{pre:['false-discovery-rate','holm'],sources:['quant-stat-bh'],formula:'BH: largest k with p(k)≤(k/m)q; reject ranks 1..k',checks:[{expression:'10/100*.05',value:.005}]});
s(7,'optional-stopping','Study design','Optional stopping','Ending a study based on repeatedly inspected results.','Keep sequential decisions from inflating ordinary fixed-sample error rates.','Use a prespecified valid sequential procedure or keep the fixed-sample plan.','Repeatedly checking the race clock changes the chance of spotting a favorable moment.',[
 ['You inspect p daily and stop at p<.05 using an ordinary final test. Main concern?','The actual procedure can have more false positives than the fixed-sample test.'],
 ['The final sample is large, so unplanned stopping cannot matter. Why wrong?','Sample size alone does not validate the stopping rule.'],
 ['Can repeated monitoring be statistically valid?','Yes, with an appropriate planned sequential design.'],
 ['What should the analysis plan specify about monitoring?','When data are viewed, decision boundaries and stopping conditions.'],
 ['An app experiment stops at the first favorable day. What should be reviewed?','The full monitoring procedure, not just that day’s p-value.'],
 ['Can unrelated operational stopping differ from significance-driven stopping?','Yes. Its effect depends on the stopping mechanism and chosen inference method.']
],{pre:['alpha','multiple-testing'],sources:['quant-stat-asa','quant-stat-nist']});
s(7,'p-hacking','Research reliability','P-hacking','Using data-dependent choices to find or selectively present favorable statistical results.','Recognize hidden searches behind a seemingly simple claim.','Disclose outcomes, exclusions, subgroups, models and stopping decisions.','Try many keys, then claim the one that opened the door was chosen beforehand.',[
 ['Try 30 outcome definitions and report only the significant one. What issue?','Selective analysis and reporting; the search increases chance findings.'],
 ['Changing models after seeing data is always forbidden. Why too broad?','Exploration is useful when labeled and evaluated honestly; concealment is the problem.'],
 ['Exploratory versus confirmatory analysis?','Exploratory analysis generates hypotheses; confirmation tests prespecified claims appropriately.'],
 ['What makes analysis flexibility visible?','A complete protocol, code, deviations and reporting of unsuccessful analyses.'],
 ['Removing two observations makes p fall below .05. What must be justified?','A defensible exclusion rule independent of wanting significance, with sensitivity analysis.'],
 ['Why can a “garden of forking paths” inflate evidence without deliberate cheating?','Outcome-dependent reasonable choices can still create an unaccounted search.']
],{pre:['multiple-testing','optional-stopping'],sources:['quant-stat-asa']});
s(7,'harking','Research reliability','HARKing','Presenting a hypothesis formed after seeing results as though it was specified before.','Separate discovery from independent evidence for a claim.','Label post-data hypotheses exploratory and seek a new appropriate test.','Draw the bullseye around the arrow after it lands.',[
 ['A surprising subgroup result inspires a theory, then is called predicted. What is this?','HARKing: hiding when the hypothesis was formed.'],
 ['A convincing story after the result counts as an independent prediction. Why wrong?','The story was informed by the same data.'],
 ['Is forming new hypotheses from data useful?','Yes, if their exploratory origin is clear.'],
 ['What document helps show a claim was prespecified?','A timestamped protocol with a sufficiently clear hypothesis and analysis.'],
 ['A model finds a new pattern. What is a good next step?','Define the prediction and evaluate it with independent data.'],
 ['Can a preregistration containing many vague possible claims prevent HARKing fully?','No. Specificity and transparent deviations still matter.']
],{pre:['p-hacking'],sources:['quant-stat-asa']});
s(7,'publication-bias','Research reliability','Publication bias','Available studies differ systematically from the studies that were conducted.','Avoid mistaking a selected literature for the full evidence.','Search unpublished results, registries and reporting patterns.','A library displaying only winning tickets hides the losing tickets.',[
 ['Positive studies are published more often than null studies. What bias arises?','Publication bias in the visible evidence.'],
 ['Ten published positive studies prove no null studies exist. Why wrong?','Unpublished or selectively reported results may be missing.'],
 ['Publication bias versus sampling error?','Publication bias selects available results; sampling error varies within studies.'],
 ['What can reveal missing or selectively reported studies?','Registries, protocols, searches for unpublished work and outcome comparisons.'],
 ['A review sees only small positive trials. What should it investigate?','Small-study effects, reporting bias and methodological quality.'],
 ['Does an asymmetric funnel plot prove publication bias?','No. Heterogeneity and other small-study effects can also cause asymmetry.']
],{pre:['p-hacking','selection-bias'],sources:['quant-stat-cochrane']});
s(7,'winners-curse','Research reliability','Winner’s curse','Selected impressive estimates tend to overstate the underlying effect.','Expect discovered “best” signals to weaken in fresh data.','Account for selecting large estimates or significant results from noisy candidates.','The winner of a noisy contest often enjoyed an unusually lucky performance.',[
 ['Choose the largest of 100 noisy estimated gains. What should you expect?','Its estimate is likely inflated by selection.'],
 ['A top-performing backtest must retain the same return out of sample. Why wrong?','Selection can favor noise and overstate future performance.'],
 ['Winner’s curse versus a biased estimator before selection?','An otherwise unbiased estimate can become biased after selection.'],
 ['What helps assess the selected winner?','Independent validation, disclosure of the search and appropriate selection-aware methods.'],
 ['A low-power study is published only if significant. What tends to happen to selected effect estimates?','They can be disproportionately large relative to the true effect.'],
 ['Why can replication shrink the estimate without disproving any real effect?','The first estimate may contain favorable selection noise.']
],{pre:['estimator-bias','power','multiple-testing'],sources:['quant-stat-cochrane','quant-stat-asa']});
s(7,'replication','Research reliability','Replication','A new attempt to test or estimate a previously studied claim.','Check whether evidence survives new data and conditions.','Compare effect estimates, uncertainty, methods and target populations.','A second independent photograph helps distinguish an object from a camera artifact.',[
 ['A new independent sample tests the same prespecified effect. What does it add?','Fresh evidence beyond the original sample.'],
 ['Original p<.05 and replication p>.05 prove contradictory effects. Why wrong?','Compare estimates and uncertainty; labels alone can differ through noise.'],
 ['Direct versus conceptual replication?','Direct uses similar procedures; conceptual tests the underlying claim through different methods.'],
 ['What must be checked before comparing replications?','Outcome definitions, populations, methods and precision.'],
 ['Original effect 5, CI [1,9]; replication 2, CI [0,4]. Automatically inconsistent?','No. Their intervals overlap and the estimates have uncertainty.'],
 ['Why does several independent precise replications usually help more than repeatedly reanalyzing one sample?','They add independent information and expose dataset-specific artifacts.']
],{pre:['confidence-coverage','winners-curse'],sources:['quant-stat-cochrane','quant-stat-asa']});
s(7,'preregistration','Study design','Preregistration','A recorded plan made before the relevant outcomes are examined.','Make confirmatory choices and deviations visible.','Specify hypotheses, endpoints, exclusions, models and stopping rules in advance.','Write the scoring rules before seeing who wins.',[
 ['What should a useful preregistration say about exclusions?','Which observations will be excluded and why.'],
 ['Preregistration guarantees a correct conclusion. Why wrong?','A plan can still be flawed, poorly executed or based on wrong assumptions.'],
 ['Preregistered plan versus registered report?','A registered report includes review and possible publication commitment before outcomes are known.'],
 ['What should happen when a justified deviation is needed?','Document it transparently and distinguish planned from changed analyses.'],
 ['A new outcome is discovered after data collection. Can it be reported?','Yes, clearly as exploratory rather than prespecified.'],
 ['Why can a vague plan fail to constrain researcher choices?','It leaves many outcome-dependent paths open.']
],{pre:['harking','optional-stopping'],sources:['quant-stat-asa','quant-stat-cochrane']});
s(7,'design-effect','Sampling','Cluster design effect','An approximate variance multiplier for equally sized clusters with common within-cluster correlation.','Translate row counts into more realistic information.','DEFF≈1+(m−1)rho; effective n≈n/DEFF under this simple model.','Many related leaves contribute less than the same number of unrelated leaves.',[
 ['Cluster size m=10, rho=.1. Approximate design effect?','1+9×.1=1.9.'],
 ['Divide SE by the design effect to correct clustering. Why wrong?','Variance multiplies by DEFF; SE multiplies by √DEFF.'],
 ['1,000 rows with DEFF=1.9: approximate effective n?','1,000/1.9≈526.3.'],
 ['When is this shortcut insufficient?','Unequal clusters, complex dependence or too few clusters need a suitable analysis.'],
 ['DEFF=4 with an unclustered SE of 1. Corrected approximate SE?','1×√4=2.'],
 ['Why does adding rows to highly correlated clusters have diminishing value?','More rows repeat much of the same group-level information.']
],{pre:['cluster-sample','se-mean'],sources:['quant-stat-mixed','quant-stat-nist'],formula:'DEFF≈1+(m−1)rho; effective n≈n/DEFF',checks:[{expression:'1+(10-1)*.1',value:1.9},{expression:'1000/1.9',value:526.3157894736843},{expression:'Math.sqrt(4)',value:2}]});
s(7,'minimum-detectable','Study design','Minimum detectable effect','An effect magnitude a specified design can detect with a chosen power.','Plan informative studies instead of merely chasing significance.','For a simple normal approximation with fixed SE, MDE≈(z_alpha+z_power)×SE.','A detector has a sensitivity threshold determined by noise and error tolerance.',[
 ['Two-sided alpha=5%, power=80%, critical values 1.96 and .84, SE=2. Approximate MDE?','(1.96+.84)×2=5.6 units.'],
 ['The MDE is the smallest effect that can ever be significant. Why wrong?','It targets a specified detection probability, not a hard significance boundary.'],
 ['MDE versus smallest important effect?','MDE describes design sensitivity; importance describes decision value.'],
 ['What should be checked before using the shortcut?','The outcome model, fixed-SE approximation and chosen one/two-sided design.'],
 ['Useful gains are 1 point but MDE is 5 points. Main concern?','The study is too insensitive to reliably detect the useful gain.'],
 ['How can sample planning improve when effect estimates are uncertain?','Evaluate several plausible effect sizes and variances, rather than one optimistic number.']
],{pre:['power','planned-threshold','fourfold-sample'],formula:'normal approximation: MDE≈(z_alpha+z_power)×SE',checks:[{expression:'(1.96+.84)*2',value:5.6}]});

// 8: Choose methods that respect unequal spread, dependence and model structure.
s(8,'welch-test','Statistical methods','Welch two-sample test','A mean-comparison procedure that does not assume equal population variances.','Compare independent groups with unequal spread or sample size.','t = (meanA−meanB)/√(sA²/nA+sB²/nB), with Welch–Satterthwaite degrees of freedom.','Let each group contribute its own noise estimate.',[
 ['Mean gap=3; sA²/nA=1 and sB²/nB=4. Welch t?','3/√5≈1.342.'],
 ['Pool variances despite a justified unequal-variance concern. What is at risk?','The usual pooled-test uncertainty can be inappropriate.'],
 ['Welch versus a paired t test?','Welch compares independent groups; a paired test analyzes linked differences.'],
 ['What is still required for reliable Welch inference?','Appropriate independent sampling and distributional or large-sample conditions.'],
 ['Groups have nA=nB=10 and variance contributions 1 and 4. Welch degrees of freedom?','25/(1/9+16/9)=225/17≈13.24.'],
 ['Does Welch eliminate selection bias or establish causality?','No. It addresses unequal-variance inference, not flawed selection or confounding.']
],{pre:['two-mean-se','t-vs-z'],formula:'t = (meanA−meanB)/√(sA²/nA+sB²/nB)',checks:[{expression:'3/Math.sqrt(5)',value:1.3416407864998738},{expression:'25/(1/9+16/9)',value:13.235294117647058}]});
s(8,'paired-test','Statistical methods','Paired t test','A one-sample t test of the mean of paired differences.','Test within-person or matched changes with the correct uncertainty.','t = (mean change−null change)/(change SD/√number of pairs).','Subtract each person’s baseline before comparing the remaining changes.',[
 ['Mean change=−3, change SD=6, n=36, null change=0. t?','−3/(6/6)=−3, with 35 degrees of freedom.'],
 ['Analyze matched before–after values as unrelated samples. What is missed?','Their covariance and the within-pair difference structure.'],
 ['Which sample size belongs in the paired formula?','The number of valid complete pairs, not twice that count.'],
 ['What should be checked in a small paired t study?','Correct matching, independent pairs and approximate normality of differences.'],
 ['40 before records but only 32 matched after records. How many complete pairs?','32, assuming all 32 match valid before records.'],
 ['What extra issue arises if the missing eight follow-up values are outcome-related?','Attrition can bias the estimated change even with correct paired arithmetic.']
],{pre:['paired-interval','nonresponse'],formula:'paired t = (mean(d)−null)/(s(d)/√n)',checks:[{expression:'-3/(6/Math.sqrt(36))',value:-3}]});
s(8,'anova','Statistical methods','One-way ANOVA','A test of whether all group means are equal under a specified model.','Compare several group means without separate unadjusted pairwise tests.','A significant omnibus test indicates at least one mean differs, not which one.','One building-wide alarm indicates a problem somewhere, not its exact room.',[
 ['Three group means are tested by one-way ANOVA. What is the null?','All three population means are equal.'],
 ['Significant ANOVA proves every pair differs. Why wrong?','Only at least one departure from equal means is indicated.'],
 ['Omnibus test versus pairwise comparison?','Omnibus tests all-equal means; pairwise tests a specific gap.'],
 ['What assumptions support classical one-way ANOVA?','Independent normal errors with common variance under the model.'],
 ['ANOVA rejects equality across four versions. What follows for pair comparisons?','Use justified contrasts or multiplicity-adjusted follow-up comparisons.'],
 ['Why might unequal-variance or robust alternatives be needed?','Classical ANOVA uncertainty can be invalid when its variance or distribution assumptions fail.']
],{pre:['multiple-testing','welch-test']});
s(8,'f-statistic','Statistical methods','ANOVA F statistic','A ratio of between-group and within-group mean squares.','Compare explained variation with noise under a specified model.','F = MS_between/MS_within in a basic one-way ANOVA.','Compare movement of group centers with scatter inside the groups.',[
 ['MS_between=12, MS_within=3. What is F?','12/3=4.'],
 ['F=4 means treatment causes a 400% improvement. Why wrong?','F is a variance ratio, not an effect-size percentage.'],
 ['What distinguishes mean square from a raw sum of squares?','Mean square divides its sum of squares by degrees of freedom.'],
 ['What is needed to get a p-value from F?','The null reference model and numerator/denominator degrees of freedom.'],
 ['Between sum of squares=30 with 2 df. Between mean square?','30/2=15.'],
 ['Why can a large F coexist with a practically tiny effect?','Large sample size or low within-group noise can make small differences detectable.']
],{pre:['anova','variance-intuition'],formula:'F = MS_between / MS_within',checks:[{expression:'12/3',value:4},{expression:'30/2',value:15}]});
s(8,'heteroskedasticity','Model assumptions','Heteroskedasticity','Error variance changes across observations or predictor levels.','Use uncertainty estimates that fit unequal noise.','Inspect residual spread; select a suitable robust or modeled variance method.','A funnel-shaped cloud widens as the predictor increases.',[
 ['Residuals scatter more at higher income. What issue is suggested?','Heteroskedasticity.'],
 ['Unequal error variance always biases OLS slopes. Why too broad?','With the appropriate zero-conditional-mean assumption, slopes can remain unbiased; conventional SEs can fail.'],
 ['Heteroskedasticity versus nonlinearity?','One changes error spread; the other changes the mean relationship’s shape.'],
 ['What diagnostic can show both patterns?','Residuals plotted against fitted values or predictors.'],
 ['Sales errors are much larger for large stores. What could you use?','Appropriate heteroskedasticity-robust SEs or a justified variance model.'],
 ['Why not automatically divide outcomes by their fitted values?','A transformation changes the model and estimand; it needs a defensible purpose.']
],{pre:['estimator-variance','two-mean-se'],sources:['quant-stat-robust','quant-stat-regression']});
s(8,'robust-se','Model assumptions','Heteroskedasticity-robust standard errors','SE estimates designed to tolerate unequal error variances under suitable conditions.','Make regression inference less dependent on constant variance.','Keep the OLS coefficients but replace their variance calculation with a valid robust method.','Repair the noise ruler without moving the fitted line.',[
 ['Changing from conventional to robust SEs in the same OLS fit changes which quantities?','SEs, intervals and tests; the fitted coefficients stay the same.'],
 ['Robust SEs repair omitted-variable bias. Why wrong?','They address uncertainty, not a biased conditional-mean model.'],
 ['Robust SEs versus robust regression?','Robust SEs alter variance estimation; robust regression can alter fitted coefficients.'],
 ['What can still make robust SEs unreliable?','Small samples, high leverage, many regressors or unhandled dependence.'],
 ['Coefficient=2; robust SE=1 rather than .5. Test statistic versus zero?','It falls from 4 to 2.'],
 ['Are robust SEs always larger?','No. They can be larger or smaller depending on the data.']
],{pre:['heteroskedasticity','z-test'],sources:['quant-stat-robust'],checks:[{expression:'2/1',value:2},{expression:'2/.5',value:4}]});
s(8,'cluster-robust','Model assumptions','Cluster-robust standard errors','SE estimates allowing dependence within specified clusters.','Respect group-level sampling or treatment assignment.','Define clusters from design and dependence; assume suitable independence across clusters.','Use separate trees, not individual leaves, as information blocks.',[
 ['Treatment is assigned by school. What cluster must the analysis account for?','School, consistent with assignment and the relevant sampling design.'],
 ['Use ordinary robust SEs for repeated observations of each user. What is missed?','Within-user dependence.'],
 ['Cluster-robust versus heteroskedasticity-only SEs?','Cluster methods allow related errors within groups; heteroskedasticity-only methods do not.'],
 ['What sample-size issue matters most for usual cluster inference?','The number and structure of independent clusters, especially when few exist.'],
 ['There are 10,000 observations in three stores. Why be cautious?','Three clusters can make standard large-cluster approximations poor.'],
 ['Why should clustering not be chosen solely by whichever option gives the desired p-value?','The sampling, assignment and dependence design must justify it.']
],{pre:['cluster-sample','robust-se','design-effect'],sources:['quant-stat-cluster','quant-stat-robust']});
s(8,'multicollinearity','Model assumptions','Multicollinearity','Predictors contain strongly overlapping linear information.','Understand unstable individual coefficients despite an apparently good fit.','Inspect predictor relationships, uncertainty and the target question.','Two nearly identical rulers cannot easily reveal each ruler’s separate contribution.',[
 ['Two predictors are almost copies. What happens to their separate coefficient precision?','It can become poor because their contributions are hard to distinguish.'],
 ['Multicollinearity always makes all predictions useless. Why wrong?','Predictions can remain stable within familiar combinations while separate coefficients are unstable.'],
 ['Perfect versus high multicollinearity?','Perfect linear duplication prevents unique identification; high duplication makes estimation noisy.'],
 ['What should guide removal or combination of predictors?','The scientific target and information structure, not just a desired significance result.'],
 ['Height is entered in meters and centimeters in the same model. What problem?','Perfect linear duplication: centimeters=100×meters.'],
 ['Why can extrapolation be dangerous with highly related predictors?','New combinations outside their observed relationship are weakly informed.']
],{pre:['estimator-variance','pearson'],sources:['quant-stat-regression']});
s(8,'panel-fixed-effects','Grouped models','Panel fixed effects','A within-unit comparison that removes modeled time-invariant unit intercepts.','Control stable differences across repeatedly observed units.','Subtract each unit’s mean; identify slopes from within-unit changes under the required assumptions.','Compare each shop with itself over time rather than comparing different shops.',[
 ['A user’s spending is 10 then 14. Its within-user deviations?','Mean 12; deviations −2 and +2.'],
 ['Unit fixed effects remove every confounder. Why wrong?','Time-varying confounding, feedback and other violations may remain.'],
 ['Within-unit versus between-unit information?','Within tracks change in the same unit; between compares different units.'],
 ['What issue prevents estimating a constant unit characteristic separately?','It has no within-unit variation and is absorbed by the unit effect.'],
 ['A store’s location never changes. Can store fixed effects separately identify its location coefficient?','No, not from within-store variation.'],
 ['Why do fixed effects not automatically make a treatment coefficient causal?','Treatment timing and remaining errors must still satisfy appropriate exogeneity assumptions.']
],{pre:['paired-data','confounding','cluster-robust'],sources:['quant-stat-panel','quant-stat-causal'],formula:'within transform: y(it)−mean_i(y) = b[x(it)−mean_i(x)] + transformed error',checks:[{expression:'10-(10+14)/2',value:-2}]});
s(8,'random-intercept','Grouped models','Random-intercept model','A model allowing group baselines to vary according to a distribution.','Model related observations and variation across groups.','y_ij = fixed part + group intercept u_j + individual error.','Each classroom has its own baseline while pupils still differ within it.',[
 ['A model gives each hospital a varying baseline. What component is this?','A hospital-level random intercept.'],
 ['Random effects means treatment was randomly assigned. Why wrong?','The term describes a model component, not assignment design.'],
 ['Random intercept versus random slope?','An intercept changes the baseline; a slope changes the predictor’s effect across groups.'],
 ['What matters for ordinary random-effects coefficient consistency?','Appropriate assumptions about group effects and their relationship to predictors.'],
 ['Schools vary in mean score but share one treatment slope. Which group structure fits that description?','A random intercept with a common fixed treatment slope.'],
 ['Why can correlated group effects and predictors bias a naive random-effects slope?','The model may attribute group-level differences to the predictor.']
],{pre:['panel-fixed-effects','cluster-sample'],sources:['quant-stat-mixed','quant-stat-panel'],formula:'y_ij = X_ij×b + u_j + error_ij'});
s(8,'mixed-model','Grouped models','Mixed-effects model','A model combining fixed coefficients and random effects.','Analyze repeated or hierarchical observations while representing group variation.','Choose fixed and random components for the target and design, then check the assumptions.','One shared rule operates alongside group-specific deviations.',[
 ['A shared drug coefficient plus patient-specific intercepts: what type of model?','A mixed-effects model.'],
 ['A mixed model makes all dependence disappear automatically. Why wrong?','Only the modeled dependence is addressed; the covariance structure can still be wrong.'],
 ['Specific group coefficients versus random group effects?','Fixed group coefficients target those groups; random effects model variation across a group population.'],
 ['What must be inspected besides overall fit?','Residuals, random-effect distribution, covariance structure and data sufficiency.'],
 ['Monthly spending repeats within customers and customers within stores. What should the model consider?','The nested dependence and which levels require varying effects.'],
 ['Why can a very complex random-effects structure fail in sparse data?','The variance components may be weakly identified or estimated at boundaries.']
],{pre:['random-intercept','robust-se'],sources:['quant-stat-mixed']});
s(8,'icc','Grouped models','Intraclass correlation','The share of variance due to group differences in a simple random-intercept model.','Quantify how similar observations within a group tend to be.','ICC = group variance/(group variance + residual variance).','Pupils resemble classmates when classroom differences explain much of the total spread.',[
 ['Group variance=4 and residual variance=6. What is ICC?','4/(4+6)=0.4.'],
 ['ICC=.4 means 40% of individuals have identical outcomes. Why wrong?','It describes a variance share and within-group correlation under the model.'],
 ['Group variance zero: what is the model’s ICC?','0, provided total variance is positive.'],
 ['What model condition supports this simple formula?','A random intercept with a common residual variance and appropriate independence assumptions.'],
 ['ICC=.2, cluster size=6. Approximate design effect?','1+(6−1)×.2=2.'],
 ['Why is a single ICC inadequate for every repeated-time structure?','Correlations may depend on time lag or vary across occasions.']
],{pre:['random-intercept','design-effect'],sources:['quant-stat-mixed'],formula:'ICC = σ_group²/(σ_group² + σ_error²)',checks:[{expression:'4/(4+6)',value:.4},{expression:'1+(6-1)*.2',value:2}]});
s(8,'partial-pooling','Grouped models','Partial pooling','Combining group-specific evidence with shared population information.','Stabilize estimates for small noisy groups.','Sparse groups usually shrink more toward the modeled common distribution.','Small boats are anchored closer to the fleet; large well-measured boats need less help.',[
 ['One store has 2 customers; another has 2,000. Which estimate usually shrinks more?','The sparse store’s estimate, under an appropriate hierarchical model.'],
 ['Shrinking a noisy group estimate proves all groups are identical. Why wrong?','Partial pooling retains variation while reducing unsupported extremes.'],
 ['No pooling versus complete pooling?','No pooling estimates groups separately; complete pooling uses one common estimate.'],
 ['What must be plausible for partial pooling?','The shared group model and which groups can reasonably borrow information.'],
 ['A tiny branch has the highest estimated conversion. Why use partial pooling?','Its extreme estimate may mostly reflect sampling noise.'],
 ['Can inappropriate pooling hide a genuinely different subgroup?','Yes. Check model fit, group differences and the intended estimand.']
],{pre:['mixed-model','winners-curse','mse'],sources:['quant-stat-mixed','quant-stat-estimation']});
s(8,'repeated-measures','Grouped models','Repeated measures','Several outcomes measured on the same observational unit.','Track trajectories without pretending each measurement is a new person.','Model within-unit covariance or use an appropriate design-based method.','Snapshots of one runner form a movie, not separate runners.',[
 ['50 people are measured four times. How many people?','50, with 200 measurement rows.'],
 ['Use n=200 independent people in every uncertainty calculation. Why wrong?','Measurements from each person can be dependent.'],
 ['More time points versus more independent people?','Time points add trajectory information; new people add independent units.'],
 ['What matters when some people miss later measurements?','Missingness mechanism, pattern and its relationship to outcomes.'],
 ['Scores improve over three visits in a control-free study. What alternatives to treatment should be checked?','Practice, time trends, selection and regression to the mean.'],
 ['Why might a random slope help a trajectory model?','Individuals can differ in their rates of change, not only their baselines.']
],{pre:['paired-data','mixed-model','nonresponse'],sources:['quant-stat-mixed','quant-stat-regression'],checks:[{expression:'50*4',value:200}]});
s(8,'residual-checks','Model assumptions','Residual diagnostics','Checks of observed outcomes minus model predictions.','Identify unmodeled structure and questionable uncertainty assumptions.','Plot residuals against fitted values, predictors and time; inspect unusual influence.','Inspect the footprints left after the model explains what it can.',[
 ['Actual sales=120, predicted=100. What is the residual?','120−100=20.'],
 ['Mean residual zero proves the model is correct. Why wrong?','OLS with an intercept imposes that property even for a poor model.'],
 ['A curved residual pattern versus a widening funnel?','Curvature suggests mean misspecification; a funnel suggests unequal variance.'],
 ['What should serially patterned residuals prompt?','A dependence check and uncertainty method appropriate to time structure.'],
 ['One point strongly changes the fitted slope. What should be investigated?','Influence, leverage, validity of that observation and sensitivity of conclusions.'],
 ['Can clean-looking residuals prove a causal interpretation?','No. Confounding or selection can remain invisible in residual plots.']
],{pre:['heteroskedasticity','mixed-model','confounding'],sources:['quant-stat-regression','quant-stat-nist'],formula:'residual = observed − predicted',checks:[{expression:'120-100',value:20}]});

// 9: Analyze time-to-event data, synthesize studies and handle incomplete outcomes.
s(9,'survival-time','Survival analysis','Time-to-event outcome','The elapsed time until a defined event, possibly not fully observed.','Use both event timing and follow-up duration.','Record a starting point, event definition, elapsed time and event indicator.','Track how long each lightbulb operates, not just whether it eventually fails.',[
 ['A customer cancels after 12 weeks. What time-to-event value is recorded?','12 weeks to the defined cancellation event.'],
 ['Compare cancellation counts without follow-up duration. What can mislead?','Longer-observed customers have more opportunity to cancel.'],
 ['Binary outcome versus time-to-event outcome?','Binary records whether an event occurred in a window; time-to-event also records timing.'],
 ['What must match across compared groups?','Time origin, event definition and observation/censoring rules.'],
 ['One group has two years of follow-up and another two months. Are raw event percentages directly comparable?','Not without accounting for the different follow-up.'],
 ['Why is event-free follow-up still informative?','It tells us the event did not occur before that known time.']
],{pre:['hazard-ratio','repeated-measures'],sources:['quant-stat-survival','quant-stat-km']});
s(9,'censoring','Survival analysis','Right censoring','The event time is known only to exceed the last observed event-free time.','Use incomplete follow-up without labeling it a failure or permanent survival.','Keep the observed time and mark that the event has not been observed.','A working bulb leaves the test after ten hours; its eventual lifetime is unknown.',[
 ['A bulb still works when a 10-hour test ends. What is known?','Its failure time exceeds 10 hours; it is right-censored.'],
 ['Treat a censored customer as someone who will never cancel. Why wrong?','Only the observed event-free period is known.'],
 ['Censoring versus an observed event?','Censoring gives a bound; an event supplies its occurrence time.'],
 ['What assumption supports usual survival estimates?','Suitable independent or non-informative censoring, possibly conditional on modeled covariates.'],
 ['Sicker participants disproportionately leave follow-up. Main concern?','Informative censoring can distort event-time estimates.'],
 ['Why does deleting all censored observations waste information and risk bias?','Their event-free times contain information, and complete cases can be selected.']
],{pre:['survival-time','nonresponse'],sources:['quant-stat-survival','quant-stat-km']});
s(9,'kaplan-meier','Survival analysis','Kaplan–Meier estimator','A product of conditional event-free proportions at observed event times.','Estimate survival from data containing right censoring.','S(t)=product over event times of (1−d_i/n_i), with n_i the risk set.','Multiply successive chances of remaining event-free.',[
 ['At first event time, 2 events among 10 at risk. Survival factor?','1−2/10=0.8.'],
 ['Drop the survival curve at every censoring time. Why wrong?','Censoring changes future risk sets; it is not an observed event.'],
 ['What happens to the Kaplan–Meier curve between event times?','It stays flat.'],
 ['What assumptions are important?','Appropriate independent censoring, valid event times and correctly constructed risk sets.'],
 ['First survival factor=.8; next risk set has 5 with 1 event. New survival estimate?','.8×(1−1/5)=.64=64%.'],
 ['Why do late curve estimates become fragile with few at risk?','Very few remaining observations inform late event probabilities.']
],{pre:['censoring','sample-proportion'],sources:['quant-stat-km','quant-stat-nist'],formula:'S-hat(t) = ∏(1 − d_i/n_i)',checks:[{expression:'.8*(1-1/5)',value:.64}]});
s(9,'hazard-risk','Survival analysis','Hazard versus cumulative risk','Hazard is an instantaneous event rate; cumulative risk is the probability of an event by a time.','Avoid multiplying a hazard by time when risks are not small.','With constant hazard λ, risk by t is 1−exp(−λt).','A pace of failures accumulates into a probability, but not indefinitely in a straight line.',[
 ['Constant hazard=.1/year. Five-year event risk?','1−exp(−.5)≈39.35%.'],
 ['.1/year for five years means exactly 50% event risk. Why wrong?','That linear shortcut ignores the shrinking event-free population.'],
 ['What units differ between hazard and risk?','Hazard is per unit time; risk is a dimensionless probability.'],
 ['What assumption justifies the exponential formula?','A constant hazard across that period.'],
 ['Constant hazard=.2/year. One-year survival probability?','exp(−.2)≈81.87%.'],
 ['Why can the same HR produce different absolute risk differences?','Baseline hazard and follow-up time affect cumulative probabilities.']
],{pre:['hazard-ratio','kaplan-meier'],sources:['quant-stat-survival','quant-stat-nist'],formula:'constant-hazard risk(t)=1−e^(−λt)',checks:[{expression:'(1-Math.exp(-.1*5))*100',value:39.346934028736655},{expression:'Math.exp(-.2)*100',value:81.87307530779819}]});
s(9,'proportional-hazards','Survival analysis','Proportional-hazards assumption','The ratio of group hazards remains constant over modeled time.','Check whether one hazard ratio is a suitable summary.','Examine time patterns and suitable diagnostics; consider time-varying effects when needed.','Two runners keep a constant speed ratio only if one never changes pace relative to the other.',[
 ['HR is .5 early but 1.5 late. Is a constant proportional-hazards description exact?','No. The relative hazard changes over time.'],
 ['Noncrossing survival curves prove proportional hazards. Why wrong?','The relative hazards can vary without visible crossing.'],
 ['Proportional hazards versus equal hazards?','Proportional allows any constant ratio; equal means the ratio is 1.'],
 ['What should support a constant-HR analysis?','A plausible time pattern and suitable model diagnostics, not a label alone.'],
 ['Treatment delays events early but not later. What might be more informative?','Time-specific effects or absolute survival summaries at relevant times.'],
 ['Why may restricted mean event-free time help with nonproportional hazards?','It summarizes event-free time up to a stated horizon without requiring one constant HR.']
],{pre:['hazard-risk','residual-checks'],sources:['quant-stat-survival','quant-stat-km']});
s(9,'meta-analysis','Evidence synthesis','Meta-analysis','A quantitative synthesis of effect estimates from multiple studies.','Combine evidence while examining differences and study quality.','Use comparable estimands, appropriate weights and a justified model.','Combine several maps only after checking that they show the same region and scale.',[
 ['Why must outcome scales be compatible before pooling effects?','A pooled number otherwise mixes different targets.'],
 ['Many weak studies automatically create strong evidence when pooled. Why wrong?','Shared bias and poor design can remain or become more precise.'],
 ['Systematic review versus meta-analysis?','A review assembles evidence; a meta-analysis statistically combines suitable estimates.'],
 ['What should be checked before pooling?','Study eligibility, bias, dependence, effect definitions and heterogeneity.'],
 ['Two papers reuse the same cohort. Why not treat them as independent studies?','Their estimates can share information and errors.'],
 ['Why can a forest plot be useful even when pooling is inappropriate?','It displays study effects and uncertainty without forcing a misleading common summary.']
],{pre:['replication','weighted-mean'],sources:['quant-stat-cochrane']});
s(9,'inverse-variance','Evidence synthesis','Inverse-variance weighting','Giving more weight to estimates with smaller variance.','Combine independent estimates according to their precision.','w_i=1/SE_i²; pooled estimate=Σ(w_i×estimate_i)/Σw_i.','A clearer measurement receives more influence than a noisier one.',[
 ['SEs are 1 and 2. Inverse-variance weights?','1 and 1/4; first receives four times the weight.'],
 ['Weight by 1/SE rather than 1/SE² and call it inverse variance. Why wrong?','Variance is SE squared.'],
 ['Doubling an SE does what to its weight?','Reduces it to one quarter.'],
 ['What must be checked before treating precision weights as evidence quality?','Low SE does not rule out bias or incompatible targets.'],
 ['Effects 2 and 6 with SEs 1 and 2. Fixed inverse-variance estimate?','(2×1+6×.25)/1.25=2.8.'],
 ['Why cannot precision weighting repair shared systematic bias?','It emphasizes precise estimates even when they are precisely biased.']
],{pre:['meta-analysis','estimator-variance'],sources:['quant-stat-cochrane'],formula:'w_i=1/SE_i²; pooled effect=Σ(w_i×effect_i)/Σw_i',checks:[{expression:'1/2**2',value:.25},{expression:'(2+6*.25)/1.25',value:2.8}]});
s(9,'common-effect-meta','Evidence synthesis','Common-effect meta-analysis','A synthesis model in which studies estimate one underlying effect.','Pool estimates when a common target is defensible.','Differences between study estimates are modeled as sampling error around one effect.','Several instruments measure the same fixed temperature.',[
 ['In the common-effect model, why can study estimates differ?','Sampling error, even though their target effect is the same.'],
 ['A nonsignificant heterogeneity test proves the common-effect assumption. Why wrong?','The test may lack power, and substantive differences still matter.'],
 ['Common-effect versus random-effects synthesis?','Common-effect has one true target; random-effects allows a distribution of true effects.'],
 ['What should justify using a common effect?','The scientific question, comparable study targets and model assumptions.'],
 ['Studies use very different doses and populations. What concern arises?','A single common underlying effect may be implausible.'],
 ['Why should model choice not simply follow the smaller pooled p-value?','The target and assumptions determine interpretation, not the desired conclusion.']
],{pre:['inverse-variance','effect-modification'],sources:['quant-stat-cochrane']});
s(9,'random-meta','Evidence synthesis','Random-effects meta-analysis','A synthesis model allowing related but different true study effects.','Estimate an average effect while acknowledging between-study variation.','Basic weights are 1/(SE_i²+tau²), where tau² is between-study variance.','Different gardens can have different true growth rates even with good measurements.',[
 ['SE²=1, tau²=3. Random-effects weight?','1/(1+3)=0.25.'],
 ['Random effects makes heterogeneity irrelevant. Why wrong?','Variation still matters for predicting effects in a new setting.'],
 ['As tau² increases, how do relative study weights change?','They tend to become more similar, giving smaller studies relatively more influence.'],
 ['What uncertainty matters with only a few studies?','The estimated between-study variance and pooled-effect uncertainty can be unstable.'],
 ['Effects 2 and 6, SE² values 1 and 4, tau²=3. Pooled estimate?','(2/4+6/7)/(1/4+1/7)≈3.45.'],
 ['Why can random-effects weighting worsen small-study reporting bias?','It gives relatively more weight to small studies when tau² is positive.']
],{pre:['common-effect-meta','estimator-variance'],sources:['quant-stat-cochrane'],formula:'random-effects weight_i = 1/(SE_i² + tau²)',checks:[{expression:'1/(1+3)',value:.25},{expression:'(2/4+6/7)/(1/4+1/7)',value:3.4545454545454546}]});
s(9,'tau-heterogeneity','Evidence synthesis','Between-study variance tau squared','The variance of true study effects in a random-effects model.','Assess how much underlying effects may vary across settings.','tau² is in squared effect units; tau is its standard-deviation scale.','Measure differences between garden growth rates, apart from measurement noise.',[
 ['tau²=9 on an effect measured in points. What is tau?','3 points.'],
 ['tau²=9 means a 9% heterogeneity rate. Why wrong?','It is a variance in squared effect units, not a percentage.'],
 ['Within-study SE versus tau?','SE reflects estimate uncertainty within a study; tau describes modeled true-effect variation across studies.'],
 ['Why be cautious about tau from two or three studies?','There is little information to estimate a variance of study effects.'],
 ['A precise average effect accompanies large tau. What should decision-makers consider?','The effect in a new setting may differ substantially from the average.'],
 ['Can heterogeneity reflect more than genuine biological differences?','Yes. Design, measurement and bias differences can contribute to observed variation.']
],{pre:['random-meta'],sources:['quant-stat-cochrane'],formula:'tau = √tau²',checks:[{expression:'Math.sqrt(9)',value:3}]});
s(9,'i-squared','Evidence synthesis','I squared','An estimate of how much observed study-effect variability reflects heterogeneity rather than sampling error.','Describe inconsistency while keeping its uncertainty and scale in view.','A common estimate is I²=max(0,(Q−df)/Q)×100%, for Q>0.','Ask which share of observed disagreement exceeds expected sampling noise.',[
 ['Q=10 and df=4. What is I²?','(10−4)/10×100%=60%.'],
 ['I²=60% means 60% of studies are false. Why wrong?','It summarizes variability, not a count of wrong studies.'],
 ['High I² versus large tau: are they identical?','No. I² also depends on within-study precision; tau is on the effect scale.'],
 ['What must accompany I² interpretation?','Study number, uncertainty, effect directions, magnitude and clinical or economic context.'],
 ['Q=3 and df=4. What does the truncated formula return?','0%, which does not prove true heterogeneity is absent.'],
 ['Why avoid a universal 50% cutoff as a model-choice rule?','Importance and estimation uncertainty depend on the studies and target question.']
],{pre:['tau-heterogeneity','familywise-error'],sources:['quant-stat-cochrane'],formula:'I² = max[0,(Q−df)/Q]×100%, for Q>0',checks:[{expression:'Math.max(0,(10-4)/10)*100',value:60},{expression:'Math.max(0,(3-4)/3)*100',value:0}]});
s(9,'funnel-plot','Evidence synthesis','Funnel plot','A plot of study effect estimates against a precision-related measure.','Investigate small-study patterns and possible reporting bias.','Interpret asymmetry alongside heterogeneity, study quality and missing-study evidence.','Less precise estimates spread wider, making a funnel-shaped cloud under simple assumptions.',[
 ['Small studies show large positive effects, while large studies center near zero. What deserves investigation?','Small-study effects, including possible reporting bias.'],
 ['Funnel asymmetry proves publication bias. Why wrong?','Real heterogeneity, chance and methodological differences can also cause it.'],
 ['Symmetric funnel versus proof of no missing studies?','Symmetry is not proof; bias can be difficult to detect.'],
 ['What limits funnel assessment with very few studies?','Sparse points give little information about shape or asymmetry.'],
 ['Trials of severe patients are smaller and have larger effects. Possible nonpublication explanation?','Population differences can create asymmetry.'],
 ['Why inspect registries as well as the funnel?','Registries can provide direct evidence of conducted but unreported studies.']
],{pre:['publication-bias','i-squared'],sources:['quant-stat-cochrane']});
s(9,'meta-regression','Evidence synthesis','Meta-regression','A regression relating study-level effect estimates to study characteristics.','Explore possible sources of heterogeneity.','Model estimates with their precision and residual between-study variation.','Compare garden-level growth estimates with garden-level climate characteristics.',[
 ['Studies with older mean age show larger estimated effects. What does meta-regression describe?','A study-level association between mean age and effect estimate.'],
 ['That study-level pattern proves an individual age interaction. Why wrong?','An ecological association need not hold within individuals.'],
 ['Meta-regression versus ordinary unweighted regression of studies?','Meta-regression should account for estimate precision and heterogeneity.'],
 ['What should constrain the number of moderators?','Study count, prespecification, uncertainty and multiple-testing risk.'],
 ['Four studies are fit with ten moderators. Main problem?','Severe overfitting and too little independent study information.'],
 ['Can adjusting study characteristics remove all between-study bias?','No. Unmeasured differences and biased study estimates can remain.']
],{pre:['random-meta','effect-modification','multicollinearity'],sources:['quant-stat-cochrane']});
s(9,'missingness','Missing data','Missing-data mechanisms','Assumptions about how the absence of observations relates to recorded and unrecorded values.','Choose analyses that do not silently treat selected complete cases as everyone.','MCAR is unrelated to full-data values; MAR depends only on observed information; MNAR can depend on unobserved values.','Missing pages may be random, predicted by page numbers, or removed because of their content.',[
 ['A truly random file glitch loses rows regardless of their values. Which mechanism fits?','MCAR, under that stated mechanism.'],
 ['MAR means missingness is entirely random. Why wrong?','It can depend on observed variables; the required independence is conditional.'],
 ['Missing income depends on that unobserved income even after observed predictors. Which mechanism?','MNAR relative to those observed predictors.'],
 ['Can MAR generally be proven from observed data alone?','No. The relationship with unobserved values requires assumptions and sensitivity analysis.'],
 ['Follow-up loss depends only on fully observed baseline age under a stated model. What may be plausible?','MAR conditional on age, if no remaining dependence on unobserved outcomes exists.'],
 ['Why can complete-case analysis bias an estimated mean?','The retained rows may have a different outcome distribution from the target sample.']
],{pre:['nonresponse','censoring','selection-bias'],sources:['quant-stat-missing','quant-stat-causal']});
s(9,'multiple-imputation','Missing data','Multiple imputation','Creating several plausible completed datasets and pooling appropriate analyses.','Reflect missing-value uncertainty instead of pretending replacements are known facts.','Under suitable assumptions, pool estimates and both within- and between-imputation variance.','Fill missing puzzle pieces in several plausible ways rather than declaring one guess certain.',[
 ['Why create multiple completed datasets rather than one mean-filled dataset?','To represent uncertainty in missing values and preserve appropriate structure.'],
 ['Imputed values are measured truth. Why wrong?','They are model-based plausible values, not recovered observations.'],
 ['Within-imputation versus between-imputation variance?','Within reflects sampling uncertainty; between reflects variation across imputations.'],
 ['What must be checked for a valid imputation analysis?','Missingness assumptions, model compatibility, predictors, diagnostics and sensitivity.'],
 ['W=4, B=1, m=5. Rubin total variance T?','4+(1+1/5)×1=5.2.'],
 ['Does ordinary MAR-based imputation automatically repair MNAR?','No. MNAR needs additional assumptions, models or sensitivity analyses.']
],{pre:['missingness','estimator-variance'],sources:['quant-stat-missing','quant-stat-rubin'],formula:'Rubin total variance T = W + (1+1/m)B',checks:[{expression:'4+(1+1/5)*1',value:5.2}]});

// 10: Combine precision, bias, assumptions and decision relevance.
s(10,'equivalence','Professional judgement','Equivalence testing','Testing whether an effect lies inside prespecified practically negligible bounds.','Support a limited practical-similarity claim rather than merely failing to find a difference.','A standard TOST at 5% uses two one-sided tests; the corresponding 90% CI must lie inside the margins.','Show that an object fits inside a small box, not just that it failed to leave a huge box.',[
 ['Equivalence margins are −1 to +1; valid 90% CI is [−.5,.6]. Standard 5% TOST conclusion?','Equivalence within those margins, under the stated procedure and assumptions.'],
 ['p=.8 for a zero-difference test proves equivalence. Why wrong?','A nonsignificant superiority test does not rule out practically important differences.'],
 ['Equivalence versus exact equality?','Equivalence limits meaningful differences; it does not prove exactly zero effect.'],
 ['When must the equivalence margins be chosen?','Before inspecting the relevant result, using substantive justification.'],
 ['Margins ±1; 90% CI [−.5,1.2]. Is equivalence established?','No. The interval extends beyond the upper margin.'],
 ['Can a statistically nonzero effect still be practically equivalent?','Yes. A precise small effect can exclude zero while remaining wholly inside meaningful bounds.']
],{pre:['absence-evidence','planned-threshold','one-sided'],sources:['quant-stat-equivalence']});
s(10,'noninferiority','Professional judgement','Noninferiority','Testing whether a new option is not worse by more than a justified margin.','Evaluate tradeoffs such as a cheaper option with acceptable performance loss.','Define the direction of benefit and margin; use the appropriate prespecified one-sided bound.','A cheaper runner need not win, but must finish within an acceptable distance of the leader.',[
 ['Benefit difference=new−old; margin=−2. Valid one-sided lower bound=−1. Is noninferiority supported?','Yes, under the planned test: the lower bound exceeds −2.'],
 ['No significant superiority difference proves noninferiority. Why wrong?','The relevant bound must rule out worse performance beyond the margin.'],
 ['Noninferiority versus superiority?','Noninferiority rules out excessive loss; superiority supports positive benefit.'],
 ['What must justify the margin?','Practical acceptability, outcome scale and reliable existing evidence.'],
 ['Same −2 margin, lower bound −3. Conclusion?','Noninferiority is not established; unacceptable loss remains compatible.'],
 ['Why can poor adherence or insensitive measurement falsely suggest similarity?','They can blur real differences, which is especially problematic for noninferiority claims.']
],{pre:['equivalence','confidence-coverage'],sources:['quant-stat-noninferiority']});
s(10,'sensitivity-analysis','Professional judgement','Sensitivity analysis','Checking how conclusions change under plausible alternative assumptions.','Show which uncertain choices or biases matter to a decision.','Vary defensible assumptions and report the consequences, including unfavorable ones.','Test the bridge under several plausible loads, not just the easiest load.',[
 ['An effect changes sign under a small plausible adjustment. What does that suggest?','The conclusion is sensitive and needs cautious interpretation.'],
 ['Only show sensitivity analyses that preserve significance. What is wrong?','That hides the actual fragility of the conclusion.'],
 ['Sampling CI versus bias sensitivity analysis?','A CI handles specified sampling uncertainty; sensitivity examines uncertain assumptions or bias.'],
 ['What makes an alternative assumption useful?','It is substantively plausible and connected to the target question.'],
 ['A revenue gain vanishes after reasonable fee estimates. What should be reported?','The fee assumptions, resulting net effects and the decision’s sensitivity.'],
 ['Does robustness to measured-confounder adjustments prove no unmeasured confounding?','No. Unmeasured factors and other bias mechanisms may still matter.']
],{pre:['confounding','residual-checks','missingness'],sources:['quant-stat-causal','quant-stat-cochrane']});
s(10,'robustness-checks','Professional judgement','Robustness checks','Comparing results across defensible analyses aimed at the same question.','Distinguish a stable finding from a result dependent on one convenient specification.','Report the analysis range transparently, with differences in estimands clearly marked.','Photograph the object from several angles while admitting when an angle shows a different object.',[
 ['A conclusion holds under several justified models. What support does this add?','It is less dependent on those particular choices, though shared bias can remain.'],
 ['Choose whichever model gives the smallest p and call it robust. Why wrong?','That is selective searching, not transparent robustness assessment.'],
 ['Different estimand versus different estimator?','One changes the target question; the other changes how the same target is estimated.'],
 ['What should a robustness table disclose?','All defensible planned variants, assumptions and any outcome-dependent changes.'],
 ['Mean revenue rises but median does not. Is one analysis necessarily wrong?','No. They answer different questions; high-spending users may drive the mean.'],
 ['Why can ten similar biased models agree and still be wrong?','They may share the same selection, measurement or causal error.']
],{pre:['p-hacking','parameter-statistic','robust-center'],sources:['quant-stat-asa','quant-stat-causal']});
s(10,'selection-aware','Professional judgement','Selection-aware inference','Inference that accounts for choosing a result using the same data.','Avoid reporting ordinary uncertainty for the winner of a hidden search.','Disclose the search and use suitable correction, selection-aware methods or independent confirmation.','Measure the contest winner knowing that winning itself selected unusually favorable noise.',[
 ['The best of 2,000 parameter sets has a high backtest return. Main uncertainty issue?','Selection makes its apparent performance optimistic unless the search is accounted for.'],
 ['An ordinary CI for the selected best result automatically has advertised coverage. Why wrong?','The selection process changes the relevant procedure.'],
 ['Prespecified one model versus selected one of 100 models?','The latter includes an additional search that inference must address.'],
 ['What information is needed to assess the search?','Candidate count, dependence, tuning steps, data reuse and reporting rules.'],
 ['After picking a winning model, evaluate one untouched test set once. What does it add?','Independent evidence for the fixed selected model, subject to representativeness and design.'],
 ['If a model fails that test set and is retuned on it, is the set still untouched?','No. It has become part of model development.']
],{pre:['winners-curse','multiple-testing','confidence-coverage'],sources:['quant-stat-asa','quant-stat-regression']});
s(10,'independent-validation','Professional judgement','Independent validation','Evaluation using evidence not used to choose or tune the tested claim.','Check whether a result survives beyond development data.','Protect the evaluation data and match their design to the intended use.','Try the key on a new lock before declaring it reliable.',[
 ['A model was tuned on all outcomes, then scored on those same outcomes. Is that independent validation?','No. The evaluation data informed the model.'],
 ['Calling reused data “test data” makes the result unbiased. Why wrong?','The actual data use matters, not the label.'],
 ['Temporal versus random validation in a changing market?','Temporal validation can better reflect deployment ordering; both require a suitable design.'],
 ['What should be checked beyond separation from training data?','Leakage, target-population match, dependencies and performance uncertainty.'],
 ['One household has rows in both training and test sets. What may happen?','Related information can leak across the split.'],
 ['Can good independent predictive accuracy prove a causal effect?','No. Prediction and causal identification require different claims and assumptions.']
],{pre:['selection-aware','independent-observations','representativeness'],sources:['quant-stat-regression','quant-stat-causal']});
s(10,'rare-risk-inference','Professional judgement','Inference about rare risks','Estimating small probabilities from data that may contain few or no events.','Avoid calling an unseen disaster impossible.','Use appropriate intervals and consider mechanisms, dependence and tail uncertainty.','A short walk without rain does not establish a rain-free climate.',[
 ['No events in 1,000 independent trials. Approximate one-sided 95% upper bound by the rule of three?','3/1,000=0.3%, under the independent common-probability model.'],
 ['No historical crash means crash probability is zero. Why wrong?','The observation period may be too short or unlike future conditions.'],
 ['Observed maximum versus a guaranteed future loss limit?','A sample maximum records the past; it does not bound all future outcomes.'],
 ['What matters when using zero-event bounds?','Independence, common probability, trial definition and a specified confidence procedure.'],
 ['Exact zero-event one-sided 95% bound for n trials: formula?','p_upper=1−0.05^(1/n), from (1−p)^n=0.05.'],
 ['Why stress-test beyond the observed loss sample?','Unobserved extreme mechanisms and changing dependence may dominate real risk.']
],{pre:['wilson-interval','prediction-interval','independent-observations'],formula:'zero-event one-sided 95% upper bound = 1 − 0.05^(1/n)',checks:[{expression:'3/1000*100',value:.3}]});
s(10,'forecast-calibration','Professional judgement','Probability calibration','Forecast probabilities agree with observed event frequencies across comparable repeated predictions.','Check whether stated probabilities can support sensible decisions.','Compare predicted chances with outcomes, using uncertainty and adequate sample sizes.','Among many weather forecasts of 70% rain, rain should occur roughly 70% of the time.',[
 ['1,000 comparable forecasts each say 70%. Approximate expected events if calibrated?','700, not guaranteed exactly 700.'],
 ['One 90% prediction fails, so the forecast is uncalibrated. Why wrong?','A calibrated 90% event can fail 10% of the time.'],
 ['Calibration versus ability to distinguish high- and low-risk cases?','Calibration checks probability accuracy; discrimination checks useful separation.'],
 ['What must accompany a calibration curve?','Sample counts, uncertainty, grouping choices and evaluation-population context.'],
 ['Binary Brier loss for p=.8 and outcome y=0?','(.8−0)²=.64, using the binary single-probability convention.'],
 ['Can a forecast be calibrated but uninformative?','Yes. Predicting the same correct base rate for everyone can be calibrated without separating cases.']
],{pre:['sample-proportion','se-proportion','independent-validation'],sources:['quant-stat-scoring'],formula:'binary Brier loss = (predicted probability − 0/1 outcome)²',checks:[{expression:'.7*1000',value:700},{expression:'(.8-0)**2',value:.64}]});
s(10,'ecological-fallacy','Professional judgement','Ecological fallacy','Inferring an individual-level relationship directly from group-level patterns.','Avoid treating country or school averages as individual evidence.','Check the level of measurement and the target relationship.','A wealthy neighborhood can contain poor people; its average does not describe every resident.',[
 ['Countries with higher average income have better health. Does that establish the individual income effect?','No. Group-level and individual-level relationships can differ.'],
 ['Average group data proves every member follows the group pattern. Why wrong?','Aggregation hides within-group variation and relationships.'],
 ['Ecological versus individual regression?','One analyzes group summaries; the other analyzes individual observations.'],
 ['What should be checked before transferring a group association?','Within-group data, confounding and whether the target level matches.'],
 ['Schools with high average study time have high average scores. Can this prove each pupil gains the same benefit?','No. School resources and pupil mix may explain the group association.'],
 ['Can aggregation reverse association direction?','Yes, including Simpson-type reversals from different group mixtures.']
],{pre:['simpson','meta-regression','confounding'],sources:['quant-stat-causal','quant-stat-cochrane']});
s(10,'transportability','Professional judgement','Transportability','Whether an estimated effect can apply to a different target population or setting.','Avoid assuming one study result fits every user, market or country.','Compare effect modifiers, baseline risks, design and outcome definitions.','A plant thriving in one garden may not thrive in another climate.',[
 ['A feature is tested on heavy users but deployed to new users. Main question?','Whether the effect transports to new users.'],
 ['Randomized within one sample means valid for every population. Why wrong?','Randomization supports its assigned comparison; generalization needs additional assumptions.'],
 ['Same risk ratio but different baseline risk: what can change?','Absolute risk difference and practical value.'],
 ['What evidence supports transport?','Target-population data, comparable mechanisms and justified adjustment for effect modifiers.'],
 ['A 20% relative conversion lift at baseline 5% versus 20%. Absolute lifts?','1 percentage point versus 4 percentage points.'],
 ['Why can weighting fail when the target contains a group absent from the study?','There is no direct support for that group; extrapolation assumptions are required.']
],{pre:['representativeness','effect-modification','risk-ratio'],sources:['quant-stat-causal'],checks:[{expression:'.05*.2*100',value:1},{expression:'.2*.2*100',value:4}]});
s(10,'causal-identification','Professional judgement','Causal identification','Connecting observable data to a causal target using explicit assumptions.','Know what must hold before interpreting a number as an intervention effect.','Define the intervention and estimand; justify consistency, exchangeability and positivity as appropriate.','A precise map reaches the right destination only when the connecting roads actually exist.',[
 ['A regression is highly predictive. Does this identify the effect of changing its predictor?','No. Prediction alone does not justify an intervention effect.'],
 ['Adjusting many variables guarantees causal identification. Why wrong?','The right causal roles and unmeasured assumptions matter; some controls create bias.'],
 ['Statistical estimation versus identification?','Identification links data to the target in principle; estimation uses a finite sample to compute it.'],
 ['What is positivity in a basic treatment comparison?','Relevant covariate groups must have a chance of receiving each treatment being compared.'],
 ['Every older participant receives treatment and none receive control. What identification concern?','There is no direct treatment overlap for older participants; comparison relies on extrapolation.'],
 ['Can a narrow CI solve a failure of identification?','No. It can precisely estimate a quantity that is not the intended causal effect.']
],{pre:['confounding','collider','transportability'],sources:['quant-stat-causal']});
s(10,'meta-prediction','Professional judgement','Meta-analytic prediction interval','An interval describing a true effect in a new comparable setting, under a specified synthesis model.','Distinguish certainty about the average from variation across settings.','A simple normal approximation uses pooled mean ±1.96√(tau²+SE_mean²); estimated small-study cases need better methods.','Knowing the average garden climate precisely does not tell every garden’s climate precisely.',[
 ['Mean effect=2, tau²=9, mean SE=1. Simple normal prediction margin?','1.96√10≈6.20 points.'],
 ['The pooled mean CI excludes zero, so every setting benefits. Why wrong?','Between-setting variation can allow zero or negative effects.'],
 ['Pooled mean CI versus prediction interval?','The first targets the average effect; the second includes effect variation in a new setting.'],
 ['What makes the simple interval unreliable with a few studies?','Uncertain tau and reference-distribution assumptions; suitable methods and sensitivity are needed.'],
 ['Using mean 2 and margin about 6.20, what is the approximate prediction interval?','About [−4.20,8.20], including effects in both directions.'],
 ['Why must a “new comparable study” condition be explicit?','A fundamentally different population may not follow the modeled effect distribution.']
],{pre:['random-meta','tau-heterogeneity','prediction-interval'],sources:['quant-stat-cochrane'],formula:'simple normal PI ≈ pooled mean ±1.96√(tau² + SE_mean²)',checks:[{expression:'1.96*Math.sqrt(9+1)',value:6.1980642139300235}]});
s(10,'dependent-evidence','Professional judgement','Dependent evidence','Evidence items can share data, biases or mechanisms rather than supplying independent information.','Avoid counting repeated reports as independent confirmation.','Trace cohorts, authorship, measurements and analysis reuse before combining evidence.','Ten copies of one photograph do not show ten separate views.',[
 ['Five papers analyze the same 1,000 people. Do they automatically provide 5,000 independent participants?','No. Participant overlap creates dependent evidence.'],
 ['Different journal titles guarantee independent replication. Why wrong?','Reports can reuse cohorts or share important biases.'],
 ['Repeated analyses versus repeated independent data collection?','Reanalysis explores one dataset; fresh collection can add independent information.'],
 ['What should a synthesis document about overlap?','Shared participants, periods, control groups and correlated effect estimates.'],
 ['Two treatment comparisons share one control group. What issue arises when pooling them?','Their effect estimates can be correlated through the shared control.'],
 ['Why can combining dependent estimates as independent make a CI too narrow?','It double-counts information and omits covariance.']
],{pre:['meta-analysis','independent-observations','covariance-formula'],sources:['quant-stat-cochrane']});
s(10,'precision-validity','Professional judgement','Precision versus validity','A small sampling error does not ensure the intended quantity is measured or identified correctly.','Evaluate bias and design before being impressed by a narrow interval.','Assess precision, measurement, selection and causal assumptions separately.','A perfectly sharp picture can still show the wrong object.',[
 ['A biased survey of a million people has a narrow CI. Is its target-population estimate necessarily valid?','No. Systematic selection bias can dominate sampling precision.'],
 ['A larger study must have a more valid causal conclusion. Why wrong?','More rows cannot repair confounding, selection or a wrong outcome measure.'],
 ['42-subject large effect versus 4,200-subject smaller effect: what should be compared?','Estimates, uncertainty, design, bias and target differences, not size or p alone.'],
 ['What few questions matter before trusting a precise result?','What was measured, who was observed, how comparison was created and which assumptions connect it to the claim.'],
 ['A tiny effect is precise and p<.001. What decision information remains needed?','Absolute magnitude, costs, risks, uncertainty and relevance to the target users.'],
 ['Why can better measurement help more than many extra noisy rows?','It can improve construct validity and reduce systematic error, not just sampling variance.']
],{pre:['practical-significance','measurement-attenuation','causal-identification'],sources:['quant-stat-asa','quant-stat-causal']});
s(10,'uncertain-decisions','Professional judgement','Decisions under statistical uncertainty','Choosing an action using estimated benefits, costs, risks and the value of further evidence.','Turn quantitative evidence into a reasoned choice without pretending certainty.','Use the target decision, plausible effect range, loss consequences and information cost.','Choose a route using travel time and accident risk, not just the most optimistic speed estimate.',[
 ['A strategy shows 6% ROI over 400 bets. Is a lasting edge proven?','No. Payoff variability, dependence, selection, costs and changing conditions must be assessed.'],
 ['Act only when p<.05, regardless of costs or stakes. Why inadequate?','A statistical threshold alone does not optimize a real decision.'],
 ['Sampling uncertainty versus uncertainty in model assumptions?','Both matter; a conventional CI often addresses only the first under a fixed model.'],
 ['What should be checked before scaling a noisy positive result?','Independent evidence, downside scenarios, implementation costs and the uncertainty in estimated edge.'],
 ['A reversible cheap pilot has uncertain benefit. What can a pilot provide?','Useful information at limited cost, if its design can answer the decision question.'],
 ['What makes a professional quantitative conclusion useful?','A clear target, honest assumptions, effect magnitude, uncertainty, consequences and evidence that could change the decision.']
],{pre:['precision-validity','independent-validation','rare-risk-inference','sensitivity-analysis'],sources:['quant-stat-asa','quant-stat-causal','quant-stat-estimation']});

export default records;
