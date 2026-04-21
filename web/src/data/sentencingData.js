/**
 * sentencingData.js
 * Hardcoded USSC FY2020-FY2024 statistics.
 * Source: U.S. Sentencing Commission Individual Offender Datafiles, N=284,823
 */

// ── Real sentence statistics by Race × Sex ───────────────────────────────────
export const SENTENCE_STATS = {
  'Black-Female':    { mean: 35.22, median: 21,  n: 4901,   pctIncarcerated: 80.3 },
  'Black-Male':      { mean: 78.01, median: 60,  n: 61166,  pctIncarcerated: 95.3 },
  'Hispanic-Female': { mean: 27.67, median: 13,  n: 14399,  pctIncarcerated: 86.6 },
  'Hispanic-Male':   { mean: 34.13, median: 14,  n: 135213, pctIncarcerated: 91.8 },
  'Other-Female':    { mean: 40.68, median: 24,  n: 2006,   pctIncarcerated: 83.3 },
  'Other-Male':      { mean: 65.94, median: 36,  n: 9415,   pctIncarcerated: 91.4 },
  'White-Female':    { mean: 52.20, median: 33,  n: 10362,  pctIncarcerated: 86.8 },
  'White-Male':      { mean: 84.91, median: 60,  n: 47361,  pctIncarcerated: 93.6 },
};

// ── Overall distribution ──────────────────────────────────────────────────────
export const OVERALL_STATS = {
  totalN:       284823,
  overallMean:  53.45,
  overallMedian: 27,
  skewness:     7.8,
};

// ── Statistical tests ─────────────────────────────────────────────────────────
export const STAT_TESTS = {
  anova:        { F: 8117.69, p: '<0.001' },
  kruskalWallis:{ H: 42619.89, p: '<0.001' },
  chiSquareRace:{ chi2: 615.72, p: '<0.001', label: 'Incarceration ~ Race' },
  chiSquareSex: { chi2: 2190.50, p: '<0.001', label: 'Incarceration ~ Sex' },
  chiSquareRaceSex: { chi2: 3216.96, p: '<0.001', label: 'Incarceration ~ Race×Sex' },
};

// ── Non-immigration-adjusted medians (drug + violent + fraud + weapons only) ──
export const SENTENCE_STATS_NO_IMMIGRATION = {
  'Black-Female':    { median: 30 },
  'Black-Male':      { median: 72 },
  'Hispanic-Female': { median: 33 },
  'Hispanic-Male':   { median: 58 },
  'Other-Female':    { median: 28 },
  'Other-Male':      { median: 48 },
  'White-Female':    { median: 36 },
  'White-Male':      { median: 60 },
};

// ── Key disparity facts ──────────────────────────────────────────────────────
export const DISPARITY_FACTS = [
  {
    id: 'black_male_vs_hispanic_female',
    stat: '2.2×',
    text: 'Black males receive sentences 2.2× longer than Hispanic females on average',
  },
  {
    id: 'women_shorter',
    stat: '−32%',
    text: 'Women receive sentences ~32% shorter than men on average',
  },
  {
    id: 'significance',
    stat: 'p < 0.001',
    text: 'All disparities statistically significant (N=284,823)',
  },
  {
    id: 'white_male_note',
    stat: '84.9 mo',
    text: 'White males have the highest mean sentence — driven by higher share of white-collar/fraud cases with heavier guideline ranges',
  },
];

// ── Ordered list for chart display ──────────────────────────────────────────
export const RACE_SEX_GROUPS = [
  { key: 'Black-Male',      label: 'Black Male',      race: 'Black',    sex: 'Male' },
  { key: 'Black-Female',    label: 'Black Female',    race: 'Black',    sex: 'Female' },
  { key: 'White-Male',      label: 'White Male',      race: 'White',    sex: 'Male' },
  { key: 'White-Female',    label: 'White Female',    race: 'White',    sex: 'Female' },
  { key: 'Hispanic-Male',   label: 'Hispanic Male',   race: 'Hispanic', sex: 'Male' },
  { key: 'Hispanic-Female', label: 'Hispanic Female', race: 'Hispanic', sex: 'Female' },
  { key: 'Other-Male',      label: 'Other Male',      race: 'Other',    sex: 'Male' },
  { key: 'Other-Female',    label: 'Other Female',    race: 'Other',    sex: 'Female' },
];

// ── Educational callouts (triggered by selection) ───────────────────────────
export const CALLOUTS = {
  'publicDefender': {
    heading: 'Public Defender',
    text: 'Studies show defendants with public defenders are 2× more likely to receive incarceration vs. private counsel, even controlling for offense severity.',
  },
  'blackMale': {
    heading: 'Black Male Profile',
    text: 'Black males in this dataset received a mean sentence of 78 months — the second-highest of any race×sex group — compared to 27.7 months for Hispanic females.',
  },
  'drugLarge': {
    heading: 'Drug Trafficking — Large Quantity',
    text: 'Mandatory minimum sentences for drug trafficking disproportionately affect Black defendants, who represent a higher share of trafficking charges relative to their share of actual drug use in the U.S. population.',
  },
  'acceptedResponsibility': {
    heading: 'Accepted Responsibility (−3 levels)',
    text: 'This 3-level reduction is applied in ~97% of federal cases. It is the most common departure and is built into the baseline data for most defendants.',
  },
  'longSentence': {
    heading: 'Sentence > 120 Months',
    text: 'This exceeds the average sentence for manslaughter in many states. Federal sentences are significantly longer than state sentences for equivalent offenses.',
  },
  'immigrationFilter': {
    heading: 'Immigration Offense Selected',
    text: 'You\'ve selected an immigration offense. The filter removes cases like yours from the comparison — switch it off to see how your profile compares within immigration cases.',
  },
};

// ── Source citation ──────────────────────────────────────────────────────────
export const DATA_SOURCE = 'U.S. Sentencing Commission, FY2020–FY2024 Individual Offender Data';
