/**
 * SimulatorPage.jsx — 3-column sentencing simulator with new light design.
 */

import React, { useState } from 'react';
import InmateCreator from '../components/InmateCreator';
import ProfileBuilder from '../components/ProfileBuilder';
import PixelAvatar, { RACE_DEFAULTS } from '../components/PixelAvatar';
import AIAvatarPanel from '../components/AIAvatarPanel';
import AvatarCustomizer from '../components/AvatarCustomizer';
import SentencingResults from '../components/SentencingResults';
import DataNote from '../components/DataNote';
import MugshotPhoto from '../components/avatar/MugshotPhoto';
import { calculateSentence } from '../utils/calculateSentence';

const DEFAULT_PROFILE = {
  race: 'Black', sex: 'Male', age: 28,
  education: 'hs_ged', income: 'under15', citizenship: 'citizen',
  representation: 'public_defender',
  crimHistory: 'I', onSupervision: false,
  offense: 'drug', drugQuantity: 'medium', fraudAmount: 'low',
  aggravatingFactors: [],
};

const PANEL = {
  background: '#fff',
  border: '1px solid #333',
  boxShadow: '3px 3px 0 #333',
  padding: 16,
};

function Simulator({ initialProfile, onBack }) {
  const [profile, setProfile]     = useState(initialProfile || DEFAULT_PROFILE);
  const [appearance, setAppearance] = useState({
    skinTone:   RACE_DEFAULTS[initialProfile?.race || 'Black']?.skinTone  || 's4',
    hairStyle:  RACE_DEFAULTS[initialProfile?.race || 'Black']?.hairStyle || 'afro',
    hairColor:  RACE_DEFAULTS[initialProfile?.race || 'Black']?.hairColor || 'black',
    facialHair: 'none', build: 'average', customized: false,
    age: (initialProfile || DEFAULT_PROFILE).age,
  });
  const [result, setResult]         = useState(() => calculateSentence(initialProfile || DEFAULT_PROFILE));
  const [showPortrait, setShowPortrait] = useState(false);

  React.useEffect(() => {
    if (!appearance.customized) {
      const def = RACE_DEFAULTS[profile.race] || RACE_DEFAULTS['White'];
      setAppearance(a => ({ ...a, skinTone: def.skinTone, hairStyle: def.hairStyle, hairColor: def.hairColor }));
    }
  }, [profile.race]); // eslint-disable-line

  React.useEffect(() => { setResult(calculateSentence(profile)); }, [profile]);

  const pct    = result?.pctIncarcerated ?? 90;
  const outfit = pct > 70 ? (profile.offense === 'fraud' ? 'khaki' : 'jumpsuit') : 'civilian';
  const stage  = 'sentenced';

  const accessories = {
    idBadge:        outfit === 'jumpsuit' || outfit === 'khaki',
    ankleMonitor:   pct > 40 && pct <= 70,
    folder:         profile.representation === 'public_defender',
    briefcase:      profile.representation === 'retained' && pct <= 70,
    orangeWristband: outfit === 'jumpsuit' && profile.offense === 'drug',
    purpleWristband: outfit === 'jumpsuit' && profile.offense === 'sex_offense',
  };

  const outfitLabel = outfit === 'jumpsuit' ? '⬛ Prison' : outfit === 'khaki' ? '⬜ Federal Camp' : '● Probation / Release';

  return (
    <div style={{ background: '#F5F2EB', minHeight: 'calc(100vh - 148px)' }}>

      {/* Sub-header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #333',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666' }}>
          Sentencing Simulator — Step 2 of 2
        </span>
        <button className="btn-secondary" style={{ fontSize: 9, padding: '4px 12px' }} onClick={onBack}>
          ← Edit Profile
        </button>
      </div>

      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: '16px',
        display: 'grid',
        gridTemplateColumns: '340px 1fr 340px',
        gap: 16,
        alignItems: 'start',
      }}>

        {/* Left — Profile editor */}
        <div style={{ ...PANEL, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div className="section-label">Build Profile</div>
          <ProfileBuilder profile={profile} onChange={setProfile} />
        </div>

        {/* Center — Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ ...PANEL, textAlign: 'center', width: '100%' }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>
              {profile.race} · {profile.sex} · Age {profile.age}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#E8621A', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {outfitLabel}{accessories.ankleMonitor ? ' + Ankle Monitor' : ''}
            </div>
          </div>

          {/* Pixel avatar */}
          <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <AIAvatarPanel
              profile={profile}
              appearance={appearance}
              outfit={outfit}
              accessories={accessories}
              stage={stage}
            />
            <div style={{ width: '100%', borderTop: '1px solid #ddd', paddingTop: 12 }}>
              <AvatarCustomizer appearance={appearance} onChange={setAppearance} sex={profile.sex} />
            </div>
          </div>

          {/* AI Portrait toggle */}
          <div style={{ width: '100%' }}>
            <button
              className="btn-secondary"
              style={{ width: '100%', fontSize: 10, textAlign: 'center' }}
              onClick={() => setShowPortrait(p => !p)}
            >
              {showPortrait ? '▲ Hide' : '▼ Show'} AI Portrait
            </button>
            {showPortrait && (
              <div style={{ marginTop: 12 }}>
                <MugshotPhoto
                  profile={profile}
                  appearance={appearance}
                  outfit={outfit}
                  stage={stage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right — Results */}
        <div style={{ ...PANEL, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <div className="section-label">Sentencing Estimate</div>
          <SentencingResults profile={profile} result={result} />
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px 32px' }}>
        <DataNote />
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const [phase, setPhase]       = useState('create');
  const [savedProfile, setSaved] = useState(null);

  if (phase === 'create') {
    return <InmateCreator onProceed={(p) => { setSaved(p); setPhase('simulate'); }} />;
  }
  return <Simulator initialProfile={savedProfile || DEFAULT_PROFILE} onBack={() => setPhase('create')} />;
}
