-- ==============================================================================
-- EarthPulse AI — Reference & Structural Seed Data (NO FAKE OBSERVATIONS)
-- Strict Data Provenance Enforcement:
-- ONLY administrative metadata, dataset definitions, and analytical grid geometry.
-- Observation and feature tables remain completely empty.
-- ==============================================================================

-- 1. Insert Datasets Catalog
INSERT INTO datasets (id, name, provider, category, spatial_resolution, temporal_resolution, license, source_url, description)
VALUES 
(
    'nasa_power_t2m_monthly',
    'NASA POWER 2m Air Temperature',
    'NASA Langley Research Center',
    'meteorological',
    '0.5 x 0.625 deg',
    'monthly',
    'Open Access (NASA Open Data)',
    'https://power.larc.nasa.gov/api/temporal',
    'Monthly average air temperature at 2 meters above surface level derived from MERRA-2 assimilation.'
),
(
    'nasa_power_prectotcorr_monthly',
    'NASA POWER Precipitation Corrected',
    'NASA Langley Research Center',
    'meteorological',
    '0.5 x 0.625 deg',
    'monthly',
    'Open Access (NASA Open Data)',
    'https://power.larc.nasa.gov/api/temporal',
    'Monthly cumulative precipitation corrected from GMAO MERRA-2 meteorological model.'
),
(
    'copernicus_s2_msi_l2a',
    'Sentinel-2 MSI Level-2A Bottom-Of-Atmosphere Reflectance',
    'European Space Agency (ESA) / Copernicus',
    'optical',
    '10m / 20m',
    '5-day revisit',
    'Open Access (Copernicus Data Policy)',
    'https://dataspace.copernicus.eu',
    'Calibrated surface reflectance imagery used to compute NDVI, NDWI, and NDBI indices with SCL cloud masking.'
),
(
    'noaa_viirs_dnb_vcmcfg',
    'VIIRS Day/Night Band Monthly Cloud-Free Radiance',
    'NOAA National Centers for Environmental Information (NCEI)',
    'nocturnal',
    '750m (15 arc-second)',
    'monthly composite',
    'Public Domain',
    'https://www.ngdc.noaa.gov/eog/viirs/download_dnb_composites.html',
    'Stray light corrected nocturnal radiance in nW/cm2/sr measuring urban and industrial luminosity.'
),
(
    'osm_overpass_infrastructure',
    'OpenStreetMap Regional Infrastructure',
    'OpenStreetMap Foundation',
    'vector',
    'sub-meter',
    'continual',
    'ODbL',
    'https://overpass-api.de/api/interpreter',
    'Vector road network density, built footprints, and designated waterbody polygons.'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Pilot Region: Chennai Metropolitan Area, Tamil Nadu, India
INSERT INTO regions (code, name, state, country, admin_level, boundary_geom, centroid_geom, area_sqkm, metadata)
VALUES (
    'IN-TN-CHE',
    'Chennai Metropolitan Area',
    'Tamil Nadu',
    'India',
    'DISTRICT',
    ST_Multi(ST_GeomFromText('POLYGON((80.10 12.85, 80.35 12.85, 80.35 13.25, 80.10 13.25, 80.10 12.85))', 4326)),
    ST_GeomFromText('POINT(80.225 13.05)', 4326),
    426.00,
    '{"census_code": "603", "population_2011": 4646732, "tier": "Metro", "pilot_region": true}'::jsonb
)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- 3. Insert 0.05° Analytical Grid Cells for Chennai Pilot (16 regular cells)
-- Latitude range: 12.90 to 13.10 (4 steps of 0.05°)
-- Longitude range: 80.15 to 80.35 (4 steps of 0.05°)
-- Analytical geometry only (NOT observational measurements)
DO $$
DECLARE
    v_region_id INT;
    v_lat NUMERIC(9,6);
    v_lon NUMERIC(9,6);
    v_step NUMERIC(9,6) := 0.050000;
    v_row INT;
    v_col INT;
    v_cell_code VARCHAR(50);
    v_poly TEXT;
    v_point TEXT;
BEGIN
    SELECT id INTO v_region_id FROM regions WHERE code = 'IN-TN-CHE';
    
    FOR v_row IN 0..3 LOOP
        FOR v_col IN 0..3 LOOP
            v_lat := 12.900000 + (v_row * v_step);
            v_lon := 80.150000 + (v_col * v_step);
            v_cell_code := 'CHE_G' || LPAD(((v_row * 4) + v_col + 1)::text, 3, '0');
            
            -- Construct 0.05 deg bounding polygon
            v_poly := 'POLYGON((' ||
                v_lon || ' ' || v_lat || ', ' ||
                (v_lon + v_step) || ' ' || v_lat || ', ' ||
                (v_lon + v_step) || ' ' || (v_lat + v_step) || ', ' ||
                v_lon || ' ' || (v_lat + v_step) || ', ' ||
                v_lon || ' ' || v_lat || '))';
                
            -- Construct cell center point
            v_point := 'POINT(' || (v_lon + (v_step / 2.0)) || ' ' || (v_lat + (v_step / 2.0)) || ')';
            
            INSERT INTO grid_cells (
                region_id, cell_code, center_lat, center_lon, cell_geom, center_point, area_sqkm, resolution_deg
            ) VALUES (
                v_region_id,
                v_cell_code,
                v_lat + (v_step / 2.0),
                v_lon + (v_step / 2.0),
                ST_GeomFromText(v_poly, 4326),
                ST_GeomFromText(v_point, 4326),
                30.25,
                0.0500
            )
            ON CONFLICT (cell_code) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 4. Strict Data Provenance Assurance:
-- Tables 'observations', 'regional_features', 'anomalies', 'signal_relationships', and 'ai_insights'
-- are deliberately left EMPTY.
-- Real observations will only be populated via the automated ingestion pipelines:
-- (NASA POWER API, Sentinel-2, VIIRS, OpenStreetMap).
