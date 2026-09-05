"use client";

/**
 * EarthPulse AI — Statistical Anomaly Telemetry (Modern Scientific Editorial)
 * "Is it Unusual?" — Separates Temporal Anomalies from Spatial Regional Deviations.
 * Progressive disclosure for Spatial Grid Distribution to prevent clutter.
 */

import React, { useState } from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { AlertCircle, TrendingUp, Compass, ChevronDown } from "lucide-react";
import clsx from "clsx";

export function RegionalAnomalySection({ temporalAnomalies = [], spatialAnomalies = [], hideHeader = false }) {
  const [selectedSignalFilter, setSelectedSignalFilter] = useState("ALL");
  const [showSpatialGrid, setShowSpatialGrid] = useState(false);

  const signals = ["ALL", "ndvi", "ndbi", "viirs_radiance", "osm_road_density"];

  const filteredSpatial = spatialAnomalies.filter((s) => {
    if (selectedSignalFilter === "ALL") return true;
    return (s.signal || "").toLowerCase() === selectedSignalFilter.toLowerCase();
  });

  const getSeverityStyle = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "HIGH":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "MEDIUM":
        return "text-sky-700 bg-sky-50 border-sky-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  // Highlight the single largest absolute z-score so the key outcome
  // stands out. Computed from backend values only, never invented.
  const largestIdx = temporalAnomalies.reduce((best, anom, idx) => {
    const z = Math.abs(Number(anom.z_score) || 0);
    const bestZ = best < 0 ? -1 : Math.abs(Number(temporalAnomalies[best].z_score) || 0);
    return z > bestZ ? idx : best;
  }, -1);

  return (
    <div className="space-y-5">
      {!hideHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="space-y-0.5">
            <h2 className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span>How unusual is this location?</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Readings compared against historical baselines, plus unusual places on the grid.
            </p>
          </div>
          <ProvenanceBadge type="CALCULATED" size="xs" />
        </div>
      )}

      {/* Part A: Temporal Anomalies */}
      <div className="space-y-3">
        <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          <span>Unusual readings over time</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {temporalAnomalies.map((anom, idx) => {
            const sev = String(anom.severity || "").toUpperCase();
            const z = anom.z_score !== null && anom.z_score !== undefined ? Number(anom.z_score) : null;
            const direction = z === null ? null : z > 0 ? "above" : z < 0 ? "below" : "at";
            const meaning =
              z === null
                ? "No score available for this signal."
                : sev === "CRITICAL" ? `Strong deviation ${direction} baseline — worth investigating first.`
                : sev === "HIGH" ? `Clear deviation ${direction} baseline.`
                : sev === "MEDIUM" ? `Mild deviation ${direction} baseline.`
                : `Near baseline levels${direction && direction !== "at" ? ` (${direction} baseline)` : ""} — no unusual change.`;
            return (
            <div key={idx} className={clsx("p-4 bg-white border rounded-2xl shadow-sm space-y-3 text-xs", idx === largestIdx ? "border-emerald-400" : "border-slate-200/80")}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 gap-2">
                <span className="font-sans font-semibold text-slate-900 text-sm">{anom.signal.toUpperCase()}</span>
                <span className="flex items-center gap-1.5">
                  {idx === largestIdx && (
                    <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Largest deviation
                    </span>
                  )}
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border font-semibold", getSeverityStyle(anom.severity))}>
                    {String(anom.severity).charAt(0) + String(anom.severity).slice(1).toLowerCase()}
                  </span>
                </span>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Observed:</span>
                  <span className="text-slate-900 font-bold font-mono">{anom.observed_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Baseline Mean:</span>
                  <span className="text-slate-700 font-mono">{anom.baseline_mean !== null ? anom.baseline_mean.toFixed(4) : "N/A"}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
                  <span className="text-slate-700 font-sans">Z-Score:</span>
                  <span className={anom.z_score > 0 ? "text-sky-700 font-mono" : "text-amber-700 font-mono"}>
                    {anom.z_score !== null ? `z = ${anom.z_score.toFixed(3)}` : "z = N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Robust MAD:</span>
                  <span className="text-slate-900 font-bold font-mono">{anom.robust_mad_score !== null ? `${anom.robust_mad_score.toFixed(3)}` : "N/A"}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 font-sans leading-relaxed">
                {meaning}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 font-sans">
                <span>Status: <strong className="text-slate-800">{anom.status}</strong></span>
                <span>Conf: <strong className="text-slate-800">{anom.confidence}</strong></span>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Part B: Spatial Anomalies (Progressive Disclosure) */}
      {spatialAnomalies.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Unusual places on the grid
              </span>
            </span>

            {/* Toggle Button */}
            <button
              onClick={() => setShowSpatialGrid(!showSpatialGrid)}
              className="text-xs font-mono font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
            >
              <span>{showSpatialGrid ? "Collapse 16-Cell Spatial Grid" : "View 16-Cell Spatial Distribution"}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", showSpatialGrid && "rotate-180")} />
            </button>
          </div>

          {showSpatialGrid && (
            <div className="space-y-3 pt-2">
              {/* Signal Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {signals.map((sig) => (
                  <button
                    key={sig}
                    onClick={() => setSelectedSignalFilter(sig)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-xs font-mono transition-all border select-none font-medium uppercase tracking-wider",
                      selectedSignalFilter === sig
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {sig.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200/80 rounded-2xl shadow-sm bg-white">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase font-semibold sticky top-0 border-b border-slate-200 tracking-wider">
                    <tr>
                      <th className="p-3">Cell Code</th>
                      <th className="p-3">Signal</th>
                      <th className="p-3">Cell Value</th>
                      <th className="p-3">Regional Mean</th>
                      <th className="p-3">Spatial Z-Score</th>
                      <th className="p-3">Percentile Rank</th>
                      <th className="p-3">Outlier?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSpatial.slice(0, 16).map((spat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{spat.cell_code}</td>
                        <td className="p-3 text-slate-600">{spat.signal}</td>
                        <td className="p-3 font-semibold text-slate-900">{spat.cell_value?.toFixed(4)}</td>
                        <td className="p-3 text-slate-500">{spat.regional_mean?.toFixed(4)}</td>
                        <td className={clsx("p-3 font-semibold", (spat.spatial_z_score || 0) > 1 ? "text-rose-700" : (spat.spatial_z_score || 0) < -1 ? "text-amber-700" : "text-slate-800")}>
                          {spat.spatial_z_score !== null ? `z = ${spat.spatial_z_score.toFixed(3)}` : "N/A"}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{spat.percentile_rank?.toFixed(1)}%</td>
                        <td className="p-3">
                          {spat.is_spatial_outlier ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">YES</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">NO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
