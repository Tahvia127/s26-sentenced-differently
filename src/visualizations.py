"""
Exploratory visualizations for the Sentenced Differently project.

Produces:
  - Sentence-length distributions by race and by gender (histograms + KDE)
  - Box plots of sentence length by offense category
  - Box plots by race × sex
  - Incarceration rate bar charts by race and gender
  - Log-transformed distribution comparison

All figures are saved to output/figures/ when save=True.
"""

from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np
import pandas as pd
import seaborn as sns

FIG_DIR = Path("output/figures")

# Consistent palette across the project
RACE_PALETTE = {"White": "#4C72B0", "Black": "#DD8452",
                "Hispanic": "#55A868", "Other": "#C44E52"}
SEX_PALETTE = {"Male": "#4C72B0", "Female": "#DD8452"}

sns.set_theme(style="whitegrid", font_scale=1.1)


def _savefig(fig, name: str, save: bool):
    if save:
        FIG_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIG_DIR / f"{name}.png", dpi=200, bbox_inches="tight")
    plt.close(fig)


# ═══════════════════════════════════════════════════════════════════════
# 1  Sentence distributions by race
# ═══════════════════════════════════════════════════════════════════════

def hist_sentence_by_race(df, save=False):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Raw
    ax = axes[0]
    for race, color in RACE_PALETTE.items():
        sub = df.loc[df["RACE"] == race, "SENTENCE_MONTHS"].dropna()
        if len(sub):
            ax.hist(sub.clip(upper=360), bins=60, alpha=0.45,
                    label=race, color=color, density=True)
    ax.set_title("Sentence Length Distribution by Race")
    ax.set_xlabel("Sentence (months, capped at 360)")
    ax.set_ylabel("Density")
    ax.legend()

    # Log-transformed
    ax = axes[1]
    for race, color in RACE_PALETTE.items():
        sub = df.loc[(df["RACE"] == race) & (df["SENTENCE_MONTHS"] > 0),
                     "SENTENCE_MONTHS"].dropna()
        if len(sub):
            ax.hist(np.log(sub), bins=60, alpha=0.45,
                    label=race, color=color, density=True)
    ax.set_title("Log Sentence Length by Race")
    ax.set_xlabel("log(Sentence months)")
    ax.set_ylabel("Density")
    ax.legend()

    fig.tight_layout()
    _savefig(fig, "hist_sentence_by_race", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# 2  Sentence distributions by sex
# ═══════════════════════════════════════════════════════════════════════

def hist_sentence_by_sex(df, save=False):
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    ax = axes[0]
    for sex, color in SEX_PALETTE.items():
        sub = df.loc[df["SEX"] == sex, "SENTENCE_MONTHS"].dropna()
        if len(sub):
            ax.hist(sub.clip(upper=360), bins=60, alpha=0.5,
                    label=sex, color=color, density=True)
    ax.set_title("Sentence Length Distribution by Sex")
    ax.set_xlabel("Sentence (months, capped at 360)")
    ax.set_ylabel("Density")
    ax.legend()

    ax = axes[1]
    for sex, color in SEX_PALETTE.items():
        sub = df.loc[(df["SEX"] == sex) & (df["SENTENCE_MONTHS"] > 0),
                     "SENTENCE_MONTHS"].dropna()
        if len(sub):
            ax.hist(np.log(sub), bins=60, alpha=0.5,
                    label=sex, color=color, density=True)
    ax.set_title("Log Sentence Length by Sex")
    ax.set_xlabel("log(Sentence months)")
    ax.set_ylabel("Density")
    ax.legend()

    fig.tight_layout()
    _savefig(fig, "hist_sentence_by_sex", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# 3  Box plots by offense category
# ═══════════════════════════════════════════════════════════════════════

def boxplot_by_offense(df, save=False):
    # Top 12 offense categories by volume
    top_cats = (df["OFFENSE_CAT"].value_counts().head(12).index.tolist())
    sub = df[df["OFFENSE_CAT"].isin(top_cats)].copy()

    fig, ax = plt.subplots(figsize=(14, 7))
    order = (sub.groupby("OFFENSE_CAT")["SENTENCE_MONTHS"]
             .median().sort_values(ascending=False).index)
    sns.boxplot(data=sub, y="OFFENSE_CAT", x="SENTENCE_MONTHS",
                order=order, ax=ax, showfliers=False, palette="viridis")
    ax.set_xlim(0, 360)
    ax.set_title("Sentence Length by Offense Category (top 12)")
    ax.set_xlabel("Sentence (months)")
    ax.set_ylabel("")
    fig.tight_layout()
    _savefig(fig, "boxplot_by_offense", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# 4  Box plots by race × sex
# ═══════════════════════════════════════════════════════════════════════

def boxplot_race_sex(df, save=False):
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.boxplot(data=df, x="RACE", y="SENTENCE_MONTHS", hue="SEX",
                showfliers=False, palette=SEX_PALETTE, ax=ax)
    ax.set_ylim(0, 300)
    ax.set_title("Sentence Length by Race and Sex")
    ax.set_ylabel("Sentence (months)")
    ax.set_xlabel("")
    fig.tight_layout()
    _savefig(fig, "boxplot_race_sex", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# 5  Incarceration rate bar chart
# ═══════════════════════════════════════════════════════════════════════

def bar_incarceration_rate(df, save=False):
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    # By race
    ax = axes[0]
    rates = df.groupby("RACE")["INCARCERATED"].mean().sort_values(ascending=False)
    rates.plot.bar(ax=ax, color=[RACE_PALETTE.get(r, "grey") for r in rates.index])
    ax.set_title("Incarceration Rate by Race")
    ax.set_ylabel("Proportion incarcerated")
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(1.0))
    ax.set_xticklabels(ax.get_xticklabels(), rotation=0)

    # By sex
    ax = axes[1]
    rates = df.groupby("SEX")["INCARCERATED"].mean().sort_values(ascending=False)
    rates.plot.bar(ax=ax, color=[SEX_PALETTE.get(s, "grey") for s in rates.index])
    ax.set_title("Incarceration Rate by Sex")
    ax.set_ylabel("Proportion incarcerated")
    ax.yaxis.set_major_formatter(mticker.PercentFormatter(1.0))
    ax.set_xticklabels(ax.get_xticklabels(), rotation=0)

    fig.tight_layout()
    _savefig(fig, "bar_incarceration_rate", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# 6  Log-transform justification figure
# ═══════════════════════════════════════════════════════════════════════

def log_transform_comparison(df, save=False):
    sent = df["SENTENCE_MONTHS"].dropna()
    sent_pos = sent[sent > 0]

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    ax = axes[0]
    ax.hist(sent.clip(upper=480), bins=80, color="#4C72B0", alpha=0.7)
    ax.set_title(f"Raw Sentence Length (skew = {sent.skew():.2f})")
    ax.set_xlabel("Months")
    ax.set_ylabel("Count")

    ax = axes[1]
    log_sent = np.log(sent_pos)
    ax.hist(log_sent, bins=80, color="#55A868", alpha=0.7)
    ax.set_title(f"Log-Transformed (skew = {log_sent.skew():.2f})")
    ax.set_xlabel("log(Months)")
    ax.set_ylabel("Count")

    fig.suptitle("Justification for Log-Transform of Sentence Length",
                 fontsize=14, y=1.02)
    fig.tight_layout()
    _savefig(fig, "log_transform_comparison", save)
    return fig


# ═══════════════════════════════════════════════════════════════════════
# Run all
# ═══════════════════════════════════════════════════════════════════════

def run_all(df: pd.DataFrame, save: bool = False) -> dict:
    """Generate all exploratory figures. Returns dict of figure objects."""
    figs = {}
    figs["hist_race"] = hist_sentence_by_race(df, save=save)
    figs["hist_sex"] = hist_sentence_by_sex(df, save=save)
    figs["boxplot_offense"] = boxplot_by_offense(df, save=save)
    figs["boxplot_race_sex"] = boxplot_race_sex(df, save=save)
    figs["bar_incarceration"] = bar_incarceration_rate(df, save=save)
    figs["log_transform"] = log_transform_comparison(df, save=save)
    print(f"Generated {len(figs)} figures" +
          (f" → saved to {FIG_DIR}/" if save else ""))
    return figs
