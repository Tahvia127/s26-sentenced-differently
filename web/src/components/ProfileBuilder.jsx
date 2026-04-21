import React, { useState } from 'react';
import Callout from './Callout';
import { CALLOUTS } from '../data/sentencingData';

const RACES = ['Black', 'Hispanic', 'White', 'Other'];
const SEXES = ['Male', 'Female'];
const EDUCATIONS = [
  { value: 'less_hs',  label: 'Less than High School' },
  { value: 'hs_ged',   label: 'High School / GED' },
  { value: 'some_col', label: 'Some College' },
  { value: 'bachelors',label: 'Bachelor\'s+' },
];
const REPRESENTATIONS = [
  { value: 'public_defender', label: 'Public Defender' },
  { value: 'private',         label: 'Retained Private Attorney' },
  { value: 'pro_se',          label: 'Pro Se (Self-Represented)' },
];
const CRIM_HIST_OPTIONS = [
  { value: 'I',   label: 'Category I — No prior convictions' },
  { value: 'II',  label: 'Category II — 1 prior conviction' },
  { value: 'III', label: 'Category III — 2 priors' },
  { value: 'IV',  label: 'Category IV — 3 priors' },
  { value: 'V',   label: 'Category V — 4 priors' },
  { value: 'VI',  label: 'Category VI — 5+ priors' },
];
const OFFENSES = [
  { value: 'drug',                label: 'Drug (trafficking / distribution)' },
  { value: 'immigration_entry',   label: 'Immigration — Illegal Entry' },
  { value: 'immigration_reentry', label: 'Immigration — Illegal Reentry' },
  { value: 'firearms',            label: 'Firearms / Weapons' },
  { value: 'fraud',               label: 'Fraud / White-collar' },
  { value: 'robbery',             label: 'Robbery / Violent' },
  { value: 'sex_offense',         label: 'Sex Offense' },
  { value: 'other',               label: 'Other Federal Offense' },
];
const DRUG_QUANTITIES = [
  { value: 'small',     label: 'Small  (< 100g equivalent)' },
  { value: 'medium',    label: 'Medium (100g – 1kg)' },
  { value: 'large',     label: 'Large  (1kg+)' },
  { value: 'very_large',label: 'Very Large (10kg+)' },
];
const FRAUD_AMOUNTS = [
  { value: 'low',  label: 'Low    (< $95k)' },
  { value: 'mid',  label: 'Mid    ($95k – $550k)' },
  { value: 'high', label: 'High   (> $550k)' },
];
const AGG_FACTORS = [
  { value: 'weapon',         label: 'Weapon used or possessed' },
  { value: 'leadership',     label: 'Leadership role in offense' },
  { value: 'vulnerable',     label: 'Vulnerable victim' },
  { value: 'obstruction',    label: 'Obstruction of justice' },
  { value: 'accepted_resp',  label: '✓ Accepted responsibility (−3 levels)' },
];

function StepHeader({ num, title, open, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 px-3 bg-gray-800 hover:bg-gray-750 rounded text-left transition-colors"
    >
      <span className="flex items-center gap-2">
        <span className="text-orange-400 font-mono font-bold text-sm">0{num}</span>
        <span className="uppercase tracking-widest text-xs text-gray-300 font-semibold">{title}</span>
      </span>
      <span className="text-gray-500 text-sm">{open ? '▲' : '▼'}</span>
    </button>
  );
}

function FieldLabel({ children, note }) {
  return (
    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">
      {children}
      {note && <span className="text-gray-600 normal-case ml-1">({note})</span>}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-orange-500"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.value || o}
          onClick={() => onChange(o.value || o)}
          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
            value === (o.value || o)
              ? 'border-orange-500 bg-orange-950/60 text-orange-300'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
          }`}
        >
          {o.label || o}
        </button>
      ))}
    </div>
  );
}

export default function ProfileBuilder({ profile, onChange }) {
  const [openSteps, setOpenSteps] = useState([0, 1, 2, 3]);

  const toggleStep = (i) =>
    setOpenSteps(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );

  const set = (key, val) => onChange({ ...profile, [key]: val });
  const toggleFactor = (val) => {
    const cur = profile.aggravatingFactors || [];
    set('aggravatingFactors', cur.includes(val) ? cur.filter(f => f !== val) : [...cur, val]);
  };

  const showPubDefCallout = profile.representation === 'public_defender';
  const showBlackMaleCallout = profile.race === 'Black' && profile.sex === 'Male';
  const showDrugLargeCallout =
    profile.offense === 'drug' &&
    (profile.drugQuantity === 'large' || profile.drugQuantity === 'very_large');
  const showAcceptCallout = (profile.aggravatingFactors || []).includes('accepted_resp');

  return (
    <div className="space-y-2">
      {/* Step 1 — Demographics */}
      <div>
        <StepHeader num={1} title="Demographics" open={openSteps.includes(0)} onToggle={() => toggleStep(0)} />
        {openSteps.includes(0) && (
          <div className="mt-2 space-y-3 px-1">
            <div>
              <FieldLabel>Race</FieldLabel>
              <RadioGroup
                name="race" value={profile.race}
                onChange={v => set('race', v)}
                options={RACES}
              />
            </div>
            <div>
              <FieldLabel>Sex</FieldLabel>
              <RadioGroup
                name="sex" value={profile.sex}
                onChange={v => set('sex', v)}
                options={SEXES}
              />
            </div>
            <div>
              <FieldLabel>Age</FieldLabel>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="18" max="65" value={profile.age}
                  onChange={e => set('age', parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="font-mono text-orange-300 text-sm w-8 text-right">{profile.age}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Younger age correlates with slight downward departure in guidelines
              </p>
            </div>
            <div>
              <FieldLabel note="not an official guideline factor">Education</FieldLabel>
              <Select value={profile.education} onChange={v => set('education', v)} options={EDUCATIONS} />
            </div>
            {showBlackMaleCallout && (
              <Callout {...CALLOUTS.blackMale} />
            )}
          </div>
        )}
      </div>

      {/* Step 2 — Legal Representation */}
      <div>
        <StepHeader num={2} title="Legal Representation" open={openSteps.includes(1)} onToggle={() => toggleStep(1)} />
        {openSteps.includes(1) && (
          <div className="mt-2 space-y-3 px-1">
            <div>
              <FieldLabel note="not in guidelines, correlates with outcomes">Representation</FieldLabel>
              <Select
                value={profile.representation}
                onChange={v => set('representation', v)}
                options={REPRESENTATIONS}
              />
            </div>
            {showPubDefCallout && (
              <Callout {...CALLOUTS.publicDefender} />
            )}
          </div>
        )}
      </div>

      {/* Step 3 — Criminal History */}
      <div>
        <StepHeader num={3} title="Criminal History" open={openSteps.includes(2)} onToggle={() => toggleStep(2)} />
        {openSteps.includes(2) && (
          <div className="mt-2 space-y-3 px-1">
            <div>
              <FieldLabel>Criminal History Category (USSC I–VI)</FieldLabel>
              <Select
                value={profile.crimHistory}
                onChange={v => set('crimHistory', v)}
                options={CRIM_HIST_OPTIONS}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="supervision"
                type="checkbox"
                checked={profile.onSupervision}
                onChange={e => set('onSupervision', e.target.checked)}
                className="accent-orange-500"
              />
              <label htmlFor="supervision" className="text-xs text-gray-400">
                On supervised release / probation at time of offense
                <span className="text-gray-600 ml-1">(+2 pts to crim. history)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Step 4 — Offense */}
      <div>
        <StepHeader num={4} title="Offense" open={openSteps.includes(3)} onToggle={() => toggleStep(3)} />
        {openSteps.includes(3) && (
          <div className="mt-2 space-y-3 px-1">
            <div>
              <FieldLabel>Offense Category</FieldLabel>
              <Select
                value={profile.offense}
                onChange={v => set('offense', v)}
                options={OFFENSES}
              />
            </div>

            {/* Drug quantity sub-field */}
            {profile.offense === 'drug' && (
              <div>
                <FieldLabel>Drug Quantity</FieldLabel>
                <Select
                  value={profile.drugQuantity}
                  onChange={v => set('drugQuantity', v)}
                  options={DRUG_QUANTITIES}
                />
                {showDrugLargeCallout && (
                  <div className="mt-2">
                    <Callout {...CALLOUTS.drugLarge} />
                  </div>
                )}
              </div>
            )}

            {/* Fraud amount sub-field */}
            {profile.offense === 'fraud' && (
              <div>
                <FieldLabel>Loss Amount</FieldLabel>
                <Select
                  value={profile.fraudAmount}
                  onChange={v => set('fraudAmount', v)}
                  options={FRAUD_AMOUNTS}
                />
              </div>
            )}

            {/* Aggravating factors */}
            <div>
              <FieldLabel>Factors</FieldLabel>
              <div className="space-y-1.5">
                {AGG_FACTORS.map(f => {
                  const checked = (profile.aggravatingFactors || []).includes(f.value);
                  return (
                    <label key={f.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFactor(f.value)}
                        className="accent-orange-500"
                      />
                      <span className={`text-xs ${
                        f.value === 'accepted_resp'
                          ? 'text-green-400'
                          : 'text-gray-400 group-hover:text-gray-200'
                      }`}>
                        {f.label}
                        {f.value === 'accepted_resp' && (
                          <span className="text-gray-600 ml-1">(downward departure)</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              {showAcceptCallout && (
                <div className="mt-2">
                  <Callout {...CALLOUTS.acceptedResponsibility} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
