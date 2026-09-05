"use client";

/**
 * EarthPulse AI — Comparative Statistical Anomaly Matrix (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { AlertCircle } from "lucide-react";

export function CompareAnomalyMatrix({ targetA, targetB, anomaliesA = [], anomaliesB = [] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-600" />
            <span>Unusual readings compared</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Baseline deviations for each location, side by side.
          </p>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location A Anomalies */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900">LOCATION A: {targetA}</span>
            <span className="text-[10px] text-slate-500 font-medium">4 Signals Processed</span>
          </div>

          <div className="space-y-2">
            {anomaliesA.length > 0 ? (
              anomaliesA.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 flex justify-between items-center shadow-xs">
                  <span className="font-semibold text-slate-900">{a.signal.toUpperCase()}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs">
                    z = {a.z_score !== null ? a.z_score.toFixed(3) : "N/A"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">{a.severity}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs font-sans">
                No active anomalies calculated for this extent.
              </div>
            )}
          </div>
        </div>

        {/* Location B Anomalies */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-700">LOCATION B: {targetB}</span>
            <span className="text-[10px] text-amber-800 font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              PROCESSING REQUIRED
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 font-sans leading-relaxed">
            Baseline anomaly calculations not yet available for {targetB}. Ingestion and historical baselining required before anomaly scoring.
          </div>
        </div>
      </div>
    </div>
  );
}
