import React, { useState } from 'react';
import DisparityChart from './DisparityChart';
import Callout from './Callout';
import { SENTENCE_STATS, RACE_SEX_GROUPS, DISPARITY_FACTS, CALLOUTS, DATA_SOURCE } from '../data/sentencingData';
import { calculateWhatIf } from '../utils/calculateSentence';

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded p-3 border ${accent ? 'border-orange-700 bg-orange-950/30' : 'border-gray-700 bg-gray-800/50'}`}>
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
      <p className={`font-mono text-lg font-bold ${accent ? 'text-orange-400' : 'text-gray-100'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function ProbabilityBar({ pct, label, color = '#E8621A' }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold border-b border-gray-800 pb-1 mb-3">
      {children}
    </h3>
  );
}

export default function SentencingResults({ profile, result }) {
  const [filterImmigration, setFilterImmigration] = useState(false);

  if (!result) return (
    <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
      Complete your profile to see results
    </div>
  );

  const selectedKey = `${profile.race}-${profile.sex}`;
  const isLong = result.estimatedSentence > 120;
  const isImmigration = profile.offense === 'immigration_entry' || profile.offense === 'immigration_reentry';

  // Build what-if data
  const whatIfData = calculateWhatIf(profile, filterImmigration).map(d => ({
    ...d,
    n: SENTENCE_STATS[d.key]?.n,
  }));

  // Offense label
  const offenseLabels = {
    drug: 'Drug Trafficking', immigration_entry: 'Immigration Entry',
    immigration_reentry: 'Immigration Reentry', firearms: 'Firearms',
    fraud: 'Fraud / White-collar', robbery: 'Robbery / Violent',
    sex_offense: 'Sex Offense', other: 'Other Federal',
  };
  const offenseLabel = offenseLabels[profile.offense] || profile.offense;

  return (
    <div className="space-y-5">
      {/* ── Section 1: Your Sentence Estimate ── */}
      <div>
        <SectionHeader>Your Sentence Estimate</SectionHeader>

        <div className="text-xs text-gray-500 mb-3">
          <span className="text-gray-400 font-semibold">{offenseLabel}</span>
          {' · '}Criminal History {profile.crimHistory}
          {' · '}
          <span className="text-gray-400">{profile.race} {profile.sex}, Age {profile.age}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatCard
            label="Guideline Range"
            value={`${result.guidelineMin}–${result.guidelineMax} mo`}
            sub="Simplified federal guidelines"
          />
          <StatCard
            label="Est. Actual Sentence"
            value={`${result.estimatedSentence} mo`}
            sub={`USSC median for ${profile.race} ${profile.sex}`}
            accent
          />
          <StatCard
            label="Incarceration Prob."
            value={`${result.pctIncarcerated}%`}
            sub="Real USSC data for this group"
          />
          <StatCard
            label="Below-Guideline Prob."
            value={`~${result.belowGuidelineProb}%`}
            sub="Estimated downward departure rate"
          />
        </div>

        {/* vs overall median */}
        <div className={`text-xs px-3 py-2 rounded border ${
          result.vsOverallMedian > 0
            ? 'border-red-800 bg-red-950/20 text-red-300'
            : 'border-green-800 bg-green-950/20 text-green-300'
        }`}>
          {result.vsOverallMedian > 0
            ? `+${result.vsOverallMedian} months above`
            : `${result.vsOverallMedian} months below`
          }{' '}the overall federal median (27 months)
        </div>

        {isLong && (
          <div className="mt-2">
            <Callout {...CALLOUTS.longSentence} variant="warn" />
          </div>
        )}
      </div>

      {/* ── Section 2: What If You Were... ── */}
      <div>
        <SectionHeader>What If You Were...</SectionHeader>

        {/* Immigration filter toggle */}
        <div className="bg-gray-800/60 border border-gray-700 rounded p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-300 mb-0.5">Filter immigration offenses</p>
              <p className="text-[10px] text-gray-500">
                {filterImmigration
                  ? `Showing non-immigration offenses only (N≈135,211)`
                  : 'Immigration cases (52.5%) skew Hispanic sentences lower — toggle to compare apples to apples'}
              </p>
            </div>
            <button
              onClick={() => setFilterImmigration(f => !f)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ml-3 ${
                filterImmigration ? 'bg-orange-600' : 'bg-gray-700'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                filterImmigration ? 'translate-x-5' : ''
              }`} />
            </button>
          </div>
        </div>

        {filterImmigration && isImmigration && (
          <div className="mb-2">
            <Callout {...CALLOUTS.immigrationFilter} variant="warn" />
          </div>
        )}

        <p className="text-xs text-gray-500 mb-2">
          Same offense · same criminal history · same factors — only race/sex changes
        </p>

        <DisparityChart
          data={whatIfData}
          selectedKey={selectedKey}
          filterImmigration={filterImmigration}
        />
      </div>

      {/* ── Section 3: By the Numbers ── */}
      <div>
        <SectionHeader>By The Numbers</SectionHeader>
        <div className="space-y-2">
          {DISPARITY_FACTS.map(f => (
            <div key={f.id} className="flex gap-3 items-start text-xs">
              <span className="font-mono font-bold text-orange-400 flex-shrink-0 w-12 text-right">
                {f.stat}
              </span>
              <span className="text-gray-400">{f.text}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          Source: {DATA_SOURCE}
        </p>
      </div>

      {/* ── Section 4: Parole / Release ── */}
      <div>
        <SectionHeader>Release Estimate</SectionHeader>

        <div className="space-y-3">
          <ProbabilityBar
            pct={result.pctIncarcerated}
            label="Probability of incarceration"
            color="#E8621A"
          />
          <ProbabilityBar
            pct={100 - result.belowGuidelineProb}
            label="Probability sentence is within or above guidelines"
            color="#3B6BAD"
          />
        </div>

        <div className="mt-3 text-xs space-y-1 text-gray-400">
          <p>
            <span className="text-gray-300 font-semibold">Good-time credit:</span>{' '}
            Federal prisoners serve ~85% of sentence minimum.
            Estimated release after{' '}
            <span className="font-mono text-orange-300">{result.goodTimeRelease} months</span>
            {' '}({result.releaseDateStr}).
          </p>

          {result.mandatoryMinimum && (
            <p className="text-yellow-400/80">
              ⚠ This offense carries a <span className="font-bold">mandatory minimum sentence</span>.
              The judge cannot sentence below the statutory floor regardless of guidelines.
            </p>
          )}

          <p className="text-gray-600">
            Under the First Step Act (2018), this person may be eligible for earned time
            credits toward supervised release.
          </p>
        </div>
      </div>
    </div>
  );
}
