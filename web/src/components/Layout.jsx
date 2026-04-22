/**
 * Layout.jsx
 * Wraps every page with NavBar + optional footer.
 */

import React from 'react';
import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0E0E1A', color: '#D0D0E8' }}>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <footer style={{
        borderTop: '1px solid #1E1E2E',
        padding: '16px',
        textAlign: 'center',
        fontSize: 9,
        color: '#333350',
        fontFamily: 'monospace',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        Sentenced Differently · University of Chicago · FY2020–2024 USSC Individual Offender Data · N=284,823
        <span style={{ margin: '0 8px' }}>|</span>
        For educational purposes only. Not legal advice.
      </footer>
    </div>
  );
}
