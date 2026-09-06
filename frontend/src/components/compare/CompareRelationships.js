"use client";

/**
 * EarthPulse AI — Comparative Cross-Signal Evidence & Non-Causal Disclosures (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { GitMerge } from "lucide-react";

export function CompareRelationships({ targetA, targetB, relationshipsA = [], relationshipsB = [], hasB = false }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
            <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-600" />
              <span>How the signals compare</span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Side-by-side signal agreement for both locations (correlation only, never causation).
            </p>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location A Relationships */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">LOCATION A: {targetA}</span>
            <span className="text-[10px] text-slate-600 font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200">
              CAUSAL CLAIM: FALSE
            </span>
          </div>

          <div className="space-y-2">
            {relationshipsA.length > 0 ? (
              relationshipsA.slice(0, 3).map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/80 flex justify-between items-center shadow-xs">
                  <span className="text-slate-800 font-medium">{r.primary_signal} ↔ {r.secondary_signal}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                    r = {r.correlation_coefficient?.toFixed(3)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-xs font-sans p-2">No active correlation relationships returned.</div>
            )}
          </div>
        </div>

        {/* Location B Relationships */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-700">LOCATION B: {targetB}</span>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
              hasB
                ? "bg-white text-slate-600 border-slate-200"
                : targetB === "BLR_TEST"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {hasB ? "CAUSAL CLAIM: FALSE" : targetB === "BLR_TEST" ? "PROCESSING REQUIRED" : "UNAVAILABLE"}
            </span>
          </div>

          {hasB ? (
            <div className="space-y-2">
              {relationshipsB.length > 0 ? (
                relationshipsB.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/80 flex justify-between items-center shadow-xs">
                    <span className="text-slate-800 font-medium">{r.primary_signal} ↔ {r.secondary_signal}</span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                      r = {r.correlation_coefficient?.toFixed(3)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs font-sans">
                  No active correlation relationships returned for this cell.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 font-sans leading-relaxed">
              {targetB === "BLR_TEST"
                ? "Multi-sensor relationship matrix not available for Bengaluru (BLR_TEST). Raw scene ingestion and temporal alignment of optical, nocturnal, and weather signals required."
                : `Multi-sensor relationship matrix not available for ${targetB}. Ingestion required.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
