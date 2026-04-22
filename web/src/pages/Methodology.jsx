/**
 * Methodology.jsx
 * Describes the statistical models, two-stage pipeline, VIF, findings.
 */

import React, { useState } from 'react';

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        fontSize: 10, padding: '6px 16px', cursor: 'pointer', outline: 'none',
        fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        background: active ? '#E8621A' : 'transparent',
        color: active ? '#FFF' : '#666688',
        border: `1px solid ${active ? '#E8621A' : '#2A2A3F'}`,
        borderRadius: 5,
      }}>
      {label}
    </button>
  );
}

function CodeBlock({ children }) {
  return (
    <pre style={{
      background: '#080810', border: '1px solid #1E1E2E', borderRadius: 8,
      padding: '14px 16px', fontSize: 11, color: '#888', fontFamily: 'monospace',
      overflowX: 'auto', lineHeight: 1.7, marginBottom: 16,
    }}>
      {children}
    </pre>
  );
}

function Finding({ stat, label, detail, color = '#E8621A' }) {
  return (
    <div style={{ background: '#12121C', border: `1px solid #1E1E2E`, borderRadius: 10, padding: '16px 20px', borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'monospace', color }}>{stat}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#D0D0E8', marginTop: 4 }}>{label}</div>
      {detail && <p style={{ fontSize: 11, color: '#666688', lineHeight: 1.6, marginTop: 6 }}>{detail}</p>}
    </div>
  );
}

const MODELS = [
  {
    id: 'model1',
    label: 'Model 1 — Bivariate',
    desc: 'Baseline: sentence length regressed on race and sex only. No controls.',
    formula: 'log(sentence) ~ RACE + FEMALE',
    r2: '0.04',
    n: '176,494',
    note: 'Captures raw disparity, but confounded by offense and criminal history composition.',
  },
  {
    id: 'model2',
    label: 'Model 2 — + Demographics',
    desc: 'Adds age, education, income, and citizenship status.',
    formula: 'log(sentence) ~ RACE + FEMALE + AGE + EDUCATION + INCOME + CITIZENSHIP',
    r2: '0.11',
    n: '176,494',
    note: 'Demographic controls reduce the race coefficient but disparities remain.',
  },
  {
    id: 'model3',
    label: 'Model 3 — + Offense',
    desc: 'Adds offense category, drug quantity, criminal history, and mandatory minimum indicator.',
    formula: 'log(sentence) ~ RACE + FEMALE + … + OFFENSE + DRUG_QTY + CRIM_HIST + MAND_MIN',
    r2: '0.61',
    n: '176,494',
    note: 'Offense and criminal history explain most variance. Race coefficient shrinks further but remains significant.',
  },
  {
    id: 'model4',
    label: 'Model 4 — Full',
    desc: 'Adds legal representation, aggravating factors, supervision status, and judicial district FE.',
    formula: 'log(sentence) ~ RACE + FEMALE + … + REPRESENTATION + AGG_FACTORS + DISTRICT_FE',
    r2: '0.71',
    n: '176,494',
    note: 'After all controls, Black and Hispanic defendants still receive sentences 6–10% longer than comparable White defendants.',
  },
];

export default function Methodology() {
  const [activeModel, setActiveModel] = useState('model1');
  const active = MODELS.find(m => m.id === activeModel);

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>Methodology</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#E0E0F0', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          Statistical Approach
        </h1>
        <p style={{ fontSize: 14, color: '#888899', lineHeight: 1.8, maxWidth: 680, marginTop: 10 }}>
          We use a two-stage regression pipeline — first modeling the probability of incarceration,
          then modeling sentence length conditional on incarceration — to avoid survivorship bias
          in the sentence distribution.
        </p>
      </div>

      {/* ── Two-stage pipeline ── */}
      <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: '24px 28px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          Two-Stage Pipeline
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ borderLeft: '3px solid #E8621A', paddingLeft: 16 }}>
            <div style={{ fontSize: 10, color: '#E8621A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>Stage 1 — Logistic</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#D0D0E8', fontFamily: 'monospace', marginBottom: 8 }}>P(Incarcerated)</div>
            <p style={{ fontSize: 12, color: '#888899', lineHeight: 1.6 }}>
              Binary logistic regression on all 284,823 cases. Pseudo-R² = 0.24.
              Predicts which defendants are sentenced to prison vs. probation/home confinement.
            </p>
            <CodeBlock>{'logit(INCARCERATED ~ RACE + FEMALE +\n  OFFENSE + CRIM_HIST + MAND_MIN +\n  REPRESENTATION + AGE)\n\nPseudo-R² = 0.24,  N = 284,823'}</CodeBlock>
          </div>
          <div style={{ borderLeft: '3px solid #5A8ED0', paddingLeft: 16 }}>
            <div style={{ fontSize: 10, color: '#5A8ED0', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>Stage 2 — OLS</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#D0D0E8', fontFamily: 'monospace', marginBottom: 8 }}>log(Sentence | Incarcerated)</div>
            <p style={{ fontSize: 12, color: '#888899', lineHeight: 1.6 }}>
              OLS on the 176,494 incarcerated defendants. Log-transformed sentence for
              right-skew correction. Robust (HC1) standard errors.
            </p>
            <CodeBlock>{'ols(log(SENTENCE) ~ RACE + FEMALE +\n  OFFENSE + CRIM_HIST + MAND_MIN +\n  REPRESENTATION + DISTRICT_FE,\n  cov_type="HC1")\n\nR² = 0.71,  N = 176,494'}</CodeBlock>
          </div>
        </div>
      </div>

      {/* ── Model progression ── */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 12 }}>
        Model Progression
      </h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {MODELS.map(m => (
          <Tab key={m.id} label={m.id.replace('model', 'M')} active={activeModel === m.id} onClick={() => setActiveModel(m.id)} />
        ))}
      </div>
      {active && (
        <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 10, padding: '20px 24px', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#E8621A', fontFamily: 'monospace', marginBottom: 6 }}>{active.label}</div>
          <p style={{ fontSize: 13, color: '#888899', lineHeight: 1.6, marginBottom: 14 }}>{active.desc}</p>
          <CodeBlock>{active.formula}</CodeBlock>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <span style={{ fontSize: 9, color: '#444460', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>R²</span>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: '#E8621A' }}>{active.r2}</div>
            </div>
            <div>
              <span style={{ fontSize: 9, color: '#444460', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>N (incarcerated)</span>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: '#5A8ED0' }}>{active.n}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#CC8844', borderLeft: '2px solid #CC8844', paddingLeft: 10 }}>
            {active.note}
          </div>
        </div>
      )}

      {/* ── Mandatory minimum interactions ── */}
      <div style={{ background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 12, padding: '24px 28px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
          Mandatory Minimum Interactions
        </h2>
        <p style={{ fontSize: 13, color: '#888899', lineHeight: 1.7, marginBottom: 16 }}>
          Mandatory minimums amplify racial disparities. Black defendants subject to mandatory
          minimums receive sentences an estimated 12–18% longer than similarly-situated White
          defendants, compared to 6–8% longer without mandatory minimums.
        </p>
        <CodeBlock>{`# Model A: Race × Mandatory Minimum
log(SENTENCE) ~ RACE * MAND_MIN + controls

# Model B: Sex × Mandatory Minimum
log(SENTENCE) ~ FEMALE * MAND_MIN + controls

# Model C: Triple interaction
log(SENTENCE) ~ RACE * FEMALE * MAND_MIN + controls`}</CodeBlock>
        <div style={{ fontSize: 11, color: '#CC8844' }}>
          Interaction terms significant at p &lt; 0.001 across all three models (HC1 SEs).
        </div>
      </div>

      {/* ── Key findings ── */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E0E0F0', fontFamily: 'monospace', marginBottom: 16 }}>
        Key Regression Findings
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 40 }}>
        <Finding stat="+8–10%" label="Black defendants (vs. comparable White)" detail="Fully-adjusted coefficient on RACE_BLACK in Model 4. Robust to HC1 standard errors." color="#E8621A" />
        <Finding stat="−26%" label="Female sentence discount (vs. male)" detail="FEMALE coefficient in Model 4. Stable across all model specifications." color="#5A8ED0" />
        <Finding stat="+14%" label="Pro se defendants (vs. public defender)" detail="Defendants who represent themselves receive substantially longer sentences." color="#CC4444" />
        <Finding stat="+18%" label="Mandatory minimum × Black interaction" detail="Mandatory minimum statutes amplify racial disparity beyond the base race gap." color="#FFAA00" />
      </div>

      {/* ── VIF note ── */}
      <div style={{ background: '#0A0A14', border: '1px solid #1A1A2A', borderRadius: 10, padding: '16px 20px', fontSize: 12, color: '#666688', lineHeight: 1.7 }}>
        <strong style={{ color: '#888899', fontFamily: 'monospace' }}>Multicollinearity check:</strong> Variance Inflation Factors (VIF) were computed for all
        predictors excluding district fixed effects. All VIFs &lt; 5 (max = 3.2 for CRIM_HIST ×
        MAND_MIN). No multicollinearity concern. Cook's Distance outlier analysis: 847 cases
        (&lt;0.5%) flagged at threshold 4/N; removal does not materially change coefficients.
      </div>
    </div>
  );
}
