/**
 * AIAvatarPanel.jsx
 *
 * Wraps the pixel art avatar with an optional AI-generated overlay.
 * Shows a "Generate AI Avatar" button; on click, calls PixelLab API and
 * displays the returned image at 4× scale with image-rendering: pixelated.
 * User can toggle back to the CSS pixel art at any time.
 * Results are cached in localStorage for 24 h.
 */

import React, { useState, useCallback } from 'react';
import PixelAvatar from './PixelAvatar';
import { generateCharacter, buildCharacterDescription } from '../utils/pixellabApi';

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
      <div style={{
        width: 28, height: 28,
        border: '3px solid #1E1E2E',
        borderTop: '3px solid #E8621A',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 10, color: '#666688', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        Generating…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAvatarPanel({
  profile,
  appearance,
  outfit,
  accessories,
  stage,
}) {
  const [mode, setMode]       = useState('pixel');   // 'pixel' | 'loading' | 'ai' | 'error'
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = useCallback(async (forceRefresh = false) => {
    setMode('loading');
    setErrorMsg('');
    try {
      const result = await generateCharacter(profile, outfit, stage, { forceRefresh });
      setAiResult(result);
      setMode('ai');
    } catch (e) {
      setErrorMsg(e.message || 'Generation failed');
      setMode('error');
    }
  }, [profile, outfit, stage]);

  const desc = buildCharacterDescription(profile, outfit, stage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

      {/* ── Avatar display area ── */}
      <div style={{
        position: 'relative',
        minHeight: 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Pixel art — always rendered, hidden when AI mode is active */}
        <div style={{
          imageRendering: 'pixelated',
          opacity: mode === 'ai' ? 0 : 1,
          position: mode === 'ai' ? 'absolute' : 'relative',
          pointerEvents: mode === 'ai' ? 'none' : 'auto',
        }}>
          <PixelAvatar
            profile={profile}
            appearance={appearance}
            outfit={outfit}
            accessories={accessories}
            stage={stage}
          />
        </div>

        {/* Loading spinner */}
        {mode === 'loading' && <Spinner />}

        {/* AI image */}
        {mode === 'ai' && aiResult && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <img
              src={aiResult.base64}
              alt={`AI-generated pixel art: ${desc}`}
              style={{
                width: 192,
                height: 192,
                imageRendering: 'pixelated',
                borderRadius: 4,
                border: '1px solid #2A2A3F',
              }}
            />
            <div style={{ fontSize: 8, color: '#333350', fontFamily: 'monospace', textAlign: 'center', maxWidth: 200, lineHeight: 1.4 }}>
              {desc}
            </div>
          </div>
        )}

        {/* Error state */}
        {mode === 'error' && (
          <div style={{
            fontSize: 10, color: '#CC4444', fontFamily: 'monospace',
            textAlign: 'center', maxWidth: 200, padding: '12px 0', lineHeight: 1.6,
          }}>
            ⚠ {errorMsg}
            <br />
            <span style={{ color: '#666688', fontSize: 9 }}>Pixel art avatar shown below</span>
          </div>
        )}
      </div>

      {/* ── Control buttons ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Generate / switch to AI */}
        {mode !== 'ai' && mode !== 'loading' && (
          <button
            onClick={() => handleGenerate(false)}
            disabled={mode === 'loading'}
            style={{
              fontSize: 9, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(232,98,26,0.12)',
              border: '1px solid rgba(232,98,26,0.4)',
              color: '#E8621A',
              fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            ✦ Generate AI Avatar
          </button>
        )}

        {/* Switch back to pixel art */}
        {mode === 'ai' && (
          <>
            <button
              onClick={() => setMode('pixel')}
              style={{
                fontSize: 9, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                background: 'transparent',
                border: '1px solid #2A2A3F',
                color: '#666688',
                fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              ← Pixel Art
            </button>
            <button
              onClick={() => handleGenerate(true)}
              style={{
                fontSize: 9, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                background: 'transparent',
                border: '1px solid #333350',
                color: '#555570',
                fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              ↺ Regenerate
            </button>
          </>
        )}

        {/* After error — show pixel art button */}
        {mode === 'error' && (
          <button
            onClick={() => setMode('pixel')}
            style={{
              fontSize: 9, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent',
              border: '1px solid #2A2A3F',
              color: '#666688',
              fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            Show Pixel Art
          </button>
        )}
      </div>

      {/* Usage note */}
      {mode !== 'ai' && mode !== 'loading' && (
        <div style={{ fontSize: 8, color: '#2A2A3F', fontFamily: 'monospace', textAlign: 'center' }}>
          AI generation uses 1 credit · results cached 24 h
        </div>
      )}

      {/* Credit badge when AI result shown */}
      {mode === 'ai' && aiResult?.usage && (
        <div style={{ fontSize: 8, color: '#333350', fontFamily: 'monospace' }}>
          {aiResult.usage.remaining_generations ?? '?'} generations remaining this month
        </div>
      )}
    </div>
  );
}
