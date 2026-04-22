/**
 * Home.jsx
 * Landing page — hero, key stats, callouts, CTAs.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DISPARITY_FACTS, OVERALL_STATS, SENTENCE_STATS, STAT_TESTS } from '../data/sentencingData';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimCounter({ target, duration = 1400, prefix = '', suffix = '' }) {
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
        setVal(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Disparity bar ─────────────────────────────────────────────────────────────
function DisparityBar({ label, median, max, color }) {
  const pct = Math.round((median / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888899', fontFamily: 'monospace', marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color }}>{median} mo</span>
      </div>
      <div style={{ height: 6, background: '#1A1A2A', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

const STAT_CARDS = [
  { label: 'Federal cases analyzed', value: 284823, suffix: '' },
  { label: 'Fiscal years', value: 5, suffix: '' },
  { label: 'Race × sex groups', value: 8, suffix: '' },
];

const HIGHLIGHTS = [
  { stat: '2.2×', desc: 'Black men sentenced 2.2× longer than Hispanic women on average', color: '#E8621A' },
  { stat: '−32%', desc: 'Women receive sentences ~32% shorter than men across all races', color: '#5A8ED0' },
  { stat: '95.3%', desc: 'Incarceration rate for Black men — highest of any group', color: '#CC4444' },
  { stat: '86.8%', desc: 'Incarceration rate for White women — lowest of any group', color: '#44CC88' },
];

const BAR_DATA = [
  { label: 'Black Male',      median: 60, color: '#E8621A' },
  { label: 'White Male',      median: 60, color: '#5A8ED0' },
  { label: 'Other Male',      median: 36, color: '#9966CC' },
  { label: 'Black Female',    median: 21, color: '#E8621A88' },
  { label: 'White Female',    median: 33, color: '#5A8ED088' },
  { label: 'Hispanic Male',   median: 14, color: '#44CC88' },
  { label: 'Hispanic Female', median: 13, color: '#44CC8888' },
  { label: 'Other Female',    median: 24, color: '#9966CC88' },
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,98,26,0.015) 2px, rgba(232,98,26,0.015) 4px)',
        }} />

        {/* Badge */}
        <div style={{
          fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#E8621A', fontFamily: 'monospace',
          border: '1px solid rgba(232,98,26,0.3)', borderRadius: 20,
          padding: '4px 14px', marginBottom: 24,
          background: 'rgba(232,98,26,0.06)',
        }}>
          University of Chicago · Sentencing Research Project
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 72px)',
          fontWeight: 900, fontFamily: 'monospace',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textAlign: 'center', lineHeight: 1.1,
          color: '#E0E0F0',
          marginBottom: 8,
        }}>
          Sentenced
          <br />
          <span style={{ color: '#E8621A' }}>Differently</span>
        </h1>

        <p style={{
          fontSize: 14, color: '#666688', fontFamily: 'monospace',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: 32, textAlign: 'center',
        }}>
          Race, Gender & Federal Sentencing Disparities · FY2020–2024
        </p>

        <p style={{
          maxWidth: 560, textAlign: 'center', fontSize: 14,
          color: '#888899', lineHeight: 1.8, marginBottom: 40,
        }}>
          Using five years of U.S. Sentencing Commission data spanning{' '}
          <span style={{ color: '#E0E0F0', fontWeight: 700 }}>284,823 federal cases</span>,
          we quantify how race and gender shape sentencing outcomes — after controlling
          for offense type, criminal history, and legal representation.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56 }}>
          <button onClick={() => nav('/simulator')}
            style={{
              fontSize: 12, padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
              background: '#E8621A', border: 'none', color: '#FFF',
              fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
              fontWeight: 700,
            }}>
            ▶ Enter the Simulator
          </button>
          <button onClick={() => nav('/about')}
            style={{
              fontSize: 12, padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid #333350', color: '#888899',
              fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
            Explore the Data →
          </button>
        </div>

        {/* Stat counters */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STAT_CARDS.map(c => (
            <div key={c.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: '#E8621A' }}>
                <AnimCounter target={c.value} />
              </div>
              <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Findings ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>
            Key Findings
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            The numbers tell a clear story
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {HIGHLIGHTS.map(h => (
            <div key={h.stat} style={{
              background: '#12121C', border: '1px solid #1E1E2E',
              borderRadius: 12, padding: '24px 20px',
              borderLeft: `3px solid ${h.color}`,
            }}>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'monospace', color: h.color, marginBottom: 8 }}>
                {h.stat}
              </div>
              <p style={{ fontSize: 12, color: '#888899', lineHeight: 1.6 }}>
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Median Sentence Chart ── */}
      <section style={{ background: '#0A0A14', padding: '60px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>
              Median Sentence by Group
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace' }}>
              Months of incarceration, all federal offenses
            </h2>
            <p style={{ fontSize: 11, color: '#444460', marginTop: 6 }}>
              Unadjusted medians — immigration-heavy Hispanic cases compress those figures
            </p>
          </div>

          {BAR_DATA.map(d => (
            <DisparityBar key={d.label} label={d.label} median={d.median} max={80} color={d.color} />
          ))}

          <div style={{ marginTop: 16, fontSize: 9, color: '#333350', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            Source: USSC FY2020–2024 Individual Offender Datafiles · N=284,823
          </div>
        </div>
      </section>

      {/* ── Simulator CTA ── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          background: '#12121C', border: '1px solid #1E1E2E',
          borderRadius: 16, padding: '40px 32px',
        }}>
          <div style={{
            display: 'inline-block', fontSize: 32, marginBottom: 16,
            fontFamily: 'monospace', fontWeight: 900,
            color: '#E8621A',
          }}>
            ■
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 12 }}>
            Build a case. See the sentence.
          </h2>
          <p style={{ fontSize: 13, color: '#666688', lineHeight: 1.7, marginBottom: 28 }}>
            Create a detailed federal defendant profile — race, offense, criminal history,
            legal representation — and watch a pixel-art avatar receive their likely
            sentence based on real USSC disparity data.
          </p>
          <button onClick={() => nav('/simulator')}
            style={{
              fontSize: 13, padding: '12px 32px', borderRadius: 8, cursor: 'pointer',
              background: '#E8621A', border: 'none', color: '#FFF',
              fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
              fontWeight: 700,
            }}>
            Open the Sentencing Simulator →
          </button>
        </div>
      </section>
    </div>
  );
}
