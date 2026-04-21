import React, { useState, useEffect } from 'react';
import InmateCreator from './components/InmateCreator';
import ProfileBuilder from './components/ProfileBuilder';
import PixelAvatar, { RACE_DEFAULTS } from './components/PixelAvatar';
import AvatarCustomizer from './components/AvatarCustomizer';
import SentencingResults from './components/SentencingResults';
import DataNote from './components/DataNote';
import { calculateSentence } from './utils/calculateSentence';

// Detect narrow screens
function useIsMobile() {
  const [mobile, setMobile] = React.useState(() => window.innerWidth < 900);
  React.useEffect(() => {
    const h = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

const DEFAULT_PROFILE = {
  race: 'Black', sex: 'Male', age: 28,
  education: 'hs_ged', income: 'under15', citizenship: 'citizen',
  representation: 'public_defender',
  crimHistory: 'I', onSupervision: false,
  offense: 'drug', drugQuantity: 'medium', fraudAmount: 'low',
  aggravatingFactors: [],
};

// ── Simulator view (existing three-panel) ─────────────────────────────────────
function Simulator({ initialProfile, onBack }) {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState(initialProfile || DEFAULT_PROFILE);
  const [appearance, setAppearance] = useState({
    skinTone:   RACE_DEFAULTS[profile.race]?.skinTone  || 's4',
    hairStyle:  RACE_DEFAULTS[profile.race]?.hairStyle || 'afro',
    hairColor:  RACE_DEFAULTS[profile.race]?.hairColor || 'black',
    facialHair: 'none', build: 'average', customized: false,
    age: profile.age,
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!appearance.customized) {
      const def = RACE_DEFAULTS[profile.race] || RACE_DEFAULTS['White'];
      setAppearance(a => ({ ...a, skinTone: def.skinTone, hairStyle: def.hairStyle, hairColor: def.hairColor }));
    }
  }, [profile.race]); // eslint-disable-line

  useEffect(() => { setResult(calculateSentence(profile)); }, [profile]);

  const pct     = result?.pctIncarcerated ?? 90;
  const outfit  = pct > 70 ? (profile.offense === 'fraud' ? 'khaki' : 'jumpsuit') : 'civilian';
  const accessories = {
    idBadge:      outfit === 'jumpsuit' || outfit === 'khaki',
    ankleMonitor: pct > 40 && pct <= 70,
    folder:       profile.representation === 'public_defender',
    briefcase:    profile.representation === 'private' && pct <= 70,
    orangeWristband: outfit === 'jumpsuit' && profile.offense === 'drug',
    purpleWristband: outfit === 'jumpsuit' && profile.offense === 'sex_offense',
  };

  const PANEL = { background:'#12121C', border:'1px solid #1E1E2E', borderRadius:12, padding:16 };

  return (
    <div style={{ minHeight:'100vh', background:'#0E0E1A' }}>
      {/* Header */}
      <header style={{ borderBottom:'1px solid #1E1E2E', background:'#080810', padding:'10px 16px' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:'#E8621A', fontFamily:'monospace', fontSize:18, fontWeight:900 }}>■</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#E0E0F0', fontFamily:'monospace' }}>
                Sentenced Differently
              </div>
              <div style={{ fontSize:9, color:'#444460', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:2 }}>
                Sentencing Simulator · USSC FY2020–2024 · N=284,823
              </div>
            </div>
          </div>
          <button onClick={onBack}
            style={{ fontSize:10, padding:'5px 12px', borderRadius:6, cursor:'pointer',
              border:'1px solid #333350', background:'transparent', color:'#666688',
              fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            ← Edit Profile
          </button>
        </div>
      </header>

      {/* Three panels */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'12px',
        display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
        gap:12, alignItems:'start' }}>

        {/* LEFT */}
        <div style={{ ...PANEL, overflowY:'auto', maxHeight: isMobile ? 'none' : 'calc(100vh - 74px)' }}>
          <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:12 }}>
            Build Profile
          </p>
          <ProfileBuilder profile={profile} onChange={setProfile} />
        </div>

        {/* CENTER */}
        <div style={{ ...PANEL, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#E8621A' }}>
              {profile.race} {profile.sex}
            </div>
            <div style={{ fontSize:9, color:'#333350', textTransform:'uppercase', letterSpacing:'0.2em' }}>
              Age {profile.age}
            </div>
          </div>
          <div style={{ imageRendering:'pixelated' }}>
            <PixelAvatar profile={profile} appearance={appearance} outfit={outfit}
              accessories={accessories} stage="sentenced" />
          </div>
          <div style={{ fontSize:9, padding:'3px 10px', borderRadius:20, textTransform:'uppercase',
            letterSpacing:'0.15em', fontWeight:700,
            background: outfit === 'jumpsuit' ? 'rgba(232,98,26,0.12)' : 'rgba(45,74,122,0.2)',
            color: outfit === 'jumpsuit' ? '#E8621A' : '#5A8ED0',
            border:`1px solid ${outfit==='jumpsuit'?'rgba(232,98,26,0.3)':'rgba(45,74,122,0.3)'}` }}>
            {outfit === 'jumpsuit' ? '⬛ Prison' : outfit === 'khaki' ? '⬜ Federal Camp' : '● Civilian'}
            {accessories.ankleMonitor ? ' + Ankle Monitor' : ''}
          </div>
          <div style={{ width:'100%', maxWidth:256, borderTop:'1px solid #1E1E2E', paddingTop:10 }}>
            <AvatarCustomizer appearance={appearance} onChange={setAppearance} sex={profile.sex} />
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ ...PANEL, overflowY:'auto', maxHeight: isMobile ? 'none' : 'calc(100vh - 74px)' }}>
          <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:12 }}>
            Sentencing Results
          </p>
          <SentencingResults profile={profile} result={result} />
        </div>
      </div>

      <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 12px 24px' }}>
        <DataNote />
      </div>
    </div>
  );
}

// ── CSS blink animation ────────────────────────────────────────────────────────
const blinkStyle = document.createElement('style');
blinkStyle.textContent = '@keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }';
document.head.appendChild(blinkStyle);

// ── Root app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState('create'); // 'create' | 'simulate'
  const [savedProfile, setSavedProfile] = useState(null);

  return phase === 'create'
    ? <InmateCreator onProceed={() => setPhase('simulate')} />
    : <Simulator initialProfile={savedProfile || DEFAULT_PROFILE} onBack={() => setPhase('create')} />;
}
