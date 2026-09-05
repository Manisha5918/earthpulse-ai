/**
 * EarthPulse AI — System Health API Service
 */

import { apiClient } from "./client";

export async function getBackendHealth() {
  return apiClient("/api/v1/health");
}
