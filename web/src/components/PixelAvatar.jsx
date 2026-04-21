// ============================================================
// PixelAvatar.jsx — CSS box-shadow pixel art avatar engine
//
// This avatar system is designed to humanize, not caricature.
// Every visual choice should reinforce the dignity of the
// person being represented.
// See: Goff et al. (2014) on dehumanization and criminal
// justice outcomes.
// ============================================================

import React, { useMemo } from 'react';

export const SCALE   = 8;
export const GRID_W  = 32;
export const GRID_H  = 52;

// ── Appearance options ────────────────────────────────────────────────────────
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
  { id: 'ponytail',       label: 'Ponytail' },
  { id: 'space_buns',     label: 'Space buns' },
];

export const HAIR_COLORS = [
  { id: 'black',       hex: '#1A1208', label: 'Black' },
  { id: 'dark_brown',  hex: '#3B2410', label: 'Dark brown' },
  { id: 'medium_brown',hex: '#7B4A20', label: 'Medium brown' },
  { id: 'blonde',      hex: '#D4A840', label: 'Blonde' },
  { id: 'red',         hex: '#9A3018', label: 'Red' },
  { id: 'gray',        hex: '#8A8A8A', label: 'Gray / white' },
  { id: 'dyed',        hex: '#3A80CC', label: 'Dyed (bright)' },
];

export const FACIAL_HAIR = [
  { id: 'none',        label: 'None' },
  { id: 'stubble',     label: 'Stubble' },
  { id: 'beard_short', label: 'Short beard' },
  { id: 'beard_full',  label: 'Full beard' },
  { id: 'mustache',    label: 'Mustache' },
];

export const BUILDS = [
  { id: 'slim',    label: 'Slim' },
  { id: 'average', label: 'Average' },
  { id: 'stocky',  label: 'Stocky' },
];

export const RACE_DEFAULTS = {
  'Black':    { skinTone: 's4', hairStyle: 'afro',          hairColor: 'black' },
  'Hispanic': { skinTone: 's3', hairStyle: 'short_straight', hairColor: 'dark_brown' },
  'White':    { skinTone: 's1', hairStyle: 'short_straight', hairColor: 'medium_brown' },
  'Other':    { skinTone: 's3', hairStyle: 'locs',           hairColor: 'dark_brown' },
  'Asian':    { skinTone: 's2', hairStyle: 'short_straight', hairColor: 'black' },
  'Native':   { skinTone: 's3', hairStyle: 'long_straight',  hairColor: 'black' },
};

// ── Color map ────────────────────────────────────────────────────────────────
// S = skin (dynamic), D = skin-dark, 0 = hair (dynamic)
const CM = {
  // Outlines / base
  'K': '#151520', 'k': '#252535',
  // Gray tones
  'G': '#484858', 'g': '#6A6A7A',
  // Hoodie / civilian
  'H': '#3A3A4E', 'h': '#4A4A5E',
  // Jogger
  'J': '#2A2A3C', 'j': '#3D3D50',
  // Suit navy
  'N': '#1C2238', 'n': '#2C3248',
  // White shirt
  'Z': '#F0EDE8', 'z': '#D8D5D0',
  // Tie red
  'U': '#BB1111',
  // Jeans
  'B': '#2D4A7A', 'b': '#3B6BAD',
  // Sneakers
  'W': '#E8E8E8', 'w': '#C8C8C8',
  // Cargo / olive
  'C': '#556040', 'c': '#657050',
  // Khaki / camp
  'T': '#C4A070', 't': '#D4B080',
  // Brown boots
  'I': '#5C3017', 'i': '#7A4820',
  // Orange jumpsuit
  'O': '#E8621A', 'o': '#F8722A',
  // Metal / cuffs
  'M': '#B0B8C0', 'm': '#8090A0',
  // Ankle monitor
  'A': '#708090', 'a': '#90A0B0',
  // Wristbands
  'V': '#7B00CC', 'v': '#9B20DC',  // purple
  'X': '#FF8000', 'x': '#FF9F20',  // orange drug
  // Work vest
  'E': '#FFCC20', 'e': '#FFE040',
  // Misc
  'R': '#CC3333', 'P': '#F4A0B0',
  'F': '#FFD0A0',
  'Y': '#D4B060', 'y': '#E4C070',
  // Plain tee colors
  'L': '#4A5060', 'l': '#5A6070',
};

function resolveColor(ch, skinHex, hairHex) {
  if (ch === 'S') return skinHex;
  if (ch === 'D') return darken(skinHex, 0.18);
  if (ch === '0') return hairHex;
  if (ch === '1') return lighten(hairHex, 0.2); // hair highlight
  return CM[ch] || null;
}

function darken(hex, amt) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, Math.round(((n>>16)&0xff)*(1-amt)));
  const g = Math.max(0, Math.round(((n>>8)&0xff)*(1-amt)));
  const b = Math.max(0, Math.round((n&0xff)*(1-amt)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
function lighten(hex, amt) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.round(((n>>16)&0xff)+(255-((n>>16)&0xff))*amt));
  const g = Math.min(255, Math.round(((n>>8)&0xff)+(255-((n>>8)&0xff))*amt));
  const b = Math.min(255, Math.round((n&0xff)+(255-(n&0xff))*amt));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Sprite → pixel array ──────────────────────────────────────────────────────
function spriteToPixels(rows, skinHex, hairHex, startRow = 0, xOffset = 0) {
  const pixels = [];
  rows.forEach((rowStr, ri) => {
    const y = startRow + ri;
    for (let xi = 0; xi < rowStr.length && xi < GRID_W; xi++) {
      const ch = rowStr[xi];
      if (ch === '.') continue;
      const color = resolveColor(ch, skinHex, hairHex);
      if (color) pixels.push([xi + xOffset, y, color]);
    }
  });
  return pixels;
}

// ── HEAD (shared, male/female same base; age-tinged via hairHex) ──────────────
const HEAD = [
  '................................', //  0
  '................................', //  1
  '................................', //  2
  '............SSSSSSSS............', //  3
  '...........SSSSSSSSSS...........', //  4
  '..........SSSSSSSSSSSS..........', //  5
  '..........SSDSD.SSDSD...........', //  6 eyes
  '..........SSSSSSSSSSSS..........', //  7
  '..........SSSSSSSSSSSS..........', //  8
  '...........SSSK.KSSS............', //  9 mouth (K=dark line)
  '...........SSSSSSSSSS...........', // 10
  '............SSSSSSSS............', // 11
  '............SSSSSSSS............', // 12
  '............SSSSSSSS............', // 13 neck
  '................................', // 14
];

// Older face (age 46+) — same but 'D' replaces some S (adds shadow)
const HEAD_OLDER = [
  '................................',
  '................................',
  '................................',
  '............SSSSSSSS............',
  '...........SSSSSSSSSS...........',
  '..........SDSSSSSSSSDS..........',
  '..........SSDSD.SSDSD...........',
  '..........SSSSSSSSSSSS..........',
  '..........SDSSSSSSSSDS..........',
  '...........SSSK.KSSSS...........',
  '...........SSSSSSSSSS...........',
  '............SSSSSSSS............',
  '............SSSSSSSS............',
  '............SSSSSSSS............',
  '................................',
];

// ── HAIR overlays (rows 0–14) ─────────────────────────────────────────────────
const HAIR = {
  short_straight: [
    '................................',
    '............00000000............',
    '...........0000000000...........',
    '..........000000000000..........',
    '..........0............0........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  long_straight: [
    '................................',
    '............00000000............',
    '...........0000000000...........',
    '..........000000000000..........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '..........0............0........',
    '................................',
  ],
  locs: [
    '................................',
    '...........000000000............',
    '..........00000000000...........',
    '.........000000000000...........',
    '.........0.0.0.0.0.0............',
    '.........0.0.0.0.0.0............',
    '.........0.0.0...0.0............',
    '.........0.0.....0.0............',
    '.........0.......0.0............',
    '.........0.........0............',
    '.........0.........0............',
    '.........0.........0............',
    '..........0.......0.............',
    '................................',
    '................................',
  ],
  afro: [
    '..........000000000000..........',
    '.........0000000000000..........',
    '........00000000000000..........',
    '........00000000000000..........',
    '........0............00.........',
    '........0..............0........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  buzzcut: [
    '................................',
    '............0000000.............',
    '...........000000000............',
    '..........00000000000...........',
    '..........0............0........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
  bald: Array(15).fill('................................'),
  ponytail: [
    '................................',
    '............00000000............',
    '...........0000000000...........',
    '..........000000000000..........',
    '..........0............0........',
    '..........0............0........',
    '..........0...........000.......',
    '..........0..........0..0.......',
    '..........0.........0...0.......',
    '..........0........0....0.......',
    '....................0...0........',
    '....................00.0.........',
    '.....................000.........',
    '................................',
    '................................',
  ],
  space_buns: [
    '........00..........00..........',
    '.......0000........0000.........',
    '........00..0000....00..........',
    '...........000000000000.........',
    '..........0............0........',
    '..........0............0........',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
    '................................',
  ],
};

// ── FACIAL HAIR overlays (applied over head, rows 8–14) ──────────────────────
const FACIAL_HAIR_OVERLAYS = {
  none:        Array(7).fill('................................'),
  stubble: [
    '................................', // row 8
    '................................', // row 9
    '..........0.0.0.0.0.0...........',
    '..........0.0.0.0.0.0...........',
    '..........0.0.0.0.0.0...........',
    '................................',
    '................................',
  ],
  beard_short: [
    '................................',
    '................................',
    '..........0000000000............',
    '..........0000000000............',
    '..........0000000000............',
    '..........0000000000............',
    '................................',
  ],
  beard_full: [
    '................................',
    '..........0000000000............',
    '..........0000000000............',
    '..........0000000000............',
    '..........0000000000............',
    '...........00000000.............',
    '............000000..............',
  ],
  mustache: [
    '................................',
    '................................',
    '................................',
    '..........000000000.............',
    '..........000000000.............',
    '................................',
    '................................',
  ],
};

// ── MALE OUTFITS (rows 14–51, 38 rows) ───────────────────────────────────────

const MALE_HOODIE_JOGGERS = [
  '..........kkkkkkkkkk............', //14 collar
  '.........kHHHHHHHHHHk...........',//15
  '........kHHHHHHHHHHHHk..........',//16
  '........kHHHHHHHHHHHHk..........',//17
  '.......kHHHHHHHHHHHHHHk.........',//18
  '.......kHHHHHHHHHHHHHHk.........',//19
  '.......kHHHHHHHHHHHHHHk.........',//20
  '.......kHHHHHHHHHHHHHHk.........',//21
  '........kHHHHHHHHHHHHk..........',//22
  '.......kHHHHHHHHHHHHHHk.........',//23
  '.......kHHHHHHHHHHHHHHk.........',//24
  '........kkkHHHHHHHHkkk..........',//25 waist/pocket
  '..........JJJJJkJJJJJ...........',//26 joggers
  '..........JJJJJkJJJJJ...........',//27
  '..........JJJJJkJJJJJ...........',//28
  '..........JJJJJkJJJJJ...........',//29
  '..........JJJJJkJJJJJ...........',//30
  '..........JJJJJkJJJJJ...........',//31
  '..........JJJJJkJJJJJ...........',//32
  '..........JJJJJkJJJJJ...........',//33
  '..........JJJJJkJJJJJ...........',//34
  '..........JJJJJkJJJJJ...........',//35
  '..........JJJJJ.JJJJJ...........',//36
  '..........JJJJJ.JJJJJ...........',//37
  '..........JJJJJ.JJJJJ...........',//38
  '..........JJJJJ.JJJJJ...........',//39
  '..........JJJJJ.JJJJJ...........',//40
  '..........JJJJJ.JJJJJ...........',//41
  '..........JJJJJ.JJJJJ...........',//42
  '..........JJJJJ.JJJJJ...........',//43
  '.........wJJJJJ.JJJJJw..........',//44 sneaker sole
  '.........WWWWWW.WWWWWW..........',//45 white sneaker
  '.........WWWWWW.WWWWWW..........',//46
  '................................',
  '................................',
  '................................',
];

const MALE_SUIT = [
  '..........nZZZZZZZZn............',//14
  '.........nNZZZZZZZZNn...........',//15
  '........nNNZZZUZZZNNn...........',//16
  '........NNNNNUUNNNNNNn..........',//17
  '.......NNNNNNUNNNNNNNNn.........',//18
  '.......NNNNNNUNNNNNNNNn.........',//19
  '.......NNNNNNNNNNNNNNNn.........',//20
  '.......NNNNNNNNNNNNNNNn.........',//21
  '........NNNNNNNNNNNNNNn.........',//22
  '.......NNNNNNNNNNNNNNNNn........',//23
  '.......NNNNNNNNNNNNNNNNn........',//24
  '........nnnNNNNNNNNnnn..........',//25
  '..........NNNNNnNNNNN...........',//26
  '..........NNNNNnNNNNN...........',//27
  '..........NNNNNnNNNNN...........',//28
  '..........NNNNNnNNNNN...........',//29
  '..........NNNNNnNNNNN...........',//30
  '..........NNNNNnNNNNN...........',//31
  '..........NNNNNnNNNNN...........',//32
  '..........NNNNNnNNNNN...........',//33
  '..........NNNNNnNNNNN...........',//34
  '..........NNNNNnNNNNN...........',//35
  '..........NNNNN.NNNNN...........',//36
  '..........NNNNN.NNNNN...........',//37
  '..........NNNNN.NNNNN...........',//38
  '..........NNNNN.NNNNN...........',//39
  '..........NNNNN.NNNNN...........',//40
  '..........NNNNN.NNNNN...........',//41
  '..........NNNNN.NNNNN...........',//42
  '..........NNNNN.NNNNN...........',//43
  '..........KKKKKkKKKKK...........',//44
  '.........KKKKKKkKKKKKK..........',//45
  '..........KKKKK.KKKKK...........',//46
  '................................',
  '................................',
  '................................',
];

const MALE_CARGO_TEE = [
  '..........SSSSSSSSSS............',//14
  '.........kLLLLLLLLLLk...........',//15
  '........kLLLLLLLLLLLLk..........',//16
  '........kLLLLLLLLLLLLk..........',//17
  '.......kLLLLLLLLLLLLLLk.........',//18
  '.......kLLLLLLLLLLLLLLk.........',//19
  '.......kLLLLLLLLLLLLLLk.........',//20
  '.......kLLLLLLLLLLLLLLk.........',//21
  '........kLLLLLLLLLLLLk..........',//22
  '.......kLLLLLLLLLLLLLLk.........',//23
  '.......kLLLLLLLLLLLLLLk.........',//24
  '..........CCCCCkCCCCC...........',//25 cargo waistband
  '..........CCCCCkCCCCC...........',//26
  '..........cCCCCkCCCCc...........',//27 pocket hint
  '..........CCCCCkCCCCC...........',//28
  '..........CCCCCkCCCCC...........',//29
  '..........CCCCCkCCCCC...........',//30
  '..........CCCCCkCCCCC...........',//31
  '..........CCCCCkCCCCC...........',//32
  '..........CCCCCkCCCCC...........',//33
  '..........CCCCCkCCCCC...........',//34
  '..........CCCCCkCCCCC...........',//35
  '..........CCCCC.CCCCC...........',//36
  '..........CCCCC.CCCCC...........',//37
  '..........CCCCC.CCCCC...........',//38
  '..........CCCCC.CCCCC...........',//39
  '..........CCCCC.CCCCC...........',//40
  '..........CCCCC.CCCCC...........',//41
  '..........CCCCC.CCCCC...........',//42
  '..........CCCCC.CCCCC...........',//43
  '..........IIIIIkIIIII...........',//44 boots
  '.........IIIIIIkIIIIII..........',//45
  '..........IIIII.IIIII...........',//46
  '................................',
  '................................',
  '................................',
];

const MALE_PLAIN_SHIRT = [
  '..........SSSSSSSSSS............',//14
  '.........kllllllllllk...........',//15
  '........kllllllllllllk..........',//16
  '........kllllllllllllk..........',//17
  '.......kllllllllllllllk.........',//18
  '.......kllllllllllllllk.........',//19
  '.......kllllllllllllllk.........',//20
  '.......kllllllllllllllk.........',//21
  '........kllllllllllllk..........',//22
  '.......kllllllllllllllk.........',//23
  '.......kllllllllllllllk.........',//24
  '........kkkllllllllkkk..........',//25
  '..........BBBBBkBBBBB...........',//26
  '..........BBBBBkBBBBB...........',//27
  '..........BBBBBkBBBBB...........',//28
  '..........BBBBBkBBBBB...........',//29
  '..........BBBBBkBBBBB...........',//30
  '..........BBBBBkBBBBB...........',//31
  '..........BBBBBkBBBBB...........',//32
  '..........BBBBBkBBBBB...........',//33
  '..........BBBBBkBBBBB...........',//34
  '..........BBBBBkBBBBB...........',//35
  '..........BBBBB.BBBBB...........',//36
  '..........BBBBB.BBBBB...........',//37
  '..........BBBBB.BBBBB...........',//38
  '..........BBBBB.BBBBB...........',//39
  '..........BBBBB.BBBBB...........',//40
  '..........BBBBB.BBBBB...........',//41
  '..........BBBBB.BBBBB...........',//42
  '..........BBBBB.BBBBB...........',//43
  '.........wBBBBB.BBBBBw..........',//44
  '.........WWWWWW.WWWWWW..........',//45
  '.........WWWWWW.WWWWWW..........',//46
  '................................',
  '................................',
  '................................',
];

const MALE_JUMPSUIT = [
  '..........SSSSSSSSSS............',
  '.........SOOOOOOOOOOs...........',
  '........SOOOOOOOOOOOOs..........',
  '........SOOOOOOOOOOOOs..........',
  '.......SOOOOOOOOOOOOOOs.........',
  '.......SOOOOOOOOOOOOOOs.........',
  '.......SOOOOOOOOOOOOOOs.........',
  '.......SOOOOOOOOOOOOOOs.........',
  '........SOOwwOOOOOwwOOs.........', // id badge area
  '.......SOOOOwwwwOOOOOOs.........',
  '.......SOOOwOOOOwOOOOOs.........',
  '........SOOOOOOOOOOOOs..........',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOkOOOOO............',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........OOOOO.OOOOO...........',
  '..........KKKKKkKKKKK...........',
  '.........KKKKKKkKKKKKK..........',
  '..........KKKKK.KKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const MALE_KHAKI = [
  '..........SSSSSSSSSS............',
  '.........TTTTTTTTTTTSS..........',
  '........TTTTTTTTTTTTTT..........',
  '........TTTTTTTTTTTTTT..........',
  '.......TTTTTTTTTTTTTTTt.........',
  '.......TTTTTTTTTTTTTTTt.........',
  '.......TTTTTTTTTTTTTTTt.........',
  '.......TTTTTTTTTTTTTTTt.........',
  '........TTTTTTTTTTTTTt..........',
  '.......TTTTTTTTTTTTTTTt.........',
  '.......TTTTTTTTTTTTTTTt.........',
  '........tttTTTTTTTTttt..........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTTtTTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........TTTTT.TTTTT...........',
  '..........KKKKKkKKKKK...........',
  '.........KKKKKKkKKKKKK..........',
  '..........KKKKK.KKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

// ── FEMALE OUTFITS ────────────────────────────────────────────────────────────
// Slightly narrower shoulder silhouette, different skirt shapes

const FEMALE_HOODIE_JOGGERS = [
  '...........SSSSSSSSS............',
  '..........kHHHHHHHHHk...........',
  '.........kHHHHHHHHHHHk..........',
  '.........kHHHHHHHHHHHk..........',
  '........kHHHHHHHHHHHHHk.........',
  '........kHHHHHHHHHHHHHk.........',
  '........kHHHHHHHHHHHHHk.........',
  '........kHHHHHHHHHHHHHk.........',
  '.........kHHHHHHHHHHHk..........',
  '........kHHHHHHHHHHHHHk.........',
  '........kHHHHHHHHHHHHHk.........',
  '.........kkkHHHHHHHkkk..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJJJJJJJj..........',
  '..........JJJJJkJJJJJ...........',
  '..........JJJJJkJJJJJ...........',
  '..........JJJJJkJJJJJ...........',
  '..........JJJJJkJJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '..........JJJJJ.JJJJJ...........',
  '.........wJJJJJ.JJJJJw..........',
  '.........WWWWWW.WWWWWW..........',
  '.........WWWWWW.WWWWWW..........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const FEMALE_BLAZER_SKIRT = [
  '...........SSSSSSSSS............',
  '..........NZZZZZZZZNn...........',
  '.........NNZZZZZZZNNn...........',
  '.........NNNZUZZNNNn............',
  '........NNNNNUNNNNNNn...........',
  '........NNNNNUNNNNNNn...........',
  '........NNNNNNNNNNNNn...........',
  '........NNNNNNNNNNNNn...........',
  '.........NNNNNNNNNNn............',
  '........NNNNNNNNNNNNn...........',
  '........NNNNNNNNNNNNn...........',
  '.........nnnNNNNNNnnn...........',
  '..........NNNNNNNNNNn...........',  // skirt wider at hips
  '.........NNNNNNNNNNNNn..........',
  '.........NNNNNNNNNNNNn..........',
  '.........NNNNNNNNNNNNn..........',
  '.........NNNNNNNNNNNNn..........',
  '..........NNNNNNNNNNn...........',
  '..........NNNNNNNNNNn...........',
  '..........NNNNNNNNNNn...........',  // skirt narrows
  '..........NNNNNNNNNNn...........',
  '..........NNNNNNNNNN............',
  '..........NNNNNkNNNN............',  // legs split below skirt
  '..........NNNNNkNNNN............',
  '..........NNNNNkNNNN............',
  '..........NNNNNkNNNN............',
  '..........NNNNN.NNNNN...........',
  '..........NNNNN.NNNNN...........',
  '..........NNNNN.NNNNN...........',
  '..........NNNNN.NNNNN...........',
  '..........KKKKKkKKKKK...........',
  '.........KKKKKKkKKKKKK..........',
  '..........KKKKK.KKKKK...........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const FEMALE_CASUAL = [
  '...........SSSSSSSSS............',
  '..........kllllllllllk..........',
  '.........kllllllllllllk.........',
  '.........kllllllllllllk.........',
  '........kllllllllllllllk........',
  '........kllllllllllllllk........',
  '........kllllllllllllllk........',
  '........kllllllllllllllk........',
  '.........kllllllllllllk.........',
  '........kllllllllllllllk........',
  '........kllllllllllllllk........',
  '.........kkkllllllllkkk.........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBBBBBBBb..........',
  '..........BBBBBkBBBBB...........',
  '..........BBBBBkBBBBB...........',
  '..........BBBBBkBBBBB...........',
  '..........BBBBBkBBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '..........BBBBB.BBBBB...........',
  '.........wBBBBB.BBBBBw..........',
  '.........WWWWWW.WWWWWW..........',
  '.........WWWWWW.WWWWWW..........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

// Female jumpsuit same shape as male
const FEMALE_JUMPSUIT = MALE_JUMPSUIT;
const FEMALE_KHAKI    = MALE_KHAKI;

// ── ACCESSORY OVERLAYS ────────────────────────────────────────────────────────
// These are sparse: only define the rows that have content

const ACC_HANDCUFFS = {
  startRow: 22,
  rows: [
    'MMMm....................mMMM....', // row 22 left/right cuffs
    'MMMm....................mMMM....', // row 23
    '....MMMMMMMMMMMMMMMMMMMM........', // row 24 chain
  ],
};

const ACC_MUGSHOT_PLACARD = {
  startRow: 28,
  rows: [
    '........zZZZZZZZZZZZz..........', // row 28 top of placard
    '........zKGGGGGGGGGKz..........', // row 29
    '........zKGGGGGGGGGKz..........', // row 30
    '........zZZZZZZZZZZZz..........', // row 31
  ],
};

const ACC_EVIDENCE_TAG = {
  startRow: 22,
  rows: [
    '............................MMM.', // row 22
    '............................mZm.', // row 23
    '............................MMM.', // row 24
  ],
};

const ACC_ID_BADGE = {
  startRow: 20,
  rows: [
    '..........zZZZZZz...............',
    '..........zKGGKKz...............',
    '..........zGGGGGz...............',
    '..........zzzzzzz...............',
  ],
};

const ACC_ANKLE_MONITOR = {
  startRow: 43,
  rows: [
    '..........AAAAAa................', // row 43 left ankle only
    '..........AAAAAa................',
    '..........AAAAAa................',
  ],
};

const ACC_ORANGE_WRISTBAND = {
  startRow: 24,
  rows: [
    '.......XXX.......................', // left wrist area
  ],
};

const ACC_PURPLE_WRISTBAND = {
  startRow: 24,
  rows: [
    '.......VVV.......................',
  ],
};

const ACC_WORK_VEST = {
  startRow: 16,
  rows: [
    '........eEEEEEEEEEEEEeE.........',
    '........eEEEEEEEEEEEEeE.........',
    '........eEEEEEEEEEEEEeE.........',
    '........eEEEEEEEEEEEEeE.........',
    '........eEEEEEEEEEEEEeE.........',
    '................................',
    '................................',
    '................................',
  ],
};

const ACC_FOLDER = {
  startRow: 32,
  rows: [
    '......................ZZZZZZZ...',
    '......................ZkZZZZZ...',
    '......................ZZZZZZZ...',
    '......................ZZZZZZZ...',
    '......................ZZZZZZZ...',
  ],
};

const ACC_BRIEFCASE = {
  startRow: 32,
  rows: [
    '.....................KKkKKKK....',
    '.....................KmMMMmK....',
    '.....................KmMMMmK....',
    '.....................KKKKKkK....',
    '.....................KKKKKkK....',
  ],
};

const ACC_READING_GLASSES = {
  startRow: 6,
  rows: [
    '..........mmmmmmmmm.............',
  ],
};

const ACC_BASEBALL_CAP = {
  startRow: 0,
  rows: [
    '..........KKKKKKKKKK............',
    '.........KKKKKKKKKKKK...........',
    '.........KKKKKKKKKKKK...........',
    '........kkkkkkkkkkkkkk..........',
    '.........KKKKKKKKKKKK...........',
    '........KKKKKKKKKKKKKKK.........',  // brim
  ],
};

const ACC_BEANIE = {
  startRow: 0,
  rows: [
    '...........HHHHHHHHH............',
    '..........HHHHHHHHHHH...........',
    '..........HHHHHHHHHHH...........',
    '.........HHHHHHHHHHHHHH.........',
    '.........HHHHHHHHHHHHHH.........',
    '................................',
  ],
};

const ACC_BOOKS = {
  startRow: 30,
  rows: [
    '.............................KKK',
    '.............................NKB',
    '.............................NKB',
    '.............................NKB',
    '.............................KKK',
  ],
};

const ACC_LETTER = {
  startRow: 32,
  rows: [
    '......................ZZZZZZZ...',
    '......................ZKZZKZz...',
    '......................ZZZZZZz...',
    '......................ZZZZZZz...',
  ],
};

const ACC_ROSARY = {
  startRow: 15,
  rows: [
    '.............GGG................',
    '............GGGGG...............',
    '............G.G.G...............',
    '............GGGGG...............',
    '.............GGG................',
    '..............G.................',
    '..............G.................',
    '..............G.................',
  ],
};

const ACC_GED_CERT = {
  startRow: 32,
  rows: [
    '......................ZZZZZZZZZ.',
    '......................ZKZZZZZZz.',
    '......................ZZZZZZZZZ.',
    '......................ZZUUUUUUZ.',
    '......................ZZZZZZZZZ.',
    '......................ZZZZZZZZZ.',
  ],
};

const ACC_HEADWRAP = {
  startRow: 0,
  rows: [
    '............00000000............',
    '...........0000000000...........',
    '..........000000000000..........',
    '..........000000000000..........',
    '..........0............0........',
    '..........0..00000000..0........',
    '................................',
  ],
};

const ACC_TATTOO_SLEEVE = {
  startRow: 18,
  rows: [
    '.......kk........................',
    '.......kk........................',
    '.......kk........................',
    '.......kk........................',
    '.......kk........................',
    '.......kk........................',
  ],
};

// ── BACKGROUNDS ───────────────────────────────────────────────────────────────

function makeBgGrid(bands) {
  return Array.from({ length: GRID_H }, (_, r) => {
    let color = '#222233';
    for (const b of bands) {
      if (r >= b.rows[0] && r < b.rows[1]) { color = b.color; break; }
    }
    return Array(GRID_W).fill(color);
  });
}

// Add detail pixels to a bg grid (mutates)
function addBgDetail(grid, detailRows, startRow = 0) {
  detailRows.forEach((rowStr, ri) => {
    const y = startRow + ri;
    if (y >= grid.length) return;
    for (let x = 0; x < rowStr.length && x < GRID_W; x++) {
      const ch = rowStr[x];
      if (ch !== '.') {
        const color = CM[ch];
        if (color) grid[y][x] = color;
      }
    }
  });
}

function buildBg(key) {
  let grid;
  switch (key) {
    case 'prison_cell': {
      grid = makeBgGrid([
        { rows: [0, 3],   color: '#2A2A2A' },
        { rows: [3, 40],  color: '#3A3A40' },
        { rows: [40, 52], color: '#2A2A30' },
      ]);
      // Prison bars
      for (let y = 0; y < 40; y++) {
        for (let bx of [0, 1, 4, 5, 8, 9]) grid[y][bx] = '#1A1A1A';
      }
      // Window
      for (let y = 6; y < 14; y++) for (let x = 22; x < 30; x++) grid[y][x] = '#87CEEB';
      for (let y = 6; y < 14; y++) { grid[y][22] = '#1A1A1A'; grid[y][24] = '#1A1A1A'; grid[y][26] = '#1A1A1A'; grid[y][28] = '#1A1A1A'; }
      // Cot
      for (let y = 32; y < 38; y++) for (let x = 20; x < 31; x++) grid[y][x] = '#5A4530';
      break;
    }
    case 'street_corner': {
      grid = makeBgGrid([
        { rows: [0, 22],  color: '#0D1B2A' },
        { rows: [22, 38], color: '#1A1A2E' },
        { rows: [38, 52], color: '#252535' },
      ]);
      // Streetlight pole
      for (let y = 4; y < 36; y++) grid[y][28] = '#888888';
      // Light glow
      for (let x = 26; x < 31; x++) { grid[4][x] = '#FFEE88'; grid[5][x] = '#FFEE88'; }
      break;
    }
    case 'desert': {
      grid = makeBgGrid([
        { rows: [0, 20],  color: '#8BBDE8' },
        { rows: [20, 28], color: '#D4A850' },
        { rows: [28, 52], color: '#C49040' },
      ]);
      // Fence posts
      for (let y = 18; y < 24; y++) for (let x = 0; x < 32; x += 5) grid[y][x] = '#4A3020';
      for (let x = 0; x < 32; x++) grid[20][x] = '#5A3A20';
      break;
    }
    case 'office': {
      grid = makeBgGrid([
        { rows: [0, 10],  color: '#9ACCE8' },
        { rows: [10, 40], color: '#A8A89A' },
        { rows: [40, 52], color: '#888878' },
      ]);
      // Windows grid
      for (let wy = 0; wy < 3; wy++) for (let wx = 0; wx < 5; wx++) {
        const y0 = 12 + wy * 8, x0 = 1 + wx * 6;
        for (let y = y0; y < y0+4; y++) for (let x = x0; x < x0+4; x++) grid[y][x] = '#D4E8F8';
      }
      break;
    }
    case 'alley': {
      grid = makeBgGrid([
        { rows: [0, 10],  color: '#0A0A12' },
        { rows: [10, 42], color: '#1A1A28' },
        { rows: [42, 52], color: '#14141E' },
      ]);
      // Brick pattern walls
      for (let y = 0; y < 42; y += 3) {
        for (let x = 0; x < 4; x++) grid[y][x] = '#2A1A10';
        for (let x = 28; x < 32; x++) grid[y][x] = '#2A1A10';
      }
      break;
    }
    case 'convenience': {
      grid = makeBgGrid([
        { rows: [0, 8],   color: '#98C0E0' },
        { rows: [8, 38],  color: '#C0B8A0' },
        { rows: [38, 52], color: '#707060' },
      ]);
      // Store window
      for (let y = 12; y < 28; y++) for (let x = 4; x < 24; x++) grid[y][x] = '#D8E8F0';
      // Door
      for (let y = 24; y < 38; y++) for (let x = 11; x < 18; x++) grid[y][x] = '#A08868';
      break;
    }
    case 'courthouse':
    default: {
      grid = makeBgGrid([
        { rows: [0, 10],  color: '#A8C4E0' },
        { rows: [10, 40], color: '#C8C0B0' },
        { rows: [40, 52], color: '#B0A898' },
      ]);
      // Columns
      for (let y = 10; y < 40; y++) for (let cx of [2, 3, 8, 9, 22, 23, 28, 29]) grid[y][cx] = '#E0D8C8';
      // Steps
      for (let s = 0; s < 4; s++) {
        const y = 40 + s;
        for (let x = s; x < 32 - s; x++) grid[y][x] = '#BCAAA0';
      }
      break;
    }
    case 'home': {
      grid = makeBgGrid([
        { rows: [0, 14],  color: '#90C0E0' },
        { rows: [14, 42], color: '#C09060' },
        { rows: [42, 52], color: '#507030' },
      ]);
      // Roof triangle
      for (let y = 8; y < 14; y++) {
        const spread = 13 - y;
        for (let x = 16 - spread; x <= 16 + spread; x++) if (x >= 0 && x < 32) grid[y][x] = '#A03020';
      }
      // Door
      for (let y = 28; y < 42; y++) for (let x = 12; x < 20; x++) grid[y][x] = '#7A4A20';
      break;
    }
  }
  return grid;
}

// ── Background pixel renderer ─────────────────────────────────────────────────
function BgLayer({ bgGrid, scale }) {
  const pixels = [];
  bgGrid.forEach((row, y) => {
    row.forEach((color, x) => pixels.push([x, y, color]));
  });
  const shadow = pixels.map(([x, y, c]) => `${(x+1)*scale}px ${y*scale}px 0 0 ${c}`).join(',');
  return <div style={{ position:'absolute', width:scale, height:scale, top:0, left:-scale, boxShadow:shadow, zIndex:0, pointerEvents:'none' }} />;
}

function SpriteLayer({ pixels, scale, zIndex = 1 }) {
  if (!pixels.length) return null;
  const shadow = pixels.map(([x, y, c]) => `${(x+1)*scale}px ${y*scale}px 0 0 ${c}`).join(',');
  return <div style={{ position:'absolute', width:scale, height:scale, top:0, left:-scale, boxShadow:shadow, zIndex, pointerEvents:'none' }} />;
}

// ── Accessory layer helper ────────────────────────────────────────────────────
function accPixels(acc, skinHex, hairHex) {
  if (!acc) return [];
  return spriteToPixels(acc.rows, skinHex, hairHex, acc.startRow);
}

// ── Build option → body offset (column shift) ────────────────────────────────
// Slim: shift body inward 1px each side; Stocky: shift outward 1px
// We achieve this by transforming x coords: slim x+=1, stocky x-=1 for outline cols

// ── Main component ────────────────────────────────────────────────────────────
export default function PixelAvatar({ profile, appearance, outfit, accessories, stage }) {
  const W = GRID_W * SCALE, H = GRID_H * SCALE;

  const skinHex = SKIN_TONES.find(s => s.id === appearance.skinTone)?.hex ?? '#C68642';
  const hairColorHex = HAIR_COLORS.find(c => c.id === appearance.hairColor)?.hex ?? '#1A1208';

  // Age-graying: for 46+, blend hair toward gray
  const ageGrayed = appearance.age >= 46;
  const effectiveHairHex = ageGrayed
    ? lighten(hairColorHex, 0.35)
    : hairColorHex;

  const hairStyle  = appearance.hairStyle  || 'short_straight';
  const facialHair = appearance.facialHair || 'none';
  const sex        = profile.sex           || 'Male';

  // Background key
  const bgKey = {
    drug:                stage === 'sentenced' ? 'prison_cell' : 'street_corner',
    immigration_entry:   stage === 'sentenced' ? 'prison_cell' : 'desert',
    immigration_reentry: stage === 'sentenced' ? 'prison_cell' : 'desert',
    firearms:            stage === 'sentenced' ? 'prison_cell' : 'alley',
    fraud:               stage === 'sentenced' ? 'prison_cell' : 'office',
    robbery:             stage === 'sentenced' ? 'prison_cell' : 'convenience',
    sex_offense:         stage === 'sentenced' ? 'prison_cell' : 'courthouse',
  }[profile.offense] ?? (stage === 'sentenced' ? 'prison_cell' : 'courthouse');

  const bgGrid = useMemo(() => buildBg(bgKey), [bgKey]);

  // Choose outfit rows
  const outfitRows = useMemo(() => {
    if (outfit === 'jumpsuit')  return sex === 'Female' ? FEMALE_JUMPSUIT : MALE_JUMPSUIT;
    if (outfit === 'khaki')     return sex === 'Female' ? FEMALE_KHAKI : MALE_KHAKI;
    if (outfit === 'suit')      return sex === 'Female' ? FEMALE_BLAZER_SKIRT : MALE_SUIT;
    if (outfit === 'cargo')     return MALE_CARGO_TEE;
    if (outfit === 'plain')     return sex === 'Female' ? FEMALE_CASUAL : MALE_PLAIN_SHIRT;
    if (outfit === 'blazer')    return FEMALE_BLAZER_SKIRT;
    // default civilian
    return sex === 'Female' ? FEMALE_HOODIE_JOGGERS : MALE_HOODIE_JOGGERS;
  }, [outfit, sex]);

  // Assemble all layers
  const characterPixels = useMemo(() => {
    const p = [];
    // Head (older face for 46+)
    const headRows = appearance.age >= 46 ? HEAD_OLDER : HEAD;
    p.push(...spriteToPixels(headRows, skinHex, effectiveHairHex, 0));
    // Hair
    p.push(...spriteToPixels(HAIR[hairStyle] || HAIR.bald, skinHex, effectiveHairHex, 0));
    // Facial hair (male only)
    if (sex === 'Male' && facialHair !== 'none') {
      const fhRows = FACIAL_HAIR_OVERLAYS[facialHair];
      if (fhRows) p.push(...spriteToPixels(fhRows, skinHex, effectiveHairHex, 8));
    }
    // Body / outfit
    p.push(...spriteToPixels(outfitRows, skinHex, effectiveHairHex, 0));

    // Auto accessories
    if (accessories.handcuffs)     p.push(...accPixels(ACC_HANDCUFFS, skinHex, effectiveHairHex));
    if (accessories.mugshotPlacard) p.push(...accPixels(ACC_MUGSHOT_PLACARD, skinHex, effectiveHairHex));
    if (accessories.evidenceTag)    p.push(...accPixels(ACC_EVIDENCE_TAG, skinHex, effectiveHairHex));
    if (accessories.idBadge)        p.push(...accPixels(ACC_ID_BADGE, skinHex, effectiveHairHex));
    if (accessories.ankleMonitor)   p.push(...accPixels(ACC_ANKLE_MONITOR, skinHex, effectiveHairHex));
    if (accessories.orangeWristband) p.push(...accPixels(ACC_ORANGE_WRISTBAND, skinHex, effectiveHairHex));
    if (accessories.purpleWristband) p.push(...accPixels(ACC_PURPLE_WRISTBAND, skinHex, effectiveHairHex));
    if (accessories.workVest)       p.push(...accPixels(ACC_WORK_VEST, skinHex, effectiveHairHex));
    if (accessories.folder)         p.push(...accPixels(ACC_FOLDER, skinHex, effectiveHairHex));
    if (accessories.briefcase)      p.push(...accPixels(ACC_BRIEFCASE, skinHex, effectiveHairHex));
    if (accessories.readingGlasses) p.push(...accPixels(ACC_READING_GLASSES, skinHex, effectiveHairHex));
    if (accessories.baseballCap)    p.push(...accPixels(ACC_BASEBALL_CAP, skinHex, effectiveHairHex));
    if (accessories.beanie)         p.push(...accPixels(ACC_BEANIE, skinHex, effectiveHairHex));
    if (accessories.headwrap)       p.push(...accPixels(ACC_HEADWRAP, skinHex, effectiveHairHex));
    if (accessories.tattooSleeve)   p.push(...accPixels(ACC_TATTOO_SLEEVE, skinHex, effectiveHairHex));
    if (accessories.lawBooks)       p.push(...accPixels(ACC_BOOKS, skinHex, effectiveHairHex));
    if (accessories.letter)         p.push(...accPixels(ACC_LETTER, skinHex, effectiveHairHex));
    if (accessories.rosary)         p.push(...accPixels(ACC_ROSARY, skinHex, effectiveHairHex));
    if (accessories.gedCert)        p.push(...accPixels(ACC_GED_CERT, skinHex, effectiveHairHex));

    return p;
  }, [skinHex, effectiveHairHex, hairStyle, facialHair, sex, outfitRows, accessories, appearance.age]);

  return (
    <div style={{ position:'relative', width:W, height:H, imageRendering:'pixelated', overflow:'hidden' }}>
      <BgLayer bgGrid={bgGrid} scale={SCALE} />
      <SpriteLayer pixels={characterPixels} scale={SCALE} zIndex={2} />

      {/* Ankle monitor blink (CSS animation on a separate element) */}
      {accessories.ankleMonitor && (
        <div style={{
          position: 'absolute',
          width: SCALE, height: SCALE,
          top: 43 * SCALE, left: (10 + 1) * SCALE,
          background: '#00FF88',
          borderRadius: '50%',
          animation: 'blink 1.2s step-start infinite',
          zIndex: 5,
        }} />
      )}

      {/* Scanline overlay */}
      <div style={{
        position:'absolute', inset:0, zIndex:8, pointerEvents:'none',
        background:'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(0,0,0,0.07) 8px)',
      }} />
    </div>
  );
}

// ── Canvas export helper ───────────────────────────────────────────────────────
export function exportAvatarToCanvas(bgGrid, characterPixels, scale = SCALE, label = '') {
  const W = GRID_W * scale;
  const H = GRID_H * scale;
  const LABEL_H = label ? 32 : 0;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H + LABEL_H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Background
  bgGrid.forEach((row, y) => {
    row.forEach((color, x) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  // Character
  characterPixels.forEach(([x, y, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
  });
  // Label
  if (label) {
    ctx.fillStyle = '#0E0E1A';
    ctx.fillRect(0, H, W, LABEL_H);
    ctx.fillStyle = '#E8621A';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(label, 6, H + 20);
  }
  return canvas;
}
