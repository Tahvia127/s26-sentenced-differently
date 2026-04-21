/**
 * calculateSentence.js
 * Federal sentencing guideline simulator.
 * Simplified BOL lookup + adjustments → guideline range → estimated actual sentence.
 */

import { SENTENCE_STATS } from '../data/sentencingData';

// ── Base Offense Level table ─────────────────────────────────────────────────
const BOL_TABLE = {
  immigration_entry:   { bol: 8,  rangeMin: 0,   rangeMax: 6   },
  immigration_reentry: { bol: 10, rangeMin: 0,   rangeMax: 14  },
  drug_small:          { bol: 12, rangeMin: 10,  rangeMax: 16  },
  drug_medium:         { bol: 16, rangeMin: 21,  rangeMax: 27  },
  drug_large:          { bol: 24, rangeMin: 51,  rangeMax: 63  },
  drug_very_large:     { bol: 30, rangeMin: 97,  rangeMax: 121 },
  firearms_simple:     { bol: 14, rangeMin: 15,  rangeMax: 21  },
  firearms_aggravated: { bol: 20, rangeMin: 33,  rangeMax: 41  },
  fraud_low:           { bol: 10, rangeMin: 6,   rangeMax: 12  },
  fraud_mid:           { bol: 14, rangeMin: 15,  rangeMax: 21  },
  fraud_high:          { bol: 18, rangeMin: 27,  rangeMax: 33  },
  robbery:             { bol: 20, rangeMin: 33,  rangeMax: 41  },
  sex_offense:         { bol: 22, rangeMin: 41,  rangeMax: 51  },
  violent_other:       { bol: 18, rangeMin: 27,  rangeMax: 33  },
};

// ── Criminal history multipliers ─────────────────────────────────────────────
const CRIM_HIST_MULTIPLIER = {
  'I':   1.00,
  'II':  1.10,
  'III': 1.20,
  'IV':  1.20,
  'V':   1.40,
  'VI':  1.40,
};

// ── Map profile inputs to BOL key ─────────────────────────────────────────────
function resolveBolKey(offense, drugQuantity, fraudAmount, hasWeapon) {
  switch (offense) {
    case 'immigration_entry':    return 'immigration_entry';
    case 'immigration_reentry':  return 'immigration_reentry';
    case 'immigration':          return 'immigration_entry';
    case 'drug':
      if (drugQuantity === 'very_large') return 'drug_very_large';
      if (drugQuantity === 'large')      return 'drug_large';
      if (drugQuantity === 'medium')     return 'drug_medium';
      return 'drug_small';
    case 'firearms':
      return hasWeapon ? 'firearms_aggravated' : 'firearms_simple';
    case 'fraud':
      if (fraudAmount === 'high')   return 'fraud_high';
      if (fraudAmount === 'mid')    return 'fraud_mid';
      return 'fraud_low';
    case 'robbery':      return 'robbery';
    case 'sex_offense':  return 'sex_offense';
    default:             return 'violent_other';
  }
}

// ── Mandatory minimum flags ───────────────────────────────────────────────────
export function hasMandatoryMinimum(offense, drugQuantity) {
  if (offense === 'drug' && (drugQuantity === 'large' || drugQuantity === 'very_large')) return true;
  if (offense === 'firearms_aggravated') return true;
  return false;
}

// ── Main calculator ───────────────────────────────────────────────────────────
export function calculateSentence(profile) {
  const {
    race = 'White',
    sex = 'Male',
    crimHistory = 'I',
    offense = 'drug',
    drugQuantity = 'small',
    fraudAmount = 'low',
    aggravatingFactors = [],
    onSupervision = false,
  } = profile;

  const hasWeapon = aggravatingFactors.includes('weapon');
  const bolKey = resolveBolKey(offense, drugQuantity, fraudAmount, hasWeapon);
  const bolEntry = BOL_TABLE[bolKey] || BOL_TABLE['violent_other'];

  // Adjustments
  let adjustment = 0;
  // Aggravating factors (+2 each, except accepted_resp which is -3)
  aggravatingFactors.forEach(f => {
    if (f === 'accepted_resp') {
      adjustment -= 3;
    } else {
      adjustment += 2;
    }
  });
  // Supervised release adds 2 pts to criminal history score
  const effectiveCrimHist = onSupervision
    ? bumpCrimHist(crimHistory)
    : crimHistory;

  // Adjusted range
  const multiplier = CRIM_HIST_MULTIPLIER[effectiveCrimHist] || 1.0;
  const guidelineMin = Math.max(
    0,
    Math.round((bolEntry.rangeMin + adjustment * 2) * multiplier)
  );
  const guidelineMax = Math.max(
    guidelineMin + 2,
    Math.round((bolEntry.rangeMax + adjustment * 2) * multiplier)
  );

  // Estimated actual sentence — use real USSC median for this race×sex
  const key = `${race}-${sex}`;
  const stats = SENTENCE_STATS[key] || SENTENCE_STATS['White-Male'];
  const pctIncarcerated = stats.pctIncarcerated;

  // Scale the real median by how the guideline sits vs overall average
  const overallGuidelineMid = (guidelineMin + guidelineMax) / 2;
  const realGroupMedian = stats.median;
  // Blend: 60% guideline mid, 40% group real median
  const estimatedSentence = Math.max(
    1,
    Math.round(overallGuidelineMid * 0.6 + realGroupMedian * 0.4)
  );

  // Below-guideline probability (based on real departure rates by demographic)
  const belowGuidelineProb = computeBelowGuideline(race, sex, offense);

  // Mandatory minimum
  const mandMin = hasMandatoryMinimum(offense, drugQuantity);

  // Good-time release: federal prisoners serve ~85% of sentence
  const goodTimeRelease = Math.round(estimatedSentence * 0.85);

  // Release date
  const now = new Date();
  const releaseDate = new Date(now);
  releaseDate.setMonth(releaseDate.getMonth() + goodTimeRelease);

  return {
    bolKey,
    bol: bolEntry.bol + adjustment,
    guidelineMin,
    guidelineMax,
    estimatedSentence,
    pctIncarcerated,
    belowGuidelineProb,
    mandatoryMinimum: mandMin,
    goodTimeRelease,
    releaseDateStr: releaseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    overallMedian: 27,
    vsOverallMedian: estimatedSentence - 27,
    key,
  };
}

// ── What-if comparator ────────────────────────────────────────────────────────
export function calculateWhatIf(profile, filterImmigration = false) {
  const groups = [
    { race: 'Black',    sex: 'Male' },
    { race: 'Black',    sex: 'Female' },
    { race: 'White',    sex: 'Male' },
    { race: 'White',    sex: 'Female' },
    { race: 'Hispanic', sex: 'Male' },
    { race: 'Hispanic', sex: 'Female' },
    { race: 'Other',    sex: 'Male' },
    { race: 'Other',    sex: 'Female' },
  ];

  return groups.map(({ race, sex }) => {
    const result = calculateSentence({ ...profile, race, sex });
    const key = `${race}-${sex}`;

    let median = result.estimatedSentence;
    if (filterImmigration) {
      // Use non-immigration adjusted medians
      const noImm = {
        'Black-Male': 72, 'Black-Female': 30,
        'White-Male': 60, 'White-Female': 36,
        'Hispanic-Male': 58, 'Hispanic-Female': 33,
        'Other-Male': 48, 'Other-Female': 28,
      };
      if (noImm[key]) {
        // Scale by guideline position
        const guidelineMid = (result.guidelineMin + result.guidelineMax) / 2;
        median = Math.round(guidelineMid * 0.6 + noImm[key] * 0.4);
      }
    }

    return {
      key,
      label: `${race} ${sex}`,
      race,
      sex,
      estimatedSentence: median,
      pctIncarcerated: (SENTENCE_STATS[key] || {}).pctIncarcerated || 90,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function bumpCrimHist(cat) {
  const order = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const idx = order.indexOf(cat);
  return order[Math.min(idx + 1, 5)];
}

function computeBelowGuideline(race, sex, offense) {
  // Based on USSC departure statistics
  // Women receive below-guideline sentences more often
  let base = 30; // ~30% of sentences are below guidelines
  if (sex === 'Female') base += 15;
  if (race === 'White') base += 5;
  if (offense === 'immigration') base += 10;
  if (offense === 'fraud') base += 8;
  if (offense === 'drug') base -= 5;
  return Math.min(65, Math.max(10, base));
}
