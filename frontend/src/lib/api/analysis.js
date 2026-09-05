/**
 * EarthPulse AI — Unified Analysis & Orchestration Service
 */

import { apiClient } from "./client";

export async function executeUnifiedAnalysis(requestPayload) {
  return apiClient("/api/v1/analysis", {
    method: "POST",
    body: JSON.stringify(requestPayload)
  });
}

export async function getJobStatus(jobId) {
  return apiClient(`/api/v1/analysis/${jobId}`);
}

export async function checkDataAvailability(params = {}) {
  const query = new URLSearchParams();
  if (params.lat !== undefined && params.lat !== null) query.set("lat", params.lat);
  if (params.lon !== undefined && params.lon !== null) query.set("lon", params.lon);
  if (params.region_code) query.set("region_code", params.region_code);
  if (params.cell_code) query.set("cell_code", params.cell_code);
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);
  if (params.signals && params.signals.length) {
    params.signals.forEach(s => query.append("signals", s));
  }

  const qs = query.toString();
  return apiClient(`/api/v1/availability${qs ? `?${qs}` : ""}`);
}
