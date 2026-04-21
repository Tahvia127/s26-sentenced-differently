"""
Regression pipeline for the Sentenced Differently project.

Models (all on CORE sample — immigration excluded):
  Model 1: log(sentence) ~ race + sex + age                         [baseline]
  Model 2: Model1 + offense_level + crim_hist + guideline_min
                  + mand_min + guilty_plea + accept_resp            [legal controls]
  Model 3: Model2 + race x sex interaction                          [interaction]
  Model 4: Model3 + district FE + fiscal-year FE                   [full spec]

  Logistic: P(incarcerated) ~ race + sex + age + legal controls + FE

  Subgroup: Model 4 run separately for Drug Trafficking, Firearms,
            Fraud/Economic, Immigration subgroups.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from statsmodels.regression.linear_model import RegressionResultsWrapper

OUTPUT_DIR = Path("output/tables")

# ── Analysis sample preparation ───────────────────────────────────────

CORE_VARS = [
    "LOG_SENTENCE", "RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER",
    "FEMALE", "AGE", "XFOLSOR", "XCRHISSR", "XMINSOR", "MAND_MIN",
    "GUILTY_PLEA", "ACCEPT_RESP", "DISTRICT", "FISCALYR",
    "IS_IMMIGRATION", "OFFENSE_GROUP", "INCARCERATED",
]


def prep_sample(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split into core sample (no immigration) and immigration subgroup.
    Drops rows missing any key regression variable from core sample.
    Returns (core_df, immigration_df).
    """
    # Core sample: exclude immigration cases
    core = df[~df["IS_IMMIGRATION"]].copy()

    # Drop rows missing essential regression variables
    essential = ["LOG_SENTENCE", "XFOLSOR", "XCRHISSR", "AGE"]
    before = len(core)
    core = core.dropna(subset=essential)
    print(f"Core sample: {before:,} → {len(core):,} after dropping missing essentials")

    # Fill remaining minor missingness with column means (ACCEPT_RESP, GUILTY_PLEA)
    for col in ["GUILTY_PLEA", "ACCEPT_RESP", "MAND_MIN"]:
        if col in core.columns:
            core[col] = core[col].fillna(core[col].mean())

    # Immigration subgroup
    imm = df[df["IS_IMMIGRATION"]].copy()
    imm = imm.dropna(subset=essential)
    print(f"Immigration sample: {len(imm):,}")

    return core, imm


# ── Formula builders ──────────────────────────────────────────────────

def _race_sex_terms() -> str:
    return "RACE_BLACK + RACE_HISPANIC + RACE_OTHER + FEMALE"


def _legal_controls() -> str:
    return "XFOLSOR + XCRHISSR + XMINSOR + MAND_MIN + GUILTY_PLEA + ACCEPT_RESP"


def _fe_terms() -> str:
    return "C(DISTRICT) + C(FISCALYR)"


# ── OLS models ────────────────────────────────────────────────────────

def run_model1(df: pd.DataFrame) -> RegressionResultsWrapper:
    """Baseline: log(sentence) ~ race + sex + age."""
    formula = f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE"
    return smf.ols(formula, data=df).fit(cov_type="HC1")


def run_model2(df: pd.DataFrame) -> RegressionResultsWrapper:
    """Add legal controls."""
    formula = f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
    return smf.ols(formula, data=df).fit(cov_type="HC1")


def run_model3(df: pd.DataFrame) -> RegressionResultsWrapper:
    """Add race x sex interaction."""
    formula = (
        f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        " + RACE_BLACK:FEMALE + RACE_HISPANIC:FEMALE + RACE_OTHER:FEMALE"
    )
    return smf.ols(formula, data=df).fit(cov_type="HC1")


def run_model4(df: pd.DataFrame) -> RegressionResultsWrapper:
    """Full specification: Model 3 + district FE + year FE."""
    formula = (
        f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        " + RACE_BLACK:FEMALE + RACE_HISPANIC:FEMALE + RACE_OTHER:FEMALE"
        f" + {_fe_terms()}"
    )
    return smf.ols(formula, data=df).fit(cov_type="HC1")


# ── Logistic regression: incarceration decision ───────────────────────

def run_logit(df: pd.DataFrame) -> object:
    """P(incarcerated=1) ~ race + sex + age + legal controls + FE."""
    data = df.copy()
    # Ensure INCARCERATED is numeric int (bool/object breaks statsmodels logit)
    data["INCARCERATED"] = data["INCARCERATED"].astype(int)
    formula = (
        f"INCARCERATED ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        f" + {_fe_terms()}"
    )
    return smf.logit(formula, data=data).fit(disp=0)


# ── Subgroup regressions ──────────────────────────────────────────────

SUBGROUPS = {
    "Drug Trafficking": "Drug Trafficking",
    "Firearms":         "Firearms",
    "Fraud/Economic":   "Fraud/Economic",
    "Immigration":      None,   # uses immigration df
}


def run_subgroup_models(core: pd.DataFrame,
                        imm: pd.DataFrame) -> dict[str, RegressionResultsWrapper]:
    """
    Run Model 4 specification within each offense subgroup.
    Returns dict of {subgroup_name: fitted_model}.
    """
    results = {}
    for label, group_val in SUBGROUPS.items():
        if group_val is None:
            sub = imm
        else:
            sub = core[core["OFFENSE_GROUP"] == group_val]

        if len(sub) < 100:
            print(f"  [skip] {label}: only {len(sub)} rows")
            continue

        print(f"  {label}: N={len(sub):,}")
        try:
            formula = (
                f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
                " + RACE_BLACK:FEMALE + RACE_HISPANIC:FEMALE + RACE_OTHER:FEMALE"
                f" + {_fe_terms()}"
            )
            results[label] = smf.ols(formula, data=sub).fit(cov_type="HC1")
        except Exception as e:
            print(f"  [error] {label}: {e}")
    return results


# ── Coefficient extraction ─────────────────────────────────────────────

KEY_COEFS = [
    "RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE",
    "RACE_BLACK:FEMALE", "RACE_HISPANIC:FEMALE", "RACE_OTHER:FEMALE",
    "AGE", "XFOLSOR", "XCRHISSR", "XMINSOR", "MAND_MIN",
    "GUILTY_PLEA", "ACCEPT_RESP",
]


def extract_coefs(result, label: str = "") -> pd.DataFrame:
    """
    Extract coefficients, SEs, t-stats, p-values, and 95% CIs
    for KEY_COEFS that appear in the model.
    """
    params   = result.params
    bse      = result.bse
    tvalues  = result.tvalues
    pvalues  = result.pvalues
    ci       = result.conf_int()

    rows = []
    for var in KEY_COEFS:
        if var in params.index:
            rows.append({
                "Variable":    var,
                "Coef":        round(params[var], 4),
                "SE":          round(bse[var], 4),
                "t":           round(tvalues[var], 3),
                "p-value":     round(pvalues[var], 4),
                "CI_low":      round(ci.loc[var, 0], 4),
                "CI_high":     round(ci.loc[var, 1], 4),
                "Sig":         _sig_stars(pvalues[var]),
            })

    df_out = pd.DataFrame(rows)
    if label:
        df_out.insert(0, "Model", label)
    return df_out


def _sig_stars(p: float) -> str:
    if p < 0.001: return "***"
    if p < 0.01:  return "**"
    if p < 0.05:  return "*"
    if p < 0.10:  return "."
    return ""


# ── Model comparison table ────────────────────────────────────────────

def model_comparison_table(models: dict[str, RegressionResultsWrapper],
                            focus_vars: list[str] | None = None) -> pd.DataFrame:
    """
    Wide-format table: rows = variables, columns = models.
    Each cell shows  coef (SE) with significance stars.
    """
    if focus_vars is None:
        focus_vars = ["RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE",
                      "RACE_BLACK:FEMALE", "RACE_HISPANIC:FEMALE"]

    rows = []
    for var in focus_vars:
        row = {"Variable": var}
        for name, res in models.items():
            if var in res.params.index:
                c = res.params[var]
                se = res.bse[var]
                p  = res.pvalues[var]
                row[name] = f"{c:.3f}{_sig_stars(p)}\n({se:.3f})"
            else:
                row[name] = "—"
        rows.append(row)

    # Footer rows: R², N
    row_r2 = {"Variable": "R²"}
    row_n  = {"Variable": "N"}
    for name, res in models.items():
        row_r2[name] = f"{res.rsquared:.4f}"
        row_n[name]  = f"{int(res.nobs):,}"
    rows.extend([row_r2, row_n])

    return pd.DataFrame(rows).set_index("Variable")


# ── Percent-change conversion ─────────────────────────────────────────

def pct_effect(coef: float) -> float:
    """Convert log-scale coefficient to approximate % change in sentence."""
    return round((np.exp(coef) - 1) * 100, 2)


# ── Full pipeline ─────────────────────────────────────────────────────

def run_all(df: pd.DataFrame,
            save: bool = False) -> dict:
    """
    Run complete regression pipeline. Returns dict of results.
    """
    print("\n" + "="*60)
    print("  REGRESSION PIPELINE — Sentenced Differently")
    print("="*60)

    core, imm = prep_sample(df)

    # OLS models
    print("\n── Running OLS Models 1-4 (core sample) ──")
    m1 = run_model1(core);  print(f"  Model 1: R²={m1.rsquared:.4f}, N={int(m1.nobs):,}")
    m2 = run_model2(core);  print(f"  Model 2: R²={m2.rsquared:.4f}, N={int(m2.nobs):,}")
    m3 = run_model3(core);  print(f"  Model 3: R²={m3.rsquared:.4f}, N={int(m3.nobs):,}")
    m4 = run_model4(core);  print(f"  Model 4: R²={m4.rsquared:.4f}, N={int(m4.nobs):,}")

    models = {"Model 1": m1, "Model 2": m2, "Model 3": m3, "Model 4": m4}

    # Logistic
    print("\n── Running Logistic Regression (incarceration) ──")
    logit = run_logit(core)

    # Subgroup
    print("\n── Running Subgroup Models ──")
    subgroup_models = run_subgroup_models(core, imm)

    # Coefficient tables
    coef_tables = {name: extract_coefs(res, name)
                   for name, res in models.items()}
    comparison  = model_comparison_table(models)

    subgroup_coefs = {name: extract_coefs(res, name)
                      for name, res in subgroup_models.items()}

    # % effects from Model 4
    print("\n── Key Effects (Model 4, % sentence difference) ──")
    for var in ["RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE"]:
        if var in m4.params.index:
            pct = pct_effect(m4.params[var])
            p   = m4.pvalues[var]
            print(f"  {var:20s}: {pct:+.1f}%  p={p:.4f}  {_sig_stars(p)}")

    results = {
        "core": core, "imm": imm,
        "models": models, "logit": logit,
        "subgroup_models": subgroup_models,
        "coef_tables": coef_tables,
        "comparison": comparison,
        "subgroup_coefs": subgroup_coefs,
    }

    if save:
        _save_outputs(results)

    return results


def _save_outputs(results: dict):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Model comparison
    results["comparison"].to_csv(OUTPUT_DIR / "model_comparison.csv")

    # Per-model coefficient tables
    for name, tbl in results["coef_tables"].items():
        fname = name.lower().replace(" ", "_")
        tbl.to_csv(OUTPUT_DIR / f"coefs_{fname}.csv", index=False)

    # Subgroup coefficient tables
    for name, tbl in results["subgroup_coefs"].items():
        fname = name.lower().replace("/", "_").replace(" ", "_")
        tbl.to_csv(OUTPUT_DIR / f"coefs_subgroup_{fname}.csv", index=False)

    # Logistic regression odds ratios
    logit = results["logit"]
    or_df = pd.DataFrame({
        "Variable": logit.params.index,
        "Log-Odds": logit.params.values.round(4),
        "Odds Ratio": np.exp(logit.params.values).round(4),
        "SE": logit.bse.values.round(4),
        "p-value": logit.pvalues.values.round(4),
    })
    # Keep only key vars
    key = ["RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE",
           "AGE", "XFOLSOR", "XCRHISSR", "MAND_MIN", "GUILTY_PLEA", "ACCEPT_RESP"]
    or_df = or_df[or_df["Variable"].isin(key)]
    or_df.to_csv(OUTPUT_DIR / "logit_odds_ratios.csv", index=False)

    print(f"\nRegression tables saved to {OUTPUT_DIR}/")
