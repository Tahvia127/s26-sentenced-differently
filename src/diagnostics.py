"""
Model diagnostics for the Sentenced Differently project.

Provides:
  - Variance Inflation Factor (VIF) for multicollinearity checks
  - Cook's Distance for influential observation detection
  - Residual diagnostic plots (residuals vs fitted, Q-Q, scale-location,
    leverage/Cook's)
  - Two-stage (Heckman-style) analysis helpers:
      Stage 1: Logit — P(incarcerated)
      Stage 2: OLS   — log(sentence) | incarcerated == 1
  - Mandatory minimum interaction models
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
import pandas as pd
import scipy.stats as stats
import statsmodels.formula.api as smf
from statsmodels.stats.outliers_influence import variance_inflation_factor

FIG_DIR = Path("output/figures")
TABLE_DIR = Path("output/tables")


# ══════════════════════════════════════════════════════════════════════
# VIF
# ══════════════════════════════════════════════════════════════════════

def compute_vif(df: pd.DataFrame,
                predictors: list[str]) -> pd.DataFrame:
    """
    Compute VIF for a list of predictor column names.

    Skips columns with zero variance or all-NaN after dropping missing.
    Returns a DataFrame with columns [Variable, VIF].
    """
    sub = df[predictors].dropna()

    # Drop zero-variance columns (FE dummies, etc.)
    sub = sub.loc[:, sub.nunique() > 1]
    valid_preds = sub.columns.tolist()

    X = sub.values
    records = []
    for i, col in enumerate(valid_preds):
        try:
            vif_val = variance_inflation_factor(X, i)
        except Exception:
            vif_val = float("nan")
        records.append({"Variable": col, "VIF": round(vif_val, 2)})

    return pd.DataFrame(records).sort_values("VIF", ascending=False)


def vif_table(df: pd.DataFrame, save: bool = False) -> pd.DataFrame:
    """
    Compute VIF for the Model 4 predictor set (no FE — those inflate VIF
    trivially and obscure the variables of interest).
    """
    predictors = [
        "RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE", "AGE",
        "XFOLSOR", "XCRHISSR", "XMINSOR", "MAND_MIN",
        "GUILTY_PLEA", "ACCEPT_RESP",
    ]
    avail = [p for p in predictors if p in df.columns]
    tbl = compute_vif(df, avail)
    tbl["Concern"] = tbl["VIF"].apply(
        lambda v: "HIGH (>10)" if v > 10 else ("Moderate (5-10)" if v > 5 else "OK")
    )
    if save:
        TABLE_DIR.mkdir(parents=True, exist_ok=True)
        tbl.to_csv(TABLE_DIR / "vif_table.csv", index=False)
        print(f"VIF table saved → {TABLE_DIR}/vif_table.csv")
    return tbl


# ══════════════════════════════════════════════════════════════════════
# Cook's Distance
# ══════════════════════════════════════════════════════════════════════

def cooks_distance(result) -> pd.Series:
    """
    Compute Cook's Distance from a fitted OLS result.
    Returns a Series indexed the same as the model data.
    """
    influence = result.get_influence()
    cd, _ = influence.cooks_distance
    return pd.Series(cd, name="CooksD")


def flag_influential(result,
                     threshold: float | None = None) -> pd.DataFrame:
    """
    Return observations with Cook's D above threshold.
    Default threshold: 4 / N  (commonly used rule of thumb).
    """
    cd = cooks_distance(result)
    n = len(cd)
    if threshold is None:
        threshold = 4.0 / n
    flagged = cd[cd > threshold].reset_index()
    flagged.columns = ["obs_index", "CooksD"]
    flagged["threshold"] = threshold
    print(f"  Influential observations (Cook's D > {threshold:.5f}): {len(flagged):,} "
          f"of {n:,} ({100*len(flagged)/n:.1f}%)")
    return flagged


# ══════════════════════════════════════════════════════════════════════
# Residual diagnostic plots
# ══════════════════════════════════════════════════════════════════════

def residual_plots(result, title: str = "Model 4", save: bool = False):
    """
    Four-panel residual diagnostic figure:
      1. Residuals vs Fitted
      2. Normal Q-Q
      3. Scale-Location (sqrt |standardized residuals| vs fitted)
      4. Residuals vs Leverage (with Cook's D contours)
    """
    fitted    = result.fittedvalues
    residuals = result.resid
    influence = result.get_influence()
    std_resid = influence.resid_studentized_internal
    leverage  = influence.hat_matrix_diag
    cd, _     = influence.cooks_distance

    fig = plt.figure(figsize=(14, 10))
    gs  = gridspec.GridSpec(2, 2, figure=fig, hspace=0.35, wspace=0.3)

    # ── 1. Residuals vs Fitted ────────────────────────────────────────
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.scatter(fitted, residuals, alpha=0.15, s=6, color="#4C72B0")
    ax1.axhline(0, color="red", lw=1.2, ls="--")
    _lowess_line(ax1, fitted, residuals)
    ax1.set_xlabel("Fitted values")
    ax1.set_ylabel("Residuals")
    ax1.set_title("Residuals vs Fitted")

    # ── 2. Normal Q-Q ─────────────────────────────────────────────────
    ax2 = fig.add_subplot(gs[0, 1])
    (osm, osr), (slope, intercept, _) = stats.probplot(std_resid, dist="norm")
    ax2.scatter(osm, osr, alpha=0.15, s=6, color="#4C72B0")
    ax2.plot(osm, slope * np.array(osm) + intercept, color="red", lw=1.2)
    ax2.set_xlabel("Theoretical quantiles")
    ax2.set_ylabel("Standardized residuals")
    ax2.set_title("Normal Q-Q")

    # ── 3. Scale-Location ─────────────────────────────────────────────
    ax3 = fig.add_subplot(gs[1, 0])
    sqrt_abs_std = np.sqrt(np.abs(std_resid))
    ax3.scatter(fitted, sqrt_abs_std, alpha=0.15, s=6, color="#4C72B0")
    _lowess_line(ax3, fitted, sqrt_abs_std)
    ax3.set_xlabel("Fitted values")
    ax3.set_ylabel("√|Standardized residuals|")
    ax3.set_title("Scale-Location")

    # ── 4. Residuals vs Leverage ──────────────────────────────────────
    ax4 = fig.add_subplot(gs[1, 1])
    ax4.scatter(leverage, std_resid, alpha=0.15, s=6, color="#4C72B0")
    ax4.axhline(0, color="grey", lw=0.8, ls="--")
    # Cook's D contour lines (0.5, 1.0)
    _cooks_contour(ax4, leverage, result)
    ax4.set_xlabel("Leverage")
    ax4.set_ylabel("Standardized residuals")
    ax4.set_title("Residuals vs Leverage")

    fig.suptitle(f"Regression Diagnostics — {title}", fontsize=13, y=1.01)

    if save:
        FIG_DIR.mkdir(parents=True, exist_ok=True)
        fname = "diagnostics_" + title.lower().replace(" ", "_") + ".png"
        fig.savefig(FIG_DIR / fname, dpi=180, bbox_inches="tight")
        print(f"Diagnostic plot saved → {FIG_DIR}/{fname}")
    plt.tight_layout()
    return fig


def _lowess_line(ax, x, y, frac=0.2):
    """Add a LOWESS smoothed line to ax (simple numpy-based for speed)."""
    try:
        from statsmodels.nonparametric.smoothers_lowess import lowess
        # Subsample for speed on large datasets
        n = len(x)
        if n > 5000:
            idx = np.random.default_rng(0).choice(n, 5000, replace=False)
            xs, ys = np.array(x)[idx], np.array(y)[idx]
        else:
            xs, ys = np.array(x), np.array(y)
        smooth = lowess(ys, xs, frac=frac, return_sorted=True)
        ax.plot(smooth[:, 0], smooth[:, 1], color="red", lw=1.5)
    except Exception:
        pass


def _cooks_contour(ax, leverage, result, levels=(0.5, 1.0)):
    """Draw Cook's D = level contour curves on a leverage plot."""
    p = result.df_model + 1   # number of parameters
    n = int(result.nobs)
    lev_range = np.linspace(1e-6, max(leverage) * 1.05, 200)
    for level in levels:
        # Cook's D ≈ std_resid^2 * leverage / (p * (1-leverage)^2) = level
        # → std_resid = sqrt(level * p * (1-leverage)^2 / leverage)
        with np.errstate(divide="ignore", invalid="ignore"):
            sr = np.sqrt(np.abs(level * p * (1 - lev_range) ** 2 / lev_range))
        ax.plot(lev_range,  sr, color="red", lw=0.8, ls="--", alpha=0.7)
        ax.plot(lev_range, -sr, color="red", lw=0.8, ls="--", alpha=0.7)
        # Label
        valid = ~np.isnan(sr) & ~np.isinf(sr)
        if valid.any():
            xi = lev_range[valid][-1]
            yi = sr[valid][-1]
            ax.annotate(f"Cook's D={level}", xy=(xi, yi),
                        fontsize=7, color="red", ha="right")


# ══════════════════════════════════════════════════════════════════════
# Two-Stage Analysis
# ══════════════════════════════════════════════════════════════════════

def _race_sex_terms() -> str:
    return "RACE_BLACK + RACE_HISPANIC + RACE_OTHER + FEMALE"


def _legal_controls() -> str:
    return "XFOLSOR + XCRHISSR + XMINSOR + MAND_MIN + GUILTY_PLEA + ACCEPT_RESP"


def _fe_terms() -> str:
    return "C(DISTRICT) + C(FISCALYR)"


def run_twostage(df: pd.DataFrame) -> dict:
    """
    Two-stage analysis of sentencing disparities.

    Stage 1: Logistic regression — P(incarcerated=1) on full sample.
    Stage 2: OLS on log(sentence) — restricted to incarcerated cases only,
             with the same covariates + FE.

    Returns dict with keys: stage1, stage2, stage1_or, stage2_coefs.
    """
    print("── Two-Stage Analysis ──")

    # Stage 1: Incarceration decision
    data = df.copy()
    data["INCARCERATED"] = data["INCARCERATED"].astype(int)
    formula1 = (
        f"INCARCERATED ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        f" + {_fe_terms()}"
    )
    print("  Stage 1: logit (full sample) …")
    stage1 = smf.logit(formula1, data=data).fit(disp=0)
    print(f"  Stage 1: N={int(stage1.nobs):,}, "
          f"pseudo-R²={stage1.prsquared:.4f}")

    # Odds ratios table for key vars
    key_vars = ["RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE",
                "AGE", "XFOLSOR", "XCRHISSR", "MAND_MIN",
                "GUILTY_PLEA", "ACCEPT_RESP"]
    or_rows = []
    for v in key_vars:
        if v in stage1.params.index:
            coef = stage1.params[v]
            se   = stage1.bse[v]
            pval = stage1.pvalues[v]
            or_rows.append({
                "Variable": v,
                "Log-Odds": round(coef, 4),
                "Odds Ratio": round(np.exp(coef), 4),
                "SE": round(se, 4),
                "p-value": round(pval, 4),
                "Sig": _sig_stars(pval),
            })
    stage1_or = pd.DataFrame(or_rows)

    # Stage 2: Sentence length | incarcerated
    incarcerated = df[df["INCARCERATED"] == 1].copy()
    print(f"  Stage 2: OLS on incarcerated cases (N={len(incarcerated):,}) …")
    formula2 = (
        f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        " + RACE_BLACK:FEMALE + RACE_HISPANIC:FEMALE + RACE_OTHER:FEMALE"
        f" + {_fe_terms()}"
    )
    stage2 = smf.ols(formula2, data=incarcerated).fit(cov_type="HC1")
    print(f"  Stage 2: R²={stage2.rsquared:.4f}, N={int(stage2.nobs):,}")

    # Extract stage 2 coefficients
    from src.regression import extract_coefs
    stage2_coefs = extract_coefs(stage2, "Stage 2 (Conditional OLS)")

    return {
        "stage1":        stage1,
        "stage2":        stage2,
        "stage1_or":     stage1_or,
        "stage2_coefs":  stage2_coefs,
    }


# ══════════════════════════════════════════════════════════════════════
# Mandatory Minimum Interactions
# ══════════════════════════════════════════════════════════════════════

def run_mand_min_interactions(df: pd.DataFrame) -> dict:
    """
    Examine how mandatory minimums moderate racial sentencing disparities.

    Model A: Full spec + MAND_MIN × RACE interactions
    Model B: Full spec + MAND_MIN × FEMALE interaction
    Model C: Full spec + MAND_MIN × RACE × FEMALE (triple interaction)

    Returns dict of fitted models.
    """
    base = (
        f"LOG_SENTENCE ~ {_race_sex_terms()} + AGE + {_legal_controls()}"
        " + RACE_BLACK:FEMALE + RACE_HISPANIC:FEMALE + RACE_OTHER:FEMALE"
        f" + {_fe_terms()}"
    )

    print("── Mandatory Minimum Interaction Models ──")

    # Model A: Mand-min × race
    formula_a = (
        base + " + MAND_MIN:RACE_BLACK + MAND_MIN:RACE_HISPANIC"
               " + MAND_MIN:RACE_OTHER"
    )
    model_a = smf.ols(formula_a, data=df).fit(cov_type="HC1")
    print(f"  Model A (MandMin×Race): R²={model_a.rsquared:.4f}, "
          f"N={int(model_a.nobs):,}")

    # Model B: Mand-min × female
    formula_b = base + " + MAND_MIN:FEMALE"
    model_b = smf.ols(formula_b, data=df).fit(cov_type="HC1")
    print(f"  Model B (MandMin×Female): R²={model_b.rsquared:.4f}, "
          f"N={int(model_b.nobs):,}")

    # Model C: Triple — mand-min × race × female
    formula_c = (
        base + " + MAND_MIN:RACE_BLACK + MAND_MIN:RACE_HISPANIC"
               " + MAND_MIN:RACE_OTHER"
               " + MAND_MIN:FEMALE"
               " + MAND_MIN:RACE_BLACK:FEMALE + MAND_MIN:RACE_HISPANIC:FEMALE"
               " + MAND_MIN:RACE_OTHER:FEMALE"
    )
    model_c = smf.ols(formula_c, data=df).fit(cov_type="HC1")
    print(f"  Model C (Triple): R²={model_c.rsquared:.4f}, "
          f"N={int(model_c.nobs):,}")

    return {"Model A (MM×Race)": model_a,
            "Model B (MM×Female)": model_b,
            "Model C (Triple)": model_c}


def mand_min_coef_table(models: dict) -> pd.DataFrame:
    """
    Extract interaction coefficient table for mandatory minimum models.
    Focuses on race/sex/interaction terms + the MAND_MIN interactions.
    """
    focus = [
        "RACE_BLACK", "RACE_HISPANIC", "RACE_OTHER", "FEMALE",
        "MAND_MIN",
        "MAND_MIN:RACE_BLACK",    "MAND_MIN:RACE_HISPANIC",
        "MAND_MIN:RACE_OTHER",    "MAND_MIN:FEMALE",
        "MAND_MIN:RACE_BLACK:FEMALE", "MAND_MIN:RACE_HISPANIC:FEMALE",
        "MAND_MIN:RACE_OTHER:FEMALE",
    ]
    rows = []
    for var in focus:
        row = {"Variable": var}
        for name, res in models.items():
            if var in res.params.index:
                c  = res.params[var]
                se = res.bse[var]
                p  = res.pvalues[var]
                row[name] = f"{c:.3f}{_sig_stars(p)}\n({se:.3f})"
            else:
                row[name] = "—"
        rows.append(row)

    # Footer
    for label, key_fn in [("R²", lambda r: f"{r.rsquared:.4f}"),
                           ("N",  lambda r: f"{int(r.nobs):,}")]:
        row = {"Variable": label}
        for name, res in models.items():
            row[name] = key_fn(res)
        rows.append(row)

    return pd.DataFrame(rows).set_index("Variable")


# ══════════════════════════════════════════════════════════════════════
# Predicted margins / effect-size visualization
# ══════════════════════════════════════════════════════════════════════

def plot_mand_min_margins(model_a, df: pd.DataFrame,
                          save: bool = False):
    """
    Plot predicted log-sentence by race and mand-min status
    (holding all other vars at their means).
    """
    races = {"White": (0, 0, 0),
             "Black": (1, 0, 0),
             "Hispanic": (0, 1, 0),
             "Other": (0, 0, 1)}
    means = df[["AGE", "XFOLSOR", "XCRHISSR", "XMINSOR",
                "GUILTY_PLEA", "ACCEPT_RESP"]].mean()

    # Most common district + year
    mode_dist = df["DISTRICT"].mode().iloc[0]
    mode_yr   = df["FISCALYR"].mode().iloc[0]

    records = []
    for mm in [0, 1]:
        for race_label, (rb, rh, ro) in races.items():
            row = {
                "RACE_BLACK": rb, "RACE_HISPANIC": rh, "RACE_OTHER": ro,
                "FEMALE": 0, "MAND_MIN": mm,
                "DISTRICT": mode_dist, "FISCALYR": mode_yr,
                **means.to_dict(),
                # interaction columns — statsmodels needs them
                "RACE_BLACK:FEMALE": 0, "RACE_HISPANIC:FEMALE": 0,
                "RACE_OTHER:FEMALE": 0,
            }
            pred_row = pd.DataFrame([row])
            try:
                pred_val = model_a.predict(pred_row).iloc[0]
            except Exception:
                pred_val = float("nan")
            records.append({
                "Race": race_label,
                "Mandatory Minimum": "Yes" if mm == 1 else "No",
                "Predicted log(sentence)": pred_val,
                "Predicted months": round(np.exp(pred_val), 1),
            })

    margin_df = pd.DataFrame(records)

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    colors = {"No": "#4C72B0", "Yes": "#DD8452"}
    race_order = ["White", "Black", "Hispanic", "Other"]

    for ax, ycol, ylabel in [
        (axes[0], "Predicted log(sentence)", "Predicted log(sentence)"),
        (axes[1], "Predicted months", "Predicted sentence (months)"),
    ]:
        for mm_label, color in colors.items():
            sub = margin_df[margin_df["Mandatory Minimum"] == mm_label]
            sub = sub.set_index("Race").reindex(race_order)
            ax.bar(
                [r + (0.2 if mm_label == "Yes" else -0.2) for r in range(4)],
                sub[ycol], width=0.35, label=f"Mand. Min: {mm_label}",
                color=color, alpha=0.85
            )
        ax.set_xticks(range(4))
        ax.set_xticklabels(race_order)
        ax.set_ylabel(ylabel)
        ax.set_title(f"{ylabel}\nby Race and Mandatory Minimum Status")
        ax.legend()

    fig.tight_layout()
    if save:
        FIG_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIG_DIR / "mand_min_margins.png", dpi=180,
                    bbox_inches="tight")
        print(f"Margins plot saved → {FIG_DIR}/mand_min_margins.png")
    return fig, margin_df


# ══════════════════════════════════════════════════════════════════════
# Full Week-4 pipeline
# ══════════════════════════════════════════════════════════════════════

def run_all(core: pd.DataFrame, save: bool = False) -> dict:
    """
    Run complete Week 4 diagnostic + extended analysis pipeline.

    Parameters
    ----------
    core : DataFrame
        Core sample (immigration excluded), output of regression.prep_sample().
    save : bool
        If True, save tables to output/tables/ and figures to output/figures/.

    Returns
    -------
    dict with keys: vif, cooks, twostage, mand_min_models,
                    mand_min_coefs, margins_df
    """
    print("\n" + "="*60)
    print("  WEEK 4 DIAGNOSTICS — Sentenced Differently")
    print("="*60)

    # Need Model 4 for diagnostic plots + Cook's distance
    from src.regression import run_model4
    print("\n── Re-fitting Model 4 for diagnostics ──")
    m4 = run_model4(core)
    print(f"  Model 4: R²={m4.rsquared:.4f}, N={int(m4.nobs):,}")

    # VIF
    print("\n── Variance Inflation Factors ──")
    vif = vif_table(core, save=save)
    print(vif.to_string(index=False))

    # Cook's Distance
    print("\n── Cook's Distance (Model 4) ──")
    influential = flag_influential(m4)

    # Residual diagnostic plots
    print("\n── Residual Diagnostic Plots ──")
    diag_fig = residual_plots(m4, title="Model 4", save=save)

    # Two-stage analysis
    print("\n── Two-Stage Analysis ──")
    twostage = run_twostage(core)
    print("\n  Stage 1 Odds Ratios (key variables):")
    print(twostage["stage1_or"].to_string(index=False))
    print("\n  Stage 2 Key Coefficients:")
    print(twostage["stage2_coefs"].to_string(index=False))

    # Mandatory minimum interactions
    print("\n── Mandatory Minimum Interactions ──")
    mm_models = run_mand_min_interactions(core)
    mm_coefs  = mand_min_coef_table(mm_models)
    print("\n  Interaction coefficient table:")
    print(mm_coefs.to_string())

    # Predicted margins plot
    print("\n── Predicted Margins (Mand. Min × Race) ──")
    margins_fig, margins_df = plot_mand_min_margins(
        mm_models["Model A (MM×Race)"], core, save=save
    )
    print(margins_df.to_string(index=False))

    # Save tables
    if save:
        TABLE_DIR.mkdir(parents=True, exist_ok=True)
        twostage["stage1_or"].to_csv(
            TABLE_DIR / "twostage_stage1_odds_ratios.csv", index=False)
        twostage["stage2_coefs"].to_csv(
            TABLE_DIR / "twostage_stage2_coefs.csv", index=False)
        mm_coefs.to_csv(TABLE_DIR / "mand_min_interactions.csv")
        influential.to_csv(TABLE_DIR / "influential_obs.csv", index=False)
        margins_df.to_csv(TABLE_DIR / "mand_min_margins.csv", index=False)
        print(f"\nWeek 4 tables saved → {TABLE_DIR}/")

    return {
        "m4":              m4,
        "vif":             vif,
        "influential":     influential,
        "diag_fig":        diag_fig,
        "twostage":        twostage,
        "mand_min_models": mm_models,
        "mand_min_coefs":  mm_coefs,
        "margins_fig":     margins_fig,
        "margins_df":      margins_df,
    }


def _sig_stars(p: float) -> str:
    if p < 0.001: return "***"
    if p < 0.01:  return "**"
    if p < 0.05:  return "*"
    if p < 0.10:  return "."
    return ""
