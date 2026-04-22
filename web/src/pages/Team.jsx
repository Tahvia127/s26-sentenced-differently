/**
 * Team.jsx — Project team page.
 */

import React from 'react';

const TEAM = [
  {
    name: 'Latahvia Williams',
    role: 'Project Lead & Data Engineer',
    bio: 'Designed the research framework, built the data pipeline, and led the regression analysis on USSC FY2020–2024 sentencing data.',
    initials: 'LW',
    color: '#E8621A',
  },
];

const TIMELINE = [
  { week: 'Weeks 1–2', label: 'Data Acquisition', desc: 'Downloaded USSC individual offender datafiles, built cleaning pipeline in Python/pandas.' },
  { week: 'Weeks 3–4', label: 'Regression Analysis', desc: 'OLS Models 1–4, two-stage logistic + conditional OLS, VIF, Cook\'s Distance, mandatory minimum interactions.' },
  { week: 'Week 5',   label: 'Web Application', desc: 'Built React + Vite sentencing simulator with pixel art avatar system and PixelLab AI integration.' },
  { week: 'Week 6',   label: 'Multi-page Site', desc: 'Expanded to a 6-page GitHub Pages site with full methodology documentation.' },
  { week: 'Weeks 7–8', label: 'Presentation & Report', desc: 'Final slide deck, written report, and team review.' },
];

function Avatar({ initials, color }) {
  return (
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `2px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Team() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>
          Project Team
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#E0E0F0', fontFamily: 'monospace' }}>
          About This Project
        </h1>
        <p style={{ fontSize: 14, color: '#888899', lineHeight: 1.8, maxWidth: 620, marginTop: 10 }}>
          <em>Sentenced Differently</em> is an 8-week academic research project examining
          racial and gender disparities in U.S. federal sentencing, conducted at the
          University of Chicago.
        </p>
      </div>

      {/* Institution badge */}
      <div style={{
        background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12,
        padding: '20px 24px', marginBottom: 40,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 8,
          background: 'linear-gradient(135deg, #800000, #A00000)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontFamily: 'serif', fontWeight: 900, color: '#FFD700',
          flexShrink: 0,
        }}>
          Ü
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#E0E0F0', letterSpacing: '0.05em' }}>
            University of Chicago
          </div>
          <div style={{ fontSize: 11, color: '#888899', marginTop: 2 }}>
            Department of Sociology / Computational Social Science
          </div>
          <div style={{ fontSize: 10, color: '#444460', marginTop: 2, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            Course S26 — Spring 2026
          </div>
        </div>
      </div>

      {/* Team members */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 20 }}>
        Team
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
        {TEAM.map(m => (
          <div key={m.name} style={{
            background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12,
            padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap',
          }}>
            <Avatar initials={m.initials} color={m.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace' }}>{m.name}</div>
              <div style={{ fontSize: 11, color: m.color, marginTop: 3, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{m.role}</div>
              <p style={{ fontSize: 13, color: '#888899', lineHeight: 1.7, marginTop: 10 }}>{m.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project timeline */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 20 }}>
        Project Timeline
      </h2>
      <div style={{ position: 'relative', marginBottom: 48 }}>
        <div style={{ position: 'absolute', left: 70, top: 0, bottom: 0, width: 1, background: '#1E1E2E' }} />
        {TIMELINE.map((t, i) => (
          <div key={t.week} style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 60, textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: '#444460', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t.week}
              </span>
            </div>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: i === TIMELINE.length - 1 ? '#333350' : '#E8621A',
              border: '2px solid #0E0E1A', marginTop: 2, position: 'relative', zIndex: 1,
            }} />
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#D0D0E8' }}>{t.label}</div>
              <p style={{ fontSize: 12, color: '#666688', lineHeight: 1.6, marginTop: 4 }}>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data access note */}
      <div style={{ borderLeft: '3px solid #5A8ED0', paddingLeft: 16, fontSize: 12, color: '#666688', lineHeight: 1.7 }}>
        <strong style={{ color: '#888899' }}>Data Access:</strong> All USSC datafiles are publicly available at{' '}
        <a href="https://www.ussc.gov/research/datafiles/commission-datafiles" target="_blank" rel="noreferrer"
          style={{ color: '#5A8ED0' }}>
          ussc.gov/research/datafiles
        </a>.
        No individual defendants can be identified from the public data — all records are
        anonymized at the district level.
      </div>
    </div>
  );
}
