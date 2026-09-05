"""Analytical Grid Generator Script for EarthPulse AI.
Builds a 0.05° (~5.5 km) regular fishnet grid for any bounding box.
Defaults reproduce the Chennai pilot grid byte-for-byte; other regions
(e.g. Bengaluru) pass --bbox/--prefix/--out. Grid geometry only — no
observations are fabricated.
"""

import os
import json
import argparse
import sys

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.geospatial.grid import generate_regular_grid, grid_to_geojson


def build_grid(min_lat, min_lon, max_lat, max_lon, resolution, prefix, output_path):
    print(f"Building {resolution} deg analytical regular grid [{prefix}]...")
    cells = generate_regular_grid(
        min_lat=min_lat,
        min_lon=min_lon,
        max_lat=max_lat,
        max_lon=max_lon,
        resolution_deg=resolution,
        prefix=prefix,
    )

    print(f"Generated {len(cells)} analytical grid cells.")

    geojson_data = grid_to_geojson(cells)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, indent=2)

    print(f"Grid saved to: {output_path}")
    return cells


def build_chennai_grid():
    """Chennai pilot grid (legacy entry point; unchanged defaults)."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return build_grid(
        min_lat=12.90, min_lon=80.15,
        max_lat=13.10, max_lon=80.35,
        resolution=0.0500, prefix="CHE",
        output_path=os.path.join(base_dir, "data", "boundaries", "chennai_grid_0.05deg.geojson"),
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build a 0.05° analytical fishnet grid for any bbox.")
    parser.add_argument("--min-lat", type=float, default=12.90)
    parser.add_argument("--min-lon", type=float, default=80.15)
    parser.add_argument("--max-lat", type=float, default=13.10)
    parser.add_argument("--max-lon", type=float, default=80.35)
    parser.add_argument("--resolution", type=float, default=0.0500)
    parser.add_argument("--prefix", type=str, default="CHE")
    parser.add_argument("--out", type=str, default=None,
                        help="Output GeoJSON path (default: data/boundaries/chennai_grid_0.05deg.geojson)")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = args.out or os.path.join(base_dir, "data", "boundaries", "chennai_grid_0.05deg.geojson")
    build_grid(args.min_lat, args.min_lon, args.max_lat, args.max_lon,
               args.resolution, args.prefix, out)
