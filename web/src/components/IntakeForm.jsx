/**
 * IntakeForm.jsx
 * Styled as a mock "U.S. Federal Intake Processing" typewriter form.
 * All style choices are intentional to evoke official government paperwork
 * while foregrounding the humanity of the person being described.
 */

import React, { useMemo } from 'react';

// ── Typewriter field components ───────────────────────────────────────────────
const inputStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #3A3A50',
  color: '#D0D0E8',
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 12,
  padding: '2px 4px',
  outline: 'none',
  width: '100%',
};

const fieldStyle = {
  borderBottom: '1px solid #333350',
  padding: '4px 6px',
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: 11,
  color: '#8888AA',
  letterSpacing: '0.05em',
};

function FormRow({ label, children, col = 1 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: col > 1 ? `repeat(${col}, 1fr)` : '1fr', gap: 8, marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444460', marginBottom: 2 }}>
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}

function TwoCol({ a, b }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
      {a}{b}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444460', marginBottom: 2 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function TypeSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, borderBottom: '1px solid #3A3A50', cursor: 'pointer', width: '100%' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#0E0E1A' }}>{o.label}</option>
      ))}
    </select>
  );
}

function RadioRow({ name, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const val = o.value || o;
        const lbl = o.label || o;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            style={{
              fontSize: 10,
              padding: '3px 8px',
              border: `1px solid ${value === val ? '#E8621A' : '#2A2A3F'}`,
              background: value === val ? 'rgba(232,98,26,0.12)' : 'transparent',
              color: value === val ? '#E8621A' : '#888',
              borderRadius: 2,
              cursor: 'pointer',
              fontFamily: "'Courier New', monospace",
              letterSpacing: '0.05em',
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

function SectionBreak({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 8px' }}>
      <div style={{ flex: 1, height: 1, background: '#2A2A3F' }} />
      <span style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#333350', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#2A2A3F' }} />
    </div>
  );
}

// ── Options ───────────────────────────────────────────────────────────────────
const RACES = [
  { value: 'Black',    label: 'Black / African American' },
  { value: 'Hispanic', label: 'Hispanic / Latino' },
  { value: 'White',    label: 'White / Caucasian' },
  { value: 'Asian',    label: 'Asian / Pacific Islander' },
  { value: 'Native',   label: 'Native American / Alaska Native' },
  { value: 'Other',    label: 'Other / Multiracial' },
];

const EDUCATIONS = [
  { value: 'less_hs',   label: 'Less than high school' },
  { value: 'hs_ged',    label: 'High school / GED' },
  { value: 'some_col',  label: 'Some college' },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'grad',      label: 'Graduate degree' },
];

const INCOMES = [
  { value: 'under15',    label: 'Under $15,000' },
  { value: '15_35',      label: '$15,000–$35,000' },
  { value: '35_75',      label: '$35,000–$75,000' },
  { value: '75_150',     label: '$75,000–$150,000' },
  { value: 'over150',    label: 'Over $150,000' },
];

const CITIZENSHIPS = [
  { value: 'citizen',  label: 'U.S. Citizen' },
  { value: 'lpr',      label: 'Legal Permanent Resident' },
  { value: 'undoc',    label: 'Undocumented / No status' },
  { value: 'visa',     label: 'Visa holder' },
];

const REPRESENTATIONS = [
  { value: 'public_defender', label: 'Public Defender' },
  { value: 'private',         label: 'Private Attorney' },
  { value: 'pro_se',          label: 'Pro Se (Self-Represented)' },
];

const CRIM_HIST_OPTS = [
  { value: 'I',   label: 'I — No priors' },
  { value: 'II',  label: 'II — 1 prior' },
  { value: 'III', label: 'III — 2 priors' },
  { value: 'IV',  label: 'IV — 3 priors' },
  { value: 'V',   label: 'V — 4 priors' },
  { value: 'VI',  label: 'VI — 5+ priors' },
];

const OFFENSES = [
  { value: 'drug',                label: 'Drug Trafficking / Distribution' },
  { value: 'immigration_entry',   label: 'Immigration — Illegal Entry' },
  { value: 'immigration_reentry', label: 'Immigration — Illegal Reentry' },
  { value: 'firearms',            label: 'Firearms / Weapons' },
  { value: 'fraud',               label: 'Fraud / White-collar' },
  { value: 'robbery',             label: 'Robbery / Violent' },
  { value: 'sex_offense',         label: 'Sex Offense' },
  { value: 'other',               label: 'Other Federal Offense' },
];

const DRUG_QUANTITIES = [
  { value: 'small',      label: 'Small (< 100g)' },
  { value: 'medium',     label: 'Medium (100g–1kg)' },
  { value: 'large',      label: 'Large (1kg+)' },
  { value: 'very_large', label: 'Very Large (10kg+)' },
];

const FRAUD_AMOUNTS = [
  { value: 'low',  label: 'Under $95k' },
  { value: 'mid',  label: '$95k–$550k' },
  { value: 'high', label: 'Over $550k' },
];

const AGG_FACTORS = [
  { value: 'weapon',        label: 'Weapon possessed' },
  { value: 'leadership',    label: 'Leadership role' },
  { value: 'vulnerable',    label: 'Vulnerable victim' },
  { value: 'obstruction',   label: 'Obstruction of justice' },
  { value: 'accepted_resp', label: '✓ Accepted responsibility (−3)' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntakeForm({ profile, caseNumber, onChange }) {
  const set = (key, val) => onChange({ ...profile, [key]: val });

  const toggleFactor = (val) => {
    const cur = profile.aggravatingFactors || [];
    set('aggravatingFactors', cur.includes(val) ? cur.filter(f => f !== val) : [...cur, val]);
  };

  const isDrug       = profile.offense === 'drug';
  const isFraud      = profile.offense === 'fraud';

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* ── USSC letterhead ── */}
      <div style={{ borderBottom: '2px solid #3A3A50', paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: '#555570', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 2 }}>
          U.S. FEDERAL INTAKE PROCESSING
        </div>
        <div style={{ fontSize: 10, color: '#6A6A88', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>
          Sentenced Differently — Interactive Case File
        </div>
        <div style={{ fontSize: 8, color: '#444460', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Fiscal Year 2024 &nbsp;|&nbsp; U.S. Sentencing Commission Data
        </div>
      </div>

      {/* Case number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'baseline' }}>
        <span style={{ fontSize: 9, color: '#444460', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Case No.</span>
        <span style={{ fontSize: 12, color: '#E8621A', fontWeight: 700, letterSpacing: '0.1em' }}>{caseNumber}</span>
      </div>

      {/* ── SECTION A: Physical ── */}
      <SectionBreak label="Section A — Demographics" />

      <TwoCol
        a={<Field label="Sex"><RadioRow value={profile.sex} onChange={v => set('sex', v)} options={['Male', 'Female']} /></Field>}
        b={<Field label="Race / Ethnicity"><TypeSelect value={profile.race} onChange={v => set('race', v)} options={RACES} /></Field>}
      />

      <FormRow label={`Age  [${profile.age}]`}>
        <input type="range" min="18" max="65" value={profile.age}
          onChange={e => set('age', parseInt(e.target.value))}
          style={{ width:'100%', accentColor:'#E8621A', cursor:'pointer' }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'#444460', marginTop:2 }}>
          <span>18</span><span>45</span><span>65</span>
        </div>
      </FormRow>

      <TwoCol
        a={<Field label="Education"><TypeSelect value={profile.education} onChange={v => set('education', v)} options={EDUCATIONS} /></Field>}
        b={<Field label="Income at offense"><TypeSelect value={profile.income} onChange={v => set('income', v)} options={INCOMES} /></Field>}
      />

      <TwoCol
        a={<Field label="Citizenship"><TypeSelect value={profile.citizenship} onChange={v => set('citizenship', v)} options={CITIZENSHIPS} /></Field>}
        b={<Field label="Legal Representation"><TypeSelect value={profile.representation} onChange={v => set('representation', v)} options={REPRESENTATIONS} /></Field>}
      />

      {profile.representation === 'public_defender' && (
        <div style={{ fontSize:9, color:'#CC8844', borderLeft:'2px solid #CC8844', paddingLeft:6, marginBottom:8 }}>
          Public defenders carry avg. 150+ cases/yr vs 60 for private attorneys.
        </div>
      )}
      {profile.representation === 'pro_se' && (
        <div style={{ fontSize:9, color:'#CC8844', borderLeft:'2px solid #CC8844', paddingLeft:6, marginBottom:8 }}>
          Pro se defendants are convicted at higher rates in federal court.
        </div>
      )}

      {/* ── SECTION B: Criminal History ── */}
      <SectionBreak label="Section B — Criminal History" />

      <FormRow label="USSC Criminal History Category">
        <TypeSelect value={profile.crimHistory} onChange={v => set('crimHistory', v)} options={CRIM_HIST_OPTS} />
      </FormRow>

      <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'#8888AA', cursor:'pointer', marginBottom:8 }}>
        <input type="checkbox" checked={profile.onSupervision}
          onChange={e => set('onSupervision', e.target.checked)}
          style={{ accentColor:'#E8621A', cursor:'pointer' }}
        />
        On supervised release at time of offense (+2 criminal history points)
      </label>

      {/* ── SECTION C: Offense ── */}
      <SectionBreak label="Section C — Offense of Conviction" />

      <FormRow label="Primary Offense Category">
        <TypeSelect value={profile.offense} onChange={v => set('offense', v)} options={OFFENSES} />
      </FormRow>

      {isDrug && (
        <FormRow label="Drug Quantity (equiv.)">
          <TypeSelect value={profile.drugQuantity} onChange={v => set('drugQuantity', v)} options={DRUG_QUANTITIES} />
        </FormRow>
      )}
      {isDrug && (profile.drugQuantity === 'large' || profile.drugQuantity === 'very_large') && (
        <div style={{ fontSize:9, color:'#CC4444', borderLeft:'2px solid #CC4444', paddingLeft:6, marginBottom:8 }}>
          ⚠ Mandatory minimum applies. Judge cannot sentence below the statutory floor.
        </div>
      )}
      {isFraud && (
        <FormRow label="Loss Amount">
          <TypeSelect value={profile.fraudAmount} onChange={v => set('fraudAmount', v)} options={FRAUD_AMOUNTS} />
        </FormRow>
      )}

      <FormRow label="Offense Factors (select all that apply)">
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {AGG_FACTORS.map(f => (
            <label key={f.value} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:10,
              color: f.value === 'accepted_resp' ? '#44CC88' : '#8888AA' }}>
              <input type="checkbox"
                checked={(profile.aggravatingFactors||[]).includes(f.value)}
                onChange={() => toggleFactor(f.value)}
                style={{ accentColor: f.value === 'accepted_resp' ? '#44CC88' : '#E8621A', cursor:'pointer' }}
              />
              {f.label}
              {f.value === 'accepted_resp' && (
                <span style={{ fontSize:8, color:'#33AA66' }}>applied in ~97% of cases</span>
              )}
            </label>
          ))}
        </div>
      </FormRow>

    </div>
  );
}
