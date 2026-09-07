# EarthPulse AI 🛰️🇮🇳

### Regional Change Intelligence Platform for India

> **AI that reveals how India is changing.**

EarthPulse AI is a multi-source geospatial intelligence platform that helps users understand regional change by connecting evidence from satellite imagery, nighttime radiance, weather observations, and mapped infrastructure.

Instead of analyzing each dataset separately, EarthPulse brings multiple signals into one analytical framework, detects unusual changes, examines relationships between signals, and produces evidence-grounded regional explanations.

---

## 🏆 TSM-TECHNOVA 2026

| | |
|---|---|
| **Project** | EarthPulse AI |
| **Category** | Environment |
| **Development Stage** | Working Prototype |

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

# 🧠 How EarthPulse Works

The current product workflow is:

**Overview → Evidence → Relationships → Briefing**

Behind the interface, the analytical pipeline follows:

**Real observations → Data processing → Temporal + spatial baselines → Anomaly detection → Cross-signal relationships → Evidence Package → Mixture-of-Experts reasoning → Grounding validation → Regional briefing**

---

# 🛰️ Data Sources

EarthPulse currently uses four major data sources.

| Data Source | Purpose |
|---|---|
| **Sentinel-2** | Vegetation, water-related and built-up land indicators |
| **VIIRS** | Nighttime radiance |
| **NASA POWER** | Temperature and precipitation observations |
| **OpenStreetMap** | Roads, buildings and mapped spatial infrastructure |

## Sentinel-2

EarthPulse processes Sentinel-2 imagery to calculate indicators including:

- **NDVI**
- **NDWI**
- **NDBI**

The current Chennai pilot contains **4 multi-temporal Sentinel-2 scenes**.

## VIIRS

EarthPulse uses VIIRS nighttime radiance as a regional activity signal.

The current pilot uses an **April annual baseline for 2021–2024**.

It is not presented as continuous real-time nighttime-light monitoring.

## NASA POWER

NASA POWER provides daily meteorological observations for regional environmental context.

The current Chennai pilot contains:

- **1,461 daily observations from 2021–2024**

## OpenStreetMap

OpenStreetMap provides mapped spatial context including roads, buildings and other relevant features.

The current OSM dataset represents a **spatial snapshot**, not historical infrastructure growth.

---

# 🗺️ Common Analytical Grid

The data sources used by EarthPulse have different native spatial and temporal characteristics.

EarthPulse therefore uses a common:

### **0.05° Analytical Grid**

The grid provides a common framework for comparing processed observations from different sources.

The **0.05° grid is EarthPulse's analytical framework** and does not represent the native resolution of every dataset.

The current Chennai pilot contains:

- **16 analytical grid cells**

---

# 📊 Analytical Engine

EarthPulse analyzes regional change using multiple statistical and geospatial methods.

These include:

- Temporal anomaly detection
- Spatial anomaly detection
- Statistical baselines
- Trend analysis
- Correlation analysis
- Cross-signal pattern detection
- Temporal compatibility checks
- Regional Change Score

The system separates temporal and spatial evidence rather than treating every deviation as the same type of change.

---

# 🧠 Mixture-of-Experts

EarthPulse includes an **evidence-aware Mixture-of-Experts (MoE) reasoning layer**.

The system routes available evidence to specialized intelligence modules.

## 🌱 Vegetation Intelligence

Works with:

- NDVI
- NDWI
- Vegetation-related changes
- Temporal and spatial evidence

## 🏙️ Urban Dynamics

Works with:

- NDBI
- Nighttime radiance
- Mapped buildings
- Mapped roads
- Built-environment patterns

## 🌦️ Climate Context

Works with:

- Temperature
- Precipitation
- Meteorological context
- Climate-related deviations

## 🗺️ Spatial Intelligence

Works with:

- Spatial anomalies
- Neighboring cells
- Spatial patterns
- Regional clustering

## 🔗 Cross-Signal Reasoning

Examines whether different independent signals changed together.

**For example: NDVI ↓ + NDBI ↑ + VIIRS ↑**

This can represent a meaningful multi-signal pattern when supported by the available evidence.

EarthPulse does not automatically interpret correlation as causation.


---

# 🛡️ Data Provenance

A major design principle of EarthPulse is keeping observed data separate from calculated results and AI interpretation.

Every important result is classified as one of four provenance types.

### `OBSERVED`

Data obtained from the original source datasets.

### `CALCULATED`

Values mathematically derived from observed data.

Examples include:

- Statistical baselines
- Anomalies
- Trends
- Correlations
- Regional scores

### `AI_INTERPRETED`

Explanations generated from structured evidence.

### `SYNTHETIC_DEMO`

Synthetic values used only for testing or demonstration.

Synthetic data is kept separate from real observations.

---

# 🔐 Location Integrity

EarthPulse does not assume that validated data exists everywhere.

For example:

**Chennai → Available / Partial Data**

A region that has not yet been ingested and validated:

**Bengaluru → Processing Required**

An unsupported location:

**London → Data Unavailable**

The system does not substitute Chennai data for another region.

This prevents cross-region data leakage and fabricated regional metrics.



---

# 🧾 Evidence-Grounded Intelligence

EarthPulse does not simply send raw geospatial data to a general-purpose chatbot.

The analytical engine first creates a structured **Evidence Package** containing the relevant observed and calculated information.

The intelligence layer works from this evidence.

The grounding system checks:

- Numerical consistency
- Evidence references
- Temporal compatibility
- Small-sample limitations
- Unsupported claims
- Causal language

If an explanation cannot be properly grounded, EarthPulse can use a deterministic fallback.

### Core Principle

> **When the data is not available, EarthPulse says so instead of inventing an answer.**

---

# 📈 Regional Change Score

EarthPulse can calculate a **Regional Change Score from 0–100** when sufficient evidence is available.

The score combines multiple analytical components, including:

- Temporal anomalies
- Spatial anomalies
- Cross-signal evidence
- Data completeness
- Temporal compatibility

The scoring configuration is explicitly defined rather than presented as a trained black-box model.

If sufficient evidence is not available, EarthPulse can return **no score** rather than producing a misleading value.



---

# 🖥️ Product Workflow

The main investigation experience is organized into four stages.

### 1. Overview

Understand the selected region and overall change score.

### 2. Evidence

Inspect what the individual data sources show.

### 3. Relationships

Examine relationships and patterns between signals.

### 4. Briefing

View an evidence-grounded regional explanation.

---

# 🏗️ System Architecture

```text
                   ┌──────────────────────────┐
                   │       Next.js 14         │
                   │        Frontend          │
                   │                          │
                   │ Explore • Compare •      │
                   │ Timeline • Insights      │
                   └────────────┬─────────────┘
                                │
                                │ HTTPS REST API
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




---

# 🛠️ Technology Stack

## Frontend

- Next.js 14
- React
- JavaScript
- Tailwind CSS
- Leaflet
- Recharts
- Lucide Icons

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy

## Geospatial & Data Processing

- GeoPandas
- Rasterio
- GDAL
- Shapely
- NumPy
- pandas
- scikit-learn

## Infrastructure

- Docker
- PostgreSQL
- PostGIS

## Deployment

- Vercel
- Render

---

# 📂 Project Structure

```text
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


---

# 🚀 Quick Start

## Prerequisites

- Docker
- Docker Compose
- Python 3.11+
- Node.js 18+
- npm

## Run with Docker

```bash
docker compose up -d
```

The backend will be available at:

```text
http://localhost:8000
```

The frontend will be available at:

```text
http://localhost:3000
```

### Backend health check

```text
http://localhost:8000/api/v1/health
```

## Run Backend Manually

```bash
cd backend
python -m venv venv
```

### Windows

```powershell
.\venv\Scripts\activate
```

Then:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run Frontend Manually

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---
