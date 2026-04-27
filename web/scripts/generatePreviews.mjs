/**
 * generatePreviews.mjs
 * Generates high-quality avatar PNGs using PixelLab's bitforge endpoint
 * (128×128, better detail than pixflux). Saves to web/avatar-previews/.
 *
 * Usage: node scripts/generatePreviews.mjs
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '../avatar-previews');
const BASE_URL  = 'https://api.pixellab.ai/v2';
const API_KEY   = '4fcb68ca-b409-4b6c-bb5c-696e76c8652f';

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Avatar subjects ───────────────────────────────────────────────────────────
const SUBJECTS = [
  // Arrested — handcuffs, mugshot placard
  {
    file: '01_black_male_arrested',
    desc: 'Black man in his late twenties, wearing a plain grey t-shirt and dark jeans, both hands bound together in silver metal handcuffs held out in front, holding a white rectangular booking number placard with black numbers, looking directly forward, neutral expression, front-facing full body pixel art character sprite',
  },
  {
    file: '02_white_female_arrested',
    desc: 'White woman in her mid-thirties, wearing a casual blue hoodie and jeans, both hands bound in silver handcuffs held in front, holding a white rectangular mugshot placard with black numbers, looking directly forward, front-facing full body pixel art character sprite',
  },
  {
    file: '03_hispanic_male_arrested',
    desc: 'Hispanic Latino man in his late twenties, medium brown skin, wearing a white t-shirt and cargo pants, both wrists bound in silver handcuffs held out in front, holding a white rectangular booking placard, front-facing full body pixel art character sprite',
  },

  // Prison — orange jumpsuit, ID badge
  {
    file: '04_black_male_prison',
    desc: 'Black man in his late twenties, wearing a bright orange federal prison jumpsuit with a small white rectangular inmate ID badge clipped to the left chest, standing upright with hands at sides, serious expression, front-facing full body pixel art character sprite, orange jumpsuit clearly visible',
  },
  {
    file: '05_white_female_prison',
    desc: 'White woman in her mid-thirties, wearing a bright orange federal prison jumpsuit with a white inmate ID badge on the chest, hands at sides, standing upright, front-facing full body pixel art character sprite',
  },
  {
    file: '06_hispanic_female_prison',
    desc: 'Hispanic Latina woman in her late twenties, medium brown skin, wearing a bright orange federal prison jumpsuit, white inmate ID badge on left chest, dark hair, hands at sides, front-facing full body pixel art character sprite',
  },

  // White-collar — khaki federal camp uniform
  {
    file: '07_white_male_whitecollar',
    desc: 'White man in his forties, wearing a khaki tan federal prison camp uniform shirt and pants, small ID badge on chest, relaxed posture, front-facing full body pixel art character sprite, khaki/beige colored uniform',
  },

  // Probation — ankle monitor
  {
    file: '08_black_female_probation',
    desc: 'Black woman in her late twenties, wearing casual civilian clothes — jeans and a light blue t-shirt, a small black electronic ankle monitoring bracelet strapped around her left ankle, standing relaxed, front-facing full body pixel art character sprite, ankle monitor clearly visible',
  },
  {
    file: '09_asian_male_probation',
    desc: 'Asian man in his early thirties, light skin, wearing casual civilian clothes — khaki pants and a dark shirt, a black electronic ankle monitoring device strapped to his left ankle, relaxed pose, front-facing full body pixel art character sprite',
  },

  // Special accessories
  {
    file: '10_native_female_probation',
    desc: 'Native American woman in her thirties, long straight dark hair, wearing casual civilian clothing — jeans and a green shirt, a black GPS ankle monitoring bracelet on her ankle, front-facing full body pixel art character sprite, ankle monitor clearly visible on ankle',
  },
];

// ── API call ──────────────────────────────────────────────────────────────────
async function generate(subject) {
  const body = {
    description:          subject.desc,
    negative_description: 'blurry, ugly, deformed, bad anatomy, multiple people, extra limbs, text, watermark, cropped, abstract, cartoon, anime, 3d',
    image_size:           { width: 128, height: 128 },
    text_guidance_scale:  9,
    outline:              'single color black outline',
    shading:              'basic shading',
    detail:               'highly detailed',
    no_background:        false,
    view:                 'side',
  };

  const res = await fetch(`${BASE_URL}/create-image-bitforge`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = Array.isArray(err?.detail)
      ? err.detail.map(d => d.msg || JSON.stringify(d)).join('; ')
      : String(err?.detail || err?.message || `HTTP ${res.status}`);
    throw new Error(detail);
  }

  const json   = await res.json();
  const rawB64 = json?.image?.base64;
  if (!rawB64) throw new Error('No image in response');

  return rawB64; // raw base64 — no data URL prefix
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nGenerating ${SUBJECTS.length} avatar PNGs…\n`);

  const results = [];

  for (let i = 0; i < SUBJECTS.length; i++) {
    const s = SUBJECTS[i];
    process.stdout.write(`  [${i+1}/${SUBJECTS.length}] ${s.file} … `);

    try {
      const b64  = await generate(s);
      const buf  = Buffer.from(b64, 'base64');
      const file = path.join(OUT_DIR, `${s.file}.png`);
      fs.writeFileSync(file, buf);
      results.push({ file: `${s.file}.png`, ok: true });
      console.log('✓');
    } catch (e) {
      results.push({ file: `${s.file}.png`, ok: false, err: e.message });
      console.log(`✗  ${e.message}`);
    }

    if (i < SUBJECTS.length - 1) await new Promise(r => setTimeout(r, 700));
  }

  // ── Write HTML gallery ───────────────────────────────────────────────────
  const items = results
    .filter(r => r.ok)
    .map(r => `
      <div class="card">
        <img src="${r.file}" />
        <div class="label">${r.file.replace('.png','').replace(/_/g,' ')}</div>
      </div>`)
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Avatar Previews — Sentenced Differently</title>
<style>
  body { background:#0E0E1A; color:#E0E0F0; font-family:monospace; padding:24px; }
  h1   { font-size:14px; letter-spacing:.3em; text-transform:uppercase; color:#E8621A; margin-bottom:24px; }
  .grid { display:flex; flex-wrap:wrap; gap:16px; }
  .card { background:#12121C; border:1px solid #1E1E2E; border-radius:8px; padding:12px;
          display:flex; flex-direction:column; align-items:center; gap:8px; }
  img   { image-rendering:pixelated; width:256px; height:256px; }
  .label { font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:#666688; text-align:center; }
</style>
</head>
<body>
<h1>Avatar + Accessory Previews · Sentenced Differently</h1>
<div class="grid">${items}</div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);

  console.log(`\n─────────────────────────────────────`);
  console.log(`✓ Saved ${results.filter(r=>r.ok).length}/${SUBJECTS.length} PNGs`);
  console.log(`→ Open: web/avatar-previews/index.html`);
}

main().catch(e => { console.error(e); process.exit(1); });
