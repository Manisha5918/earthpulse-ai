"use client";

/**
 * EarthPulse AI — Map Container with SSR Safety & Dynamic Leaflet Import (Light Theme)
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapLayerControl } from "./MapLayerControl";
import { MapLegend } from "./MapLegend";
import { MapSelectionPanel } from "./MapSelectionPanel";
import { MapStatusBar } from "./MapStatusBar";
import { getRegionGrid, getRegionDetail } from "../../lib/api/regions";
import { DataStateView } from "../common/DataStateView";
import { Loader2 } from "lucide-react";

const DynamicLeafletMap = dynamic(
  () => import("./InvestigationMap").then((mod) => mod.InvestigationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-700" />
        <div className="text-xs font-sans font-medium">Loading the analytical map…</div>
      </div>
    )
  }
);

export function MapContainer({
  regionId = "IN-TN-CHE",
  selectedCell,
  onSelectCell
}) {
  const [gridGeoJson, setGridGeoJson] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [activeLayer, setActiveLayer] = useState("change_score");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGridData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gridData, detailData] = await Promise.all([
        getRegionGrid(regionId),
        getRegionDetail(regionId)
      ]);
      setGridGeoJson(gridData);
      setRegionDetail(detailData);
    } catch (err) {
      setError(err.message || "Failed to load analytical grid from EarthPulse backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGridData();
  }, [regionId]);

  // Extract selected cell properties dynamically from GeoJSON
  const selectedFeature = gridGeoJson?.features?.find(
    (f) => f.properties?.cell_code === selectedCell
  );

  if (error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <DataStateView
            status="ERROR"
            customMessage={error}
            onRetry={fetchGridData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
      {/* Map Surface */}
      <div className="flex-1 relative w-full h-full min-h-[500px]">
        <DynamicLeafletMap
          gridGeoJson={gridGeoJson}
          selectedCell={selectedCell}
          hoveredCell={hoveredCell}
          onSelectCell={onSelectCell}
          onHoverCell={setHoveredCell}
          activeLayer={activeLayer}
        />

        {/* Top-Right Layer & Selection Controls Overlay */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 max-w-xs w-full pointer-events-auto">
          <MapSelectionPanel
            selectedCell={selectedCell}
            selectedCellProps={selectedFeature?.properties}
            onClearSelection={() => onSelectCell(null)}
            regionDetail={regionDetail}
          />
          <MapLayerControl
            activeLayer={activeLayer}
            onSelectLayer={setActiveLayer}
          />
          <MapLegend activeLayerId={activeLayer} />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <MapStatusBar selectedCell={selectedCell} activeLayerId={activeLayer} />
    </div>
  );
}
