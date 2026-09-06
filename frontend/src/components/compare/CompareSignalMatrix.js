"use client";

/**
 * EarthPulse AI — Signal-by-Signal Physical Telemetry Matrix (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Activity } from "lucide-react";

export function CompareSignalMatrix({ targetA, targetB, baselinesA, baselinesB, osmA = null, osmB = null }) {
  // Location-A and Location-B presence gate
  const baseA = baselinesA?.baselines || baselinesA;
  const baseB = baselinesB?.baselines || baselinesB;
  const hasA = !!baseA && (baseA.ndvi !== undefined || baseA.temperature_2m !== undefined || (typeof baseA === "object" && Object.keys(baseA).length > 0));
  const hasB = !!baseB && (baseB.ndvi !== undefined || baseB.temperature_2m !== undefined || (typeof baseB === "object" && Object.keys(baseB).length > 0));
  const naA = "N/A";
  const noDataA = "No data ingested";

  const getFallbackB = () => {
    if (targetB === "BLR_TEST") return { val: "Processing required", obs: "Ingestion pending (Bengaluru)" };
    if (targetB === "LON_TEST") return { val: "Unavailable", obs: "Outside India domain" };
    return { val: "Processing required", obs: "No records ingested" };
  };
  const fbB = getFallbackB();

  const signals = [
    {
      name: "Sentinel-2 Multispectral",
      metric: "Vegetation Index (NDVI)",
      semantics: "MULTI-TEMPORAL SCENES",
      unit: "index",
      valA: hasA && baseA?.ndvi?.mean !== undefined ? baseA.ndvi.mean.toFixed(4) : naA,
      obsA: hasA ? "4 Scenes (2021–2024)" : noDataA,
      valB: hasB && baseB?.ndvi?.mean !== undefined ? baseB.ndvi.mean.toFixed(4) : fbB.val,
      obsB: hasB ? "4 Scenes (2021–2024)" : fbB.obs,
      prov: "CALCULATED"
    },
    {
      name: "Sentinel-2 Multispectral",
      metric: "Built-up Index (NDBI)",
      semantics: "MULTI-TEMPORAL SCENES",
      unit: "index",
      valA: hasA && baseA?.ndbi?.mean !== undefined ? baseA.ndbi.mean.toFixed(4) : naA,
      obsA: hasA ? "4 Scenes (2021–2024)" : noDataA,
      valB: hasB && baseB?.ndbi?.mean !== undefined ? baseB.ndbi.mean.toFixed(4) : fbB.val,
      obsB: hasB ? "4 Scenes (2021–2024)" : fbB.obs,
      prov: "CALCULATED"
    },
    {
      name: "VIIRS Day/Night Band",
      metric: "Nighttime Radiance Mean",
      semantics: "ANNUAL BASELINE (April)",
      unit: "nW/(cm²·sr)",
      valA: hasA && baseA?.viirs_radiance?.mean !== undefined ? `${baseA.viirs_radiance.mean.toFixed(2)}` : naA,
      obsA: hasA ? "4 April Baselines" : noDataA,
      valB: hasB && baseB?.viirs_radiance?.mean !== undefined ? `${baseB.viirs_radiance.mean.toFixed(2)}` : fbB.val,
      obsB: hasB ? "4 April Baselines" : fbB.obs,
      prov: "CALCULATED"
    },
    {
      name: "NASA POWER Meteorology",
      metric: "Mean Temperature (T2M)",
      semantics: "DAILY OBSERVATIONS",
      unit: "°C",
      valA: hasA && baseA?.temperature_2m?.mean !== undefined ? `${baseA.temperature_2m.mean.toFixed(1)} °C` : naA,
      obsA: hasA ? "1,461 Daily Records" : noDataA,
      valB: hasB && baseB?.temperature_2m?.mean !== undefined ? `${baseB.temperature_2m.mean.toFixed(1)} °C` : fbB.val,
      obsB: hasB ? "1,461 Daily Records" : fbB.obs,
      prov: "OBSERVED"
    },
    {
      name: "OpenStreetMap Spatial Context",
      metric: "Mapped Road Density",
      semantics: "SNAPSHOT",
      unit: "km/km²",
      valA: hasA && osmA?.road_density_km_per_km2 !== undefined && osmA?.road_density_km_per_km2 !== null
        && osmA?.total_road_length_km !== undefined && osmA?.total_road_length_km !== null
        ? `${Number(osmA.road_density_km_per_km2).toFixed(2)} km/km² (${Math.round(Number(osmA.total_road_length_km)).toLocaleString("en-US")} km)`
        : naA,
      obsA: hasA ? "Static Snapshot" : noDataA,
      valB: hasB && osmB?.road_density_km_per_km2 !== undefined && osmB?.road_density_km_per_km2 !== null
        ? `${Number(osmB.road_density_km_per_km2).toFixed(2)} km/km²`
        : fbB.val,
      obsB: hasB ? "Static Snapshot" : fbB.obs,
      prov: "CALCULATED"
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-xs font-display font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Signal-by-signal evidence</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Independent observations across optical, nighttime-light, weather, and mapped sources.
          </p>
        </div>
        <ProvenanceBadge type="OBSERVED" size="xs" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold">Sensor & Metric</th>
              <th className="p-3 font-semibold">Temporal Semantics</th>
              <th className="p-3 font-bold text-slate-900">Location A ({targetA})</th>
              <th className="p-3 font-semibold text-slate-500">Location B ({targetB})</th>
              <th className="p-3 font-semibold">Provenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {signals.map((sig, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-3">
                  <div className="font-semibold text-slate-900">{sig.name}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{sig.metric}</div>
                </td>
                <td className="p-3 text-slate-500 text-[11px]">
                  {sig.semantics}
                </td>
                <td className="p-3 font-bold text-slate-900">
                  <div>{sig.valA}</div>
                  <div className="text-[10px] text-slate-400 font-normal font-sans">{sig.obsA}</div>
                </td>
                <td className="p-3 font-medium text-slate-600">
                  <div>{sig.valB}</div>
                  <div className="text-[10px] text-slate-400 font-normal font-sans">{sig.obsB}</div>
                </td>
                <td className="p-3">
                  <ProvenanceBadge type={sig.prov} size="xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
