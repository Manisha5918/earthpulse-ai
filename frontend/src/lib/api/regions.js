/**
 * EarthPulse AI — Spatial Regions & Analytical Grid Service
 */

import { apiClient } from "./client";

export async function getRegions() {
  return apiClient("/api/v1/regions");
}

export async function getRegionDetail(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}`);
}

export async function getRegionGrid(regionId = "IN-TN-CHE") {
  return apiClient(`/api/v1/regions/${regionId}/grid`);
}
