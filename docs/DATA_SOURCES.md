# EarthPulse AI — Data Sources & Ingestion Specification

> **"AI that reveals how India is changing."**

---

## 1. Overview of Heterogeneous Signals

EarthPulse AI ingests and harmonizes 4 real-world Earth Observation and geospatial datasets across a standardized **0.05° analytical grid** (~5.5 km resolution):

| Dataset | Provider | Parameters / Signals | Temporal Extent | Provenance Rule | Authentication |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA POWER** | NASA Langley Research Center | 2m Air Temperature (`T2M`), Precipitation (`PRECTOTCORR`) | 2021-01-01 to 2024-12-31 (1,461 daily records) | `OBSERVED` | No API key required |
| **Sentinel-2 L2A** | European Space Agency (ESA) / AWS COG | NDVI (Vegetation), NDWI (Water), NDBI (Built-Up) | 2021–2024 Multi-Temporal (4 cloud-free scenes) | `CALCULATED` | No API key required |
| **VIIRS DNB Nighttime Lights** | NOAA / EOG / World Bank Open Night Lights | Monthly Cloud-Free Nighttime Radiance (`v10_ops`, `ecm-slcorr`) | April 2021, April 2022, April 2023, April 2024 | `CALCULATED` | No API key required |
| **OpenStreetMap (OSM)** | OpenStreetMap Contributors | Deduplicated road networks (5,772.9 km), mapped buildings (236,154), estimated building coverage, POIs (2,835) | Current Baseline Extract | `CALCULATED` | No API key required |

---

## 2. Source Specifications

### 2.1 NASA POWER Meteorological Data
- **Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Region**: Chennai Metropolitan Area (`13.0827°N, 80.2707°E`)
- **Period**: 2021-01-01 through 2024-12-31 (1,461 daily records)
- **Variables**: `T2M` (Temperature at 2m in °C), `PRECTOTCORR` (Precipitation in mm/day)
- **License**: Public Domain (NASA Open Data Policy)
- **Authentication**: None required

### 2.2 Sentinel-2 Level-2A Surface Reflectance
- **Catalog**: AWS Open Data Cloud-Optimized GeoTIFFs (`https://sentinel-cogs.s3.us-west-2.amazonaws.com`)
- **Tile**: MGRS `44PMV` (Chennai coverage)
- **Scenes Ingested**:
  - `2021-04-10` (Pre-monsoon summer baseline)
  - `2022-04-10` (Annual follow-up)
  - `2023-04-10` (Annual follow-up)
  - `2024-04-09` (Recent summer baseline)
- **Spectral Indices Computed**:
  - $\text{NDVI} = \frac{\text{B08} - \text{B04}}{\text{B08} + \text{B04}}$ (Normalized Difference Vegetation Index)
  - $\text{NDWI} = \frac{\text{B03} - \text{B08}}{\text{B03} + \text{B08}}$ (McFeeters Normalized Difference Water Index)
  - $\text{NDBI} = \frac{\text{B11} - \text{B08}}{\text{B11} + \text{B08}}$ (Zha Normalized Difference Built-Up Index)
- **Quality Control**: Scene Classification Layer (SCL) cloud/shadow masking.

### 2.3 VIIRS Day/Night Band (DNB) Nighttime Radiance
- **Source**: NOAA / Earth Observation Group (EOG) / World Bank Open Night Lights
- **Repository**: AWS S3 Open Data (`https://globalnightlight.s3.amazonaws.com`)
- **Composites Ingested**:
  - `202104` (April 2021 Monthly Cloud-Free Stray-Light Corrected)
  - `202204` (April 2022 Monthly Cloud-Free Stray-Light Corrected)
  - `202304` (April 2023 Monthly Cloud-Free Stray-Light Corrected)
  - `202404` (April 2024 Monthly Cloud-Free Stray-Light Corrected)
- **Sensor Resolution**: 15 arc-seconds (~500m per pixel, ~144 sensor pixels per 0.05° grid cell)
- **Metric**: Top-of-Atmosphere Nighttime Radiance in $\text{nW}\cdot\text{cm}^{-2}\cdot\text{sr}^{-1}$
- **Provenance**: Derived raster statistics stamped as `CALCULATED`.

### 2.4 OpenStreetMap (OSM) Regional Context Layer
- **Source**: OpenStreetMap Contributors
- **Access Endpoints**: Public Overpass API mirrors (`https://overpass-api.de/api/interpreter`, `https://maps.mail.ru/osm/tools/overpass/api/interpreter`, `https://overpass.kumi.systems/api/interpreter`)
- **License**: Open Database License (ODbL) 1.0 (`© OpenStreetMap contributors`)
- **Authentication**: None required (public open endpoints)
- **Spatial Processing CRS**: Snyder (1987) Transverse Mercator UTM Zone 44N (`EPSG:32644`) for all metric length and area calculations.
- **Derived Metrics**:
  1. **Road Network**: Deduplicated total length (5,772.94 km across 42,500 unique ways), road density ($\text{km/km}^2$), and length breakdown across 7 highway classes (`motorway`, `trunk`, `primary`, `secondary`, `tertiary`, `residential`, `service`).
  2. **Mapped Buildings**: Exact count of mapped structures per cell, empirical mean footprint ($141.4\text{ m}^2$), total building footprint area ($\text{km}^2$), building density ($\text{buildings/km}^2$), and building coverage ratio ($\%$).
  3. **Points of Interest (POIs)**: Categorized into `healthcare`, `education`, `public_transport`, `financial_commercial`, and `other_amenity`, plus total POI density ($\text{POIs/km}^2$).
- **Strict Data Interpretation Limits**:
  - OpenStreetMap is a volunteered geographic information (VGI) dataset. Feature densities reflect mapping completeness and do not represent a complete demographic census.
  - Absence of an OSM feature does NOT prove non-existence.
  - Building counts reflect physical mapped structures and must **NEVER** be interpreted as population numbers.

---

## 3. Dedicated Dataset Architecture (`datasets/`)

```
datasets/
├── nasa_power/
│   ├── raw/ (1,461 daily weather observations JSON)
│   ├── processed/ (Cleaned CSV & observations ledger)
│   └── metadata/ (API & parameter provenance JSON)
├── sentinel2/
│   ├── raw/ (4-year multi-temporal tile bytes & overview headers)
│   ├── processed/ (NDVI, NDWI, NDBI grid aggregations CSV & JSON)
│   └── metadata/ (Sentinel-2 COG scene provenance JSON)
├── viirs/
│   ├── raw/ (Cloud-free BigTIFF monthly composite tiles)
│   ├── processed/ (Multi-temporal radiance statistics CSV & JSON)
│   └── metadata/ (VIIRS DNB calibration & sensor metadata JSON)
└── osm/
    ├── raw/ (osm_chennai_roads_raw.json, osm_chennai_pois_raw.json, osm_chennai_buildings_summary_raw.json)
    ├── processed/ (osm_chennai_grid_context.csv, osm_chennai_grid_context.json, osm_chennai_observations_ledger.csv)
    └── metadata/ (osm_metadata.json)
```
