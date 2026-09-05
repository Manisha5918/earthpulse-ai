-- ==============================================================================
-- EarthPulse AI — PostGIS Database Schema DDL
-- "AI that reveals how India is changing."
-- ==============================================================================

-- 1. Enable Required Spatial and Core Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE provenance_type_enum AS ENUM (
        'OBSERVED',
        'CALCULATED',
        'AI_INTERPRETED',
        'SYNTHETIC_DEMO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE admin_level_enum AS ENUM (
        'NATIONAL',
        'STATE',
        'DISTRICT',
        'SUB_DISTRICT',
        'METRO_ZONE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE anomaly_severity_enum AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'researcher',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Regions Table (National, State, District Boundaries)
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    admin_level admin_level_enum NOT NULL,
    boundary_geom GEOMETRY(MultiPolygon, 4326),
    centroid_geom GEOMETRY(Point, 4326),
    area_sqkm NUMERIC(10, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regions_boundary ON regions USING GIST (boundary_geom);
CREATE INDEX IF NOT EXISTS idx_regions_centroid ON regions USING GIST (centroid_geom);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions (code);

-- 5. Grid Cells Table (0.05° Analytical Grid)
CREATE TABLE IF NOT EXISTS grid_cells (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    cell_code VARCHAR(50) UNIQUE NOT NULL,
    center_lat NUMERIC(9, 6) NOT NULL,
    center_lon NUMERIC(9, 6) NOT NULL,
    cell_geom GEOMETRY(Polygon, 4326) NOT NULL,
    center_point GEOMETRY(Point, 4326) NOT NULL,
    area_sqkm NUMERIC(8, 2) DEFAULT 30.25,
    resolution_deg NUMERIC(6, 4) DEFAULT 0.0500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grid_cells_geom ON grid_cells USING GIST (cell_geom);
CREATE INDEX IF NOT EXISTS idx_grid_cells_point ON grid_cells USING GIST (center_point);
CREATE INDEX IF NOT EXISTS idx_grid_cells_region ON grid_cells (region_id);
CREATE INDEX IF NOT EXISTS idx_grid_cells_code ON grid_cells (cell_code);

-- 6. Datasets Catalog Table
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    spatial_resolution VARCHAR(50),
    temporal_resolution VARCHAR(50),
    license VARCHAR(100),
    source_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Observations Table (Immutable Raw & Preprocessed Observations)
CREATE TABLE IF NOT EXISTS observations (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    dataset_id VARCHAR(50) REFERENCES datasets(id),
    signal_name VARCHAR(50) NOT NULL,
    signal_value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    acquisition_timestamp TIMESTAMPTZ NOT NULL,
    processing_timestamp TIMESTAMPTZ DEFAULT NOW(),
    cloud_cover_pct NUMERIC(5, 2),
    quality_flag VARCHAR(50) DEFAULT 'GOOD',
    provenance_type provenance_type_enum NOT NULL DEFAULT 'OBSERVED',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_obs_grid_signal_time ON observations (grid_id, signal_name, acquisition_timestamp);
CREATE INDEX IF NOT EXISTS idx_obs_provenance ON observations (provenance_type);
CREATE INDEX IF NOT EXISTS idx_obs_dataset ON observations (dataset_id);

-- 8. Regional Features Table (Unified Monthly Analytical Features)
CREATE TABLE IF NOT EXISTS regional_features (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    timestamp TIMESTAMPTZ NOT NULL,
    ndvi NUMERIC(6, 4),
    ndwi NUMERIC(6, 4),
    ndbi NUMERIC(6, 4),
    night_light NUMERIC(10, 4),
    temp_celsius NUMERIC(6, 2),
    rainfall_mm NUMERIC(8, 2),
    built_up_pct NUMERIC(5, 2),
    provenance_type provenance_type_enum NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_grid_time UNIQUE (grid_id, year_month)
);

CREATE INDEX IF NOT EXISTS idx_features_grid_month ON regional_features (grid_id, year_month);
CREATE INDEX IF NOT EXISTS idx_features_provenance ON regional_features (provenance_type);

-- 9. Anomalies Table (Statistically Detected Deviations)
CREATE TABLE IF NOT EXISTS anomalies (
    id BIGSERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    signal_name VARCHAR(50) NOT NULL,
    observed_value NUMERIC(12, 4) NOT NULL,
    baseline_mean NUMERIC(12, 4) NOT NULL,
    baseline_std NUMERIC(12, 4) NOT NULL,
    z_score NUMERIC(8, 3) NOT NULL,
    severity anomaly_severity_enum NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomalies_grid ON anomalies (grid_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies (severity);
CREATE INDEX IF NOT EXISTS idx_anomalies_month ON anomalies (year_month);

-- 10. Signal Relationships Table (Cross-Signal Correlations)
CREATE TABLE IF NOT EXISTS signal_relationships (
    id SERIAL PRIMARY KEY,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    primary_signal VARCHAR(50) NOT NULL,
    secondary_signal VARCHAR(50) NOT NULL,
    correlation_coefficient NUMERIC(6, 4) NOT NULL,
    lag_months INT DEFAULT 0,
    p_value NUMERIC(8, 6),
    relationship_type VARCHAR(50),
    sample_size INT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sigrel_grid ON signal_relationships (grid_id);

-- 11. AI Insights Table (Evidence-Grounded Syntheses)
CREATE TABLE IF NOT EXISTS ai_insights (
    id BIGSERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    grid_id INT REFERENCES grid_cells(id) ON DELETE SET NULL,
    year_month VARCHAR(7) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    detailed_explanation TEXT NOT NULL,
    evidence_json JSONB NOT NULL,
    confidence_score NUMERIC(4, 3) DEFAULT 0.950,
    model_name VARCHAR(100) NOT NULL,
    provenance_type provenance_type_enum NOT NULL DEFAULT 'AI_INTERPRETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_region ON ai_insights (region_id);
CREATE INDEX IF NOT EXISTS idx_insights_month ON ai_insights (year_month);

-- 12. Saved Regions Table
CREATE TABLE IF NOT EXISTS saved_regions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    grid_id INT REFERENCES grid_cells(id) ON DELETE CASCADE,
    custom_label VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- 11. ANALYSIS_JOBS
-- Tracks asynchronous multi-signal analysis execution tasks.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL,
    request_params JSONB NOT NULL,
    progress_pct INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    provenance_type VARCHAR(32) DEFAULT 'CALCULATED'
);

CREATE INDEX IF NOT EXISTS idx_analysis_jobs_job_id ON analysis_jobs (job_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs (status);

-- -----------------------------------------------------------------------------
-- 12. ANALYSIS_CACHE
-- Deterministic SHA-256 caching for verified multi-signal analysis profiles.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_cache (
    cache_key VARCHAR(64) PRIMARY KEY,
    location_type VARCHAR(32),
    matched_region VARCHAR(64),
    start_date DATE,
    end_date DATE,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON analysis_cache (expires_at);


-- ====================================================================
-- PHASE 6: STATISTICAL BASELINES, ANOMALIES & CROSS-SIGNAL INTELLIGENCE
-- ====================================================================

CREATE TABLE IF NOT EXISTS feature_baselines (
    id SERIAL PRIMARY KEY,
    grid_cell_id INTEGER REFERENCES grid_cells(id) ON DELETE CASCADE,
    signal VARCHAR(64) NOT NULL,
    baseline_start DATE,
    baseline_end DATE,
    observation_count INTEGER NOT NULL,
    mean DOUBLE PRECISION,
    median DOUBLE PRECISION,
    stddev DOUBLE PRECISION,
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    temporal_semantics VARCHAR(64) NOT NULL,
    confidence VARCHAR(32) NOT NULL DEFAULT 'LIMITED',
    status VARCHAR(64) NOT NULL DEFAULT 'CALCULATED',
    provenance_type VARCHAR(32) NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feature_baselines_cell_signal ON feature_baselines(grid_cell_id, signal);

CREATE TABLE IF NOT EXISTS anomaly_results (
    id SERIAL PRIMARY KEY,
    grid_cell_id INTEGER REFERENCES grid_cells(id) ON DELETE CASCADE,
    signal VARCHAR(64) NOT NULL,
    observation_date VARCHAR(64) NOT NULL,
    baseline_id INTEGER REFERENCES feature_baselines(id) ON DELETE SET NULL,
    observed_value DOUBLE PRECISION NOT NULL,
    absolute_change DOUBLE PRECISION,
    relative_change DOUBLE PRECISION,
    z_score DOUBLE PRECISION,
    robust_mad_score DOUBLE PRECISION,
    severity VARCHAR(32) NOT NULL,
    confidence VARCHAR(32) NOT NULL DEFAULT 'LIMITED',
    status VARCHAR(64) NOT NULL DEFAULT 'CALCULATED',
    provenance_type VARCHAR(32) NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomaly_results_cell_date ON anomaly_results(grid_cell_id, observation_date);
CREATE INDEX IF NOT EXISTS idx_anomaly_results_severity ON anomaly_results(severity);

CREATE TABLE IF NOT EXISTS cross_signal_results (
    id SERIAL PRIMARY KEY,
    grid_cell_id INTEGER REFERENCES grid_cells(id) ON DELETE CASCADE,
    analysis_period VARCHAR(64) NOT NULL,
    pattern_type VARCHAR(128) NOT NULL,
    supporting_signals TEXT[] NOT NULL,
    opposing_signals TEXT[] DEFAULT '{}',
    evidence_count INTEGER NOT NULL,
    temporal_compatibility VARCHAR(64) NOT NULL,
    spatial_compatibility VARCHAR(64) NOT NULL DEFAULT 'SAME_GRID_CELL',
    relationship_type VARCHAR(64) NOT NULL DEFAULT 'CORRELATION',
    causal_claim BOOLEAN NOT NULL DEFAULT FALSE,
    confidence VARCHAR(32) NOT NULL DEFAULT 'LIMITED',
    provenance_type VARCHAR(32) NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cross_signal_pattern ON cross_signal_results(pattern_type, analysis_period);
