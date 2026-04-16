"""
Variable dictionary and recoding guide for USSC individual-offender data.

This module defines:
  - RECODE_MAPS: value-label mappings for categorical variables
  - recode_dataframe(): applies all recoding in one call

USSC codebook reference:
  MONSEX:    0=Male, 1=Female
  NEWRACE:   1=White, 2=Black, 3=Hispanic, 6=Other
  XCRHISSR:  1=I, 2=II, 3=III, 4=IV, 5=V, 6=VI
  INOUT:     1=Prison, 2=Probation only, 3=Other (fine only, etc.)
  SENTTOT:   Total months; 9996=Life, 9997+=missing/N/A
  ZONE:      A=1, B=2, C=3, D=4  (guideline zone at sentencing)
"""

# ── Recode maps (raw numeric code → human-readable label) ──────────────

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

CRIMINAL_HISTORY_MAP = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
}

# Two-digit USSC primary-offense guideline codes → readable categories
OFFENSE_CATEGORY_MAP = {
    1:  "Administration of Justice",
    2:  "Antitrust",
    3:  "Arson",
    4:  "Assault",
    5:  "Bribery/Corruption",
    6:  "Burglary/Trespass",
    7:  "Child Pornography",
    8:  "Commercialized Vice",
    9:  "Drug Trafficking",
    10: "Environmental",
    11: "Extortion/Racketeering",
    12: "Firearms",
    13: "Food & Drug",
    14: "Forgery/Counterfeiting",
    15: "Fraud",
    16: "Immigration",
    17: "Individual Rights",
    18: "Kidnapping",
    19: "Larceny",
    20: "Manslaughter",
    21: "Money Laundering",
    22: "Murder",
    23: "National Defense",
    24: "Obscenity/Prostitution",
    25: "Prison Offenses",
    26: "Robbery",
    27: "Sex Offenses",
    28: "Stalking/Harassment",
    29: "Tax",
    30: "Other",
}

ZONE_MAP = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
}

INOUT_MAP = {
    1: "Prison",
    2: "Probation",
    3: "Other",
}


def recode_dataframe(df):
    """Apply all standard recodes to a USSC dataframe (in place) and return it."""

    # Race
    if "NEWRACE" in df.columns:
        df["RACE"] = df["NEWRACE"].map(RACE_MAP)

    # Sex
    if "MONSEX" in df.columns:
        df["SEX"] = df["MONSEX"].map(SEX_MAP)

    # Criminal history category
    if "XCRHISSR" in df.columns:
        df["CRIM_HIST"] = df["XCRHISSR"].map(CRIMINAL_HISTORY_MAP)

    # Offense category
    if "OFFGUIDE" in df.columns:
        df["OFFENSE_CAT"] = df["OFFGUIDE"].map(OFFENSE_CATEGORY_MAP)

    # Guideline zone
    if "ZONE" in df.columns:
        df["ZONE_LABEL"] = df["ZONE"].map(ZONE_MAP)

    # Sentence type
    if "INOUT" in df.columns:
        df["SENTENCE_TYPE"] = df["INOUT"].map(INOUT_MAP)

    # Sentence length (clean version)
    # SENTTOT of 9996 = life; 9997-9999 = missing/NA
    # Treat 0 as probation (no prison time)
    if "SENTTOT" in df.columns:
        df["SENTENCE_MONTHS"] = df["SENTTOT"].where(df["SENTTOT"] < 9996)
        # For probation cases (SENTTOT == 0 or very small), keep as 0
        df.loc[df["SENTTOT"] == 0, "SENTENCE_MONTHS"] = 0

    # Prison vs. probation binary (for chi-square analysis)
    # In USSC data after cleaning, SENTTOT=0.03 (1 day) represents time-served/
    # probation-equivalent. We treat SENTTOT > 1 month as substantive prison.
    if "SENTTOT" in df.columns:
        df["INCARCERATED"] = (df["SENTTOT"] > 1) & (df["SENTTOT"] < 9996)

    return df
