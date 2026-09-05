"use client";

/**
 * EarthPulse AI — Evidence Strength & Small-Sample Disclosures (Modern Scientific Editorial)
 * Preserves strict temporal honesty: DAILY_OBSERVATIONS for NASA POWER, MULTI_TEMPORAL_SCENES for Sentinel-2.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { ShieldAlert } from "lucide-react";

export function EvidenceStrength({ dailyCount = null, osmRoadsKm = null, osmBuildings = null, sceneCount = null }) {
  const dailyText = dailyCount !== undefined && dailyCount !== null && Number(dailyCount) > 0
    ? `NASA POWER daily meteorological records cover ${Number(dailyCount).toLocaleString("en-US")} consecutive daily observations across 2021–2024, providing statistically robust historical baselines for surface temperature and precipitation.`
    : "NASA POWER daily meteorological records across 2021–2024 provide historical baselines for surface temperature and precipitation.";
  const dailyTitle = dailyCount !== undefined && dailyCount !== null && Number(dailyCount) > 0
    ? `Daily Weather Archive (N = ${Number(dailyCount).toLocaleString("en-US")})`
    : "Daily Weather Archive";
  const osmText = osmRoadsKm !== undefined && osmRoadsKm !== null && osmBuildings !== undefined && osmBuildings !== null
    ? `OpenStreetMap infrastructure density (${Number(osmRoadsKm).toLocaleString("en-US", { maximumFractionDigits: 2 })} km roads, ${Number(osmBuildings).toLocaleString("en-US")} buildings) represents a static spatial context snapshot and does not describe historical growth trends.`
    : "OpenStreetMap mapped roads and buildings represent a static spatial context snapshot and do not describe historical growth trends.";
  return (
    <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-4 text-xs font-mono shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="font-display font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Evidence Quality & Sample Size Disclosures</span>
        </span>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
          <span className="text-amber-900 font-display font-bold block text-sm">Small-Sample Baselines{sceneCount ? ` (N = ${sceneCount})` : ""}</span>
          <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
            Sentinel-2 optical scenes (4 multi-temporal scenes) and VIIRS April annual observations (4 baseline periods) reflect exploratory baselines. Correlation from N=4 is not conclusive proof.
          </p>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
          <span className="text-emerald-900 font-display font-bold block text-sm">{dailyTitle}</span>
          <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
            {dailyText}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <span className="text-slate-900 font-display font-bold block text-sm">Static Spatial Snapshot</span>
          <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
            {osmText}
          </p>
        </div>
      </div>
    </div>
  );
}
