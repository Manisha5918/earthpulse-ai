# EarthPulse AI — Application Flow & Navigation Specification

> **“AI that reveals how India is changing.”**

---

## 1. Primary User Journey & Screen Hierarchy

```
                                  +-----------------------+
                                  |   / (Landing Page)    |
                                  +-----------+-----------+
                                              |
                                              v
+-------------------------------------------------------------------------------------------+
|                                    /explore (India Map)                                    |
|  - National / State / District Overview       - Active Signal Layer Selector               |
|  - Anomaly Severity Filter                     - Regional Quick-Select (Chennai Pilot)      |
+---------------------------------------------+---------------------------------------------+
                                              |
                          +-------------------+-------------------+
                          | (Select Region)                       | (Select Compare)
                          v                                       v
+-----------------------------------+   +---------------------------------------------------+
|     /region/[id] (Dashboard)      |   |            /compare (Comparative Mode)            |
|  - 0.05° Sub-Grid Cell Explorer   |   |  - Dual Region Comparison (e.g. Core vs Suburb)   |
|  - Multi-Signal Telemetry Cards   |   |  - Dual Time Comparison (e.g. 2021 vs 2024)       |
|  - Historical Baseline Sparklines |   +---------------------------------------------------+
|  - Detected Anomaly Feed          |
|  - Cross-Signal Correlation Graph |
|  - AI Grounded Intelligence Brief |
+-----------------+-----------------+
                  | (Click Grid Cell)
                  v
+-----------------------------------+
|      Grid Cell Detail Drawer      |
|  - Sensor Observations (NDVI/NDWI)|
|  - Meteorological Readings        |
|  - Provenance & Sensor Timestamps |
+-----------------------------------+
```

---

## 2. Screen Specifications

### 2.1 Landing Page (`/`)
- **Hero Section**: Tagline “AI that reveals how India is changing.”
- **Mission Statement**: Explaining the Observe → Detect → Connect → Explain → Decide paradigm.
- **Physical Signal Matrix**: Interactive cards illustrating Sentinel-2, VIIRS, NASA POWER, and OSM.
- **Data Integrity Guarantee**: Explaining the strict zero-fabrication and provenance standards.
- **Call-to-Action**: Direct button: `Launch EarthPulse Console` navigating to `/explore`.

### 2.2 National & Regional Explore Page (`/explore`)
- **Map Viewport**: Interactive Leaflet / MapLibre map centered on India (initial zoom: Level 5), highlighted bounding box on the Chennai Metropolitan Area.
- **Signal Layer Switcher**:
  - `NDVI` (Normalized Difference Vegetation Index)
  - `NDWI` (Normalized Difference Water Index)
  - `Night Lights` (VIIRS Radiance)
  - `Temperature` (NASA POWER 2m Air Temp)
  - `Precipitation` (NASA POWER Rainfall)
  - `Built-up Index` (NDBI / Urban Density)
- **Region Quick Switcher**: Selector for pilot districts (starting with Chennai, Tamil Nadu).
- **Time Slider / Scrubber**: Monthly scrubber from Jan 2021 to Dec 2024.

### 2.3 Regional Intelligence Dashboard (`/region/[id]`)
- **Sub-Grid Map**: Visualizes the analytical 0.05° (~5.5 km) regular grid overlaid on the district boundary.
- **Top Telemetry Bar**: Real computed indicators for the selected district and month.
- **Signal Cards**:
  - Vegetation Status (NDVI) with 3-year baseline comparison.
  - Surface Water Dynamics (NDWI) with water body surface area delta.
  - Nocturnal Luminosity (VIIRS radiance in nW/cm²/sr).
  - Thermal Profile (NASA POWER mean monthly temperature in °C).
  - Precipitation Accumulation (NASA POWER monthly rainfall in mm).
- **Anomaly Feed**: List of cells with significant deviations ($|Z| \ge 2.0$), tagged with severity (Low, Medium, High).
- **Cross-Signal Relationship Panel**: Scatter plots and correlation coefficients between signals (e.g., rainfall vs. surface water).
- **AI Intelligence Briefing**: Expandable narrative explaining detected shifts with citations of exact observed metrics and timestamps.

### 2.4 Comparative Intelligence (`/compare`)
- Side-by-side split screen comparing two entities:
  - **Spatial Comparison**: Compare an urban core cell with an expanding peri-urban cell.
  - **Temporal Comparison**: Compare the same grid cell between two historical years (e.g., May 2021 vs. May 2024).
- Automatic diff computation showing percentage change, absolute delta, and divergence in anomaly scores.

### 2.5 Historical Timeline Explorer (`/timeline`)
- Multi-year progression view showing seasonal cyclicality vs. permanent shifts.
- Scrubbing through months animates the grid cell color intensity according to signal values.

### 2.6 Methodology & About (`/about`)
- Comprehensive scientific documentation on data sources, processing formulas, cloud masking, and academic citations.
- Complete ethical disclaimer stating what EarthPulse AI does and does not do.

### 2.7 Settings & Configuration (`/settings`)
- Measurement unit toggle (Metric / Imperial).
- Grid cell opacity and contour settings.
- Provenance indicator detail level.
- Local cache clearing and API endpoint diagnostics.

---

## 3. UI States & Edge Cases

### 3.1 Empty State
- Displayed when no satellite or meteorological observations have been ingested for a newly initialized region.
- Clear message: `No observational records ingested for this region and time window. Run the data pipeline to ingest real satellite and climate feeds.`
- Explicit button to trigger the ingestion pipeline or view demo data.

### 3.2 Loading State
- Sleek skeleton loaders mimicking the card layout with a glowing pulse animation.
- Map displays a non-blocking subtle spinning telemetry radar.

### 3.3 Synthetic Demo Data State
- Whenever `SYNTHETIC_DEMO` data is present, a persistent warning banner appears at the top of the screen:
  `⚠️ DEMO MODE: Displaying synthetic test records. Real satellite feeds not yet ingested for this selection.`
