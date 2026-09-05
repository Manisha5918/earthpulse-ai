/**
 * EarthPulse AI — Geospatial & Layer Semantics Constants
 * Defines verified pilot region parameters and layer metadata.
 * Strict Truthfulness: Zero fabricated analytical metrics.
 */

export const PILOT_REGION = {
  id: "IN-TN-CHE",
  name: "Chennai Metropolitan Area",
  state: "Tamil Nadu",
  country: "India",
  bbox: [12.90, 80.15, 13.10, 80.35],
  centroid: [13.05, 80.225],
  gridResolution: "0.05° (~5.5 km)",
  cellCount: 16
};

export const ANALYTICAL_LAYERS = [
  {
    id: "change_score",
    label: "Regional Change Score",
    description: "Composite 0–100 multi-sensor change rating (requires Phase D analysis job)",
    provenance: "CALCULATED",
    temporalSemantics: "COMPOSITE (2021–2024)",
    unit: "score (0–100)",
    status: "PROCESSING_REQUIRED",
    color: "#06B6D4"
  },
  {
    id: "ndvi",
    label: "Vegetation Index (NDVI)",
    description: "Normalized Difference Vegetation Index from Sentinel-2 L2A",
    provenance: "CALCULATED",
    temporalSemantics: "MULTI_TEMPORAL_SCENES (4 Scenes)",
    unit: "index (-1.0 to 1.0)",
    status: "PROCESSING_REQUIRED",
    color: "#10B981"
  },
  {
    id: "ndbi",
    label: "Built-up Index (NDBI)",
    description: "Normalized Difference Built-up Index from Sentinel-2 L2A",
    provenance: "CALCULATED",
    temporalSemantics: "MULTI_TEMPORAL_SCENES (4 Scenes)",
    unit: "index (-1.0 to 1.0)",
    status: "PROCESSING_REQUIRED",
    color: "#8B5CF6"
  },
  {
    id: "viirs",
    label: "Nighttime Radiance",
    description: "Nocturnal light emissions from VIIRS Day/Night Band",
    provenance: "CALCULATED",
    temporalSemantics: "ANNUAL_BASELINE (April 2021–2024)",
    unit: "nW/(cm²·sr)",
    status: "PROCESSING_REQUIRED",
    color: "#FBBF24"
  },
  {
    id: "temperature",
    label: "Surface Temperature (T2M)",
    description: "Daily 2-meter air temperature from NASA POWER (daily observations)",
    provenance: "OBSERVED",
    temporalSemantics: "DAILY_OBSERVATIONS",
    unit: "°C",
    status: "DAILY_OBSERVATIONS",
    color: "#F43F5E"
  },
  {
    id: "precipitation",
    label: "Precipitation (PRECTOTCORR)",
    description: "Corrected meteorological precipitation from NASA POWER (daily observations)",
    provenance: "OBSERVED",
    temporalSemantics: "DAILY_OBSERVATIONS",
    unit: "mm/day",
    status: "DAILY_OBSERVATIONS",
    color: "#3B82F6"
  },
  {
    id: "osm",
    label: "OSM Infrastructure Context",
    description: "Static road network density & mapped building footprints",
    provenance: "CALCULATED",
    temporalSemantics: "SNAPSHOT",
    unit: "km/km² & structures",
    status: "SNAPSHOT",
    color: "#94A3B8"
  }
];
