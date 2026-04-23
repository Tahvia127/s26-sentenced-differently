/**
 * DiceBearAvatar.jsx
 *
 * Fully customizable pixel-art avatar using the DiceBear API (free, no credits).
 * Every change to appearance or profile updates the image instantly — no API key,
 * no wait, no limit.
 *
 * API: https://api.dicebear.com/9.x/pixel-art/svg
 */

import React, { useMemo } from 'react';
import { SKIN_TONES, HAIR_COLORS } from './PixelAvatar';

// ── Skin tone: our IDs → DiceBear hex ────────────────────────────────────────
// DiceBear pixel-art skin palette (lightest → darkest):
// ffdbac  f5cfa0  eac393  e0b687  cb9e6e  b68655  a26d3d  8d5524
const SKIN_MAP = {
  s1: 'ffdbac',
  s2: 'f5cfa0',
  s3: 'e0b687',
  s4: 'b68655',
  s5: 'a26d3d',
  s6: '8d5524',
};

// ── Hair color: our IDs → closest DiceBear hex ───────────────────────────────
// DiceBear hair palette: cab188 603a14 83623b a78961 611c17 603015 612616 28150a 009bbd bd1700 91cb15
const HAIR_COLOR_MAP = {
  black:        '28150a',
  dark_brown:   '603a14',
  medium_brown: '83623b',
  blonde:       'cab188',
  red:          'bd1700',
  gray:         'cab188', // no true grey in DiceBear palette — use lightest
  dyed:         '009bbd',
};

// ── Hair style: our IDs → DiceBear short/long variant ────────────────────────
// DiceBear has short01–short24, long01–long21
const HAIR_STYLE_MAP = {
  short_straight: 'short01',
  buzzcut:        'short05',
  afro:           'short11',
  bald:           null,          // omit hair param → bald/no-hair seed
  locs:           'long07',
  long_straight:  'long01',
  ponytail:       'long10',
  space_buns:     'short19',
};

// ── Beard/facial hair: our IDs → DiceBear beard variant ─────────────────────
// DiceBear has variant01–variant08
const BEARD_MAP = {
  none:        null,
  stubble:     'variant01',
  beard_short: 'variant03',
  beard_full:  'variant06',
  mustache:    'variant02',
};

// ── Outfit → clothing style + color ──────────────────────────────────────────
// DiceBear clothing variants 01–23; colors are custom hex (API accepts any hex)
const OUTFIT_CLOTHING = {
  jumpsuit:  { style: 'variant01', color: 'F5900A' },   // orange
  khaki:     { style: 'variant07', color: 'C4A070' },   // tan/khaki
  suit:      { style: 'variant15', color: '1C2238' },   // navy
  civilian:  { style: 'variant04', color: '3A6EA5' },   // casual blue
  cargo:     { style: 'variant09', color: '556040' },   // olive cargo
  plain:     { style: 'variant02', color: '4A5060' },   // plain grey
};

// ── Stage → background tint ───────────────────────────────────────────────────
const STAGE_BG = {
  arrest:    '1A0A0A',   // dark red tint
  sentenced: '0A0A1A',   // dark blue tint
};

// ── URL builder ───────────────────────────────────────────────────────────────
function buildUrl(profile, appearance, outfit, stage, size) {
  const skin  = SKIN_MAP[appearance.skinTone] || 'e0b687';
  const hair  = HAIR_STYLE_MAP[appearance.hairStyle];
  const hCol  = HAIR_COLOR_MAP[appearance.hairColor] || '28150a';
  const beard = profile.sex === 'Male' ? BEARD_MAP[appearance.facialHair] : null;
  const cloth = OUTFIT_CLOTHING[outfit] || OUTFIT_CLOTHING.civilian;
  const bg    = STAGE_BG[stage] || '12121C';

  // Build query string manually so [] brackets aren't percent-encoded
  const parts = [
    `seed=${encodeURIComponent(`${profile.race}-${profile.sex}`)}`,
    `size=${size}`,
    `radius=0`,
    `backgroundColor[]=${bg}`,
    `skinColor[]=${skin}`,
    hair  ? `hair[]=${hair}`          : 'hair[]=',
    `hairColor[]=${hCol}`,
    `clothing[]=${cloth.style}`,
    `clothingColor[]=${cloth.color}`,
    beard ? `beard[]=${beard}`        : '',
    // Age-based eyes (older → more tired)
    profile.age > 45 ? 'eyes[]=variant08' : 'eyes[]=variant01',
    // Mood: arrested → sad, sentenced-free → neutral, sentenced-prison → sad
    stage === 'arrest' || outfit === 'jumpsuit'
      ? 'mouth[]=sad01'
      : 'mouth[]=happy01',
  ].filter(Boolean).join('&');

  return `https://api.dicebear.com/9.x/pixel-art/svg?${parts}`;
}

// ── Accessory badges drawn over the SVG ──────────────────────────────────────
// These are simple CSS overlays since DiceBear accessories are limited (only glasses)
function AccessoryBadges({ accessories, stage, outfit }) {
  const badges = [];

  if (stage === 'arrest') {
    badges.push({ label: '⛓ Cuffs',    color: '#888899', bg: 'rgba(136,136,153,0.12)' });
  }
  if (accessories?.idBadge) {
    badges.push({ label: '🪪 ID Badge', color: '#E8621A', bg: 'rgba(232,98,26,0.1)' });
  }
  if (accessories?.ankleMonitor) {
    badges.push({ label: '📡 Monitor',  color: '#FFAA00', bg: 'rgba(255,170,0,0.1)', blink: true });
  }
  if (accessories?.orangeWristband) {
    badges.push({ label: '🟠 Drug',     color: '#FF8000', bg: 'rgba(255,128,0,0.1)' });
  }
  if (accessories?.purpleWristband) {
    badges.push({ label: '🟣 SO',       color: '#9966CC', bg: 'rgba(153,102,204,0.1)' });
  }

  if (!badges.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 4 }}>
      {badges.map(b => (
        <span key={b.label} style={{
          fontSize: 8, padding: '2px 6px', borderRadius: 10,
          fontFamily: 'monospace', letterSpacing: '0.05em',
          color: b.color, background: b.bg,
          border: `1px solid ${b.color}44`,
          animation: b.blink ? 'blink 1.2s step-start infinite' : 'none',
        }}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DiceBearAvatar({
  profile,
  appearance,
  outfit,
  stage,
  accessories,
  size = 192,
}) {
  const url = useMemo(() =>
    buildUrl(profile, appearance, outfit, stage, size),
    // Re-build URL when any visual characteristic changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      profile.race, profile.sex, profile.age,
      appearance.skinTone, appearance.hairStyle, appearance.hairColor, appearance.facialHair,
      outfit, stage, size,
    ]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <img
        key={url}                          // force re-render on URL change
        src={url}
        alt={`${profile.race} ${profile.sex} pixel-art avatar`}
        width={size}
        height={size}
        style={{
          imageRendering: 'pixelated',
          borderRadius: 8,
          border: '1px solid #2A2A3F',
          background: '#12121C',
        }}
        onError={e => { e.currentTarget.style.opacity = '0.3'; }}
      />
      <AccessoryBadges accessories={accessories} stage={stage} outfit={outfit} />
    </div>
  );
}
