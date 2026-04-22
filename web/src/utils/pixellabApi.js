/**
 * pixellabApi.js
 * PixelLab API v2 client for generating AI pixel art characters.
 * https://api.pixellab.ai/v2
 *
 * NOTE: API key is intentionally in the frontend for this academic demo.
 * This is a free-trial key with 40 generations/month — not a production secret.
 */

const BASE_URL = 'https://api.pixellab.ai/v2';
const API_KEY  = '4fcb68ca-b409-4b6c-bb5c-696e76c8652f';

const CACHE_PREFIX  = 'pixellab_v2_';
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000; // 24 hours

// ── Cache helpers ─────────────────────────────────────────────────────────────
function cacheKey(profile, outfit, stage) {
  const parts = [
    profile.race, profile.sex,
    Math.round(profile.age / 5) * 5, // bucket ages in 5-year bands
    outfit, stage,
  ];
  return CACHE_PREFIX + parts.join('_').replace(/[^a-zA-Z0-9_]/g, '');
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); }
  catch { /* storage full — ignore */ }
}

// ── Description builder ───────────────────────────────────────────────────────
const RACE_DESC = {
  Black:    'Black African American',
  Hispanic: 'Hispanic Latino',
  White:    'White Caucasian',
  Asian:    'Asian',
  Native:   'Native American',
  Other:    'mixed race',
};

const OUTFIT_DESC = {
  jumpsuit:  'bright orange prison jumpsuit, prison ID badge on chest',
  khaki:     'khaki federal camp uniform, beige pants and shirt',
  civilian:  'casual civilian clothing, jeans and a t-shirt',
  suit:      'business suit and tie, formal attire',
  cargo:     'cargo pants and plain t-shirt',
  plain:     'simple plain t-shirt and jeans',
};

const STAGE_EXTRAS = {
  arrest:    'hands in handcuffs in front, holding a mugshot number placard',
  sentenced: '',
};

export function buildCharacterDescription(profile, outfit, stage) {
  const race    = RACE_DESC[profile.race]    || profile.race;
  const outDesc = OUTFIT_DESC[outfit]         || 'casual clothing';
  const stExtra = STAGE_EXTRAS[stage]         || '';
  const sex     = profile.sex === 'Male' ? 'man' : 'woman';
  const age     = profile.age <= 25 ? 'young adult'
                : profile.age <= 40 ? 'adult'
                : profile.age <= 55 ? 'middle-aged'
                : 'older adult';

  return [
    `${race} ${sex}, ${age}, ${outDesc}`,
    stExtra,
    'full body pixel art character, front-facing, detailed face, solid dark background',
  ].filter(Boolean).join(', ');
}

// ── Main API call ─────────────────────────────────────────────────────────────
/**
 * Generate an AI pixel art character via PixelLab.
 * Returns { base64: "data:image/png;base64,..." } or throws.
 *
 * @param {object} profile  - profile object (race, sex, age, offense, …)
 * @param {string} outfit   - jumpsuit | khaki | civilian | suit | cargo | plain
 * @param {string} stage    - arrest | sentenced
 * @param {object} [opts]
 * @param {boolean} [opts.forceRefresh] - bypass cache
 */
export async function generateCharacter(profile, outfit, stage, opts = {}) {
  const key = cacheKey(profile, outfit, stage);

  if (!opts.forceRefresh) {
    const cached = cacheGet(key);
    if (cached) return cached;
  }

  const description = buildCharacterDescription(profile, outfit, stage);

  const body = {
    description,
    negative_description: 'blurry, ugly, deformed, low quality, extra limbs, bad anatomy',
    image_size:  { width: 96, height: 96 },
    text_guidance_scale: 8,
    view:        'side',
    no_background: false,
    outline:     'hard outline',
    shading:     'basic shading',
    detail:      'high detail',
  };

  const res = await fetch(`${BASE_URL}/create-image-pixflux`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.detail || err?.message || `HTTP ${res.status}`;
    throw new Error(`PixelLab API error: ${msg}`);
  }

  const json = await res.json();

  // Response: { image: { type: "base64", base64: "data:image/png;base64,..." }, usage: {...} }
  const b64 = json?.image?.base64 || json?.data?.image?.base64;
  if (!b64) throw new Error('PixelLab: no image in response');

  const result = { base64: b64, description, usage: json.usage };
  cacheSet(key, result);
  return result;
}

/**
 * Get current credit balance.
 */
export async function getBalance() {
  const res = await fetch(`${BASE_URL}/balance`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Balance check failed: HTTP ${res.status}`);
  return res.json();
}
