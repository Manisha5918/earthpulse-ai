"use client";

/**
 * EarthPulse AI — Temporal Investigation Header (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import clsx from "clsx";
import { formatStatus } from "../../lib/utils";

export function TimelineHeader({
  selectedTarget = "IN-TN-CHE",
  onSelectTarget,
  status = "AVAILABLE"
}) {
  const presets = [
    { label: "Chennai Pilot (IN-TN-CHE)", id: "IN-TN-CHE", status: "VERIFIED" },
    { label: "Bengaluru Test (12.97°N, 77.59°E)", id: "BLR_TEST", status: "PROCESSING_REQUIRED" },
    { label: "London Test (51.51°N, -0.13°E)", id: "LON_TEST", status: "DATA_UNAVAILABLE" }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      {/* Top Meta Memo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-emerald-800 font-bold uppercase tracking-wider font-mono text-[11px]">Multi-Sensor Temporal Alignment</span>
        </div>
        <span className="font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">Horizon: 2021–2024</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 border-l-3 border-emerald-500 pl-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Observation Timeline
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Audit discrete Sentinel-2 optical scenes, NOAA VIIRS annual April composites, and NASA POWER daily meteorological records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-bold">
            PERIOD: 2021-01-01 → 2024-12-31
          </span>
          <ProvenanceBadge type="CALCULATED" size="sm" />
        </div>
      </div>

      {/* Target Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 font-mono">
        {presets.map((p) => {
          const isSelected = selectedTarget === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectTarget(p.id)}
              className={clsx(
                "p-3 rounded-xl border text-xs transition-all flex items-center justify-between text-left select-none font-sans",
                isSelected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="truncate pr-2">
                <span className="block font-semibold text-xs">{p.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{p.id}</span>
              </div>
              <span className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border flex-shrink-0",
                p.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                p.status === "PROCESSING_REQUIRED" ? "bg-amber-50 text-amber-800 border-amber-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {p.status === "VERIFIED" ? "Verified" : formatStatus(p.status)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
