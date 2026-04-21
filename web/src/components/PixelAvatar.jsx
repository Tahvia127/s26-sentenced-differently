import React, { useMemo } from 'react';

// ── Constants ────────────────────────────────────────────────────────────────
export const SCALE = 8;
export const GRID_W = 32;
export const GRID_H = 52;

export const SKIN_TONES = [
  { id: 's1', hex: '#FDDBB4', label: 'Very light' },
  { id: 's2', hex: '#E8B88A', label: 'Light' },
  { id: 's3', hex: '#C68642', label: 'Medium' },
  { id: 's4', hex: '#8D5524', label: 'Medium-dark' },
  { id: 's5', hex: '#4A2912', label: 'Dark' },
  { id: 's6', hex: '#2C1A0E', label: 'Very dark' },
];

export const HAIR_STYLES = [
  { id: 'short_straight', label: 'Short straight' },
  { id: 'long_straight',  label: 'Long straight' },
  { id: 'locs',           label: 'Locs / dreads' },
  { id: 'afro',           label: 'Natural / afro' },
  { id: 'buzzcut',        label: 'Buzzcut' },
  { id: 'bald',           label: 'Bald' },
];

// Default appearance per race
export const RACE_DEFAULTS = {
  Black:    { skinTone: 's4', hairStyle: 'afro' },
  Hispanic: { skinTone: 's3', hairStyle: 'short_straight' },
  White:    { skinTone: 's1', hairStyle: 'short_straight' },
  Other:    { skinTone: 's3', hairStyle: 'locs' },
};

// ── Sprite pixel-array builder ────────────────────────────────────────────────
// Each sprite layer is defined as a 2D string array.
// Character → color:
//   '.' = transparent
//   'S' = skin (replaced at render)
//   'D' = skin-dark (slightly darker, for shading)
//   '0' = hair color (replaced at render)
//   'O' = orange (#E8621A)
//   'B' = dark blue/jeans (#2D4A7A)
//   'b' = mid blue (#3B6BAD)
//   'W' = white (#F0EDE8)
//   'w' = off-white (#D0CCC8)
//   'K' = near-black (#1A1A2E)
//   'k' = dark grey (#333355)
//   'G' = grey (#888899)
//   'g' = light grey (#BBBBC8)
//   'Y' = tan/khaki (#C4A882)
//   'R' = red (#CC3333)
//   'P' = pink (#F4A0B0)
//   'T' = teal/green (#2D8B5A)
//   'A' = ankle monitor grey (#9AABB0)
//   'M' = metal silver (#C0C8D0)
//   'F' = flesh/inner (#FFD0A0)

const COLOR_MAP = {
  'O': '#E8621A',
  'B': '#2D4A7A',
  'b': '#3B6BAD',
  'W': '#F0EDE8',
  'w': '#D0CCC8',
  'K': '#1A1A2E',
  'k': '#333355',
  'G': '#888899',
  'g': '#BBBBC8',
  'Y': '#C4A882',
  'R': '#CC3333',
  'P': '#F4A0B0',
  'T': '#2D8B5A',
  'A': '#9AABB0',
  'M': '#C0C8D0',
  'F': '#FFD0A0',
};

// ── Sprite definitions (32 cols × 52 rows, each row is a string of 32 chars) ─

// HEADS — shared for both sexes, hair applied separately
const HEAD_LAYER = [
/*00*/ '................................',
/*01*/ '................................',
/*02*/ '................................',
/*03*/ '............SSSSSSSS............',
/*04*/ '...........SSSSSSSSSS...........',
/*05*/ '..........SSSSSSSSSSSS..........',
/*06*/ '..........SSDSDSSSSDSD..........',
/*07*/ '..........SSSSSSSSSSSS..........',
/*08*/ '..........SSSSSSSSSSS...........',
/*09*/ '..........SSSSKKSSSSS...........',
/*10*/ '...........SSSSSSSS.............',
/*11*/ '............SSSSSS..............',
/*12*/ '............SSSSSS..............',
/*13*/ '............SSSSSS..............',
/*14*/ '................................',
];

// HAIR overlays (same indices as HEAD_LAYER rows 0–14)
const HAIR_LAYERS = {
  short_straight: [
/*00*/ '................................',
/*01*/ '............00000000............',
/*02*/ '...........0000000000...........',
/*03*/ '..........00OOOOOOOO00..........',
/*04*/ '..........0............0........',
/*05*/ '................................',
/*06*/ '................................',
/*07*/ '................................',
/*08*/ '................................',
/*09*/ '................................',
/*10*/ '................................',
/*11*/ '................................',
/*12*/ '................................',
/*13*/ '................................',
/*14*/ '................................',
  ],
  long_straight: [
/*00*/ '................................',
/*01*/ '............00000000............',
/*02*/ '...........0000000000...........',
/*03*/ '..........00OOOOOOOO00..........',
/*04*/ '..........0............0........',
/*05*/ '..........0............0........',
/*06*/ '..........0............0........',
/*07*/ '..........0............0........',
/*08*/ '..........0............0........',
/*09*/ '..........0............0........',
/*10*/ '..........0............0........',
/*11*/ '..........0............0........',
/*12*/ '..........0............0........',
/*13*/ '..........0............0........',
/*14*/ '................................',
  ],
  locs: [
/*00*/ '................................',
/*01*/ '...........000000000............',
/*02*/ '..........0000000000............',
/*03*/ '.........00OOOOOOOO0............',
/*04*/ '.........0.0.0.0.0.0............',
/*05*/ '.........0.0.0.0.0.0............',
/*06*/ '.........0.0.0...0.0............',
/*07*/ '.........0.0.....0.0............',
/*08*/ '.........0.......0.0............',
/*09*/ '.........0...........0..........',
/*10*/ '.........0.........0............',
/*11*/ '.........0.........0............',
/*12*/ '..........0.......0.............',
/*13*/ '................................',
/*14*/ '................................',
  ],
  afro: [
/*00*/ '..........000000000000..........',
/*01*/ '.........00000000000000.........',
/*02*/ '........000000000000000.........',
/*03*/ '........00OOOOOOOOOO000.........',
/*04*/ '........0............000........',
/*05*/ '........0.............0.........',
/*06*/ '................................',
/*07*/ '................................',
/*08*/ '................................',
/*09*/ '................................',
/*10*/ '................................',
/*11*/ '................................',
/*12*/ '................................',
/*13*/ '................................',
/*14*/ '................................',
  ],
  buzzcut: [
/*00*/ '................................',
/*01*/ '............0000000.............',
/*02*/ '...........000000000............',
/*03*/ '..........00OOOOOOOO0...........',
/*04*/ '..........0............0........',
/*05*/ '................................',
/*06*/ '................................',
/*07*/ '................................',
/*08*/ '................................',
/*09*/ '................................',
/*10*/ '................................',
/*11*/ '................................',
/*12*/ '................................',
/*13*/ '................................',
/*14*/ '................................',
  ],
  bald: [
/*00*/ '................................',
/*01*/ '................................',
/*02*/ '................................',
/*03*/ '................................',
/*04*/ '................................',
/*05*/ '................................',
/*06*/ '................................',
/*07*/ '................................',
/*08*/ '................................',
/*09*/ '................................',
/*10*/ '................................',
/*11*/ '................................',
/*12*/ '................................',
/*13*/ '................................',
/*14*/ '................................',
  ],
};

// CIVILIAN OUTFIT (hoodie + jeans) — rows 14–51
const CIVILIAN_BODY = [
/*14*/ '..........kkkkkkkkkk............', // neck/collar
/*15*/ '.........kGGGGGGGGGGk...........',
/*16*/ '........kGGGGGGGGGGGGk..........',
/*17*/ '........kGGGGGGGGGGGGk..........',
/*18*/ '.......kGGGGGGGGGGGGGGk.........',
/*19*/ '.......kGGGWGGGGGGWGGGk.........',
/*20*/ '.......kGGGWGGGGGGWGGGk.........',
/*21*/ '.......kGGGGGGGGGGGGGGk.........',
/*22*/ '........kGGGGGGGGGGGGk..........',
/*23*/ '.......kGGGGGGGGGGGGGGk.........',  // arms out
/*24*/ '.......kGGGGGGGGGGGGGGk.........',
/*25*/ '........kkkGGGGGGGGkkk..........',  // waist
/*26*/ '..........BBBBBkBBBB............',  // pants
/*27*/ '..........BBBBBkBBBB............',
/*28*/ '..........BBBBBkBBBB............',
/*29*/ '..........BBBBBkBBBB............',
/*30*/ '..........BBBBBkBBBB............',
/*31*/ '..........BBBBBkBBBB............',
/*32*/ '..........BBBBBkBBBB............',
/*33*/ '..........BBBBBkBBBB............',
/*34*/ '..........BBBBBkBBBB............',
/*35*/ '..........BBBBBkBBBB............',
/*36*/ '..........BBBBB.BBBBB...........',
/*37*/ '..........BBBBB.BBBBB...........',
/*38*/ '..........BBBBB.BBBBB...........',
/*39*/ '..........BBBBB.BBBBB...........',
/*40*/ '..........BBBBB.BBBBB...........',
/*41*/ '..........BBBBB.BBBBB...........',
/*42*/ '..........BBBBB.BBBBB...........',
/*43*/ '..........BBBBB.BBBBB...........',
/*44*/ '..........KKKKKkKKKKK...........',  // shoes
/*45*/ '..........KKKKKkKKKKK...........',
/*46*/ '..........KKKKK.KKKKK...........',
/*47*/ '................................',
/*48*/ '................................',
/*49*/ '................................',
/*50*/ '................................',
/*51*/ '................................',
];

// PRISON JUMPSUIT (orange) — rows 14–51
const JUMPSUIT_BODY = [
/*14*/ '..........SSSSSSSSS.............',  // neck
/*15*/ '.........SOOOOOOOOOS............',
/*16*/ '........SOOOOOOOOOOOS...........',
/*17*/ '........SOOOOOOOOOOOS...........',
/*18*/ '.......SOOOOOOOOOOOOOS..........',
/*19*/ '.......SOOOOOOOOOOOOOS..........',
/*20*/ '.......SOOOOOOOOOOOOOS..........',
/*21*/ '.......SOOOOOOOOOOOOOS..........',
/*22*/ '........SOwwOOOOOwwOS...........',  // ID badge area + zipper
/*23*/ '.......SOOOOwwwwOOOOOS..........',
/*24*/ '.......SOOOwOOOOwOOOOS..........',
/*25*/ '........SOOOOOOOOOOOs...........',
/*26*/ '..........OOOOkOOOO.............',
/*27*/ '..........OOOOkOOOO.............',
/*28*/ '..........OOOOkOOOO.............',
/*29*/ '..........OOOOkOOOO.............',
/*30*/ '..........OOOOkOOOO.............',
/*31*/ '..........OOOOkOOOO.............',
/*32*/ '..........OOOOkOOOO.............',
/*33*/ '..........OOOOkOOOO.............',
/*34*/ '..........OOOOkOOOO.............',
/*35*/ '..........OOOOkOOOO.............',
/*36*/ '..........OOOOO.OOOOO...........',
/*37*/ '..........OOOOO.OOOOO...........',
/*38*/ '..........OOOOO.OOOOO...........',
/*39*/ '..........OOOOO.OOOOO...........',
/*40*/ '..........OOOOO.OOOOO...........',
/*41*/ '..........OOOOO.OOOOO...........',
/*42*/ '..........OOOOO.OOOOO...........',
/*43*/ '..........OOOOO.OOOOO...........',
/*44*/ '..........KKKKKkKKKKK...........',
/*45*/ '..........KKKKKkKKKKK...........',
/*46*/ '..........KKKKK.KKKKK...........',
/*47*/ '................................',
/*48*/ '................................',
/*49*/ '................................',
/*50*/ '................................',
/*51*/ '................................',
];

// ACCESSORIES (overlays)
const HANDCUFFS_LAYER = [
/*14*/ '................................',
/*15*/ '................................',
/*16*/ '................................',
/*17*/ '................................',
/*18*/ '................................',
/*19*/ '................................',
/*20*/ '................................',
/*21*/ '................................',
/*22*/ 'MMMM.......................MMMM.',
/*23*/ 'MMMM.......................MMMM.',
/*24*/ '....MMMMMMMMMMMMMMMMMMMMMM......',
/*25*/ '................................',
];

const ANKLE_MONITOR_LAYER = [
/*43*/ '..........AAAAA..............',
/*44*/ '..........AAAAA..............',
/*45*/ '..........AAAAA..............',
];

const ID_BADGE_LAYER = [
/*20*/ '............wWWWw...............',
/*21*/ '............wKGKw...............',
/*22*/ '............wGGGw...............',
/*23*/ '............wwwww...............',
];

const BRIEFCASE_LAYER = [
/*36*/ '......................YYYYYYY....',
/*37*/ '......................YkkkkkY....',
/*38*/ '......................YkMMMkY....',
/*39*/ '......................YYYYYYY....',
];

const FOLDER_LAYER = [
/*36*/ '......................WWWWWW.....',
/*37*/ '......................WkWWWW.....',
/*38*/ '......................WWWWWW.....',
/*39*/ '......................WWWWWW.....',
];

// BACKGROUNDS — full 32×52 grids
const BACKGROUNDS = {
  default: buildBg([
    // Courthouse exterior — grey stone building
    { rows: [0, 10], color: '#87CEEB' },  // sky
    { rows: [10, 30], color: '#8899AA' }, // building
    { rows: [30, 52], color: '#556677' }, // steps
  ]),
  immigration: buildBg([
    { rows: [0, 18], color: '#A0C4E8' },  // sky
    { rows: [18, 30], color: '#D4A574' }, // desert ground
    { rows: [30, 52], color: '#C49060' }, // sand
  ]),
  drug: buildBg([
    { rows: [0, 20], color: '#1A1A2E' },  // night sky
    { rows: [20, 30], color: '#333350' }, // buildings
    { rows: [30, 52], color: '#222235' }, // street
  ]),
  fraud: buildBg([
    { rows: [0, 15], color: '#B8D4F0' },  // sky
    { rows: [15, 35], color: '#CCC0A8' }, // office building
    { rows: [35, 52], color: '#A09080' }, // sidewalk
  ]),
  robbery: buildBg([
    { rows: [0, 15], color: '#1A1A1A' },  // night
    { rows: [15, 35], color: '#2A2A3A' }, // alley walls
    { rows: [35, 52], color: '#1A1A25' }, // ground
  ]),
};

function buildBg(bands) {
  const rows = [];
  for (let r = 0; r < 52; r++) {
    let color = '#888888';
    for (const band of bands) {
      if (r >= band.rows[0] && r < band.rows[1]) { color = band.color; break; }
    }
    rows.push(Array(32).fill(color));
  }
  return rows;
}

// ── Sprite → pixel array ─────────────────────────────────────────────────────
function spriteToPixels(rows, skinHex, hairHex, startRow = 0) {
  const pixels = [];
  rows.forEach((rowStr, ri) => {
    const y = startRow + ri;
    for (let x = 0; x < rowStr.length && x < 32; x++) {
      const ch = rowStr[x];
      if (ch === '.') continue;
      let color;
      if (ch === 'S') color = skinHex;
      else if (ch === 'D') color = darken(skinHex, 0.15);
      else if (ch === '0') color = hairHex || '#1A1A2E';
      else color = COLOR_MAP[ch] || '#FF00FF'; // magenta = missing
      pixels.push([x, y, color]);
    }
  });
  return pixels;
}

function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((n >> 8)  & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round(( n        & 0xff) * (1 - amount)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Box-shadow renderer ───────────────────────────────────────────────────────
function buildBoxShadow(pixels, scale) {
  if (!pixels.length) return 'none';
  return pixels
    .map(([x, y, color]) => `${(x + 1) * scale}px ${y * scale}px 0 0 ${color}`)
    .join(',');
}

// ── Background renderer ────────────────────────────────────────────────────────
function PixelBg({ bgGrid, scale }) {
  // Compress runs of same color into rectangles via box-shadow
  const pixels = [];
  bgGrid.forEach((row, y) => {
    row.forEach((color, x) => {
      pixels.push([x, y, color]);
    });
  });
  const shadow = buildBoxShadow(pixels, scale);
  return (
    <div
      style={{
        position: 'absolute',
        width: scale,
        height: scale,
        top: 0,
        left: -scale,
        boxShadow: shadow,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Single sprite layer ───────────────────────────────────────────────────────
function PixelLayer({ pixels, scale, zIndex = 1 }) {
  const shadow = buildBoxShadow(pixels, scale);
  if (shadow === 'none') return null;
  return (
    <div
      style={{
        position: 'absolute',
        width: scale,
        height: scale,
        top: 0,
        left: -scale,
        boxShadow: shadow,
        zIndex,
        pointerEvents: 'none',
      }}
    />
  );
}

// Hair color per style
const HAIR_COLORS = {
  short_straight: '#2C1810',
  long_straight:  '#1A1208',
  locs:           '#3A2010',
  afro:           '#1A1208',
  buzzcut:        '#2C1810',
  bald:           null,
};

// ── Main PixelAvatar ──────────────────────────────────────────────────────────
export default function PixelAvatar({ profile, appearance, outfit, accessories }) {
  const scale = SCALE;
  const W = GRID_W * scale;
  const H = GRID_H * scale;

  const skinHex = appearance.skinTone
    ? SKIN_TONES.find(s => s.id === appearance.skinTone)?.hex || '#C68642'
    : '#C68642';
  const hairStyle = appearance.hairStyle || 'short_straight';
  const hairHex = HAIR_COLORS[hairStyle];

  const bgKey = {
    immigration: 'immigration', immigration_entry: 'immigration',
    immigration_reentry: 'immigration',
    drug: 'drug', firearms: 'robbery', robbery: 'robbery',
    fraud: 'fraud',
  }[profile.offense] || 'default';
  const bgGrid = BACKGROUNDS[bgKey] || BACKGROUNDS.default;

  // Assemble layers
  const layers = useMemo(() => {
    const l = [];
    // Head
    l.push(...spriteToPixels(HEAD_LAYER, skinHex, hairHex, 0));
    // Hair
    const hairRows = HAIR_LAYERS[hairStyle] || HAIR_LAYERS.bald;
    l.push(...spriteToPixels(hairRows, skinHex, hairHex, 0));
    // Body
    const bodyRows = outfit === 'jumpsuit' ? JUMPSUIT_BODY : CIVILIAN_BODY;
    l.push(...spriteToPixels(bodyRows, skinHex, hairHex, 0));
    // Accessories
    if (accessories.handcuffs) {
      l.push(...spriteToPixels(HANDCUFFS_LAYER, skinHex, hairHex, 0));
    }
    if (accessories.ankleMonitor) {
      l.push(...spriteToPixels(ANKLE_MONITOR_LAYER, skinHex, hairHex, 0));
    }
    if (accessories.idBadge) {
      l.push(...spriteToPixels(ID_BADGE_LAYER, skinHex, hairHex, 0));
    }
    if (accessories.briefcase) {
      l.push(...spriteToPixels(BRIEFCASE_LAYER, skinHex, hairHex, 0));
    }
    if (accessories.folder) {
      l.push(...spriteToPixels(FOLDER_LAYER, skinHex, hairHex, 0));
    }
    return l;
  }, [skinHex, hairHex, hairStyle, outfit, accessories]);

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        imageRendering: 'pixelated',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <PixelBg bgGrid={bgGrid} scale={scale} />

      {/* Character */}
      <PixelLayer pixels={layers} scale={scale} zIndex={2} />

      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.08) 8px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}
