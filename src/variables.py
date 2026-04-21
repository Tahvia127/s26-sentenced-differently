"""
Variable dictionary and recoding guide for USSC individual-offender data.

Codebook reference (USSC Public Release Codebook FY99-FY24):
  MONSEX:    0=Male, 1=Female
  NEWRACE:   1=White, 2=Black, 3=Hispanic, 6=Other
  XCRHISSR:  1=I, 2=II, 3=III, 4=IV, 5=V, 6=VI
  INOUT:     1=Prison, 2=Probation only, 3=Other
  SENTTOT:   Total months; 9996=Life; 9997-9999=missing/N/A
  ZONE:      1=A, 2=B, 3=C, 4=D  (guideline zone)
  OFFGUIDE:  1-30 offense category code (see OFFENSE_CATEGORY_MAP)
"""

# ── Race / sex ─────────────────────────────────────────────────────────

RACE_MAP = {
    1: "White",
    2: "Black",
    3: "Hispanic",
    6: "Other",
}

SEX_MAP = {
    0: "Male",
    1: "Female",
}

# ── Criminal history ───────────────────────────────────────────────────

CRIMINAL_HISTORY_MAP = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
}

# ── Guideline zone ─────────────────────────────────────────────────────

ZONE_MAP = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
}

# ── Sentence type ──────────────────────────────────────────────────────

INOUT_MAP = {
    1: "Prison",
    2: "Probation",
    3: "Other",
}

# ── Offense category (OFFGUIDE) ────────────────────────────────────────
# Verified against FY2022 USSC annual report counts:
#   OFFGUIDE=10 Drug Trafficking ~32.7%  ✓
#   OFFGUIDE=17 Immigration      ~28.6%  ✓
#   OFFGUIDE=13 Firearms         ~14.9%  ✓
#   OFFGUIDE=16 Fraud            ~ 7.1%  ✓
OFFENSE_CATEGORY_MAP = {
    1:  "Administration of Justice",
    2:  "Antitrust",
    3:  "Arson",
    4:  "Assault",
    5:  "Bribery/Corruption",
    6:  "Burglary/Trespass",
    7:  "Child Pornography",
    8:  "Commercialized Vice",
    9:  "Drug Possession",
    10: "Drug Trafficking",
    11: "Environmental/Wildlife",
    12: "Extortion/Racketeering",
    13: "Firearms",
    14: "Food/Drug/Agriculture",
    15: "Forgery/Counterfeiting",
    16: "Fraud/Theft/Embezzlement",
    17: "Immigration",
    18: "Individual Rights",
    19: "Kidnapping",
    20: "Larceny",
    21: "Money Laundering",
    22: "Murder",
    23: "National Defense",
    24: "Obscenity/Pornography",
    25: "Prison Offenses",
    26: "Robbery",
    27: "Sex Offenses",
    28: "Stalking/Harassment",
    29: "Tax",
    30: "Other",
}

# ── Regression subgroups (four core offense groups for subgroup analysis)
# Immigration excluded from core sample per project decision.
OFFENSE_GROUP_MAP = {
    10: "Drug Trafficking",
    13: "Firearms",
    16: "Fraud/Economic",
    17: "Immigration",   # flagged separately; excluded from core
}

# Life sentence cap (USSC standard: code 9996 → 470 months)
LIFE_SENTENCE_MONTHS = 470


# ══════════════════════════════════════════════════════════════════════
# Main recode function
# ══════════════════════════════════════════════════════════════════════

def recode_dataframe(df):
    """
    Apply all standard recodes to a USSC dataframe and return it.

    Adds columns:
      RACE, SEX, CRIM_HIST, OFFENSE_CAT, OFFENSE_GROUP, ZONE_LABEL,
      SENTENCE_TYPE, SENTENCE_MONTHS, LOG_SENTENCE,
      INCARCERATED, IS_IMMIGRATION, IS_LIFE,
      MAND_MIN (mandatory minimum flag: XMINSOR > 0),
      FEMALE, RACE_BLACK, RACE_HISPANIC, RACE_OTHER  (dummies for regression)
    """

    # ── Demographics ─────────────────────────────────────────────────
    if "NEWRACE" in df.columns:
        df["RACE"] = df["NEWRACE"].map(RACE_MAP)

    if "MONSEX" in df.columns:
        df["SEX"] = df["MONSEX"].map(SEX_MAP)

    # ── Legal variables ───────────────────────────────────────────────
    if "XCRHISSR" in df.columns:
        df["CRIM_HIST"] = df["XCRHISSR"].map(CRIMINAL_HISTORY_MAP)

    if "ZONE" in df.columns:
        df["ZONE_LABEL"] = df["ZONE"].map(ZONE_MAP)

    if "INOUT" in df.columns:
        df["SENTENCE_TYPE"] = df["INOUT"].map(INOUT_MAP)

    # ── Offense category ──────────────────────────────────────────────
    if "OFFGUIDE" in df.columns:
        df["OFFENSE_CAT"] = df["OFFGUIDE"].map(OFFENSE_CATEGORY_MAP)
        # Four-group classification for subgroup regression
        df["OFFENSE_GROUP"] = df["OFFGUIDE"].map(OFFENSE_GROUP_MAP).fillna("Other")
        # Immigration flag (excluded from core sample per project decision)
        df["IS_IMMIGRATION"] = (df["OFFGUIDE"] == 17)

    # ── Sentence length ───────────────────────────────────────────────
    if "SENTTOT" in df.columns:
        # Life sentences (9996) → 470 months per USSC standard
        df["IS_LIFE"] = (df["SENTTOT"] == 9996)
        df["SENTENCE_MONTHS"] = df["SENTTOT"].copy()
        df.loc[df["SENTTOT"] == 9996, "SENTENCE_MONTHS"] = LIFE_SENTENCE_MONTHS
        # True missing (9997-9999) → NaN
        df.loc[df["SENTTOT"] >= 9997, "SENTENCE_MONTHS"] = float("nan")

        # Prison vs. probation: >1 month = incarcerated (cast to int for logit)
        df["INCARCERATED"] = ((df["SENTENCE_MONTHS"] > 1) & df["SENTENCE_MONTHS"].notna()).astype(int)

        # Log-transform (for cases > 0; probation/time-served excluded)
        import numpy as np
        df["LOG_SENTENCE"] = float("nan")
        mask = df["SENTENCE_MONTHS"] > 0
        df.loc[mask, "LOG_SENTENCE"] = np.log(df.loc[mask, "SENTENCE_MONTHS"])

    # ── Mandatory minimum flag ────────────────────────────────────────
    # XMINSOR is guideline minimum; positive value signals a mandatory floor
    if "XMINSOR" in df.columns:
        df["MAND_MIN"] = (df["XMINSOR"] > 0).astype(float)

    # ── Plea / acceptance of responsibility ───────────────────────────
    # DSPLEA actual coding (verified from DISPOSIT cross-tab):
    #   1=guilty plea, 2=nolo contendere, 5=stipulated plea of facts
    #   3=bench trial, 8=jury trial
    if "DSPLEA" in df.columns:
        import pandas as _pd
        dsplea_num = _pd.to_numeric(df["DSPLEA"], errors="coerce")
        df["GUILTY_PLEA"] = dsplea_num.isin([1, 2, 5]).astype(float)
        df["TRIAL"]       = dsplea_num.isin([3, 8]).astype(float)
        df.loc[dsplea_num.isna(), ["GUILTY_PLEA", "TRIAL"]] = float("nan")

    # ACCTRESP: guideline adjustment for acceptance of responsibility
    #   -3 = full 3-pt reduction, -2 = partial 2-pt reduction, 0 = none
    if "ACCTRESP" in df.columns:
        import pandas as _pd
        acctresp_num = _pd.to_numeric(df["ACCTRESP"], errors="coerce")
        df["ACCEPT_RESP"] = (acctresp_num < 0).astype(float)
        df.loc[acctresp_num.isna(), "ACCEPT_RESP"] = float("nan")

    # ── Regression dummy variables ────────────────────────────────────
    # Reference category = White Male; dummies needed for statsmodels
    if "RACE" in df.columns:
        df["RACE_BLACK"]    = (df["RACE"] == "Black").astype(float)
        df["RACE_HISPANIC"] = (df["RACE"] == "Hispanic").astype(float)
        df["RACE_OTHER"]    = (df["RACE"] == "Other").astype(float)

    if "SEX" in df.columns:
        df["FEMALE"] = (df["SEX"] == "Female").astype(float)

    return df
