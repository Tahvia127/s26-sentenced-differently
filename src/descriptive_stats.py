"""
Descriptive statistics and preliminary statistical tests for the
Sentenced Differently project.

Computes:
  1. Mean / median sentence length by race, by gender, by race x gender
  2. Mean / median sentence length by offense category
  3. Sample sizes for each demographic group and subgroup
  4. Distribution shape metrics (skewness, justification for log-transform)
  5. ANOVA on sentence length by race
  6. Kruskal-Wallis (non-parametric) on sentence length by race
  7. Chi-square on incarceration decision (prison vs. probation) by race & gender
  8. Summary statistics table formatted for the report

Usage:
    from src.descriptive_stats import run_all
    results = run_all(df)           # returns dict of DataFrames / test results
    run_all(df, save=True)          # also writes tables to output/tables/
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

TABLE_DIR = Path("output/tables")


# ═══════════════════════════════════════════════════════════════════════
# 1-3  Sentence length by demographics + sample sizes
# ═══════════════════════════════════════════════════════════════════════

def _group_stats(df: pd.DataFrame, groupby: str | list[str],
                 value: str = "SENTENCE_MONTHS") -> pd.DataFrame:
    """Mean, median, std, N for *value* grouped by *groupby*."""
    return (
        df.groupby(groupby)[value]
        .agg(["mean", "median", "std", "count"])
        .rename(columns={"mean": "Mean", "median": "Median",
                         "std": "Std Dev", "count": "N"})
        .round(2)
    )


def sentence_by_race(df):
    return _group_stats(df, "RACE")


def sentence_by_sex(df):
    return _group_stats(df, "SEX")


def sentence_by_race_sex(df):
    return _group_stats(df, ["RACE", "SEX"])


def sentence_by_offense(df):
    return _group_stats(df, "OFFENSE_CAT")


def sample_sizes(df):
    """Cross-tabulation of race x sex counts."""
    ct = pd.crosstab(df["RACE"], df["SEX"], margins=True)
    return ct


# ═══════════════════════════════════════════════════════════════════════
# 4  Distribution shape
# ═══════════════════════════════════════════════════════════════════════

def distribution_shape(df, col: str = "SENTENCE_MONTHS"):
    """Skewness, kurtosis, and comparison with log-transformed version."""
    raw = df[col].dropna()
    raw_pos = raw[raw > 0]  # log only defined for positive values
    log_vals = np.log(raw_pos)

    shape = pd.DataFrame({
        "Metric": ["N", "Mean", "Median", "Std Dev",
                    "Skewness", "Kurtosis",
                    "Log-Skewness", "Log-Kurtosis"],
        "Value": [
            len(raw),
            round(raw.mean(), 2),
            round(raw.median(), 2),
            round(raw.std(), 2),
            round(raw.skew(), 3),
            round(raw.kurtosis(), 3),
            round(log_vals.skew(), 3),
            round(log_vals.kurtosis(), 3),
        ]
    })
    return shape


# ═══════════════════════════════════════════════════════════════════════
# 5  ANOVA – sentence length by race
# ═══════════════════════════════════════════════════════════════════════

def anova_sentence_by_race(df):
    """One-way ANOVA: sentence months ~ race."""
    groups = [g["SENTENCE_MONTHS"].dropna().values
              for _, g in df.groupby("RACE")]
    F, p = stats.f_oneway(*groups)
    return {"test": "One-way ANOVA (sentence ~ race)",
            "F-statistic": round(F, 4), "p-value": p,
            "significant_at_05": p < 0.05}


# ═══════════════════════════════════════════════════════════════════════
# 6  Kruskal-Wallis – non-parametric alternative
# ═══════════════════════════════════════════════════════════════════════

def kruskal_sentence_by_race(df):
    """Kruskal-Wallis H-test: sentence months ~ race."""
    groups = [g["SENTENCE_MONTHS"].dropna().values
              for _, g in df.groupby("RACE")]
    H, p = stats.kruskal(*groups)
    return {"test": "Kruskal-Wallis (sentence ~ race)",
            "H-statistic": round(H, 4), "p-value": p,
            "significant_at_05": p < 0.05}


# ═══════════════════════════════════════════════════════════════════════
# 7  Chi-square – incarceration by race and by gender
# ═══════════════════════════════════════════════════════════════════════

def chi2_incarceration_by_race(df):
    """Chi-square: incarceration (yes/no) vs. race."""
    ct = pd.crosstab(df["RACE"], df["INCARCERATED"])
    chi2, p, dof, _ = stats.chi2_contingency(ct)
    return {"test": "Chi-square (incarceration ~ race)",
            "chi2": round(chi2, 4), "p-value": p,
            "dof": dof, "significant_at_05": p < 0.05,
            "contingency_table": ct}


def chi2_incarceration_by_sex(df):
    """Chi-square: incarceration (yes/no) vs. sex."""
    ct = pd.crosstab(df["SEX"], df["INCARCERATED"])
    chi2, p, dof, _ = stats.chi2_contingency(ct)
    return {"test": "Chi-square (incarceration ~ sex)",
            "chi2": round(chi2, 4), "p-value": p,
            "dof": dof, "significant_at_05": p < 0.05,
            "contingency_table": ct}


def chi2_incarceration_by_race_sex(df):
    """Chi-square: incarceration vs. race x sex (combined group)."""
    df = df.copy()
    df["RACE_SEX"] = df["RACE"] + " " + df["SEX"]
    ct = pd.crosstab(df["RACE_SEX"], df["INCARCERATED"])
    chi2, p, dof, _ = stats.chi2_contingency(ct)
    return {"test": "Chi-square (incarceration ~ race x sex)",
            "chi2": round(chi2, 4), "p-value": p,
            "dof": dof, "significant_at_05": p < 0.05,
            "contingency_table": ct}


# ═══════════════════════════════════════════════════════════════════════
# 8  Summary table for report
# ═══════════════════════════════════════════════════════════════════════

def summary_table(df):
    """
    Produce a single publication-ready summary table:
    race x sex with mean/median sentence, N, % incarcerated.
    """
    rows = []
    for race in sorted(df["RACE"].dropna().unique()):
        for sex in sorted(df["SEX"].dropna().unique()):
            sub = df[(df["RACE"] == race) & (df["SEX"] == sex)]
            sent = sub["SENTENCE_MONTHS"].dropna()
            rows.append({
                "Race": race,
                "Sex": sex,
                "N": len(sub),
                "Mean Sentence (mo)": round(sent.mean(), 1) if len(sent) else None,
                "Median Sentence (mo)": round(sent.median(), 1) if len(sent) else None,
                "Std Dev": round(sent.std(), 1) if len(sent) else None,
                "% Incarcerated": round(sub["INCARCERATED"].mean() * 100, 1)
                                  if "INCARCERATED" in sub.columns else None,
            })
    return pd.DataFrame(rows)


# ═══════════════════════════════════════════════════════════════════════
# Run all + save
# ═══════════════════════════════════════════════════════════════════════

def run_all(df: pd.DataFrame, save: bool = False) -> dict:
    """Execute every analysis and return results as a dict."""

    results = {}

    # Descriptive tables
    results["sentence_by_race"] = sentence_by_race(df)
    results["sentence_by_sex"] = sentence_by_sex(df)
    results["sentence_by_race_sex"] = sentence_by_race_sex(df)
    results["sentence_by_offense"] = sentence_by_offense(df)
    results["sample_sizes"] = sample_sizes(df)
    results["distribution_shape"] = distribution_shape(df)

    # Statistical tests
    results["anova"] = anova_sentence_by_race(df)
    results["kruskal"] = kruskal_sentence_by_race(df)
    results["chi2_race"] = chi2_incarceration_by_race(df)
    results["chi2_sex"] = chi2_incarceration_by_sex(df)
    results["chi2_race_sex"] = chi2_incarceration_by_race_sex(df)

    # Summary table
    results["summary_table"] = summary_table(df)

    # Print quick report
    _print_report(results)

    # Optionally save to disk
    if save:
        _save_tables(results)

    return results


def _print_report(r: dict):
    """Pretty-print key findings to stdout."""
    print("\n" + "=" * 70)
    print("  DESCRIPTIVE STATISTICS – Sentenced Differently")
    print("=" * 70)

    print("\n── Sentence Length by Race ──")
    print(r["sentence_by_race"].to_string())

    print("\n── Sentence Length by Sex ──")
    print(r["sentence_by_sex"].to_string())

    print("\n── Sentence Length by Race × Sex ──")
    print(r["sentence_by_race_sex"].to_string())

    print("\n── Distribution Shape ──")
    print(r["distribution_shape"].to_string(index=False))

    print("\n── ANOVA (sentence ~ race) ──")
    for k, v in r["anova"].items():
        print(f"  {k}: {v}")

    print("\n── Kruskal-Wallis (sentence ~ race) ──")
    for k, v in r["kruskal"].items():
        print(f"  {k}: {v}")

    print("\n── Chi-square: incarceration ~ race ──")
    for k, v in r["chi2_race"].items():
        if k != "contingency_table":
            print(f"  {k}: {v}")

    print("\n── Chi-square: incarceration ~ sex ──")
    for k, v in r["chi2_sex"].items():
        if k != "contingency_table":
            print(f"  {k}: {v}")

    print("\n── Chi-square: incarceration ~ race × sex ──")
    for k, v in r["chi2_race_sex"].items():
        if k != "contingency_table":
            print(f"  {k}: {v}")

    print("\n── Summary Table (for report) ──")
    print(r["summary_table"].to_string(index=False))

    print("\n" + "=" * 70)


def _save_tables(r: dict):
    """Write DataFrames to CSV in output/tables/."""
    TABLE_DIR.mkdir(parents=True, exist_ok=True)

    for key in ["sentence_by_race", "sentence_by_sex", "sentence_by_race_sex",
                "sentence_by_offense", "sample_sizes", "distribution_shape",
                "summary_table"]:
        obj = r[key]
        if isinstance(obj, pd.DataFrame):
            obj.to_csv(TABLE_DIR / f"{key}.csv")

    # Save test results as a combined table
    test_rows = []
    for key in ["anova", "kruskal", "chi2_race", "chi2_sex", "chi2_race_sex"]:
        row = {k: v for k, v in r[key].items() if k != "contingency_table"}
        test_rows.append(row)
    pd.DataFrame(test_rows).to_csv(TABLE_DIR / "statistical_tests.csv", index=False)

    # Save contingency tables
    for key in ["chi2_race", "chi2_sex", "chi2_race_sex"]:
        ct = r[key].get("contingency_table")
        if ct is not None:
            ct.to_csv(TABLE_DIR / f"contingency_{key}.csv")

    print(f"\nTables saved to {TABLE_DIR}/")
