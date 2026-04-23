/**
 * generateAvatars.mjs
 * Pre-generates pixel art character images for all race × sex × stage combos
 * using the PixelLab API, then writes them as base64 into src/data/generatedAvatars.js.
 *
 * Usage: node scripts/generateAvatars.mjs
 *
 * Cost: 1 credit per image.
 * With 5 races × 2 sexes × 3 outfit-states = 30 images.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://api.pixellab.ai/v2';
const API_KEY  = '4fcb68ca-b409-4b6c-bb5c-696e76c8652f';

// ── Combinations ──────────────────────────────────────────────────────────────
const RACES = ['Black', 'White', 'Hispanic', 'Asian', 'Native'];
const SEXES = ['Male', 'Female'];

// 3 outfit-states that cover all sentencing outcomes
const OUTFIT_STATES = [
  {
    key: 'arrested',
    label: 'Arrest stage',
    desc: (race, sex) =>
      `casual street clothing, both hands in silver handcuffs held in front, holding a rectangular mugshot number placard, looking forward`,
  },
  {
    key: 'prison',
    label: 'Prison sentence',
    desc: (race, sex) =>
      `bright orange federal prison jumpsuit, white inmate ID badge clipped to chest, hands at sides`,
  },
  {
    key: 'probation',
    label: 'Probation / home confinement',
    desc: (race, sex) =>
      `casual civilian clothing, black electronic ankle monitoring bracelet on ankle, hands at sides`,
  },
];

// ── Appearance seeds by race/sex ──────────────────────────────────────────────
const RACE_APPEARANCE = {
  Black:    { skinDesc: 'dark brown skin',         hairDesc: 'short natural hair' },
  White:    { skinDesc: 'light skin',               hairDesc: 'short brown hair' },
  Hispanic: { skinDesc: 'medium brown skin',        hairDesc: 'short dark hair' },
  Asian:    { skinDesc: 'light to medium skin',     hairDesc: 'straight black hair' },
  Native:   { skinDesc: 'medium copper-toned skin', hairDesc: 'long straight dark hair' },
};

const FEMALE_HAIR = {
  Black:    'shoulder-length natural curly hair',
  White:    'shoulder-length straight brown hair',
  Hispanic: 'shoulder-length wavy dark hair',
  Asian:    'straight black hair past shoulders',
  Native:   'long straight dark hair',
};

// ── API call ──────────────────────────────────────────────────────────────────
async function generateCharacter(race, sex, outfitState) {
  const appear  = RACE_APPEARANCE[race];
  const sexWord = sex === 'Male' ? 'man' : 'woman';
  const hairDesc = sex === 'Female' ? FEMALE_HAIR[race] : appear.hairDesc;
  const outfit  = outfitState.desc(race, sex);

  const description = [
    `${appear.skinDesc}, ${hairDesc}`,
    `${sexWord} in their late twenties`,
    outfit,
    'front-facing full body pixel art character',
    'centered in frame, game sprite style',
    'clean pixel art, detailed face, 96x96 resolution',
  ].join(', ');

  const negative = [
    'blurry, ugly, deformed, bad anatomy, extra limbs',
    'multiple people, text, watermark, border',
    'cartoon, anime, 3d render',
  ].join(', ');

  const body = {
    description,
    negative_description: negative,
    image_size: { width: 96, height: 96 },
    text_guidance_scale: 8,
    view: 'side',
    no_background: false,
    outline: 'single color black outline',
    shading: 'basic shading',
    detail: 'highly detailed',
  };

  const res = await fetch(`${BASE_URL}/create-image-pixflux`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = Array.isArray(err?.detail)
      ? err.detail.map(d => d.msg || JSON.stringify(d)).join('; ')
      : (err?.detail || err?.message || `HTTP ${res.status}`);
    throw new Error(String(detail));
  }

  const json = await res.json();
  const rawB64 = json?.image?.base64;
  if (!rawB64) throw new Error('No image.base64 in response');

  // API returns raw base64 without the data-URL prefix — add it
  const b64 = rawB64.startsWith('data:') ? rawB64 : `data:image/png;base64,${rawB64}`;

  const usage = json?.usage ?? {};
  return { b64, description, usage };
}

// ── Delay helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const combos = [];
  for (const race of RACES) {
    for (const sex of SEXES) {
      for (const state of OUTFIT_STATES) {
        combos.push({ race, sex, state });
      }
    }
  }

  console.log(`\nGenerating ${combos.length} avatars (${combos.length} credits)…\n`);

  // Check balance first
  try {
    const bal = await fetch(`${BASE_URL}/balance`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    const balJson = await bal.json();
    const remaining = balJson?.data?.remaining_generations ?? balJson?.remaining_generations ?? '?';
    console.log(`Credits remaining before generation: ${remaining}\n`);
  } catch { /* ignore */ }

  const avatars = {};
  const descriptions = {};
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < combos.length; i++) {
    const { race, sex, state } = combos[i];
    const key = `${race}-${sex}-${state.key}`;

    process.stdout.write(`  [${i + 1}/${combos.length}] ${key} … `);

    try {
      const { b64, description, usage } = await generateCharacter(race, sex, state);
      avatars[key]      = b64;
      descriptions[key] = description;
      succeeded++;
      const rem = usage?.remaining_generations ?? '?';
      console.log(`✓  (${rem} remaining)`);
    } catch (e) {
      avatars[key] = null;
      failed++;
      console.log(`✗  ${e.message}`);
    }

    // Polite delay between calls
    if (i < combos.length - 1) await sleep(600);
  }

  // ── Write output file ──────────────────────────────────────────────────────
  const outPath = path.join(__dirname, '../src/data/generatedAvatars.js');

  const jsContent = `/**
 * generatedAvatars.js — AUTO-GENERATED. Do not edit manually.
 * Run: node scripts/generateAvatars.mjs to regenerate.
 *
 * Keys: "{Race}-{Sex}-{outfitKey}"
 *   Race:      Black | White | Hispanic | Asian | Native
 *   Sex:       Male | Female
 *   outfitKey: arrested | prison | probation
 */

export const GENERATED_AVATARS = ${JSON.stringify(avatars, null, 0)};

export const AVATAR_DESCRIPTIONS = ${JSON.stringify(descriptions, null, 0)};

/**
 * Resolve a profile + outfit + stage to a pre-generated avatar key,
 * then return the base64 image string (or null if not found).
 */
export function lookupAvatar(race, sex, outfit, stage) {
  // Map outfit/stage to our 3 keys
  let outfitKey;
  if (stage === 'arrest') {
    outfitKey = 'arrested';
  } else if (outfit === 'jumpsuit' || outfit === 'khaki') {
    outfitKey = 'prison';
  } else {
    outfitKey = 'probation';
  }

  // Normalize race — fall back to White for unknown groups
  const KNOWN = ['Black', 'White', 'Hispanic', 'Asian', 'Native'];
  const raceKey = KNOWN.includes(race) ? race : 'White';

  const key = \`\${raceKey}-\${sex}-\${outfitKey}\`;
  return GENERATED_AVATARS[key] ?? null;
}
`;

  fs.writeFileSync(outPath, jsContent);

  console.log(`\n──────────────────────────────────────────`);
  console.log(`✓ Generated: ${succeeded}/${combos.length}`);
  console.log(`✗ Failed:    ${failed}/${combos.length}`);
  console.log(`→ Saved to:  src/data/generatedAvatars.js`);
}

main().catch(e => { console.error(e); process.exit(1); });
