/**
 * NavBar.jsx
 * Persistent top navigation for all site pages.
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/about',       label: 'About the Data' },
  { to: '/simulator',   label: 'Simulator' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/team',        label: 'Team' },
  { to: '/sources',     label: 'Sources' },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isSimulator = location.pathname === '/simulator';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#080810',
      borderBottom: '1px solid #1E1E2E',
      padding: '0 16px',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>

        {/* Wordmark */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#E8621A', fontFamily: 'monospace', fontSize: 18, fontWeight: 900 }}>■</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E0E0F0', fontFamily: 'monospace' }}>
              Sentenced Differently
            </div>
            <div style={{ fontSize: 8, color: '#333350', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 1 }}>
              USSC FY2020–2024 · N=284,823
            </div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}
          className="desktop-nav">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                fontSize: 10,
                padding: '5px 12px',
                borderRadius: 5,
                textDecoration: 'none',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#E8621A' : '#888899',
                background: isActive ? 'rgba(232,98,26,0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(232,98,26,0.3)' : 'transparent'}`,
                transition: 'all 0.15s',
              })}
            >
              {label === 'Simulator' ? '▶ Simulator' : label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'none', background: 'none', border: 'none',
            color: '#888899', fontSize: 20, cursor: 'pointer',
            padding: 4,
          }}
          className="hamburger"
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid #1E1E2E',
          background: '#080810',
          padding: '8px 16px 12px',
        }}>
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                fontSize: 11,
                padding: '8px 0',
                textDecoration: 'none',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: isActive ? '#E8621A' : '#888899',
                borderBottom: '1px solid #1A1A2A',
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
