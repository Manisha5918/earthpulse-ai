# EarthPulse AI 🛰️🇮🇳

> **“AI that reveals how India is changing.”**

EarthPulse AI is an India-focused regional geospatial intelligence platform. It fuses multi-source, real-world satellite imagery, nocturnal illumination, meteorological observations, and spatial infrastructure into a unified analytical grid and temporal continuum.

---

## 🎯 Project Overview & Paradigm

EarthPulse AI does **not** make sensationalized disaster predictions or economic collapse forecasts. Instead, it operates on a rigorous 5-stage analytical lifecycle:

$$\text{Observe} \longrightarrow \text{Detect} \longrightarrow \text{Connect} \longrightarrow \text{Explain} \longrightarrow \text{Decide}$$

1. **Observe**: Ingest verifiable physical observations from Sentinel-2, VIIRS Nighttime Lights, NASA POWER (temperature & precipitation), and OpenStreetMap.
2. **Detect**: Model seasonal baselines across multi-year histories to detect statistically significant regional anomalies (e.g. vegetation loss, thermal spikes, water body shrinkage, nocturnal light shifts).
3. **Connect**: Form cross-signal relationship graphs (e.g., assessing if a drop in surface water correlates with rainfall deficit or built-up expansion).
4. **Explain**: Generate evidence-grounded AI explanations citing precise observed data points, sensor timestamps, and computed deviation percentiles.
5. **Decide**: Empower regional planners, environmental monitors, and researchers with actionable spatial intelligence.

---

## 🛡️ Strict Data Provenance Principles

EarthPulse AI maintains complete separation between data layers:

| Provenance Level | Description |
| :--- | :--- |
| `OBSERVED` | Direct telemetry acquired from authoritative scientific APIs (Sentinel-2, NASA POWER, VIIRS, OSM) with immutable timestamps and dataset IDs. |
| `CALCULATED` | Metrics, indices (NDVI, NDWI, NDBI), and statistical baselines computed directly from observed records. |
| `AI_INTERPRETED` | Synthesis and analytical explanations generated strictly referencing calculated metrics and observed signals. |
| `SYNTHETIC_DEMO` | Mock/demo values used strictly for UI prototyping in local offline environments. Prominently badged across all APIs and frontend views. **Never presented as real observations.** |

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: Next.js (App Router, JavaScript), Tailwind CSS, Leaflet/MapLibre, Recharts, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0.
- **Geospatial & AI**: GeoPandas, Rasterio, Shapely, NumPy, pandas, scikit-learn.
- **Database**: PostgreSQL with PostGIS extension (Supabase / local Docker).
- **Authentication**: Supabase Auth.
- **Deployment**: Vercel (Frontend), Railway / Render (Backend), Supabase (PostGIS & Auth).

---

## 📂 Project Structure

```
EarthPulse-AI/
├── docs/                        # Complete technical and product documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── TRD.md                   # Technical Requirements Document
│   ├── APP_FLOW.md              # UX and Screen Navigation Flow
│   ├── UI_UX_DESIGN.md          # Scientific Command Center Design System
│   ├── BACKEND_SCHEMA.md        # PostGIS Database Schema Specification
│   ├── IMPLEMENTATION_PLAN.md   # Phased Engineering Roadmap
│   ├── DATA_SOURCES.md          # Remote Sensing & Meteorological Ingestion Specs
│   └── AI_ARCHITECTURE.md       # Multi-Signal Anomaly & Reasoning Pipeline
│
├── frontend/                    # Next.js JavaScript Application
│   ├── src/app/                 # App Router (explore, region, compare, insights, timeline)
│   ├── src/components/          # Map, charts, telemetry widgets, indicators
│   └── src/services/            # API client with provenance badges
│
├── backend/                     # FastAPI Application
│   └── app/
│       ├── api/                 # REST endpoints for regions, observations, anomalies
│       ├── data_sources/        # Ingestion modules (NASA POWER, Sentinel-2, VIIRS, OSM)
│       ├── geospatial/          # Analytical grid generator and zonal statistics
│       └── ml/                  # Baselines, anomaly detection, multi-signal scoring
│
├── data/                        # Local raw, processed, and boundary datasets
│   └── boundaries/              # Administrative boundaries (GeoJSON)
├── database/                    # PostGIS DDL and reference seed metadata
├── notebooks/                   # Jupyter exploratory research notebooks
├── scripts/                     # Operational ETL, grid building, and demo seed scripts
└── tests/                       # Automated test suites
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Docker & Docker Compose (or local PostgreSQL with PostGIS 3.0+)
- Python 3.11+
- Node.js 18+ and npm

### 2. Environment Setup
Copy the environment template and populate your credentials:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 3. Database Initialization
Start PostgreSQL with PostGIS via Docker:
```bash
docker-compose up -d db
```
Run the schema setup script:
```bash
python scripts/setup_database.py
```

### 4. Running Backend
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation is available at `http://localhost:8000/docs`.

### 5. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to access the EarthPulse AI platform.

### 6. Running MVP Data Pipeline (Chennai, Tamil Nadu)
To ingest real NASA POWER meteorological observations for the Chennai grid:
```bash
python scripts/build_grid.py --region chennai
python scripts/download_nasa_power.py --region chennai --start-year 2021 --end-year 2024
python scripts/generate_features.py --region chennai
```

---

## ⚖️ Ethics, Disclaimers & Limitations
- **No Disaster Forecasting**: EarthPulse AI measures historical and recent observable physical changes; it is not an early warning disaster prediction system.
- **Atmospheric & Cloud Interference**: Optical satellite observations (Sentinel-2) are subject to monsoon cloud cover; all optical measurements display cloud-mask confidence flags.
- **Scientific Reference**: Intended for environmental and regional analytical decision support.
