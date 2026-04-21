import React from 'react';
import { SKIN_TONES, HAIR_STYLES, SCALE } from './PixelAvatar';

// Mini 16×16 pixel previews for hair styles using box-shadow technique
const HAIR_PREVIEWS = {
  short_straight: [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],
    [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],
    [2,2],[13,2],[2,3],[13,3]],
  long_straight:  [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],
    [2,1],[13,1],[2,2],[13,2],[2,3],[13,3],[2,4],[13,4],[2,5],[13,5],
    [2,6],[13,6],[2,7],[13,7],[2,8],[13,8]],
  locs:  [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],
    [2,1],[13,1],[2,2],[5,2],[8,2],[11,2],[13,2],
    [2,3],[5,3],[8,3],[11,3],[13,3],[2,4],[5,4],[8,4],[11,4],[13,4],
    [2,5],[8,5],[13,5],[2,6],[8,6],[13,6],[2,7],[13,7]],
  afro:  [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],
    [0,1],[1,1],[14,1],[15,1],[0,2],[15,2],[0,3],[15,3],[1,4],[14,4]],
  buzzcut: [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],
    [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],
    [2,2],[13,2]],
  bald:  [[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],
    [2,1],[13,1],[2,2],[13,2]],
};

const HAIR_COLORS_PREVIEW = '#2C1810';
const HAIR_SCALE = 2;

function HairPreview({ styleId, selected }) {
  const pts = HAIR_PREVIEWS[styleId] || [];
  if (!pts.length) return <div style={{ width: 32, height: 32, background: '#333' }} />;

  const shadow = pts
    .map(([x, y]) => `${(x + 1) * HAIR_SCALE}px ${y * HAIR_SCALE}px 0 0 ${HAIR_COLORS_PREVIEW}`)
    .join(',');

  return (
    <div
      style={{
        position: 'relative',
        width: 32,
        height: 32,
        overflow: 'hidden',
        imageRendering: 'pixelated',
        background: selected ? '#E8621A22' : 'transparent',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: HAIR_SCALE,
          height: HAIR_SCALE,
          top: 0,
          left: -HAIR_SCALE,
          boxShadow: shadow,
        }}
      />
    </div>
  );
}

export default function AvatarCustomizer({ appearance, onChange }) {
  return (
    <div className="mt-2 space-y-3">
      <p className="text-xs text-gray-500 italic text-center">
        Appearance is yours to set — race selection gives a starting point only
      </p>

      {/* Skin tone row */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Skin Tone</p>
        <div className="flex gap-2 flex-wrap">
          {SKIN_TONES.map(tone => (
            <button
              key={tone.id}
              aria-label={`Skin tone: ${tone.label}`}
              onClick={() => onChange({ ...appearance, skinTone: tone.id, customized: true })}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: tone.hex,
                border: appearance.skinTone === tone.id
                  ? '2px solid #E8621A'
                  : '2px solid #444',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              title={tone.label}
            />
          ))}
        </div>
      </div>

      {/* Hair style row */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Hair Style</p>
        <div className="flex gap-2 flex-wrap">
          {HAIR_STYLES.map(style => (
            <button
              key={style.id}
              aria-label={`Hair style: ${style.label}`}
              onClick={() => onChange({ ...appearance, hairStyle: style.id, customized: true })}
              title={style.label}
              style={{
                border: appearance.hairStyle === style.id
                  ? '2px solid #E8621A'
                  : '2px solid #444',
                borderRadius: 4,
                background: '#1a1a2e',
                cursor: 'pointer',
                padding: 2,
                outline: 'none',
              }}
            >
              <HairPreview styleId={style.id} selected={appearance.hairStyle === style.id} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
