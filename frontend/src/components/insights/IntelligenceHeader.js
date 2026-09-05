"use client";

/**
 * EarthPulse AI — Intelligence Feed Header (Modern Scientific Editorial)
 * Clear disclosure: insights are limited to currently processed pilot regions.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export function IntelligenceHeader({ totalFindings = 0, processedRegions = 1 }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Meta Memo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Findings across the pilot region</span>
        </div>
        <span>Coverage: pilot extent</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-semibold text-slate-900 tracking-tight">
            Latest findings
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            The strongest evidence-backed findings EarthPulse currently has.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
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
