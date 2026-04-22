/**
 * AboutData.jsx — "About the Data" page
 * USSC dataset overview, race×sex breakdown table, key definitions, limitations.
 */

import React, { useState } from 'react';
import { SENTENCE_STATS, SENTENCE_STATS_NO_IMMIGRATION, OVERALL_STATS, STAT_TESTS } from '../data/sentencingData';

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>
        About the Data
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
        {children}
      </h2>
    </div>
  );
}

function StatBox({ label, value, sub }) {
  return (
    <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#E8621A' }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#E0E0F0', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 9, color: '#444460', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const GROUP_ORDER = [
  'Black-Male', 'Black-Female',
  'White-Male', 'White-Female',
  'Hispanic-Male', 'Hispanic-Female',
  'Other-Male', 'Other-Female',
];

const GROUP_COLORS = {
  Black: '#E8621A',
  White: '#5A8ED0',
  Hispanic: '#44CC88',
  Other: '#9966CC',
};

function pctBar(pct, color) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 5, background: '#1A1A2A', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 10, color, minWidth: 38, textAlign: 'right', fontFamily: 'monospace' }}>{pct}%</span>
    </div>
  );
}

export default function AboutData() {
  const [showNoImm, setShowNoImm] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

      {/* ── Header ── */}
      <SectionTitle>U.S. Sentencing Commission Data</SectionTitle>

      <p style={{ fontSize: 14, color: '#888899', lineHeight: 1.8, maxWidth: 720, marginBottom: 40 }}>
        This project draws on five fiscal years of individual case-level data published by the
        U.S. Sentencing Commission (USSC) — the independent federal agency responsible for
        establishing sentencing policies in federal courts. Every row in the dataset represents
        a real person sentenced in a U.S. federal court between October 2019 and September 2024.
      </p>

      {/* ── Stat boxes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 48 }}>
        <StatBox value="284,823" label="Total cases" sub="FY2020–FY2024" />
        <StatBox value="FY2020–24" label="Five fiscal years" sub="Oct 2019 – Sep 2024" />
        <StatBox value="94 %"  label="Incarceration rate" sub="Overall federal average" />
        <StatBox value="53.5 mo" label="Mean sentence length" sub="Median: 27 months" />
        <StatBox value="p < .001" label="Race×Sex disparity" sub="All tests significant" />
      </div>

      {/* ── What is the USSC? ── */}
      <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: '24px 28px', marginBottom: 40 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          What is the USSC?
        </h3>
        <p style={{ fontSize: 13, color: '#888899', lineHeight: 1.8 }}>
          The <strong style={{ color: '#E0E0F0' }}>U.S. Sentencing Commission</strong> was created by the Sentencing Reform Act of 1984
          to reduce disparity in federal sentencing. It publishes detailed annual datasets of every
          federal sentence imposed, including defendant demographics, offense type, criminal history,
          guideline range, and final sentence — making it one of the most comprehensive public records
          of criminal justice outcomes in the world.
        </p>
        <p style={{ fontSize: 13, color: '#888899', lineHeight: 1.8, marginTop: 10 }}>
          The data <strong style={{ color: '#E0E0F0' }}>does not include</strong> state-level prosecutions (which account for ~90% of all
          U.S. incarcerations), only federal cases. Federal prosecutions skew heavily toward
          drug trafficking, immigration offenses, firearms, and fraud.
        </p>
      </div>

      {/* ── Race × Sex table ── */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 8 }}>
        Sentence Statistics by Race × Sex
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowNoImm(false)}
          style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: !showNoImm ? 'rgba(232,98,26,0.12)' : 'transparent',
            border: `1px solid ${!showNoImm ? '#E8621A' : '#2A2A3F'}`,
            color: !showNoImm ? '#E8621A' : '#666688',
          }}>
          All offenses
        </button>
        <button
          onClick={() => setShowNoImm(true)}
          style={{
            fontSize: 10, padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: showNoImm ? 'rgba(232,98,26,0.12)' : 'transparent',
            border: `1px solid ${showNoImm ? '#E8621A' : '#2A2A3F'}`,
            color: showNoImm ? '#E8621A' : '#666688',
          }}>
          Excl. immigration
        </button>
        <span style={{ fontSize: 9, color: '#444460', fontFamily: 'monospace' }}>
          Immigration cases compress Hispanic medians dramatically
        </span>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 48 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #2A2A3F' }}>
              {['Group', 'N', 'Mean (mo)', 'Median (mo)', '% Incarcerated'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444460' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUP_ORDER.map(key => {
              const s = SENTENCE_STATS[key];
              const noImm = SENTENCE_STATS_NO_IMMIGRATION[key];
              const [race] = key.split('-');
              const color = GROUP_COLORS[race] || '#888899';
              const median = showNoImm ? noImm.median : s.median;
              return (
                <tr key={key} style={{ borderBottom: '1px solid #1A1A2A' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color, marginRight: 8 }} />
                    <span style={{ color: '#D0D0E8' }}>{key.replace('-', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#888899' }}>{s.n.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', color: '#D0D0E8' }}>{s.mean}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color, fontWeight: 700 }}>{median}</span>
                  </td>
                  <td style={{ padding: '10px 12px', minWidth: 140 }}>
                    {pctBar(s.pctIncarcerated, color)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Statistical tests ── */}
      <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: '24px 28px', marginBottom: 40 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Statistical Tests
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'ANOVA', val: `F = ${STAT_TESTS.anova.F.toLocaleString()}`, sub: `p ${STAT_TESTS.anova.p}` },
            { label: 'Kruskal–Wallis', val: `H = ${STAT_TESTS.kruskalWallis.H.toLocaleString()}`, sub: `p ${STAT_TESTS.kruskalWallis.p}` },
            { label: 'Chi² (Race)', val: `χ² = ${STAT_TESTS.chiSquareRace.chi2}`, sub: `p ${STAT_TESTS.chiSquareRace.p}` },
            { label: 'Chi² (Sex)', val: `χ² = ${STAT_TESTS.chiSquareSex.chi2}`, sub: `p ${STAT_TESTS.chiSquareSex.p}` },
          ].map(t => (
            <div key={t.label} style={{ padding: '10px 14px', background: '#0E0E1A', borderRadius: 8, border: '1px solid #1A1A2A' }}>
              <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#E8621A' }}>{t.val}</div>
              <div style={{ fontSize: 10, color: '#44CC88', fontFamily: 'monospace' }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Key Definitions ── */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 16 }}>Key Definitions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 48 }}>
        {[
          { term: 'Guideline Range', def: 'The sentencing range (min–max months) prescribed by the Federal Sentencing Guidelines based on offense severity and criminal history.' },
          { term: 'Criminal History Category', def: 'A I–VI scale derived from prior convictions. Category I = no priors; VI = five or more. Directly raises the guideline range.' },
          { term: 'Mandatory Minimum', def: 'Statutory floor below which a judge cannot sentence, regardless of mitigating factors. Common for drug trafficking and firearms offenses.' },
          { term: 'Substantial Assistance', def: 'A departure below mandatory minimums for defendants who cooperate with prosecutors. Disproportionately benefits defendants with higher-level connections.' },
          { term: 'Acceptance of Responsibility', def: 'A −2 or −3 level reduction for defendants who plead guilty and accept responsibility. Applied in ~97% of federal cases.' },
          { term: 'Below-Guideline Sentence', def: 'A sentence shorter than the guideline minimum. Judges must justify these. Rate varies significantly by race, judge, and district.' },
        ].map(d => (
          <div key={d.term} style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#E8621A', fontFamily: 'monospace', marginBottom: 6 }}>{d.term}</div>
            <p style={{ fontSize: 12, color: '#888899', lineHeight: 1.6 }}>{d.def}</p>
          </div>
        ))}
      </div>

      {/* ── Limitations ── */}
      <div style={{ borderLeft: '3px solid #CC4444', paddingLeft: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#CC4444', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
          ⚠ Data Limitations
        </h3>
        <ul style={{ fontSize: 12, color: '#888899', lineHeight: 2, paddingLeft: 16 }}>
          <li>Federal courts handle only ~10% of all U.S. criminal cases — state disparities may differ substantially.</li>
          <li>Race categories are coarse aggregates; within-group variation is significant.</li>
          <li>"Hispanic" in USSC data is primarily immigration offense cases, which carry shorter sentences and compress that group's median.</li>
          <li>The simulator uses simplified guideline calculations. Real federal sentencing involves hundreds of adjustment factors.</li>
          <li>Correlation ≠ causation: observed disparities reflect the intersection of systemic, judicial, and individual factors.</li>
        </ul>
      </div>

      <div style={{ fontSize: 10, color: '#333350', fontFamily: 'monospace', borderTop: '1px solid #1E1E2E', paddingTop: 16 }}>
        Source: U.S. Sentencing Commission, Individual Offender Datafiles, FY2020–FY2024.
        Available at ussc.gov/research/datafiles/commission-datafiles.
      </div>
    </div>
  );
}
