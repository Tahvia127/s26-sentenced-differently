/**
 * AIAvatarPanel.jsx
 *
 * 1. Instantly shows the pre-generated PixelLab image for the selected
 *    race × sex × outfit-state combo (no API call, no wait).
 * 2. Falls back to the on-demand API button if the combo isn't pre-generated.
 * 3. Always renders the CSS pixel art below as a toggle alternative.
 */

import React, { useState, useEffect, useCallback } from 'react';
import PixelAvatar from './PixelAvatar';
import { lookupAvatar } from '../data/generatedAvatars';
import { generateCharacter } from '../utils/pixellabApi';

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'20px 0' }}>
      <div style={{
        width:24, height:24,
        border:'3px solid #1E1E2E', borderTop:'3px solid #E8621A',
        borderRadius:'50%', animation:'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize:9, color:'#666688', fontFamily:'monospace', letterSpacing:'0.1em' }}>
        Generating…
      </span>
    </div>
  );
}

// ── Image display ─────────────────────────────────────────────────────────────
function AvatarImage({ src, label, badge }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <img
        src={src}
        alt={label}
        style={{ width:192, height:192, imageRendering:'pixelated', borderRadius:4, border:'1px solid #2A2A3F' }}
      />
      {badge && (
        <div style={{
          fontSize:8, padding:'2px 8px', borderRadius:10,
          background:'rgba(232,98,26,0.1)', border:'1px solid rgba(232,98,26,0.25)',
          color:'#E8621A', fontFamily:'monospace', letterSpacing:'0.1em',
        }}>
          {badge}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAvatarPanel({ profile, appearance, outfit, accessories, stage }) {
  const [showPixelArt, setShowPixelArt] = useState(false);
  const [apiImage,     setApiImage]     = useState(null);   // on-demand fallback
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // Look up the pre-generated image every time profile / outfit / stage changes
  const pregenB64 = lookupAvatar(profile.race, profile.sex, outfit, stage);

  // Reset API image when profile changes (pre-gen takes priority again)
  useEffect(() => {
    setApiImage(null);
    setError('');
  }, [profile.race, profile.sex, outfit, stage]);

  const handleGenerate = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const result = await generateCharacter(profile, outfit, stage, { forceRefresh });
      setApiImage(result.base64);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [profile, outfit, stage]);

  // Active image: api override > pre-generated
  const activeImage = apiImage || pregenB64;
  const hasPregened = !!pregenB64;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>

      {/* ── Display area ── */}
      {showPixelArt ? (
        <div style={{ imageRendering:'pixelated' }}>
          <PixelAvatar profile={profile} appearance={appearance} outfit={outfit}
            accessories={accessories} stage={stage} />
        </div>
      ) : loading ? (
        <Spinner />
      ) : activeImage ? (
        <AvatarImage
          src={activeImage}
          label={`${profile.race} ${profile.sex} — ${stage}`}
          badge={apiImage ? '✦ Custom AI' : hasPregened ? '✦ AI' : null}
        />
      ) : (
        // No pre-gen and no api image yet — show pixel art by default
        <div style={{ imageRendering:'pixelated' }}>
          <PixelAvatar profile={profile} appearance={appearance} outfit={outfit}
            accessories={accessories} stage={stage} />
        </div>
      )}

      {/* ── Controls ── */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'center' }}>

        {/* Toggle pixel art / AI */}
        {!showPixelArt && activeImage && (
          <button onClick={() => setShowPixelArt(true)}
            style={btnStyle('#2A2A3F', '#666688')}>
            ⬡ Pixel Art
          </button>
        )}
        {showPixelArt && (
          <button onClick={() => setShowPixelArt(false)}
            style={btnStyle('rgba(232,98,26,0.3)', '#E8621A')}>
            ✦ AI Art
          </button>
        )}

        {/* On-demand regenerate (always available) */}
        {!loading && (
          <button
            onClick={() => { setShowPixelArt(false); handleGenerate(true); }}
            style={btnStyle('#1E1E2E', '#555570')}
            title="Generate a new AI image for this profile (uses 1 credit)"
          >
            ↺ {apiImage ? 'Regenerate' : hasPregened ? 'Custom Gen' : 'Generate AI'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize:9, color:'#CC4444', fontFamily:'monospace', textAlign:'center', maxWidth:200 }}>
          ⚠ {error}
        </div>
      )}

      {/* Caption */}
      {!showPixelArt && hasPregened && !apiImage && (
        <div style={{ fontSize:8, color:'#2A2A3F', fontFamily:'monospace', textAlign:'center' }}>
          Pre-generated · {profile.race} {profile.sex} · {stage === 'arrest' ? 'arrested' : outfit === 'jumpsuit' || outfit === 'khaki' ? 'prison' : 'probation'}
        </div>
      )}
    </div>
  );
}

function btnStyle(border, color) {
  return {
    fontSize:9, padding:'4px 10px', borderRadius:5, cursor:'pointer',
    background:'transparent', border:`1px solid ${border}`,
    color, fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase',
  };
}
