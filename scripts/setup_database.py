"""Database Initialization Script for EarthPulse AI.
Executes schema.sql (DDL) and seed.sql (Reference Metadata).
Strict Data Provenance: Zero fake observations are inserted.
"""

import os
import sys
import argparse
import psycopg2


def setup_db(database_url: str):
    print(f"Connecting to database: {database_url}...")
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        schema_path = os.path.join(base_dir, "database", "schema.sql")
        seed_path = os.path.join(base_dir, "database", "seed.sql")

        print("Applying schema.sql...")
        with open(schema_path, "r", encoding="utf-8") as f:
            cur.execute(f.read())
        conn.commit()
        print("Schema successfully applied.")

        print("Applying seed.sql (reference & analytical grid metadata only)...")
        with open(seed_path, "r", encoding="utf-8") as f:
            cur.execute(f.read())
        conn.commit()
        print("Seed metadata successfully applied. Observation tables remain clean and empty.")

        cur.close()
        conn.close()
        print("Database setup complete.")
    except Exception as e:
        print(f"Error setting up database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize EarthPulse AI Database")
    parser.add_argument(
        "--db-url",
        default=os.getenv("DATABASE_URL", "postgresql://earthpulse:earthpulse_dev_password@localhost:5432/earthpulse_db"),
        help="PostgreSQL Connection URL"
    )
    args = parser.parse_args()
    setup_db(args.db_url)
