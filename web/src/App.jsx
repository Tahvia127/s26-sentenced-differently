import React, { useState, useEffect, useCallback } from 'react';
import ProfileBuilder from './components/ProfileBuilder';
import PixelAvatar, { RACE_DEFAULTS } from './components/PixelAvatar';
import AvatarCustomizer from './components/AvatarCustomizer';
import SentencingResults from './components/SentencingResults';
import DataNote from './components/DataNote';
import { calculateSentence } from './utils/calculateSentence';

// Detect narrow screens at render time
function useIsMobile() {
  const [mobile, setMobile] = React.useState(() => window.innerWidth < 900);
  React.useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

const DEFAULT_PROFILE = {
  race: 'Black',
  sex: 'Male',
  age: 28,
  education: 'hs_ged',
  representation: 'public_defender',
  crimHistory: 'I',
  onSupervision: false,
  offense: 'drug',
  drugQuantity: 'medium',
  fraudAmount: 'low',
  aggravatingFactors: [],
};

export default function App() {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [appearance, setAppearance] = useState({
    skinTone: RACE_DEFAULTS['Black'].skinTone,
    hairStyle: RACE_DEFAULTS['Black'].hairStyle,
    customized: false,
  });
  const [result, setResult] = useState(null);

  // Auto-infer appearance from race (unless user has manually customized)
  useEffect(() => {
    if (!appearance.customized) {
      const defaults = RACE_DEFAULTS[profile.race] || RACE_DEFAULTS['White'];
      setAppearance(prev => ({
        ...prev,
        skinTone: defaults.skinTone,
        hairStyle: defaults.hairStyle,
      }));
    }
  }, [profile.race]); // eslint-disable-line

  // Recalculate sentence on every profile change
  useEffect(() => {
    setResult(calculateSentence(profile));
  }, [profile]);

  const isLikelyIncarcerated = result ? result.pctIncarcerated > 70 : false;
  const outfit = isLikelyIncarcerated ? 'jumpsuit' : 'civilian';

  const accessories = {
    handcuffs: false,
    ankleMonitor: !isLikelyIncarcerated && (result?.pctIncarcerated ?? 100) < 50,
    idBadge: outfit === 'jumpsuit',
    briefcase: profile.representation === 'private',
    folder: profile.representation === 'public_defender',
  };

  return (
    <div style={{ background: '#0E0E1A', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid #1E1E2E', background: '#080810', padding: '10px 16px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#E8621A', fontFamily: 'monospace', fontSize: 18, fontWeight: 900 }}>■</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E0E0F0', lineHeight: 1 }}>
                Sentenced Differently
              </div>
              <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
                Federal Sentencing Simulator · USSC FY2020–2024 · N=284,823
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9, color: '#333350', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Academic Research &nbsp;|&nbsp; Not Legal Advice
          </div>
        </div>
      </header>

      {/* ── Three-panel body ──────────────────────────────────────── */}
      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: '12px 12px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
        gap: 12, alignItems: 'start',
      }}>

        {/* LEFT ── Profile Builder */}
        <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: 16, overflowY: 'auto', maxHeight: isMobile ? 'none' : 'calc(100vh - 74px)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#333350', marginBottom: 12 }}>
            Build Profile
          </div>
          <ProfileBuilder profile={profile} onChange={setProfile} />
        </div>

        {/* CENTER ── Pixel Avatar */}
        <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

          {/* Identity banner */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#E8621A', letterSpacing: '0.05em' }}>
              {profile.race} {profile.sex}
            </div>
            <div style={{ fontSize: 9, color: '#333350', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Age {profile.age} · {profile.offense.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Avatar */}
          <div style={{ imageRendering: 'pixelated' }}>
            <PixelAvatar
              profile={profile}
              appearance={appearance}
              outfit={outfit}
              accessories={accessories}
            />
          </div>

          {/* Status badge */}
          <div style={{
            fontSize: 9, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
            letterSpacing: '0.15em', fontWeight: 700,
            background: outfit === 'jumpsuit' ? 'rgba(232,98,26,0.12)' : 'rgba(45,74,122,0.2)',
            color: outfit === 'jumpsuit' ? '#E8621A' : '#5A8ED0',
            border: `1px solid ${outfit === 'jumpsuit' ? 'rgba(232,98,26,0.3)' : 'rgba(45,74,122,0.3)'}`,
          }}>
            {outfit === 'jumpsuit' ? '⬛ Prison Jumpsuit' : '👔 Civilian'}
            {accessories.ankleMonitor ? ' + Ankle Monitor' : ''}
          </div>

          {result && result.estimatedSentence > 60 && (
            <div style={{ fontSize: 9, color: '#CC4444', textAlign: 'center' }}>
              Est. {result.estimatedSentence}-month sentence
            </div>
          )}

          {/* Appearance customizer (always visible) */}
          <div style={{ width: '100%', maxWidth: 256, borderTop: '1px solid #1E1E2E', paddingTop: 10 }}>
            <AvatarCustomizer appearance={appearance} onChange={setAppearance} />
          </div>
        </div>

        {/* RIGHT ── Sentencing Results */}
        <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: 16, overflowY: 'auto', maxHeight: isMobile ? 'none' : 'calc(100vh - 74px)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#333350', marginBottom: 12 }}>
            Sentencing Results
          </div>
          <SentencingResults profile={profile} result={result} />
        </div>
      </div>

      {/* ── Footer / methodology ──────────────────────────────────── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 12px 24px' }}>
        <DataNote />
      </div>
    </div>
  );
}
