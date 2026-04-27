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

const PANEL = {
  background: '#fff',
  border: '1px solid #333',
  boxShadow: '3px 3px 0 #333',
  padding: 16,
};
const SCROLL_PANEL = { ...PANEL, overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' };

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
      html2c(node, { backgroundColor: '#F5F2EB', scale: 2 }).then(canvas => {
        // Add label
        const final = document.createElement('canvas');
        final.width  = canvas.width;
        final.height = canvas.height + 48;
        const ctx = final.getContext('2d');
        ctx.fillStyle = '#F5F2EB';
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
    <div style={{ minHeight: 'calc(100vh - 148px)', background: '#F5F2EB' }}>

      {/* ── Sub-header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #333', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666' }}>
          Create Your Case File — Step 1 of 2
        </span>
        <button className="btn-primary" style={{ fontSize: 10, padding: '5px 16px' }} onClick={onProceed}>
          See Sentence Estimate →
        </button>
      </div>

      {/* ── Three-panel body ── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '16px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start' }}>

        {/* LEFT — Intake Form */}
        <div style={SCROLL_PANEL}>
          <IntakeForm profile={profile} caseNumber={caseNumber} onChange={setProfile} />
        </div>

        {/* CENTER — Avatar */}
        <div style={{ ...PANEL, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

          {/* ARREST / SENTENCED toggle */}
          <div style={{ display: 'flex', border: '1px solid #333', width: '100%', maxWidth: 280 }}>
            {['arrest','sentenced'].map(s => (
              <button key={s} onClick={() => setStage(s)}
                style={{ flex: 1, fontSize: 9, padding: '6px 0', cursor: 'pointer', outline: 'none', border: 'none',
                  fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: stage === s ? '#E8621A' : 'transparent',
                  color: stage === s ? '#fff' : '#666',
                  boxShadow: stage === s ? 'inset 0 0 0 1px #333' : 'none',
                }}>
                {s === 'arrest' ? 'Arrest' : 'Sentenced'}
              </button>
            ))}
          </div>

          {/* Case number */}
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#999', letterSpacing: '0.12em' }}>
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
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, padding: '4px 12px', textTransform: 'uppercase',
            letterSpacing: '0.15em', fontWeight: 700,
            background: sentBadgeColor === '#E8621A' ? '#fff3ee' : sentBadgeColor === '#FFAA00' ? '#fffbee' : '#eefff4',
            color: sentBadgeColor,
            border: `1px solid ${sentBadgeColor}`,
          }}>
            {stage === 'sentenced'
              ? (pct > 70 ? '⬛ Prison' : pct > 40 ? '⚫ Home Confinement' : '● Probation')
              : '◉ Arrest Stage'
            }
          </div>

          {result && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#666', textAlign: 'center' }}>
              Est. <span style={{ color: '#E8621A', fontWeight: 700 }}>{result.estimatedSentence} mo</span>
              {' · '}
              <span style={{ color: sentBadgeColor }}>{pct}% incarceration</span>
            </div>
          )}

          {/* Save + Reset */}
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 280 }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: 9 }} onClick={handleSave}>
              Save PNG
            </button>
            <button className="btn-secondary" style={{ flex: 1, fontSize: 9 }} onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT — Customizer + Accessories */}
        <div style={SCROLL_PANEL}>
          {/* Customize appearance */}
          <div style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>Customize Appearance</div>
            <AvatarCustomizer
              appearance={appearance}
              onChange={setAppearance}
              sex={profile.sex}
            />
          </div>

          {/* Manual accessory picker */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: 12 }}>
            <div className="section-label">Add Accessories</div>
            <AccessoryPicker active={manualAccs} onToggle={toggleManualAcc} />
          </div>

          {/* Auto-assigned summary */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: 10, marginTop: 4 }}>
            <div className="section-label">Auto-assigned ({stage})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {Object.entries(autoAccs)
                .filter(([, v]) => v)
                .map(([k]) => (
                  <span key={k} style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, padding: '2px 6px', border: '1px solid #ccc', color: '#666' }}>
                    {k.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ borderTop: '1px solid #ddd', paddingTop: 10, marginTop: 8 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 11, color: '#666', lineHeight: 1.6, fontStyle: 'italic' }}>
              Giving incarcerated people faces and clothing increases viewer empathy vs. statistics alone. (Goff et al., 2014)
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '8px 16px 32px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-primary" style={{ fontSize: 13, padding: '12px 40px' }} onClick={onProceed}>
          Proceed to Sentencing Simulator →
        </button>
      </div>
    </div>
  );
}
