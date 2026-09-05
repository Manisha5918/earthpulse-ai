"use client";

/**
 * EarthPulse AI — Multi-Source Temporal Coverage Lanes (Modern Scientific Editorial)
 * Clearly visualizes heterogeneous observation schedules across the 4 sensors.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Calendar } from "lucide-react";

export function TemporalCoverage() {
  const lanes = [
    {
      source: "NASA POWER",
      type: "DAILY OBSERVATIONS",
      desc: "1,461 Daily Meteorological Records (Continuous Archive)",
      schedule: "100% complete daily observations across 2021, 2022, 2023, 2024",
      provenance: "OBSERVED",
      color: "text-emerald-800 border-emerald-200 bg-emerald-50"
    },
    {
      source: "Sentinel-2 Multispectral",
      type: "MULTI-TEMPORAL SCENES",
      desc: "4 Verified Optical Cloud-Filtered Scenes (2021–2024)",
      schedule: "Acquisitions: 2021-05-30, 2022-04-05, 2023-05-20, 2024-04-29",
      provenance: "CALCULATED",
      color: "text-sky-800 border-sky-200 bg-sky-50"
    },
    {
      source: "VIIRS Day/Night Band",
      type: "ANNUAL BASELINE",
      desc: "4 April Cloud-Free Stray-Light-Corrected Composites (2021–2024)",
      schedule: "Annual composites: 2021-04, 2022-04, 2023-04, 2024-04 (April baseline only)",
      provenance: "CALCULATED",
      color: "text-amber-800 border-amber-200 bg-amber-50"
    },
    {
      source: "OpenStreetMap",
      type: "SNAPSHOT",
      desc: "Static Spatial Infrastructure Snapshot (Roads, Buildings, POIs)",
      schedule: "Static physical infrastructure snapshot; zero historical time-series claims",
      provenance: "CALCULATED",
      color: "text-slate-700 border-slate-200 bg-slate-100"
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>What each source covers</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Each sensor observes on its own schedule — nothing here is continuous unless stated.
          </p>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="space-y-3">
        {lanes.map((lane, idx) => (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 text-sm">{lane.source}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${lane.color}`}>
                  {lane.type}
                </span>
              </div>
              <div className="text-xs text-slate-700 font-sans font-medium">{lane.desc}</div>
              <div className="text-[11px] text-slate-500">{lane.schedule}</div>
            </div>

            <div className="self-end sm:self-auto flex items-center gap-2">
              <ProvenanceBadge type={lane.provenance} size="xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
