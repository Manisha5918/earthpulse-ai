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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      {/* Top Meta Memo */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-emerald-800 font-bold uppercase tracking-wider font-mono text-[11px]">Multi-Region Comparative Intelligence</span>
        </div>
        <span className="font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">Framework: Phase6-v1</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 border-l-3 border-emerald-500 pl-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Compare Regions
          </h1>
          <p className="text-sm font-sans text-slate-600 max-w-2xl">
            Evaluate side-by-side satellite observations, meteorological baselines, and statistical deviations.
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
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              statusA === "AVAILABLE" || statusA === "VALID" || statusA === "VERIFIED"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {statusA}
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">{targetA}</div>
          <div className="text-[11px] text-slate-500 font-sans">
            {targetA === "IN-TN-CHE"
              ? "Chennai Metropolitan Area (Tamil Nadu, India)"
              : targetA === "CHE_G005"
              ? "Chennai Core Urban Cell CHE_G005 (T. Nagar)"
              : targetA === "CHE_G001"
              ? "Chennai Coastal Cell CHE_G001 (Royapuram/Harbour)"
              : targetA.startsWith("CHE_G")
              ? `Chennai Grid Cell ${targetA} (Tamil Nadu, India)`
              : targetA === "BLR_TEST"
              ? "Bengaluru Urban Extent (Karnataka, India)"
              : "Target A Extent"}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">LOCATION B</span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              statusB === "AVAILABLE" || statusB === "VALID" || statusB === "VERIFIED" || statusB === "PARTIAL_DATA"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {statusB}
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">{targetB}</div>
          <div className="text-[11px] text-slate-500 font-sans">
            {targetB === "IN-TN-CHE"
              ? "Chennai Metropolitan Area (Tamil Nadu, India)"
              : targetB === "CHE_G005"
              ? "Chennai Core Urban Cell CHE_G005 (T. Nagar)"
              : targetB === "CHE_G001"
              ? "Chennai Coastal Cell CHE_G001 (Royapuram/Harbour)"
              : targetB.startsWith("CHE_G")
              ? `Chennai Grid Cell ${targetB} (Tamil Nadu, India)`
              : targetB === "BLR_TEST"
              ? "Bengaluru Urban Extent (Karnataka, India — Pipeline Ingestion Pending)"
              : targetB === "LON_TEST"
              ? "London Reference (United Kingdom — Outside India Domain)"
              : "Target B Extent"}
          </div>
        </div>
      </div>
    </div>
  );
}
