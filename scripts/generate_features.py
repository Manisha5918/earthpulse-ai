"""Unified Feature Matrix Generation Script.
Merges multi-source observations into regional_features schema.
"""

import os
import sys
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.ml.feature_engineering import assemble_grid_feature_matrix
from app.geospatial.grid import generate_regular_grid


def build_features():
    print("Assembling unified multi-signal feature matrix for Chennai...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    nasa_csv = os.path.join(base_dir, "data", "processed", "nasa_power_chennai_monthly.csv")

    if not os.path.exists(nasa_csv):
        print(f"NASA POWER processed CSV not found at {nasa_csv}. Run download_nasa_power.py first.")
        return

    obs_df = pd.read_csv(nasa_csv)
    cells = generate_regular_grid(12.90, 80.15, 13.10, 80.35, 0.0500, "CHE")
    grid_cells_dicts = [{"id": i+1, **c} for i, c in enumerate(cells)]

    feature_matrix = assemble_grid_feature_matrix(obs_df.to_dict(orient="records"), grid_cells_dicts)
    out_path = os.path.join(base_dir, "data", "features", "chennai_feature_matrix.csv")
    feature_matrix.to_csv(out_path, index=False)
    print(f"Feature matrix generated with {len(feature_matrix)} rows. Saved to {out_path}")


if __name__ == "__main__":
    build_features()
