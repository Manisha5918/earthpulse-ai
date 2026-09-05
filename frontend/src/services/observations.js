import { fetchJson } from "./api";

export async function getObservations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await fetchJson(`/observations?${query}`);
}

export async function getGridObservations(gridId) {
  return await fetchJson(`/observations/grid/${gridId}`);
}

export async function getAnomalies(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await fetchJson(`/anomalies?${query}`);
}

export async function getInsights(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await fetchJson(`/insights?${query}`);
}
