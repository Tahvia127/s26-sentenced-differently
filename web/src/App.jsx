/**
 * App.jsx — Root router. HashRouter for GitHub Pages compatibility.
 */

import React, { useMemo } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Layout        from './components/Layout';
import Home          from './pages/Home';
import AboutData     from './pages/AboutData';
import SimulatorPage from './pages/SimulatorPage';
import Methodology   from './pages/Methodology';
import Team          from './pages/Team';
import Sources       from './pages/Sources';

function randomCaseNum() {
  return String(Math.floor(10000 + Math.random() * 89999));
}

export const CASE_NUMBER = `2024-FED-${randomCaseNum()}`;

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout caseNumber={CASE_NUMBER} />}>
          <Route index            element={<Home />} />
          <Route path="about"     element={<AboutData />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="team"      element={<Team />} />
          <Route path="sources"   element={<Sources />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
