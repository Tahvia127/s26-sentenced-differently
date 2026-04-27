/**
 * Home.jsx — Landing page, new Y2K editorial light theme.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USSC_STATS } from '../data/sentencingData';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimCounter({ target, duration = 1400, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        setVal(parseFloat((ease * target).toFixed(decimals)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, decimals]);
  return <span ref={ref}>{prefix}{typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : val}{suffix}</span>;
}

const BAR_DATA = [
  { label: 'Black Male',      median: 60, color: '#E8621A' },
  { label: 'White Male',      median: 60, color: '#4A6FA5' },
  { label: 'Other Male',      median: 36, color: '#9966CC' },
  { label: 'White Female',    median: 33, color: '#4A6FA5' },
  { label: 'Other Female',    median: 24, color: '#9966CC' },
  { label: 'Black Female',    median: 21, color: '#E8621A' },
  { label: 'Hispanic Male',   median: 14, color: '#6B8F71' },
  { label: 'Hispanic Female', median: 13, color: '#6B8F71' },
];
const MAX_MEDIAN = 60;

const HIGHLIGHTS = [
  { stat: '2.82×', desc: 'Black men sentenced 2.82× longer than Hispanic women (median 60 vs 13 mo)', border: '#E8621A' },
  { stat: '−32%', desc: 'Women receive sentences ~32% shorter than men across all races', border: '#4A6FA5' },
  { stat: '95.3%', desc: 'Incarceration rate for Black men — highest of any demographic group', border: '#CC4444' },
  { stat: '52.5%', desc: 'Hispanic defendants make up over half the entire USSC dataset', border: '#6B8F71' },
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div>

      {/* ── Hero ── */}
      <section style={{
        padding: '80px 24px 60px',
        borderBottom: '2px solid #333',
        background: '#fff',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#E8621A', textTransform: 'uppercase', marginBottom: 20 }}>
            University of Chicago · DSS Sentencing Research · FY2020–2024
          </div>
          <h1 style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 'clamp(40px, 7vw, 88px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            color: '#1A1A1A',
            marginBottom: 24,
          }}>
            Sentenced<br />
            <span style={{ color: '#E8621A', display: 'inline-block', borderBottom: '4px solid #333', paddingBottom: 4 }}>Differently</span>
          </h1>
          <p style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 18,
            lineHeight: 1.7,
            color: '#333',
            maxWidth: 640,
            marginBottom: 32,
          }}>
            The same federal crime. The same criminal history score. The same guideline range.
            But race and gender predict who goes to prison, and for how long — and the gap is measurable.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => nav('/simulator')}>
              ▶ Try the Simulator
            </button>
            <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => nav('/about')}>
              About the Data →
            </button>
          </div>
        </div>
      </section>

      {/* ── Stat counter row ── */}
      <section style={{ padding: '40px 24px', borderBottom: '2px solid #333', background: '#F5F2EB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          {[
            { label: 'Federal cases', val: USSC_STATS.totalN, suffix: '' },
            { label: 'Fiscal years covered', val: 5, suffix: '' },
            { label: 'Mean sentence (mo)', val: USSC_STATS.overallMean, suffix: '', decimals: 1 },
            { label: 'Gender gap in sentencing', val: 32, suffix: '%' },
          ].map(({ label, val, suffix, decimals = 0 }) => (
            <div key={label} style={{ borderLeft: '4px solid #E8621A', paddingLeft: 16 }}>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>
                <AnimCounter target={val} suffix={suffix} decimals={decimals} />
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disparity chart ── */}
      <section style={{ padding: '60px 24px', borderBottom: '2px solid #333', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <div className="section-label">Median sentence by group (months)</div>
            <h2 style={{ fontFamily: "'Courier New', monospace", fontSize: 24, fontWeight: 700, marginBottom: 24, marginTop: 8 }}>
              The Gap at a Glance
            </h2>
            {BAR_DATA.map(({ label, median, color }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#555', marginBottom: 4 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{median} mo</span>
                </div>
                <div style={{ height: 8, background: '#E8E4DC', border: '1px solid #ccc' }}>
                  <div style={{ width: `${(median / MAX_MEDIAN) * 100}%`, height: '100%', background: color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#999', marginTop: 16 }}>
              Source: USSC FY2020–2024 · N=284,823 · Median months incarcerated
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-label">Key findings</div>
            {HIGHLIGHTS.map(({ stat, desc, border }) => (
              <div key={stat} style={{
                background: '#fff',
                border: '1px solid #333',
                borderLeft: `4px solid ${border}`,
                padding: '14px 16px',
                boxShadow: '3px 3px 0 #333',
              }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 32, fontWeight: 700, color: border, lineHeight: 1, marginBottom: 6 }}>
                  {stat}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color: '#333', lineHeight: 1.5 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulator CTA ── */}
      <section style={{ padding: '60px 24px', background: '#1A1A1A' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.3em', color: '#E8621A', textTransform: 'uppercase', marginBottom: 16 }}>
            Interactive Tool
          </div>
          <h2 style={{ fontFamily: "'Courier New', monospace", fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: '#F5F2EB', marginBottom: 16, letterSpacing: '0.04em' }}>
            Build a Case. See the Disparity.
          </h2>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: '#999', lineHeight: 1.7, marginBottom: 32 }}>
            Select a race, gender, offense, and criminal history. The simulator shows your estimated sentence
            alongside real median outcomes for every demographic group — using actual USSC data.
          </p>
          <button className="btn-primary" style={{ fontSize: 13, padding: '12px 28px' }} onClick={() => nav('/simulator')}>
            ▶ Open the Sentencing Simulator
          </button>
        </div>
      </section>

    </div>
  );
}
