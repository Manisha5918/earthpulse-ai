"""Unified Grid Feature Engineering.
Merges disparate satellite & climate observations into a standardized analytical matrix.
"""

from typing import List, Dict, Any, Optional
import pandas as pd


def assemble_grid_feature_matrix(
    observations: List[Dict[str, Any]],
    grid_cells: List[Dict[str, Any]]
) -> pd.DataFrame:
    """Transform raw observation records into a unified multi-signal matrix per (grid_id, year_month).

    Columns:
    - grid_id, cell_code, year_month, latitude, longitude
    - ndvi, ndwi, ndbi, night_light, temperature, rainfall, built_up
    - provenance_type
    """
    if not observations:
        return pd.DataFrame(columns=[
            "grid_id", "cell_code", "year_month", "latitude", "longitude",
            "ndvi", "ndwi", "ndbi", "night_light", "temperature", "rainfall", "built_up",
            "provenance_type"
        ])

    df = pd.DataFrame(observations)
    df["year_month"] = pd.to_datetime(df["acquisition_timestamp"]).dt.strftime("%Y-%m")

    # Pivot signal_value by signal_name
    pivot_df = df.pivot_table(
        index=["grid_id", "year_month"],
        columns="signal_name",
        values="signal_value",
        aggfunc="mean"
    ).reset_index()

    # Map grid metadata
    grid_lookup = {g["id"]: g for g in grid_cells}
    pivot_df["cell_code"] = pivot_df["grid_id"].map(lambda gid: grid_lookup.get(gid, {}).get("cell_code", "UNKNOWN"))
    pivot_df["latitude"] = pivot_df["grid_id"].map(lambda gid: grid_lookup.get(gid, {}).get("center_lat", 0.0))
    pivot_df["longitude"] = pivot_df["grid_id"].map(lambda gid: grid_lookup.get(gid, {}).get("center_lon", 0.0))

    # Provenance rollup: if any record is SYNTHETIC_DEMO, flag whole row as SYNTHETIC_DEMO
    prov_map = df.groupby(["grid_id", "year_month"])["provenance_type"].apply(
        lambda s: "SYNTHETIC_DEMO" if "SYNTHETIC_DEMO" in s.values else "CALCULATED"
    ).to_dict()

    pivot_df["provenance_type"] = pivot_df.set_index(["grid_id", "year_month"]).index.map(prov_map)

    return pivot_df
