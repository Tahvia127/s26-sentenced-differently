/**
 * NavBar.jsx — Persistent navigation in new light-theme design.
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/about',       label: 'About the Data' },
  { to: '/simulator',   label: '▶ Simulator' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/team',        label: 'Team' },
  { to: '/sources',     label: 'Sources' },
];

const NAV_STYLE = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: '#F5F2EB',
  borderBottom: '1px solid #333',
};

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={NAV_STYLE}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>

        <div style={{ display: 'flex', gap: 1 }} className="desktop-nav">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0 14px',
                lineHeight: '42px',
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: isActive ? '#fff' : '#1A1A1A',
                background: isActive ? '#E8621A' : 'transparent',
                borderRight: '1px solid transparent',
                borderLeft: '1px solid transparent',
                boxShadow: isActive ? '2px 2px 0 #333' : 'none',
                position: 'relative',
                zIndex: isActive ? 1 : 0,
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="hamburger"
          style={{ display: 'none', background: 'none', border: '1px solid #333', padding: '4px 8px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 14 }}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{ background: '#F5F2EB', borderTop: '1px solid #333', padding: '8px 24px 12px' }}>
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: isActive ? '#E8621A' : '#1A1A1A',
                padding: '10px 0',
                borderBottom: '1px solid #ddd',
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
          .hamburger   { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
