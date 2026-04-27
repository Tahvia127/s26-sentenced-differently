/**
 * buildPortraitPrompt.js
 * Constructs a GPT-Image-2 prompt for a mugshot-style portrait.
 */

const RACE_DESC = {
  Black:    'Black',
  White:    'White',
  Hispanic: 'Hispanic Latino',
  Asian:    'East Asian',
  Native:   'Native American',
  Other:    'multiracial',
};

const HAIR_DESC = {
  short_straight: 'short straight hair',
  long_straight:  'long straight hair',
  locs:           'locs',
  afro:           'natural afro',
  buzzcut:        'buzzcut',
  bald:           'shaved head',
  ponytail:       'hair in a ponytail',
  space_buns:     'space buns',
};

const FACIAL_HAIR_DESC = {
  none:        '',
  stubble:     'light stubble',
  beard_short: 'short beard',
  beard_full:  'full beard',
  mustache:    'mustache',
};

const OUTFIT_DESC = {
  jumpsuit:  'bright orange federal prison jumpsuit, white inmate ID badge clipped to chest',
  khaki:     'khaki tan federal prison camp uniform, small ID badge',
  suit:      'dark navy suit, white dress shirt, red tie',
  civilian:  'casual civilian clothing',
  cargo:     'cargo pants and a plain t-shirt',
  plain:     'plain gray t-shirt and jeans',
};

export function buildPortraitPrompt(profile, appearance, outfit, stage) {
  const race   = RACE_DESC[profile.race]  ?? profile.race;
  const sexWord = profile.sex === 'Male' ? 'man' : 'woman';
  const hair   = HAIR_DESC[appearance?.hairStyle] ?? 'short hair';
  const fhair  = profile.sex === 'Male' ? (FACIAL_HAIR_DESC[appearance?.facialHair] ?? '') : '';
  const clothe = OUTFIT_DESC[outfit] ?? 'plain clothing';

  const ageRange =
    profile.age < 25 ? 'early twenties' :
    profile.age < 35 ? 'late twenties to early thirties' :
    profile.age < 45 ? 'mid-thirties to early forties' :
    'mid-forties to fifties';

  const stageNote = stage === 'arrest'
    ? 'front-facing mugshot pose against a plain white wall, neutral expression, holding a booking placard'
    : 'standing, serious expression, facing camera';

  const description = [
    `Realistic portrait photograph of a ${race} ${sexWord} in their ${ageRange}`,
    `${hair}${fhair ? ', ' + fhair : ''}`,
    clothe,
    stageNote,
    'photorealistic, clear lighting, documentary style, dignified, not mocking',
    'high detail face, sharp focus',
  ].filter(Boolean).join(', ');

  return description;
}
