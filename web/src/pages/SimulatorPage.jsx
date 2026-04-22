/**
 * SimulatorPage.jsx
 * Wraps the full InmateCreator → Simulator flow inside the site layout.
 * Uses a local phase state so the nav stays visible throughout.
 */

import React, { useState } from 'react';
import InmateCreator from '../components/InmateCreator';
import { useNavigate } from 'react-router-dom';

// Inline minimal Simulator (delegates to App's Simulator logic reimported here)
import ProfileBuilder from '../components/ProfileBuilder';
import PixelAvatar, { RACE_DEFAULTS } from '../components/PixelAvatar';
import AIAvatarPanel from '../components/AIAvatarPanel';
import AvatarCustomizer from '../components/AvatarCustomizer';
import SentencingResults from '../components/SentencingResults';
import DataNote from '../components/DataNote';
import { calculateSentence } from '../utils/calculateSentence';

const DEFAULT_PROFILE = {
  race: 'Black', sex: 'Male', age: 28,
  education: 'hs_ged', income: 'under15', citizenship: 'citizen',
  representation: 'public_defender',
  crimHistory: 'I', onSupervision: false,
  offense: 'drug', drugQuantity: 'medium', fraudAmount: 'low',
  aggravatingFactors: [],
};

function Simulator({ initialProfile, onBack }) {
  const [profile, setProfile] = useState(initialProfile || DEFAULT_PROFILE);
  const [appearance, setAppearance] = useState({
    skinTone:   RACE_DEFAULTS[profile.race]?.skinTone  || 's4',
    hairStyle:  RACE_DEFAULTS[profile.race]?.hairStyle || 'afro',
    hairColor:  RACE_DEFAULTS[profile.race]?.hairColor || 'black',
    facialHair: 'none', build: 'average', customized: false,
    age: profile.age,
  });
  const [result, setResult] = useState(() => calculateSentence(profile));

  React.useEffect(() => {
    if (!appearance.customized) {
      const def = RACE_DEFAULTS[profile.race] || RACE_DEFAULTS['White'];
      setAppearance(a => ({ ...a, skinTone: def.skinTone, hairStyle: def.hairStyle, hairColor: def.hairColor }));
    }
  }, [profile.race]); // eslint-disable-line

  React.useEffect(() => { setResult(calculateSentence(profile)); }, [profile]);

  const pct    = result?.pctIncarcerated ?? 90;
  const outfit = pct > 70 ? (profile.offense === 'fraud' ? 'khaki' : 'jumpsuit') : 'civilian';
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
    <div style={{ background:'#0E0E1A', minHeight:'calc(100vh - 52px)' }}>
      {/* Sub-header */}
      <div style={{ borderBottom:'1px solid #1E1E2E', background:'#080810', padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:9, color:'#444460', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase' }}>
          Sentencing Simulator — Step 2 of 2
        </span>
        <button onClick={onBack}
          style={{ fontSize:10, padding:'4px 12px', borderRadius:5, cursor:'pointer',
            border:'1px solid #333350', background:'transparent', color:'#666688',
            fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          ← Edit Profile
        </button>
      </div>

      <div style={{ maxWidth:1440, margin:'0 auto', padding:'12px',
        display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'start' }}>

        <div style={{ ...PANEL, overflowY:'auto', maxHeight:'calc(100vh - 120px)' }}>
          <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:12 }}>Build Profile</p>
          <ProfileBuilder profile={profile} onChange={setProfile} />
        </div>

        <div style={{ ...PANEL, display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#E8621A' }}>{profile.race} {profile.sex}</div>
            <div style={{ fontSize:9, color:'#333350', textTransform:'uppercase', letterSpacing:'0.2em' }}>Age {profile.age}</div>
          </div>
          <AIAvatarPanel profile={profile} appearance={appearance} outfit={outfit} accessories={accessories} stage="sentenced" />
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

        <div style={{ ...PANEL, overflowY:'auto', maxHeight:'calc(100vh - 120px)' }}>
          <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:12 }}>Sentencing Results</p>
          <SentencingResults profile={profile} result={result} />
        </div>
      </div>

      <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 12px 24px' }}>
        <DataNote />
      </div>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [phase, setPhase] = useState('create');
  const [savedProfile, setSavedProfile] = useState(null);

  return phase === 'create'
    ? <InmateCreator onProceed={() => setPhase('simulate')} />
    : <Simulator initialProfile={savedProfile || DEFAULT_PROFILE} onBack={() => setPhase('create')} />;
}
