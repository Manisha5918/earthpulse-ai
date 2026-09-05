"use client";

/**
 * EarthPulse AI — OpenStreetMap Static Spatial Context Snapshot (Modern Scientific Editorial)
 * Explicitly states that OSM is a static snapshot, not a historical time series.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { MapPin, Info } from "lucide-react";

export function OsmSnapshotContext({ osmSummary }) {
  // Backend snapshot only: missing data renders N/A, never frozen numbers.
  const osm = osmSummary || {};
  const num = (v, digits = 2) =>
    v !== undefined && v !== null && !Number.isNaN(Number(v)) ? Number(v).toFixed(digits) : "N/A";
  const count = (v) =>
    v !== undefined && v !== null ? Number(v).toLocaleString("en-US") : "N/A";
  const snapshotDate = osm?.observation_timestamp ? osm.observation_timestamp.substring(0, 10) : "N/A";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Mapped infrastructure snapshot</span>
          </div>
          <div className="text-xs text-slate-500 font-sans">
            Static snapshot · observed {snapshotDate}
          </div>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-sans font-semibold block">Road density</span>
          <span className="text-slate-900 font-sans font-semibold text-xl block font-mono">{num(osm.road_density_km_per_km2)} km/km²</span>
          <span className="text-slate-500 text-[11px] block font-sans">Total length: {num(osm.total_road_length_km, 1)} km</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-sans font-semibold block">Mapped buildings</span>
          <span className="text-slate-900 font-sans font-semibold text-xl block font-mono">{count(osm.mapped_building_count)}</span>
          <span className="text-slate-500 text-[11px] block font-sans">Footprints processed</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[11px] font-sans font-semibold block">Categorized places</span>
          <span className="text-slate-900 font-sans font-semibold text-xl block font-mono">{count(osm.poi_counts?.total)} places</span>
          <span className="text-slate-500 text-[11px] block font-sans">Healthcare and transit</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600 font-sans">
        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>OpenStreetMap metrics provide static physical spatial context and cannot be rendered as a historical time series.</span>
      </div>
    </div>
  );
}
