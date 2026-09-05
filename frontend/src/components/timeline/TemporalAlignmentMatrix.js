"use client";

/**
 * EarthPulse AI — Cross-Signal Temporal Alignment Matrix (Modern Scientific Editorial)
 * Strict adherence to backend TemporalCompatibilityType classifications.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { GitMerge, Info } from "lucide-react";

export function TemporalAlignmentMatrix() {
  const matrix = [
    {
      pair: "Sentinel-2 ↔ VIIRS",
      compatibility: "SAME_MONTH",
      window: "April/May seasonal windows (2021–2024)",
      description: "Both sensors have observations matching the same calendar month."
    },
    {
      pair: "Sentinel-2 ↔ NASA POWER",
      compatibility: "SAME_DAY",
      window: "Exact scene dates (2021-05-30, 2022-04-05, 2023-05-20, 2024-04-29)",
      description: "NASA POWER daily meteorology matches optical scene acquisition day."
    },
    {
      pair: "VIIRS ↔ NASA POWER",
      compatibility: "AGGREGATED_WINDOW",
      window: "April monthly baseline window (2021–2024)",
      description: "NASA POWER daily records aggregated across April to match VIIRS composite window."
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
            <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-600" />
              <span>Do the observations line up in time?</span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              How observation windows overlap before signals are compared. Classifications below use backend terms (same day, same month, same season, aggregated window).
            </p>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold">Signal Pair</th>
              <th className="p-3 font-semibold">Classification</th>
              <th className="p-3 font-semibold text-slate-900">Alignment Window</th>
              <th className="p-3 font-semibold text-slate-500">Reasoning Basis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-semibold text-slate-900">{row.pair}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    {row.compatibility}
                  </span>
                </td>
                <td className="p-3 text-slate-700 font-medium">{row.window}</td>
                <td className="p-3 text-slate-500 font-sans text-xs">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Spatial Snapshot Notice for OpenStreetMap */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600 font-sans">
        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          <strong className="text-slate-900 font-mono">OpenStreetMap Spatial Context:</strong> Handled separately as static spatial context semantics (SNAPSHOT); not evaluated for temporal series compatibility.
        </span>
      </div>
    </div>
  );
}
