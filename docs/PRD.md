# EarthPulse AI — Product Requirements Document (PRD)

> **“AI that reveals how India is changing.”**

---

## 1. Project Identification
- **Project Name**: EarthPulse AI
- **Tagline**: “AI that reveals how India is changing.”
- **Target Geographic Scope**: India (MVP Focus: Chennai Metropolitan Region, Tamil Nadu)
- **Analytical Lifecycle**: Observe → Detect → Connect → Explain → Decide

---

## 2. Problem Statement
India is undergoing one of the fastest socio-economic and environmental transitions in the world: rapid urban footprint expansion, localized heat island intensification, seasonal surface water depletion, and shifting economic activity centers. 

Currently, stakeholders (city planners, environmental researchers, ESG auditors, policy analysts) face severe bottlenecks:
1. **Siloed Geospatial Feeds**: Satellite imagery (Sentinel-2), nocturnal illumination (VIIRS), meteorological records (NASA POWER), and civic infrastructure (OSM) exist in isolated portals with mismatched formats, projections, and time cadences.
2. **Raw Rasters vs. Regional Intelligence**: Raw satellite bands and numerical arrays require heavy GIS tooling that non-GIS domain experts cannot readily query.
3. **Black-box Disaster Panic vs. Nuanced Change**: Existing tools often focus on sensationalized, unverified "catastrophic collapse" or "disaster predictions". There is no trustworthy platform dedicated to observing, measuring, and explaining nuanced physical and environmental changes.
4. **Data Hallucination & Fabrication**: Modern AI tools frequently invent fake statistics and ungrounded percentages without provenance or traceability.

---

## 3. Target User Personas

### 3.1 Urban & Regional Planners
- **Goals**: Quantify urban sprawl, monitor vegetative loss versus concrete expansion, evaluate lake and reservoir shrinkage against local rainfall.
- **Pain Points**: Lack of high-cadence, consolidated multi-signal indicators at sub-district grid cell resolution.

### 3.2 Environmental Researchers & Climate Policy Analysts
- **Goals**: Study multi-year surface temperature trends, verify monsoon rainfall deficits, and measure ecological stress with high scientific integrity.
- **Pain Points**: Manual data download, harmonization, and spatial re-gridding consume 80% of research time.

### 3.3 ESG & Regional Infrastructure Analysts
- **Goals**: Track industrial corridor activity through nocturnal luminosity (VIIRS) and assess environmental externalities over time.
- **Pain Points**: Opaque reporting without verifiable data provenance or direct link to authoritative satellite observations.

---

## 4. Core Value Proposition
EarthPulse AI unifies diverse physical remote-sensing and climate datasets onto a **common 0.05° (~5.5 km) analytical spatial grid** and regular temporal baseline. It detects deviations from seasonal norms, correlates multi-sensor signals, and produces explainable, evidence-backed AI intelligence briefs where every number links back to immutable observation records.

---

## 5. Strict Data Provenance Rules
The system enforces 4 immutable tiers of data integrity:
1. `OBSERVED`: Raw or preprocessed physical sensor readings directly acquired from verified scientific APIs (Sentinel-2, NASA POWER, VIIRS, OSM) with sensor timestamps and source URLs.
2. `CALCULATED`: Statistical metrics and indices (NDVI, NDWI, NDBI, rolling baselines, z-scores) computed directly by our auditable algorithms.
3. `AI_INTERPRETED`: Explanations synthesized strictly from calculated metrics and observed signals. Never allowed to fabricate numbers or cite external hallucinations.
4. `SYNTHETIC_DEMO`: Explicitly tagged mock values used strictly for UI testing in offline environments. Always badged with clear visual warnings.

---

## 6. Functional Requirements

### 6.1 Must-Have Features (P0)
- **Interactive Regional Map**: Leaflet/MapLibre map visualizing India with a drill-down into the Chennai MVP region partitioned into a 0.05° analytical grid.
- **Multi-Signal Layer Toggles**: Visual switching between NDVI (Vegetation), NDWI (Surface Water), VIIRS (Night Lights), Temperature, Precipitation, and Built-up Index.
- **Historical Seasonal Baseline Engine**: Automated calculation of 36-month rolling baseline metrics (median, mean, standard deviation, MAD).
- **Statistical Anomaly Detection**: Identification of unusual regional signals using robust Z-score and Isolation Forest algorithms.
- **Cross-Signal Relationship Graph**: Correlation analysis showing co-occurring changes (e.g., rainfall deficit vs. water body contraction).
- **Evidence-Grounded AI Briefings**: Contextual explanations highlighting observed anomalies, citing exact sensor timestamps and percentage changes computed from real data.
- **Data Provenance Badging**: Unambiguous visual indicators displaying `[OBSERVED]`, `[CALCULATED]`, or `[SYNTHETIC DEMO]` across all cards and metrics.
- **Graceful Empty State Support**: Zero crashes or mock-data leakage when tables or dates have no observations.

### 6.2 Nice-to-Have Features (P1)
- **Comparative Analysis View**: Side-by-side comparison of 2 grid cells or 2 historical time periods.
- **Timeline Historical Scrubber**: Interactive player to observe multi-year change dynamics across 2021–2024.
- **Saved Regions / Bookmarks**: User ability to pin specific grid cells for rapid monitoring.
- **Export Capabilities**: Download analytical summaries and grid features as GeoJSON or CSV.

---

## 7. Out-of-Scope Features (Explicit Non-Goals)
To maintain scientific rigor and clear focus, EarthPulse AI strictly does **NOT** build:
- ❌ **Disaster Prediction**: No predictive forecasting of cyclones, earthquakes, floods, or landslides.
- ❌ **Economic Collapse Prediction**: No speculative financial or macroeconomic doomsday models.
- ❌ **Generic Conversational Chatbot**: No open-ended conversational bot; AI outputs are constrained to structured regional intelligence briefs.
- ❌ **Medical / Epidemiological Diagnosis**: No claims regarding disease outbreaks or health outcomes.
- ❌ **Legal or Property Title Advice**: No land registration, cadastral dispute resolution, or legal guidance.
- ❌ **Government Scheme Management**: No welfare scheme eligibility checking or beneficiary management.
- ❌ **Fabricated "Real-Time" Data**: No pseudo-real-time ticking counters or simulated live satellite positions.

---

## 8. User Stories

### Story 1: Regional Green Cover and Thermal Stress
> *“As an urban researcher in Chennai, I want to inspect the Sholinganallur IT corridor grid cell over the last 3 years, so that I can evaluate whether vegetative loss (NDVI) corresponds with increased surface temperature and nighttime light expansion.”*

### Story 2: Reservoir Water Surface Depletion Investigation
> *“As a water resources consultant, I want to view NDWI trends for the Chembarambakkam reservoir grid cells alongside NASA POWER rainfall data, so that I can determine if water shrinkage was driven by meteorological rainfall deficit or excessive seasonal dry spells.”*

### Story 3: Verifiable Provenance for ESG Reporting
> *“As an ESG compliance analyst, I want every metric and anomaly on the dashboard to display its scientific source, sensor acquisition timestamp, and calculation method, so that my regional assessment can be independently audited.”*

---

## 9. Success Metrics
1. **100% Provenance Compliance**: 0% unlabeled or fabricated numbers across the entire platform.
2. **API Performance**: Sub-250ms query response time for 0.05° grid feature queries on the Chennai pilot region.
3. **Explainability**: Every AI summary cites at least 2 distinct physical observed signals with quantified z-scores.
4. **Data Integrity**: Clean handling of missing optical imagery during monsoon cloud cover without breaking pipeline execution.
