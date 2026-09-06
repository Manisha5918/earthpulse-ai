"use client";

/**
 * EarthPulse AI — Intelligence Feed Header (Modern Scientific Editorial)
 * Clear disclosure: insights are limited to currently processed pilot regions.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export function IntelligenceHeader({ totalFindings = 0, processedRegions = 1 }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      {/* Top Meta Memo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-emerald-800 font-bold uppercase tracking-wider font-mono text-[11px]">Regional Intelligence Feed</span>
        </div>
        <span className="font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">Coverage: Pilot Extent</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 border-l-3 border-emerald-500 pl-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Latest Regional Findings
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Surfaces verified multi-signal findings synthesized strictly from immutable physical observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-bold">
            PILOT: CHENNAI (IN-TN-CHE)
          </span>
          <ProvenanceBadge type="CALCULATED" size="sm" />
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">PROCESSED REGIONS</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{processedRegions} (Chennai Metro)</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">TELEMETRY SOURCES</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">4 Ingested Pipelines</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">ACTIVE FINDINGS</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{totalFindings} Synthesized</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">GROUNDING SYSTEM</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">Deterministic AI</span>
        </div>
      </div>
    </div>
  );
}
