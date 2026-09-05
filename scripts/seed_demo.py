"""SEPARATE OPT-IN SCRIPT: Synthetic Demo Data Generator.
STRICT DATA PROVENANCE NOTICE:
This script generates mock data strictly for offline UI layout validation and local development testing.
EVERY ROW IS EXPLICITLY FLAGGED WITH provenance_type = 'SYNTHETIC_DEMO'.
NEVER PRESENT THIS DATA AS REAL EARTHPULSE OBSERVATIONS.
"""

import os
import sys
import json
import random
from datetime import datetime
import psycopg2

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))


def seed_synthetic_demo_data(database_url: str):
    print("=" * 70)
    print("WARNING: POPULATING SYNTHETIC DEMO DATA FOR OFFLINE TESTING ONLY")
    print("ALL RECORDS WILL BE MARKED: provenance_type = 'SYNTHETIC_DEMO'")
    print("=" * 70)

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        # Check existing grid cells
        cur.execute("SELECT id, cell_code, center_lat, center_lon FROM grid_cells WHERE cell_code LIKE 'CHE_%';")
        grid_cells = cur.fetchall()

        if not grid_cells:
            print("No grid cells found in database. Run database/seed.sql first.")
            return

        months = [
            "2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06",
            "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12",
            "2024-01", "2024-02", "2024-03", "2024-04", "2024-05"
        ]

        inserted_count = 0
        for gid, code, lat, lon in grid_cells:
            for ym in months:
                dt = datetime.strptime(f"{ym}-01", "%Y-%m-%d")
                
                # Synthetic ranges for Chennai climate/geography
                s_ndvi = round(random.uniform(0.18, 0.45), 4)
                s_ndwi = round(random.uniform(-0.15, 0.10), 4)
                s_ndbi = round(random.uniform(0.05, 0.35), 4)
                s_night = round(random.uniform(12.0, 48.0), 2)
                s_temp = round(random.uniform(28.0, 36.5), 2)
                s_rain = round(random.uniform(5.0, 180.0), 2)
                s_built = round(random.uniform(30.0, 85.0), 1)

                cur.execute("""
                    INSERT INTO regional_features (
                        grid_id, year_month, timestamp, ndvi, ndwi, ndbi, night_light,
                        temp_celsius, rainfall_mm, built_up_pct, provenance_type
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'SYNTHETIC_DEMO')
                    ON CONFLICT (grid_id, year_month) DO UPDATE SET
                        ndvi = EXCLUDED.ndvi,
                        provenance_type = 'SYNTHETIC_DEMO';
                """, (gid, ym, dt, s_ndvi, s_ndwi, s_ndbi, s_night, s_temp, s_rain, s_built))
                inserted_count += 1

        conn.commit()
        cur.close()
        conn.close()
        print(f"Successfully inserted {inserted_count} SYNTHETIC_DEMO feature records.")
    except Exception as e:
        print(f"Error seeding demo data: {e}")


if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL", "postgresql://earthpulse:earthpulse_dev_password@localhost:5432/earthpulse_db")
    seed_synthetic_demo_data(db_url)
