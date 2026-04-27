/**
 * Layout.jsx — Wraps every page with the intake-form header + footer.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout({ caseNumber }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Intake-form masthead ── */}
      <div style={{
        background: '#fff',
        borderBottom: '2px solid #333',
        borderLeft: '4px solid #E8621A',
        padding: '10px 24px',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.25em', color: '#666', textTransform: 'uppercase', marginBottom: 2 }}>
              U.S. Federal Intake Processing System
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', color: '#1A1A1A', lineHeight: 1 }}>
              SENTENCED DIFFERENTLY
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>
              Interactive Case File · Fiscal Year 2020–2024 · U.S. Sentencing Commission · N=284,823
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Case Number
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 14, fontWeight: 700, color: '#E8621A', letterSpacing: '0.05em' }}>
              {caseNumber ?? 'CASE #2024-FED-XXXXX'}
            </div>
          </div>
        </div>
      </div>

      <NavBar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        background: '#fff',
        borderTop: '2px solid #333',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Sentenced Differently · University of Chicago · FY2020–2024 USSC Individual Offender Data · N=284,823
        </div>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 11, color: '#999', fontStyle: 'italic' }}>
          For educational purposes only. Not legal advice.
        </div>
      </footer>
    </div>
  );
}
