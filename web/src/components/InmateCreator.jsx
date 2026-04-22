/**
 * InmateCreator.jsx
 * Full-screen "Create Your Inmate" experience.
 * Three-column: Intake Form | Pixel Avatar | Customizer + Accessories
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import IntakeForm from './IntakeForm';
import PixelAvatar, {
  RACE_DEFAULTS, SKIN_TONES, HAIR_COLORS,
  GRID_W, GRID_H, SCALE,
  exportAvatarToCanvas,
} from './PixelAvatar';
import AIAvatarPanel from './AIAvatarPanel';
import AvatarCustomizer from './AvatarCustomizer';
import AccessoryPicker from './AccessoryPicker';
import { calculateSentence } from '../utils/calculateSentence';

// ── Case number generator ─────────────────────────────────────────────────────
function genCaseNumber() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `CASE #2024-FED-${n}`;
}

// ── Determine outfit from stage + profile + sentence result ───────────────────
function resolveOutfit(profile, result, stage) {
  if (stage === 'sentenced') {
    const pct = result?.pctIncarcerated ?? 90;
    if (pct > 70) {
      // White-collar gets khaki camp uniform
      if (profile.offense === 'fraud') return 'khaki';
      return 'jumpsuit';
    }
    return 'civilian'; // home confinement / probation → civilian with ankle monitor
  }
  // Arrest stage — outfit by offense
  const map = {
    fraud:               'suit',
    drug:                'civilian',
    robbery:             'civilian',
    firearms:            'cargo',
    immigration_entry:   'plain',
    immigration_reentry: 'plain',
    sex_offense:         'plain',
    other:               'plain',
  };
  return map[profile.offense] || 'civilian';
}

// ── Auto-accessories by stage + profile ───────────────────────────────────────
function resolveAutoAccessories(profile, result, stage) {
  const pct = result?.pctIncarcerated ?? 90;
  const acc = {};

  if (stage === 'arrest') {
    acc.handcuffs     = true;
    acc.mugshotPlacard = true;
    acc.evidenceTag   = profile.offense === 'drug' || profile.offense === 'firearms';
    acc.folder        = profile.representation === 'public_defender';
    acc.briefcase     = profile.representation === 'private';
  } else {
    // sentenced stage
    acc.idBadge          = pct > 70;
    acc.ankleMonitor     = pct > 40 && pct <= 70;
    acc.orangeWristband  = pct > 70 && profile.offense === 'drug';
    acc.purpleWristband  = pct > 70 && profile.offense === 'sex_offense';
    // White-collar private attorney → no orange jumpsuit styling
    acc.folder           = profile.representation === 'public_defender';
    acc.briefcase        = profile.representation === 'private' && pct <= 70;
    // 5+ years (60 months) → add age-graying via appearance prop
  }
  return acc;
}

const DEFAULT_PROFILE = {
  sex: 'Male', race: 'Black', age: 28,
  education: 'hs_ged', income: 'under15', citizenship: 'citizen',
  representation: 'public_defender',
  crimHistory: 'I', onSupervision: false,
  offense: 'drug', drugQuantity: 'medium', fraudAmount: 'low',
  aggravatingFactors: [],
};

const PANEL = { background:'#12121C', border:'1px solid #1E1E2E', borderRadius:12, padding:16 };
const SCROLL_PANEL = { ...PANEL, overflowY:'auto', maxHeight:'calc(100vh - 100px)' };

export default function InmateCreator({ onProceed }) {
  const [caseNumber] = useState(genCaseNumber);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [appearance, setAppearance] = useState({
    skinTone:   RACE_DEFAULTS['Black'].skinTone,
    hairStyle:  RACE_DEFAULTS['Black'].hairStyle,
    hairColor:  RACE_DEFAULTS['Black'].hairColor,
    facialHair: 'none',
    build:      'average',
    customized: false,
    age:        28,
  });
  const [stage, setStage] = useState('arrest'); // 'arrest' | 'sentenced'
  const [manualAccs, setManualAccs] = useState([]); // array of accessory IDs
  const [result, setResult] = useState(null);
  const avatarRef = useRef(null);

  // Sync age from profile to appearance
  useEffect(() => {
    setAppearance(a => ({ ...a, age: profile.age }));
  }, [profile.age]);

  // Auto-infer appearance from race (unless user customized)
  useEffect(() => {
    if (!appearance.customized) {
      const def = RACE_DEFAULTS[profile.race] || RACE_DEFAULTS['White'];
      setAppearance(a => ({
        ...a,
        skinTone:  def.skinTone,
        hairStyle: def.hairStyle,
        hairColor: def.hairColor,
      }));
    }
  }, [profile.race]); // eslint-disable-line

  // Recalculate sentence
  useEffect(() => {
    setResult(calculateSentence(profile));
  }, [profile]);

  const outfit      = resolveOutfit(profile, result, stage);
  const autoAccs    = resolveAutoAccessories(profile, result, stage);

  // Merge auto + manual accessories
  const accessories = useMemo(() => {
    const merged = { ...autoAccs };
    manualAccs.forEach(id => { merged[id] = true; });
    return merged;
  }, [autoAccs, manualAccs]);

  const toggleManualAcc = useCallback((id) => {
    setManualAccs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setAppearance({
      skinTone: RACE_DEFAULTS['Black'].skinTone,
      hairStyle: RACE_DEFAULTS['Black'].hairStyle,
      hairColor: RACE_DEFAULTS['Black'].hairColor,
      facialHair: 'none', build: 'average', customized: false, age: 28,
    });
    setManualAccs([]);
    setStage('arrest');
  };

  const handleSave = () => {
    // Build pixel arrays from current state for canvas export
    const label = `${caseNumber}  |  ${profile.race} ${profile.sex}, ${profile.age}  |  Est. ${result?.estimatedSentence ?? '?'} mo`;
    // We can't easily extract the layered pixels here without re-running the assembly,
    // so we capture the DOM node via html2canvas as fallback
    import('html2canvas').then(({ default: html2c }) => {
      const node = document.getElementById('avatar-export-target');
      if (!node) return;
      html2c(node, { backgroundColor: '#0E0E1A', scale: 2 }).then(canvas => {
        // Add label
        const final = document.createElement('canvas');
        final.width  = canvas.width;
        final.height = canvas.height + 48;
        const ctx = final.getContext('2d');
        ctx.fillStyle = '#0E0E1A';
        ctx.fillRect(0, 0, final.width, final.height);
        ctx.drawImage(canvas, 0, 0);
        ctx.fillStyle = '#E8621A';
        ctx.font = `bold ${Math.round(11 * 2)}px monospace`;
        ctx.fillText(label, 8, canvas.height + 30);

        const link = document.createElement('a');
        link.download = `inmate-profile-${caseNumber.replace(/[^0-9]/g,'')}.png`;
        link.href = final.toDataURL('image/png');
        link.click();
      });
    });
  };

  const pct = result?.pctIncarcerated ?? 90;
  const sentBadgeColor = pct > 70 ? '#E8621A' : pct > 40 ? '#FFAA00' : '#44CC88';

  return (
    <div style={{ minHeight:'100vh', background:'#0E0E1A' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header style={{ borderBottom:'1px solid #1E1E2E', background:'#080810', padding:'10px 16px' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ color:'#E8621A', fontFamily:'monospace', fontSize:18, fontWeight:900 }}>■</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#E0E0F0', fontFamily:'monospace' }}>
                Sentenced Differently
              </div>
              <div style={{ fontSize:9, color:'#444460', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:2 }}>
                Create Your Case File — Step 1 of 2
              </div>
            </div>
          </div>
          <button
            onClick={onProceed}
            style={{ fontSize:11, padding:'6px 16px', borderRadius:6, cursor:'pointer', fontFamily:'monospace',
              background:'rgba(232,98,26,0.15)', border:'1px solid #E8621A', color:'#E8621A', letterSpacing:'0.1em',
              textTransform:'uppercase' }}
          >
            See Sentence Estimate →
          </button>
        </div>
      </header>

      {/* ── Three-panel body ──────────────────────────────────────── */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'12px', display:'grid',
        gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'start' }}>

        {/* LEFT — Intake Form */}
        <div style={SCROLL_PANEL}>
          <IntakeForm profile={profile} caseNumber={caseNumber} onChange={setProfile} />
        </div>

        {/* CENTER — Avatar */}
        <div style={{ ...PANEL, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>

          {/* ARREST / SENTENCED toggle */}
          <div style={{ display:'flex', borderRadius:6, overflow:'hidden', border:'1px solid #2A2A3F' }}>
            {['arrest','sentenced'].map(s => (
              <button key={s} onClick={() => setStage(s)}
                style={{ fontSize:10, padding:'5px 14px', cursor:'pointer', outline:'none', border:'none',
                  fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase',
                  background: stage===s ? '#E8621A' : '#0E0E1A',
                  color: stage===s ? '#FFF' : '#444460',
                }}>
                {s === 'arrest' ? '[ ARREST ]' : '[ SENTENCED ]'}
              </button>
            ))}
          </div>

          {/* Case number */}
          <div style={{ fontSize:9, color:'#444460', fontFamily:'monospace', letterSpacing:'0.1em' }}>
            {caseNumber}
          </div>

          {/* Avatar — pixel art + optional AI generation */}
          <div id="avatar-export-target" ref={avatarRef} style={{ position:'relative' }}>
            <AIAvatarPanel
              profile={profile}
              appearance={appearance}
              outfit={outfit}
              accessories={accessories}
              stage={stage}
            />
          </div>

          {/* Status badge */}
          <div style={{ fontSize:9, padding:'3px 10px', borderRadius:20, textTransform:'uppercase',
            letterSpacing:'0.15em', fontWeight:700, fontFamily:'monospace',
            background:`rgba(${sentBadgeColor === '#E8621A' ? '232,98,26' : sentBadgeColor === '#FFAA00' ? '255,170,0' : '68,204,136'},0.12)`,
            color: sentBadgeColor,
            border:`1px solid ${sentBadgeColor}44`,
          }}>
            {stage === 'sentenced'
              ? (pct > 70 ? '⬛ Prison' : pct > 40 ? '⚫ Home Confinement' : '● Probation')
              : '◉ Arrest Stage'
            }
          </div>

          {result && (
            <div style={{ fontSize:10, color:'#888', textAlign:'center', fontFamily:'monospace' }}>
              Est. <span style={{ color:'#E8621A', fontWeight:700 }}>{result.estimatedSentence} mo</span>
              {' · '}
              <span style={{ color: sentBadgeColor }}>{pct}% incarceration</span>
            </div>
          )}

          {/* Save + Reset buttons */}
          <div style={{ display:'flex', gap:6, width:'100%', maxWidth:256 }}>
            <button onClick={handleSave}
              style={{ flex:1, fontSize:9, padding:'5px 8px', borderRadius:4, cursor:'pointer',
                border:'1px solid #E8621A', background:'rgba(232,98,26,0.1)', color:'#E8621A',
                fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Save Profile
            </button>
            <button onClick={handleReset}
              style={{ flex:1, fontSize:9, padding:'5px 8px', borderRadius:4, cursor:'pointer',
                border:'1px solid #333350', background:'transparent', color:'#666688',
                fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT — Customizer + Accessories */}
        <div style={SCROLL_PANEL}>
          {/* Customize appearance */}
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:10 }}>
              Customize Appearance
            </p>
            <AvatarCustomizer
              appearance={appearance}
              onChange={setAppearance}
              sex={profile.sex}
            />
          </div>

          {/* Manual accessory picker */}
          <div style={{ borderTop:'1px solid #1E1E2E', paddingTop:12 }}>
            <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#444460', marginBottom:10 }}>
              Add Accessories
            </p>
            <AccessoryPicker active={manualAccs} onToggle={toggleManualAcc} />
          </div>

          {/* Auto-assigned accessories (read-only summary) */}
          <div style={{ borderTop:'1px solid #1E1E2E', paddingTop:10, marginTop:4 }}>
            <p style={{ fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'#333350', marginBottom:6 }}>
              Auto-assigned ({stage} stage)
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {Object.entries(autoAccs)
                .filter(([,v]) => v)
                .map(([k]) => (
                  <span key={k} style={{ fontSize:8, padding:'2px 6px', border:'1px solid #2A2A3F',
                    borderRadius:10, color:'#555570', fontFamily:'monospace' }}>
                    {k.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                ))}
            </div>
          </div>

          {/* Educational note on the dressup mechanic */}
          <div style={{ borderTop:'1px solid #1E1E2E', paddingTop:10, marginTop:12,
            fontSize:9, color:'#333350', lineHeight:1.6 }}>
            <p style={{ color:'#444460', marginBottom:4 }}>About this tool</p>
            <p>
              Giving incarcerated people faces, hair, clothing, and personal touches
              increases viewer empathy vs. statistics alone.
              (Goff et al., 2014 — "The Essence of Innocence")
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'8px 12px 24px',
        display:'flex', justifyContent:'center' }}>
        <button onClick={onProceed}
          style={{ fontSize:12, padding:'10px 32px', borderRadius:8, cursor:'pointer',
            background:'#E8621A', border:'none', color:'#FFF', fontFamily:'monospace',
            letterSpacing:'0.15em', textTransform:'uppercase', fontWeight:700 }}>
          Proceed to Sentencing Simulator →
        </button>
      </div>
    </div>
  );
}
