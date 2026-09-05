# EarthPulse AI — Backend Database Schema Specification (PostGIS)

> **“AI that reveals how India is changing.”**

---

## 1. Overview & Extensions

The EarthPulse AI relational storage layer uses PostgreSQL 16+ with the PostGIS 3.4+ extension. All spatial geometries use EPSG:4326 (WGS 84 coordinate system).

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Enumerations

```sql
-- Data Provenance Tiers
CREATE TYPE provenance_type_enum AS ENUM (
    'OBSERVED',
    'CALCULATED',
    'AI_INTERPRETED',
    'SYNTHETIC_DEMO'
);

-- Administrative Hierarchy Level
CREATE TYPE admin_level_enum AS ENUM (
    'NATIONAL',
    'STATE',
    'DISTRICT',
    'SUB_DISTRICT',
    'METRO_ZONE'
);

-- Anomaly Severity Levels
CREATE TYPE anomaly_severity_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);
```

---

## 3. Entity Relational Definitions

### 3.1 `users`
System users and researchers.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'researcher',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 `regions`
Official administrative areas (India national boundary, states, districts like Chennai).
```sql
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,       -- e.g. 'IN-TN-CHE'
    name VARCHAR(150) NOT NULL,              -- e.g. 'Chennai'
    state VARCHAR(100) NOT NULL,             -- e.g. 'Tamil Nadu'
    country VARCHAR(100) DEFAULT 'India',
    admin_level admin_level_enum NOT NULL,
    boundary_geom GEOMETRY(Polygon, 4326),
    centroid_geom GEOMETRY(Point, 4326),
    area_sqkm NUMERIC(10, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_regions_boundary ON regions USING GIST (boundary_geom);
CREATE INDEX idx_regions_centroid ON regions USING GIST (centroid_geom);
```

### 3.3 `grid_cells`
Unified 0.05° (~5.5 km) analytical spatial grid cells covering regions.
```sql
CREATE TABLE grid_cells (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    cell_code VARCHAR(50) UNIQUE NOT NULL,   -- e.g. 'CHE_G014'
    center_lat NUMERIC(9, 6) NOT NULL,
    center_lon NUMERIC(9, 6) NOT NULL,
    cell_geom GEOMETRY(Polygon, 4326) NOT NULL,
    center_point GEOMETRY(Point, 4326) NOT NULL,
    area_sqkm NUMERIC(8, 2) DEFAULT 30.25,
    resolution_deg NUMERIC(6, 4) DEFAULT 0.0500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_grid_cells_geom ON grid_cells USING GIST (cell_geom);
CREATE INDEX idx_grid_cells_point ON grid_cells USING GIST (center_point);
CREATE INDEX idx_grid_cells_region ON grid_cells (region_id);
```

### 3.4 `datasets`
Catalog of real-world remote sensing and climate data feeds.
```sql
CREATE TABLE datasets (
    id VARCHAR(50) PRIMARY KEY,              -- e.g. 'nasa_power_t2m_daily'
    name VARCHAR(150) NOT NULL,
    provider VARCHAR(100) NOT NULL,          -- e.g. 'NASA Langley Research Center'
    category VARCHAR(50) NOT NULL,           -- 'meteorological', 'optical', 'nocturnal', 'vector'
    spatial_resolution VARCHAR(50),          -- '0.5 x 0.625 deg', '10m', '750m'
    temporal_resolution VARCHAR(50),         -- 'daily', 'monthly', '5-day'
    license VARCHAR(100),
    source_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 `observations`
Primary ledger for all observed physical values.
```sql
CREATE TABLE observations (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    dataset_id VARCHAR(50) REFERENCES datasets(id),
    signal_name VARCHAR(50) NOT NULL,        -- 'temperature_2m', 'precipitation', 'ndvi', 'radiance'
    signal_value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(30) NOT NULL,               -- 'Celsius', 'mm', 'index_ratio', 'nW/cm2/sr'
    acquisition_timestamp TIMESTAMPTZ NOT NULL,
    processing_timestamp TIMESTAMPTZ DEFAULT NOW(),
    cloud_cover_pct NUMERIC(5, 2),
    quality_flag VARCHAR(50) DEFAULT 'GOOD',
    provenance_type provenance_type_enum NOT NULL DEFAULT 'OBSERVED',
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_obs_grid_signal_time ON observations (grid_id, signal_name, acquisition_timestamp);
CREATE INDEX idx_obs_provenance ON observations (provenance_type);
```

### 3.6 `regional_features`
Aggregated multi-signal feature matrix per grid cell and monthly time slice.
```sql
CREATE TABLE regional_features (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,          -- 'YYYY-MM'
    timestamp TIMESTAMPTZ NOT NULL,
    ndvi NUMERIC(6, 4),
    ndwi NUMERIC(6, 4),
    ndbi NUMERIC(6, 4),
    night_light NUMERIC(10, 4),              -- VIIRS radiance
    temp_celsius NUMERIC(6, 2),              -- NASA POWER 2m temp
    rainfall_mm NUMERIC(8, 2),               -- NASA POWER precipitation
    built_up_pct NUMERIC(5, 2),
    provenance_type provenance_type_enum NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_grid_time UNIQUE (grid_id, year_month)
);
CREATE INDEX idx_features_grid_month ON regional_features (grid_id, year_month);
```

### 3.7 `anomalies`
Statistically verified multi-signal deviations from baseline norms.
```sql
CREATE TABLE anomalies (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    signal_name VARCHAR(50) NOT NULL,
    observed_value NUMERIC(12, 4) NOT NULL,
    baseline_mean NUMERIC(12, 4) NOT NULL,
    baseline_std NUMERIC(12, 4) NOT NULL,
    z_score NUMERIC(8, 3) NOT NULL,
    severity anomaly_severity_enum NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL,       -- 'HEAT_SPIKE', 'WATER_DEPLETION', 'VEGETATION_LOSS'
    detected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_anomalies_grid ON anomalies (grid_id);
CREATE INDEX idx_anomalies_severity ON anomalies (severity);
```

### 3.8 `signal_relationships`
Correlation and causal coupling across physical signals.
```sql
CREATE TABLE signal_relationships (
    id SERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    primary_signal VARCHAR(50) NOT NULL,
    secondary_signal VARCHAR(50) NOT NULL,
    correlation_coefficient NUMERIC(6, 4) NOT NULL,
    lag_months INT DEFAULT 0,
    p_value NUMERIC(8, 6),
    relationship_type VARCHAR(50),           -- 'POSITIVE_COUPLED', 'INVERSE_COUPLED'
    sample_size INT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.9 `ai_insights`
Structured, evidence-grounded briefings generated from observed and calculated facts.
```sql
CREATE TABLE ai_insights (
    id BIGSERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    grid_id INT REFERENCES grid_cells(id) ON DELETE SET NULL,
    year_month VARCHAR(7) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    evidence_json JSONB NOT NULL,            -- Array of cited { signal, value, z_score, timestamp }
    confidence_score NUMERIC(4, 3) DEFAULT 0.950,
    model_name VARCHAR(100) NOT NULL,        -- e.g. 'claude-3.5-sonnet', 'gpt-4o'
    provenance_type provenance_type_enum NOT NULL DEFAULT 'AI_INTERPRETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.10 `saved_regions`
Bookmarked locations for quick user monitoring.
```sql
CREATE TABLE saved_regions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    custom_label VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```


### 2.3 VIIRS Dataset Schema Reference
- `dataset_id`: `noaa_viirs_dnb_monthly_radiance`
- `signal_name`: `night_light`
- `unit`: `nW/cm2/sr`
- `provenance_type`: `CALCULATED` (grid-aggregated) / `OBSERVED` (raw pixel rasters)
- `grid_metrics`: `nighttime_radiance_mean`, `nighttime_radiance_median`, `nighttime_radiance_max`, `nighttime_radiance_min`, `nighttime_radiance_std`
