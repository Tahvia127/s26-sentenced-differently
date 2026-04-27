import React from 'react';
import { SKIN_TONES, HAIR_STYLES, HAIR_COLORS, FACIAL_HAIR, BUILDS } from './PixelAvatar';

// Tiny pixel preview for hair styles (16×16 at 2px scale)
const HAIR_PREVIEW_PTS = {
  short_straight: [[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[2,2],[13,2],[2,3],[13,3]],
  long_straight:  [[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[2,2],[13,2],[2,3],[13,3],[2,4],[13,4],[2,5],[13,5],[2,6],[13,6],[2,7],[13,7],[2,8],[13,8]],
  locs:           [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[2,1],[13,1],[2,2],[5,2],[8,2],[11,2],[13,2],[2,3],[5,3],[8,3],[11,3],[2,4],[8,4],[2,5],[8,5]],
  afro:           [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[0,1],[15,1],[0,2],[15,2],[0,3],[15,3],[1,4],[14,4]],
  buzzcut:        [[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[2,2],[13,2]],
  bald:           [[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[2,3],[13,3]],
  ponytail:       [[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[2,2],[13,2],[2,3],[13,3],[14,4],[14,5],[14,6],[13,7],[13,8]],
  space_buns:     [[1,0],[2,0],[14,0],[15,0],[1,1],[2,1],[14,1],[15,1],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2]],
};

function HairPreview({ styleId, selected, hairHex }) {
  const pts = HAIR_PREVIEW_PTS[styleId] || [];
  const S = 2;
  const shadow = pts.map(([x, y]) => `${(x+1)*S}px ${y*S}px 0 0 ${hairHex}`).join(',');
  return (
    <div style={{ position:'relative', width:32, height:22, overflow:'hidden', imageRendering:'pixelated',
      background: selected ? 'rgba(232,98,26,0.15)' : 'transparent', borderRadius:3 }}>
      <div style={{ position:'absolute', width:S, height:S, top:0, left:-S, boxShadow:shadow }} />
    </div>
  );
}

function Label({ children }) {
  return (
    <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#555', marginBottom:6 }}>
      {children}
    </p>
  );
}

export default function AvatarCustomizer({ appearance, onChange, sex }) {
  const currentHairHex = HAIR_COLORS.find(c => c.id === (appearance.hairColor || 'black'))?.hex || '#1A1208';

  const set = (key, val) => onChange({ ...appearance, [key]: val, customized: true });

  return (
    <div style={{ fontSize:11, color:'#AAAACC' }}>
      <p style={{ fontSize:9, color:'#555', fontStyle:'italic', textAlign:'center', marginBottom:8 }}>
        Appearance is yours to set — race gives a starting point only
      </p>

      {/* Skin tone */}
      <div style={{ marginBottom:10 }}>
        <Label>Skin Tone</Label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {SKIN_TONES.map(t => (
            <button key={t.id}
              aria-label={`Skin tone: ${t.label}`}
              title={t.label}
              onClick={() => set('skinTone', t.id)}
              style={{ width:22, height:22, borderRadius:'50%', background:t.hex, border:`2px solid ${appearance.skinTone===t.id?'#E8621A':'#ddd'}`, cursor:'pointer', outline:'none' }}
            />
          ))}
        </div>
      </div>

      {/* Hair style */}
      <div style={{ marginBottom:10 }}>
        <Label>Hair Style</Label>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {HAIR_STYLES
            .filter(s => sex === 'Female' || !['ponytail','space_buns'].includes(s.id))
            .concat(sex === 'Female' ? [] : [])
            .map(style => (
              <button key={style.id}
                aria-label={`Hair style: ${style.label}`}
                title={style.label}
                onClick={() => set('hairStyle', style.id)}
                style={{ border:`2px solid ${appearance.hairStyle===style.id?'#E8621A':'#ddd'}`, background:'#F5F2EB', padding:2, borderRadius:4, cursor:'pointer', outline:'none' }}
              >
                <HairPreview styleId={style.id} selected={appearance.hairStyle===style.id} hairHex={currentHairHex} />
              </button>
            ))}
          {/* Also show female-only styles if female */}
          {sex === 'Female' && ['ponytail','space_buns'].map(sid => {
            const style = HAIR_STYLES.find(s => s.id === sid);
            if (!style) return null;
            return (
              <button key={style.id}
                aria-label={`Hair style: ${style.label}`}
                title={style.label}
                onClick={() => set('hairStyle', style.id)}
                style={{ border:`2px solid ${appearance.hairStyle===style.id?'#E8621A':'#ddd'}`, background:'#F5F2EB', padding:2, borderRadius:4, cursor:'pointer', outline:'none' }}
              >
                <HairPreview styleId={style.id} selected={appearance.hairStyle===style.id} hairHex={currentHairHex} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair color */}
      <div style={{ marginBottom:10 }}>
        <Label>Hair Color</Label>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {HAIR_COLORS.map(c => (
            <button key={c.id}
              aria-label={`Hair color: ${c.label}`}
              title={c.label}
              onClick={() => set('hairColor', c.id)}
              style={{ width:22, height:22, borderRadius:4, background:c.hex, border:`2px solid ${appearance.hairColor===c.id?'#E8621A':'#ddd'}`, cursor:'pointer', outline:'none' }}
            />
          ))}
        </div>
      </div>

      {/* Facial hair (male only) */}
      {sex === 'Male' && (
        <div style={{ marginBottom:10 }}>
          <Label>Facial Hair</Label>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {FACIAL_HAIR.map(f => (
              <button key={f.id}
                onClick={() => set('facialHair', f.id)}
                style={{
                  fontSize:9, padding:'3px 6px', borderRadius:3, cursor:'pointer', outline:'none',
                  background: appearance.facialHair===f.id ? 'rgba(232,98,26,0.15)' : '#F5F2EB',
                  border:`1px solid ${appearance.facialHair===f.id?'#E8621A':'#ddd'}`,
                  color: appearance.facialHair===f.id ? '#E8621A' : '#888',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Build */}
      <div>
        <Label>Build</Label>
        <div style={{ display:'flex', gap:4 }}>
          {BUILDS.map(b => (
            <button key={b.id}
              onClick={() => set('build', b.id)}
              style={{
                fontSize:9, padding:'3px 8px', borderRadius:3, cursor:'pointer', outline:'none',
                background: appearance.build===b.id ? 'rgba(232,98,26,0.15)' : '#F5F2EB',
                border:`1px solid ${appearance.build===b.id?'#E8621A':'#ddd'}`,
                color: appearance.build===b.id ? '#E8621A' : '#888',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
