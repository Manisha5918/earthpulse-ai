/**
 * EarthPulse AI — Narrative Intelligence API Service
 */

import { apiClient } from "./client";

export async function generateNarrativeIntelligence(requestPayload) {
  return apiClient("/api/v1/intelligence", {
    method: "POST",
    body: JSON.stringify(requestPayload)
  });
}

export async function getRegionalChangeProfile(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}/change-profile`);
}

export async function getRegionalBaselines(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}/baselines`);
}

export async function getRegionalAnomalies(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}/anomalies`);
}

export async function getRegionalRelationships(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}/relationships`);
}
