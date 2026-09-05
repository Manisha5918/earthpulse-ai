"use client";

/**
 * EarthPulse AI — NASA POWER Daily Meteorology Sequence (Modern Scientific Editorial)
 * 1,461 Daily Observations across 2021–2024.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Activity } from "lucide-react";

export function NasaTemporalView({ nasaSummary }) {
  // Backend values only: an absent summary renders N/A, never frozen numbers.
  const summary = nasaSummary || {};
  const count = summary.observation_count;
  const countText = count !== undefined && count !== null ? Number(count).toLocaleString("en-US") : "N/A";
  const num = (v, digits = 2) =>
    v !== undefined && v !== null && !Number.isNaN(Number(v)) ? Number(v).toFixed(digits) : "N/A";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-xs font-display font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>NASA POWER Daily Meteorology ({countText} Daily Records)</span>
          </div>
          <div className="text-xs text-slate-500 font-sans">
            Semantics: DAILY OBSERVATIONS • 100% complete temporal record (2021-01-01 to 2024-12-31)
          </div>
        </div>
        <ProvenanceBadge type="OBSERVED" size="xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-mono font-semibold block tracking-wider">DAILY RECORDS</span>
          <span className="text-emerald-900 font-display font-bold text-xl block">{countText} Days</span>
          <span className="text-slate-500 text-[11px] block font-sans">100% Archive Depth</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-mono font-semibold block tracking-wider">MEAN TEMPERATURE</span>
          <span className="text-slate-900 font-display font-bold text-xl block">{num(summary.mean_temperature_c, 1)} °C</span>
          <span className="text-slate-500 text-[11px] block font-sans">Range: {num(summary.min_temperature_c, 1)}° to {num(summary.max_temperature_c, 1)}°C</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-mono font-semibold block tracking-wider">TOTAL PRECIPITATION</span>
          <span className="text-slate-900 font-display font-bold text-xl block">{num(summary.total_precipitation_mm, 0)} mm</span>
          <span className="text-slate-500 text-[11px] block font-sans">Cumulative 2021–2024</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-xs space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-mono font-semibold block tracking-wider">MEAN DAILY RAIN</span>
          <span className="text-slate-900 font-display font-bold text-xl block">{num(summary.mean_daily_precipitation_mm, 2)} mm/d</span>
          <span className="text-slate-500 text-[11px] block font-sans">Daily Average Rate</span>
        </div>
      </div>
    </div>
  );
}
