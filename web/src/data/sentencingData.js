/**
 * sentencingData.js — Real USSC statistics.
 * Source: U.S. Sentencing Commission, FY2020–2024. N=284,823.
 */

export const USSC_STATS = {
  totalN: 284823,
  overallMean: 53.45,
  overallMedian: 27,
  overallStdDev: 75.61,
  skewness: 7.78,

  // Mean / Median sentence in months by Race × Sex
  byDemographic: {
    'Black-Male':      { mean: 78.01, median: 60, n: 61166,  pctIncarcerated: 95.3 },
    'Black-Female':    { mean: 35.22, median: 21, n: 4901,   pctIncarcerated: 80.3 },
    'Hispanic-Male':   { mean: 34.13, median: 14, n: 135213, pctIncarcerated: 91.8 },
    'Hispanic-Female': { mean: 27.67, median: 13, n: 14399,  pctIncarcerated: 86.6 },
    'White-Male':      { mean: 84.91, median: 60, n: 47361,  pctIncarcerated: 93.6 },
    'White-Female':    { mean: 52.20, median: 33, n: 10362,  pctIncarcerated: 86.8 },
    'Other-Male':      { mean: 65.94, median: 36, n: 9415,   pctIncarcerated: 91.4 },
    'Other-Female':    { mean: 40.68, median: 24, n: 2006,   pctIncarcerated: 83.3 },
  },

  // Adjusted medians excluding immigration offenses
  byDemographicNoImmigration: {
    'Black-Male':      { median: 72 },
    'Black-Female':    { median: 30 },
    'Hispanic-Male':   { median: 58 },
    'Hispanic-Female': { median: 33 },
    'White-Male':      { median: 60 },
    'White-Female':    { median: 36 },
    'Other-Male':      { median: 48 },
    'Other-Female':    { median: 28 },
  },

  stats: {
    anova_F:                      8117.69,
    anova_p:                      '< 0.001',
    kruskalWallis_H:              42619.89,
    kruskalWallis_p:              '< 0.001',
    chiSq_incarcerationByRace:    615.72,
    chiSq_incarcerationBySex:     2190.50,
    chiSq_incarcerationByRaceSex: 3216.96,
  },

  keyFacts: {
    hispanicShareOfDataset:         0.525,
    femaleShareOfDataset:           0.111,
    blackMaleToHispanicFemaleRatio: 2.82,
    genderGap:                      0.32,
  },
};

export const OFFENSE_MULTIPLIERS = {
  drug:                { label: 'Drug trafficking',     multiplier: 0.95, mandatoryMin: true  },
  immigration_entry:   { label: 'Unlawful entry',       multiplier: 0.32, mandatoryMin: false },
  immigration_reentry: { label: 'Illegal re-entry',     multiplier: 0.48, mandatoryMin: false },
  firearms:            { label: 'Weapons / firearms',   multiplier: 1.20, mandatoryMin: true  },
  fraud:               { label: 'Fraud / white-collar', multiplier: 0.85, mandatoryMin: false },
  robbery:             { label: 'Robbery',              multiplier: 1.60, mandatoryMin: false },
  sex_offense:         { label: 'Sex offense',          multiplier: 2.10, mandatoryMin: false },
};

export const REPRESENTATION_ADJ = {
  public_defender:  { label: 'Public defender',  adj:  0.00 },
  retained:         { label: 'Retained counsel', adj: -0.12 },
  pro_se:           { label: 'Pro se (self)',     adj: +0.15 },
  federal_defender: { label: 'Federal defender', adj: -0.06 },
};

export function getDemographicStats(race, sex, excludeImmigration = false) {
  const RACE_MAP = { Black: 'Black', White: 'White', Hispanic: 'Hispanic', Other: 'Other', Asian: 'Other', Native: 'Other' };
  const key = `${RACE_MAP[race] ?? 'Other'}-${sex}`;
  if (excludeImmigration) return USSC_STATS.byDemographicNoImmigration[key] ?? null;
  return USSC_STATS.byDemographic[key] ?? null;
}

// Backward-compat alias for calculateSentence.js
export const SENTENCE_STATS = USSC_STATS.byDemographic;

// Backward-compat aliases
export const OVERALL_STATS = {
  totalN: USSC_STATS.totalN,
  mean:   USSC_STATS.overallMean,
  median: USSC_STATS.overallMedian,
};
export const DISPARITY_FACTS           = USSC_STATS.keyFacts;
export const STAT_TESTS                = USSC_STATS.stats;
export const SENTENCE_STATS_NO_IMMIGRATION = USSC_STATS.byDemographicNoImmigration;
export const RACE_SEX_GROUPS           = Object.keys(USSC_STATS.byDemographic);

export const CALLOUTS = [
  { label: 'Black–Hispanic female gap', value: '2.82×', detail: 'Black men sentenced 2.82× longer than Hispanic women' },
  { label: 'Gender gap', value: '−32%', detail: 'Women receive ~32% shorter sentences on average' },
  { label: 'Black male incarceration rate', value: '95.3%', detail: 'Highest of any demographic group in the dataset' },
];

export const DATA_SOURCE = 'U.S. Sentencing Commission Individual Offender Datafiles, FY2020–2024. N=284,823.';
