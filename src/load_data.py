"""
Load and convert USSC individual-offender .dat / .csv files to a cleaned
parquet dataset for FY2020-FY2024.

Handles:
  - Fixed-width .dat files inside zips (with companion .sas for column specs)
  - CSV files inside zips (FY2024+)
  - Reads directly from zip archives — no manual extraction needed

Usage (CLI):
    python -m src.load_data                    # FY2020-2024
    python -m src.load_data --year 2023 2024   # specific years
"""

from __future__ import annotations

import argparse
import io
import re
import zipfile
from pathlib import Path

import pandas as pd

from src.variables import recode_dataframe

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")

# Variables we need for the analysis (keeps memory manageable)
KEEP_VARS = [
    # Identifiers
    "USSCIDN",
    # Demographics
    "AGE", "AGECAT", "MONSEX", "NEWRACE", "MONRACE",
    "HISPORIG", "EDUCATN", "NEWEDUC", "NEWCIT",
    # Offense / guidelines
    "OFFGUIDE", "XFOLSOR", "XCRHISSR", "XMINSOR", "XMAXSOR",
    # Sentence outcome
    "SENTTOT", "SENSPLT0", "SENTMON", "SENTRNGE",
    "INOUT", "ZONE",
    # Plea / acceptance of responsibility
    "ACCAP",    # acceptance of responsibility (0=none, 1=partial, 2=full, 3=N/A)
    "ACCTRESP", # acceptance points adjustment
    "DSPLEA",   # disposition/plea type (1=guilty plea, 2=nolo, 3=trial, 4=other)
    "DISPOSIT", # case disposition
    # Geography / jurisdiction
    "DISTRICT", "CIRCDIST",
    # Offense count
    "NOCOUNTS",
]

# Zip filename → fiscal year mapping
FY_PATTERN = re.compile(r"opafy(\d{2})")


def _infer_fy(filename: str) -> int:
    """Extract fiscal year from USSC zip/dat filename like opafy20nid."""
    m = FY_PATTERN.search(filename)
    if m:
        yy = int(m.group(1))
        return 2000 + yy
    return 0


# ═══════════════════════════════════════════════════════════════════════
# SAS INPUT parser  (handles the real USSC format)
# ═══════════════════════════════════════════════════════════════════════

def _parse_sas_input(sas_text: str) -> list[tuple[str, int, int, bool]]:
    """
    Parse a USSC SAS INPUT block.

    The format is:  VARNAME $ start-end   ($ means character)
    or:             VARNAME $ start       (single column)
    or:             VARNAME start-end     (numeric)
    or:             VARNAME start         (single column numeric)

    Returns list of (name, start_0indexed, width, is_string).
    """
    # Find the INPUT block
    in_input = False
    columns = []
    # Pattern: optional $, then start (and optionally -end)
    var_pat = re.compile(
        r"(\w+)\s+(\$)?\s*(\d+)(?:\s*-\s*(\d+))?"
    )

    for line in sas_text.splitlines():
        stripped = line.strip().upper()
        if stripped.startswith("INPUT"):
            in_input = True
            # Process rest of the INPUT line
            stripped = stripped[5:]
        if not in_input:
            continue
        if ";" in stripped:
            # End of INPUT block — process up to semicolon
            stripped = stripped[:stripped.index(";")]
            for m in var_pat.finditer(stripped):
                name = m.group(1)
                is_str = m.group(2) is not None
                start = int(m.group(3))
                end = int(m.group(4)) if m.group(4) else start
                columns.append((name, start - 1, end - start + 1, is_str))
            break

        for m in var_pat.finditer(stripped):
            name = m.group(1)
            is_str = m.group(2) is not None
            start = int(m.group(3))
            end = int(m.group(4)) if m.group(4) else start
            columns.append((name, start - 1, end - start + 1, is_str))

    return columns


# ═══════════════════════════════════════════════════════════════════════
# Loaders
# ═══════════════════════════════════════════════════════════════════════

def _load_dat_from_zip(zip_path: Path) -> pd.DataFrame:
    """Load a .dat file from a USSC zip, using the companion .sas for specs."""
    with zipfile.ZipFile(zip_path) as zf:
        names = zf.namelist()
        dat_name = [n for n in names if n.lower().endswith(".dat")][0]
        sas_name = [n for n in names if n.lower().endswith(".sas")][0]

        # Parse SAS to get column layout
        sas_text = zf.read(sas_name).decode("latin-1")
        all_cols = _parse_sas_input(sas_text)

        if not all_cols:
            raise ValueError(f"Could not parse any columns from {sas_name}")

        # Filter to only columns we need (huge speed/memory savings)
        keep_upper = {v.upper() for v in KEEP_VARS}
        needed = [(name, start, width, is_str)
                  for name, start, width, is_str in all_cols
                  if name in keep_upper]

        colspecs = [(start, start + width) for _, start, width, _ in needed]
        col_names = [name for name, _, _, _ in needed]

        print(f"  Parsing {dat_name} ({len(needed)}/{len(all_cols)} columns) …")

        with zf.open(dat_name) as dat_file:
            df = pd.read_fwf(
                io.TextIOWrapper(dat_file, encoding="latin-1"),
                colspecs=colspecs,
                names=col_names,
                dtype=str,
            )
    return df


def _load_csv_from_zip(zip_path: Path) -> pd.DataFrame:
    """Load a CSV file from a USSC zip, keeping only needed columns."""
    with zipfile.ZipFile(zip_path) as zf:
        csv_name = [n for n in zf.namelist() if n.lower().endswith(".csv")][0]
        print(f"  Reading {csv_name} …")
        with zf.open(csv_name) as csv_file:
            # Read header first to identify which columns to keep
            header_line = csv_file.readline().decode("latin-1")
            cols_in_file = [c.strip().strip('"').upper()
                           for c in header_line.split(",")]
            keep_upper = {v.upper() for v in KEEP_VARS}
            use_cols = [c for c in cols_in_file if c in keep_upper]

            # Reset and read with usecols
            csv_file.seek(0)
            df = pd.read_csv(
                io.TextIOWrapper(csv_file, encoding="latin-1"),
                usecols=lambda c: c.strip().strip('"').upper() in keep_upper,
                dtype=str,
                low_memory=False,
            )
    df.columns = [c.upper() for c in df.columns]
    return df


# ═══════════════════════════════════════════════════════════════════════
# Numeric coercion
# ═══════════════════════════════════════════════════════════════════════

NUMERIC_COLS = [
    "AGE", "AGECAT", "MONSEX", "NEWRACE", "MONRACE", "HISPORIG",
    "EDUCATN", "NEWEDUC", "NEWCIT",
    "OFFGUIDE", "XFOLSOR", "XCRHISSR", "XMINSOR", "XMAXSOR",
    "SENTTOT", "SENSPLT0", "SENTMON", "SENTRNGE",
    "INOUT", "ZONE", "CRIMHIST",
    "DISTRICT", "CIRCDIST", "NOCOUNTS",
    # Plea / acceptance of responsibility
    "ACCAP", "ACCTRESP", "DSPLEA", "DISPOSIT",
]


def _coerce_numeric(df: pd.DataFrame) -> pd.DataFrame:
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


# ═══════════════════════════════════════════════════════════════════════
# Main pipeline
# ═══════════════════════════════════════════════════════════════════════

# Map of fiscal years to their zip filenames
FY_ZIP_MAP = {
    2020: "opafy20nid.zip",
    2021: "opafy21nid.zip",
    2022: "opafy22nid.zip",
    2023: "opafy23nid.zip",
    2024: "opafy24nid_csv.zip",
}


def build_dataset(raw_dir: str = str(RAW_DIR),
                  out_dir: str = str(PROCESSED_DIR),
                  years: list[int] | None = None) -> pd.DataFrame:
    """
    Load USSC data for requested fiscal years, clean, merge, and save.

    Returns the merged DataFrame.
    """
    raw = Path(raw_dir)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    target_years = years or list(range(2020, 2025))
    frames = []

    for fy in sorted(target_years):
        zip_name = FY_ZIP_MAP.get(fy)
        if not zip_name:
            print(f"  [skip] No zip mapping for FY{fy}")
            continue

        zip_path = raw / zip_name
        if not zip_path.exists():
            print(f"  [skip] {zip_path} not found")
            continue

        print(f"\n{'='*50}")
        print(f"FY{fy}: {zip_name}")
        print(f"{'='*50}")

        # Determine format by checking zip contents
        with zipfile.ZipFile(zip_path) as zf:
            has_dat = any(n.lower().endswith(".dat") for n in zf.namelist())

        if has_dat:
            df = _load_dat_from_zip(zip_path)
        else:
            df = _load_csv_from_zip(zip_path)

        df = _coerce_numeric(df)

        # Add fiscal year column
        df["FISCALYR"] = fy

        frames.append(df)
        print(f"  -> {len(df):,} rows, {len(df.columns)} columns")

    if not frames:
        print("No data loaded!")
        return pd.DataFrame()

    merged = pd.concat(frames, ignore_index=True)
    print(f"\n{'='*50}")
    print(f"Merged: {len(merged):,} rows")

    # Recode
    merged = recode_dataframe(merged)

    # Drop rows with missing core analysis variables
    before = len(merged)
    merged = merged.dropna(subset=["SENTENCE_MONTHS", "RACE", "SEX"])
    dropped = before - len(merged)
    print(f"Dropped {dropped:,} rows missing sentence/race/sex")
    print(f"Final: {len(merged):,} rows")

    # Save
    csv_path = out / "ussc_fy2020_fy2024.csv"
    parquet_path = out / "ussc_fy2020_fy2024.parquet"
    merged.to_csv(csv_path, index=False)
    merged.to_parquet(parquet_path, index=False)
    print(f"\nSaved:\n  {csv_path}\n  {parquet_path}")

    return merged


# ── CLI ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build USSC merged dataset")
    parser.add_argument("--year", type=int, nargs="*",
                        help="Fiscal year(s) to include")
    args = parser.parse_args()
    build_dataset(years=args.year or list(range(2020, 2025)))
