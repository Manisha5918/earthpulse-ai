# EarthPulse AI 

### Regional Change Intelligence Platform for India

> **AI that reveals how India is changing.**

EarthPulse AI is a multi-source geospatial intelligence platform that helps users understand regional change by connecting evidence from satellite imagery, nighttime radiance, weather observations, and mapped infrastructure.

Instead of analyzing each dataset separately, EarthPulse brings multiple signals into a common analytical framework, detects unusual changes, examines relationships between signals, and produces evidence-grounded regional explanations.

---

## 🏆 TSM-TECHNOVA 2026

**Project:** EarthPulse AI  
**Category:** Environment  
**Development Stage:** Working Prototype  

EarthPulse AI was developed as a student hackathon project for **TSM-TECHNOVA 2026**.

The current fully validated real-data pilot focuses on **Chennai, Tamil Nadu**.


---

# 🎯 The Problem

Information about a region is often spread across different datasets.

For example:

- Satellite imagery can show vegetation and land-cover changes.
- Nighttime-light data can provide an indicator of changes in human activity.
- Weather observations provide environmental context.
- OpenStreetMap provides mapped infrastructure and spatial features.

These datasets are often analyzed separately.

This makes it difficult to answer questions such as:

- What changed in a region?
- Which signals changed together?
- Are the changes spatially concentrated?
- How strong is the available evidence?
- What can reasonably be concluded from the data?

EarthPulse AI brings these signals together into one analytical workflow.

---

# 🧠 How EarthPulse Works

The current product workflow is:

```text
Overview
   ↓
Evidence
   ↓
Relationships
   ↓
Briefing

Behind the interface, the analytical pipeline follows:

Real observations
       ↓
Data processing
       ↓
Temporal + spatial baselines
       ↓
Anomaly detection
       ↓
Cross-signal relationships
       ↓
Evidence Package
       ↓
Mixture-of-Experts reasoning
       ↓
Grounding validation
       ↓
Regional briefing
🛰️ Data Sources

EarthPulse currently uses four major data sources.

Data Source	Purpose
Sentinel-2	Vegetation, water-related and built-up land indicators
VIIRS	Nighttime radiance
NASA POWER	Temperature and precipitation observations
OpenStreetMap	Roads, buildings and mapped spatial infrastructure
Sentinel-2

EarthPulse processes Sentinel-2 imagery to calculate indicators including:

NDVI
NDWI
NDBI

The current Chennai pilot contains 4 multi-temporal Sentinel-2 scenes.

VIIRS

EarthPulse uses VIIRS nighttime radiance as a regional activity signal.

The current pilot uses an April annual baseline for 2021–2024.

It is not presented as continuous real-time nighttime-light monitoring.

NASA POWER

NASA POWER provides daily meteorological observations for regional environmental context.

The current Chennai pilot contains:

1,461 daily observations from 2021–2024.

OpenStreetMap

OpenStreetMap provides mapped spatial context including roads, buildings and other relevant features.

The current OSM dataset represents a spatial snapshot, not historical infrastructure growth.

🗺️ Common Analytical Grid

The data sources used by EarthPulse have different native spatial and temporal characteristics.

EarthPulse therefore uses a common:

0.05° Analytical Grid

The grid provides a common framework for comparing processed observations from different sources.

The 0.05° grid is EarthPulse's analytical framework and does not represent the native resolution of every dataset.

The current Chennai pilot contains:

16 analytical grid cells.

📊 Analytical Engine

EarthPulse analyzes regional change using multiple statistical and geospatial methods.

These include:

Temporal anomaly detection
Spatial anomaly detection
Statistical baselines
Trend analysis
Correlation analysis
Cross-signal pattern detection
Temporal compatibility checks
Regional Change Score

The system separates temporal and spatial evidence rather than treating every deviation as the same type of change.

🧠 Mixture-of-Experts

EarthPulse includes an evidence-aware Mixture-of-Experts (MoE) reasoning layer.

The system routes available evidence to specialized intelligence modules.

🌱 Vegetation Intelligence

Works with:

NDVI
NDWI
vegetation-related changes
temporal and spatial evidence
🏙️ Urban Dynamics

Works with:

NDBI
nighttime radiance
mapped buildings
mapped roads
built-environment patterns
🌦️ Climate Context

Works with:

temperature
precipitation
meteorological context
climate-related deviations
🗺️ Spatial Intelligence

Works with:

spatial anomalies
neighboring cells
spatial patterns
regional clustering
🔗 Cross-Signal Reasoning

Examines whether different independent signals changed together.

For example: NDVI ↓ + NDBI ↑ + VIIRS ↑

may represent a meaningful multi-signal pattern.

EarthPulse does not automatically interpret correlation as causation.

🛡️ Data Provenance

A major design principle of EarthPulse is keeping observed data separate from calculated results and AI interpretation.

Every important result is classified as one of four provenance types.

OBSERVED

Data obtained from the original source datasets.

CALCULATED

Values mathematically derived from observed data.

Examples include:

Statistical baselines
Anomalies
Trends
Correlations
Regional scores
AI_INTERPRETED

Explanations generated from structured evidence.

SYNTHETIC_DEMO

Synthetic values used only for testing or demonstration.

Synthetic data is kept separate from real observations.

🔐 Location Integrity

EarthPulse does not assume that validated data exists everywhere.

For example:

Chennai
    ↓
Available / Partial Data

A region that has not yet been ingested and validated:

Bengaluru
    ↓
Processing Required

An unsupported location:

London
    ↓
Data Unavailable

The system does not substitute Chennai data for another region.

This prevents cross-region data leakage and fabricated regional metrics.

🧾 Evidence-Grounded Intelligence

EarthPulse does not simply send raw geospatial data to a general-purpose chatbot.

The analytical engine first creates a structured Evidence Package containing the relevant observed and calculated information.

The intelligence layer works from this evidence.

The grounding system checks:

Numerical consistency
Evidence references
Temporal compatibility
Small-sample limitations
Unsupported claims
Causal language

If an explanation cannot be properly grounded, EarthPulse can use a deterministic fallback.

Core Principle

When the data is not available, EarthPulse says so instead of inventing an answer.

📈 Regional Change Score

EarthPulse can calculate a Regional Change Score from 0–100 when sufficient evidence is available.

The score combines multiple analytical components, including:

Temporal anomalies
Spatial anomalies
Cross-signal evidence
Data completeness
Temporal compatibility

The scoring configuration is explicitly defined rather than presented as a trained black-box model.

If sufficient evidence is not available, EarthPulse can return no score rather than producing a misleading value.

🖥️ Product Workflow

The main investigation experience is organized into four stages.

1. Overview

Understand the selected region and overall change score.

2. Evidence

Inspect what the individual data sources show.

3. Relationships

Examine relationships and patterns between signals.

4. Briefing

View an evidence-grounded regional explanation.

🏗️ System Architecture
                  ┌──────────────────────────┐
                  │       Next.js 14         │
                  │        Frontend          │
                  │                          │
                  │ Explore • Compare •      │
                  │ Timeline • Insights      │
                  └────────────┬─────────────┘
                               │
                          HTTPS REST API
                               │
                               ▼
                  ┌──────────────────────────┐
                  │         FastAPI          │
                  │         Backend          │
                  │                          │
                  │ Analysis Engine          │
                  │ Evidence Package         │
                  │ MoE Intelligence         │
                  │ Grounding Validation     │
                  └────────────┬─────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │     EarthPulse Data      │
                  │                          │
                  │ Sentinel-2               │
                  │ VIIRS                    │
                  │ NASA POWER               │
                  │ OpenStreetMap            │
                  └──────────────────────────┘
🛠️ Technology Stack
Frontend
Next.js 14
React
JavaScript
Tailwind CSS
Leaflet
Recharts
Lucide Icons
Backend
Python
FastAPI
Pydantic
SQLAlchemy
Geospatial & Data Processing
GeoPandas
Rasterio
GDAL
Shapely
NumPy
pandas
scikit-learn
Infrastructure
Docker
PostgreSQL
PostGIS
Deployment
Vercel
Render
📂 Project Structure
EarthPulse-AI/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── data_sources/
│       ├── geospatial/
│       ├── intelligence/
│       ├── intelligence_narrative/
│       ├── services/
│       │   └── moe/
│       └── schemas/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   └── Dockerfile
│
├── data/
│   ├── raw/
│   └── processed/
│
├── datasets/
│   ├── nasa_power/
│   ├── sentinel2/
│   ├── viirs/
│   └── osm/
│
├── database/
├── docs/
├── scripts/
└── tests/
🚀 Quick Start
Prerequisites
Docker
Docker Compose
Python 3.11+
Node.js 18+
npm
Run with Docker
docker compose up -d

The backend will be available at:

http://localhost:8000

The frontend will be available at:

http://localhost:3000

Backend health check:

http://localhost:8000/api/v1/health
Run Backend Manually
cd backend
python -m venv venv
Windows
.\venv\Scripts\activate

Then:

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Run Frontend Manually
cd frontend
npm install
npm run dev

Open:

http://localhost:3000
🧪 Testing & Validation

EarthPulse has been tested across:

API endpoints
Data ingestion
Geospatial calculations
Anomaly detection
Temporal compatibility
Provenance
Location isolation
Evidence generation
Grounding validation
Mixture-of-Experts routing
Current Status
107 backend tests passing

The frontend production build has also been validated successfully.

📍 Current Scope
Fully Validated Real-Data Pilot

Chennai, Tamil Nadu

Current Data Coverage

EarthPulse does not claim validated real-data coverage for every Indian city.

The architecture is designed for region-by-region expansion as additional real datasets are ingested and validated.

This means a new region becomes available only after its underlying data has been processed and validated.

🌱 Potential Applications

EarthPulse can support research and analysis related to:

Urban expansion
Vegetation change
Environmental monitoring
Regional climate context
Geospatial research
Infrastructure analysis
Sustainability studies

EarthPulse is an analysis and intelligence tool.

It is not an autonomous decision-making system or disaster prediction system.

⚖️ Ethics & Limitations
No Disaster Prediction

EarthPulse analyzes observed regional changes.

It is not an early-warning disaster prediction system.

No Causal Claims

Statistical relationships are not automatically interpreted as causation.

Data Availability Matters

A region is only analyzed when validated data is available.

Satellite Limitations

Optical satellite observations can be affected by cloud cover and other observation conditions.

VIIRS Limitations

The current pilot uses an April annual baseline for 2021–2024 rather than continuous monthly monitoring.

OpenStreetMap Limitations

OpenStreetMap represents mapped features and should not be interpreted as a complete record of every physical feature.

🏆 Hackathon Context

EarthPulse AI was developed for:

TSM-TECHNOVA 2026

Category: Environment

Development Stage: Working Prototype

Current Pilot: Chennai, Tamil Nadu

The project focuses on combining geospatial data, statistical analysis, and evidence-aware AI reasoning to make regional change easier to investigate and understand.

🎯 Project Goals

EarthPulse aims to:

Connect fragmented geospatial datasets.
Make regional change easier to investigate.
Identify meaningful multi-signal patterns.
Keep observed and calculated information separate.
Make AI explanations traceable to evidence.
Prevent unsupported regional claims.
Provide a foundation for expanding regional intelligence across India.
💡 What Makes EarthPulse Different?

Most systems answer:

"What does this dataset show?"

EarthPulse asks a broader question:

"What changed, which signals support that observation, and how strong is the evidence?"

The key idea is not simply using AI with satellite data.

The key idea is connecting multiple independent signals while keeping their limitations, provenance, and evidence visible.

🔗 Project Links

🌐 Live Platform
https://earthpulse-ai-ten.vercel.app

⚙️ Backend API
https://earthpulse-ai-nkt4.onrender.com

💻 GitHub Repository
https://github.com/Manisha5918/earthpulse-ai

👥 Team

Manisha G & Team

Developed as a student project for TSM-TECHNOVA 2026.
