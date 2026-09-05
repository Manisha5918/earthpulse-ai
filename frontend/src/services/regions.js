import { fetchJson } from "./api";

export async function getRegions() {
  return await fetchJson("/regions") || [
    {
      id: 1,
      code: "IN-TN-CHE",
      name: "Chennai Metropolitan Area",
      state: "Tamil Nadu",
      country: "India",
      grid_cells_count: 16
    }
  ];
}

export async function getRegionGrid(regionId = 1) {
  return await fetchJson(`/regions/${regionId}/grid`);
}
