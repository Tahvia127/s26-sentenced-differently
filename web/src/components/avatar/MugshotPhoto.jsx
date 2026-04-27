/**
 * MugshotPhoto.jsx
 * AI-generated portrait via ShortAPI / GPT-Image-2.
 * Shows a spinner while generating, then displays the result.
 */

import React, { useState, useCallback } from 'react';
import { buildPortraitPrompt } from '../../utils/buildPortraitPrompt';
import { generatePortrait    } from '../../utils/generatePortrait';

function Spinner() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'40px 0' }}>
      <div style={{
        width:28, height:28,
        border:'3px solid #ccc', borderTop:'3px solid #E8621A',
        borderRadius:'50%', animation:'spin 0.8s linear infinite',
      }} />
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#666', letterSpacing:'0.15em' }}>
        GENERATING PORTRAIT…
      </span>
    </div>
  );
}

export default function MugshotPhoto({ profile, appearance, outfit, stage }) {
  const [imgSrc,  setImgSrc]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = buildPortraitPrompt(profile, appearance, outfit, stage);
      const result = await generatePortrait(prompt);
      const src = result.url ?? (result.base64 ? `data:image/png;base64,${result.base64}` : null);
      if (!src) throw new Error('No image returned');
      setImgSrc(src);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [profile, appearance, outfit, stage]);

  const containerStyle = {
    background: '#fff',
    border: '1px solid #333',
    boxShadow: '4px 4px 0 #333',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    width: 256,
  };

  return (
    <div style={containerStyle}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'0.2em', color:'#666', textTransform:'uppercase' }}>
        AI Portrait · GPT-Image-2
      </div>

      {loading ? (
        <Spinner />
      ) : imgSrc ? (
        <>
          <img
            src={imgSrc}
            alt="AI-generated portrait"
            style={{ width:232, height:232, objectFit:'cover', border:'1px solid #333', display:'block' }}
          />
          <button className="btn-secondary" style={{ fontSize:9 }} onClick={generate}>
            ↺ Regenerate
          </button>
        </>
      ) : (
        <>
          <div style={{
            width:232, height:160, background:'#F5F2EB',
            border:'1px dashed #999', display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:8,
          }}>
            <div style={{ fontSize:32, opacity:0.3 }}>◻</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#999', textAlign:'center', letterSpacing:'0.1em' }}>
              PORTRAIT PENDING
            </div>
          </div>
          <button className="btn-primary" onClick={generate}>
            ✦ Generate AI Portrait
          </button>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#999', textAlign:'center' }}>
            Uses ShortAPI credits · ~20s
          </div>
        </>
      )}

      {error && (
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'#CC3333', textAlign:'center', maxWidth:220 }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
