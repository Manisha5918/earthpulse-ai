"use client";

/**
 * EarthPulse AI — Comparative Header (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export function CompareHeader({
  targetA = "IN-TN-CHE",
  statusA = "AVAILABLE",
  targetB = "BLR_TEST",
  statusB = "PROCESSING_REQUIRED"
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Meta Memo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Multi-region comparison</span>
        </div>
        <span className="font-mono">Framework: Phase6-v1</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-semibold text-slate-900 tracking-tight">
            Compare regions
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Choose two locations to see how they differ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceBadge type="CALCULATED" size="sm" />
        </div>
      </div>

      {/* Target Comparison Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">LOCATION A</span>
            <span className="text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px]">
              {statusA}
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">{targetA}</div>
          <div className="text-[11px] text-slate-500 font-sans">
            {targetA === "IN-TN-CHE" ? "Chennai Metropolitan Area (Tamil Nadu, India)" : "Target A Extent"}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">LOCATION B</span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              statusB === "AVAILABLE" || statusB === "PARTIAL_DATA"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {statusB}
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">{targetB}</div>
          <div className="text-[11px] text-slate-500 font-sans">
            {targetB === "BLR_TEST" ? "Bengaluru Urban Extent (Karnataka, India)" : targetB === "LON_TEST" ? "London (United Kingdom)" : "Target B Extent"}
          </div>
        </div>
      </div>
    </div>
  );
}
