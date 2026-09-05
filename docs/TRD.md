# EarthPulse AI — Technical Requirements Document (TRD)

> **“AI that reveals how India is changing.”**

---

## 1. System Architecture Overview

EarthPulse AI is architected as a decoupled, cloud-native geospatial intelligence platform:
- **Frontend Presentation Layer**: Next.js (App Router, JavaScript) delivering a high-performance, dark-first geospatial command center.
- **Application & API Layer**: Python FastAPI microservice handling geospatial queries, baseline computations, and multi-signal anomaly analytics.
- **Data & Spatial Storage Layer**: PostgreSQL with PostGIS extension for spatial vector geometries, spatial joins, and immutable observation ledgers.
- **Analytical & ML Processing Engine**: Python data pipeline (GeoPandas, Rasterio, Shapely, scikit-learn) orchestrating raster regularization onto an analytical 0.05° grid.
- **Authentication & Identity**: Supabase Auth integration.

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                     |
|     Next.js (App Router, JavaScript, Tailwind CSS, Leaflet/MapLibre, Recharts)        |
+-------------------------------------------+-------------------------------------------+
                                            | HTTPS / JSON
                                            v
+---------------------------------------------------------------------------------------+
|                               FASTAPI APPLICATION SERVER                             |
|  - Auth Middleware (Supabase JWT)           - CORS Middleware                         |
|  - REST API Routers (/regions, /observations, /anomalies, /insights, /comparisons)    |
|  - Geospatial Grid Services                 - ML Anomaly & Baseline Engine            |
+---------------------+-------------------------------------+---------------------------+
                      |                                     |
                      v                                     v
+------------------------------------+  +-----------------------------------------------+
|     POSTGRESQL + POSTGIS           |  |           DATA INGESTION PIPELINE             |
|  - Spatial Fishnet Grid Cells      |  |  - NASA POWER API (Temp, Precip)              |
|  - Regional Administrative Polygons|  |  - Sentinel-2 MSI (NDVI, NDWI, NDBI)          |
|  - Observations & Provenance Ledger|  |  - VIIRS DNB (Nighttime Lights)               |
|  - Anomaly & Insight Catalog       |  |  - OpenStreetMap (Infrastructure Density)     |
+------------------------------------+  +-----------------------------------------------+
```

---

## 2. Technology Stack Breakdown

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router, JavaScript, NOT TypeScript).
- **Styling**: Tailwind CSS with custom design tokens for dark-mode telemetry.
- **Component Primitives**: shadcn/ui inspired modular components (Card, Badge, Button, Tabs, Sheet).
- **Mapping Engine**: Leaflet (via React-Leaflet with dynamic client-side loading) / MapLibre GL.
- **Charting & Visualizations**: Recharts for multi-signal time-series, radar charts, and anomaly scatter plots.
- **Icons**: Lucide React.
- **Data Fetching**: Native Fetch with custom caching and error boundary handling.

### 2.2 Backend
- **Framework**: Python 3.11+ with FastAPI.
- **Server**: Uvicorn ASGI server.
- **Validation & Settings**: Pydantic v2 & Pydantic Settings.
- **ORM & DB Connectivity**: SQLAlchemy 2.0 with GeoAlchemy2 and `asyncpg` / `psycopg2-binary`.
- **API Documentation**: Interactive Swagger UI (`/docs`) and ReDoc (`/redoc`).

### 2.3 Geospatial & Machine Learning
- **Geospatial Processing**: GeoPandas, Shapely 2.0, Rasterio, PyProj.
- **Data Manipulation**: pandas, NumPy.
- **Machine Learning**: scikit-learn (Isolation Forest, RobustScaler, PCA), SciPy (z-score, MAD, signal cross-correlation).
- **LLM Reasoning**: OpenAI / Groq / Ollama client integration using structured JSON schema output.

### 2.4 Database & Storage
- **Database Engine**: PostgreSQL 16+ with PostGIS 3.4+.
- **Spatial Features**: Geometry types (`GEOMETRY(Polygon, 4326)` and `GEOMETRY(Point, 4326)`).
- **Indexing**: PostGIS R-Tree spatial indexing (`GIST`) on all boundary and grid polygons; composite indexes on `(grid_id, acquisition_timestamp)`.

---

## 3. Data Provenance Architecture

To prevent fabricated data, every data record must satisfy the provenance contract:

```sql
CREATE TYPE provenance_type_enum AS ENUM (
    'OBSERVED',
    'CALCULATED',
    'AI_INTERPRETED',
    'SYNTHETIC_DEMO'
);
```

Every observation response returned by the API includes:
```json
{
  "grid_id": 14,
  "signal_name": "temperature_2m",
  "signal_value": 31.45,
  "unit": "Celsius",
  "acquisition_timestamp": "2024-05-15T00:00:00Z",
  "processing_timestamp": "2024-05-16T04:12:30Z",
  "dataset_id": "nasa_power_t2m_monthly",
  "source_name": "NASA POWER",
  "source_url": "https://power.larc.nasa.gov/api/temporal",
  "spatial_resolution": "0.5x0.625 deg",
  "temporal_resolution": "monthly",
  "provenance_type": "OBSERVED"
}
```

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status and database connectivity check |
| `GET` | `/api/v1/regions` | List administrative regions (National, State, District) |
| `GET` | `/api/v1/regions/{id}` | Retrieve regional geometry and summary metadata |
| `GET` | `/api/v1/regions/{id}/grid` | Retrieve GeoJSON FeatureCollection of 0.05° grid cells |
| `GET` | `/api/v1/observations` | Query observations filtered by region, signal, and time range |
| `GET` | `/api/v1/observations/grid/{grid_id}` | Time-series observations for a specific analytical cell |
| `GET` | `/api/v1/anomalies` | List detected multi-signal anomalies |
| `GET` | `/api/v1/anomalies/grid/{grid_id}` | Anomaly events detected within a grid cell |
| `GET` | `/api/v1/insights` | Evidence-backed AI summaries and cross-signal explanations |
| `GET` | `/api/v1/comparisons` | Comparative metric analysis between two cells or time windows |

---

## 5. Security & Deployment

### 5.1 Security
- **Authentication**: JWT verification via Supabase public keys.
- **CORS Protection**: Explicit domain whitelisting.
- **SQL Injection Prevention**: 100% parameterized queries via SQLAlchemy ORM.
- **Input Sanitization**: Pydantic schema validation on all inputs.

### 5.2 Deployment
- **Frontend**: Vercel (Edge network, global CDN, automatic SSL).
- **Backend**: Containerized Docker on Railway or Render with health checks.
- **Database**: Managed Supabase PostgreSQL with PostGIS enabled.
