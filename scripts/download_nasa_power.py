"""NASA POWER Data Ingestion Script for Chennai Pilot Grid.
Queries the real NASA POWER API for Temperature (T2M) and Precipitation (PRECTOTCORR).
Attaches strict OBSERVED provenance metadata and saves to data/processed/.
"""

import os
import sys
import json
import argparse
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.data_sources.nasa_power import fetch_nasa_power_point, normalize_nasa_power_response
from app.geospatial.grid import generate_regular_grid


def ingest_nasa_power_for_chennai(start_year: int = 2021, end_year: int = 2024):
    print(f"Starting NASA POWER ingestion for Chennai Pilot ({start_year} - {end_year})...")
    
    # Generate Chennai grid
    cells = generate_regular_grid(12.90, 80.15, 13.10, 80.35, 0.0500, "CHE")
    all_observations = []

    for idx, cell in enumerate(cells, start=1):
        lat = cell["center_lat"]
        lon = cell["center_lon"]
        cell_code = cell["cell_code"]
        print(f"[{idx}/{len(cells)}] Fetching NASA POWER for {cell_code} ({lat}, {lon})...")

        try:
            raw_data = fetch_nasa_power_point(
                latitude=lat,
                longitude=lon,
                start_year=start_year,
                end_year=end_year,
                temporal_api="monthly"
            )
            records = normalize_nasa_power_response(raw_data, grid_id=idx, provenance_type="OBSERVED")
            all_observations.extend(records)
            print(f"  -> Successfully extracted {len(records)} monthly records.")
        except Exception as e:
            print(f"  -> Warning: Failed to query NASA POWER for {cell_code}: {e}")

    if all_observations:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_csv = os.path.join(base_dir, "data", "processed", "nasa_power_chennai_monthly.csv")
        df = pd.DataFrame(all_observations)
        df.to_csv(output_csv, index=False)
        print(f"Successfully saved {len(all_observations)} real NASA POWER observations to {output_csv}")
    else:
        print("No observations downloaded. Check internet connection.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download real NASA POWER data for Chennai")
    parser.add_argument("--start-year", type=int, default=2021)
    parser.add_argument("--end-year", type=int, default=2024)
    args = parser.parse_args()
    ingest_nasa_power_for_chennai(args.start_year, args.end_year)
