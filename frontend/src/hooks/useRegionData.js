'use client';

import { useState, useEffect } from "react";
import { getRegions, getRegionGrid } from "@/services/regions";

export function useRegionData(regionId = 1) {
  const [regions, setRegions] = useState([]);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const r = await getRegions();
      const g = await getRegionGrid(regionId);
      setRegions(r || []);
      setGridData(g);
      setLoading(false);
    }
    load();
  }, [regionId]);

  return { regions, gridData, loading };
}
