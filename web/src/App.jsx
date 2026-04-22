/**
 * App.jsx — Root router for the Sentenced Differently multi-page site.
 * Uses HashRouter so GitHub Pages static hosting works without a 404 redirect.
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Layout       from './components/Layout';
import Home         from './pages/Home';
import AboutData    from './pages/AboutData';
import SimulatorPage from './pages/SimulatorPage';
import Methodology  from './pages/Methodology';
import Team         from './pages/Team';
import Sources      from './pages/Sources';

// ── Inject CSS animations app-wide ───────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes spin  { to { transform: rotate(360deg); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0E0E1A; color: #D0D0E8; }
  a { color: inherit; }
  button { font-family: inherit; }
`;
document.head.appendChild(styleEl);

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index       element={<Home />} />
          <Route path="about"       element={<AboutData />} />
          <Route path="simulator"   element={<SimulatorPage />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="team"        element={<Team />} />
          <Route path="sources"     element={<Sources />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
