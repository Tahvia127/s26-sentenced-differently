/**
 * AIAvatarPanel.jsx
 *
 * Three avatar modes with a pill-tab switcher:
 *
 *  ① Custom  — DiceBear SVG (free, instant, reflects every UI change live)
 *  ② AI Photo — Pre-generated PixelLab image (30 combos, no credits at runtime)
 *  ③ Pixel Art — Original CSS box-shadow sprite (fully detailed accessories)
 *
 * Default mode is ① so users immediately get a responsive, customizable avatar.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DiceBearAvatar from './DiceBearAvatar';
import PixelAvatar    from './PixelAvatar';
import { lookupAvatar } from '../data/generatedAvatars';
import { generateCharacter } from '../utils/pixellabApi';

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'32px 0', minWidth:192 }}>
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

// ── Mode tab button ────────────────────────────────────────────────────────────
function ModeTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 9, padding: '4px 10px', cursor: 'pointer',
      fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
      border: 'none', outline: 'none',
      background: active ? '#E8621A'       : 'transparent',
      color:      active ? '#FFF'          : '#555570',
      borderRadius: 4,
      transition: 'all 0.12s',
    }}>
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAvatarPanel({
  profile, appearance, outfit, accessories, stage,
}) {
  const [mode,     setMode]     = useState('custom'); // 'custom' | 'ai' | 'pixel'
  const [aiImage,  setAiImage]  = useState(null);     // on-demand generated image
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // Pre-generated image lookup (instant, no API call)
  const pregenB64 = lookupAvatar(profile.race, profile.sex, outfit, stage);

  // Reset on-demand image when profile changes significantly
  useEffect(() => {
    setAiImage(null);
    setError('');
  }, [profile.race, profile.sex, outfit, stage]);

  const handleGenerate = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const result = await generateCharacter(profile, outfit, stage, { forceRefresh });
      setAiImage(result.base64);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [profile, outfit, stage]);

  // ── Render active avatar ────────────────────────────────────────────────────
  function renderAvatar() {
    if (mode === 'custom') {
      return (
        <DiceBearAvatar
          profile={profile}
          appearance={appearance}
          outfit={outfit}
          stage={stage}
          accessories={accessories}
          size={192}
        />
      );
    }

    if (mode === 'ai') {
      const src = aiImage || pregenB64;
      if (loading) return <Spinner />;
      if (src) {
        return (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <img
              src={src}
              alt={`AI avatar: ${profile.race} ${profile.sex}`}
              style={{ width:192, height:192, imageRendering:'pixelated', borderRadius:8, border:'1px solid #2A2A3F' }}
            />
            <div style={{ fontSize:8, color:'#333350', fontFamily:'monospace' }}>
              {aiImage ? '✦ Custom generated' : `✦ Pre-generated · ${profile.race} ${profile.sex}`}
            </div>
          </div>
        );
      }
      // No pre-gen for this combo
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'20px 0', minWidth:192 }}>
          <div style={{ fontSize:10, color:'#555570', fontFamily:'monospace', textAlign:'center' }}>
            No pre-generated image<br />for this combo
          </div>
          <button onClick={() => handleGenerate(false)} style={smallBtn('#E8621A', 'rgba(232,98,26,0.12)')}>
            ✦ Generate (1 credit)
          </button>
        </div>
      );
    }

    if (mode === 'pixel') {
      return (
        <div style={{ imageRendering:'pixelated' }}>
          <PixelAvatar
            profile={profile}
            appearance={appearance}
            outfit={outfit}
            accessories={accessories}
            stage={stage}
          />
        </div>
      );
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>

      {/* ── Mode switcher pill ── */}
      <div style={{
        display:'flex', gap:2, background:'#0A0A14',
        border:'1px solid #1E1E2E', borderRadius:6, padding:3,
      }}>
        <ModeTab label="✦ Custom"    active={mode==='custom'} onClick={() => setMode('custom')} />
        <ModeTab label="AI Photo"    active={mode==='ai'}     onClick={() => setMode('ai')} />
        <ModeTab label="Pixel Art"   active={mode==='pixel'}  onClick={() => setMode('pixel')} />
      </div>

      {/* ── Avatar ── */}
      {renderAvatar()}

      {/* ── AI mode controls ── */}
      {mode === 'ai' && !loading && (
        <div style={{ display:'flex', gap:6 }}>
          {(aiImage || pregenB64) && (
            <button onClick={() => handleGenerate(true)} style={smallBtn('#555570', 'transparent')}>
              ↺ Regenerate
            </button>
          )}
          {!aiImage && !pregenB64 && null /* covered above */}
        </div>
      )}

      {/* ── Custom mode label ── */}
      {mode === 'custom' && (
        <div style={{ fontSize:8, color:'#2A2A3F', fontFamily:'monospace', textAlign:'center', lineHeight:1.5 }}>
          Updates live with every change ·{' '}
          <span style={{ color:'#44CC88' }}>free · no credits</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ fontSize:9, color:'#CC4444', fontFamily:'monospace', textAlign:'center', maxWidth:200 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

function smallBtn(color, bg) {
  return {
    fontSize:9, padding:'4px 10px', borderRadius:5, cursor:'pointer',
    background:bg, border:`1px solid ${color}55`,
    color, fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase',
  };
}
