"use client";

/**
 * EarthPulse AI — Cross-Signal Concurrence & Evidence Chain
 * Strictly enforces non-causal disclosures:
 * - relationship_type: "CORRELATION"
 * - causal_claim: false
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { GitMerge } from "lucide-react";

export function CrossSignalChain({ patterns = [], relationships = [] }) {
  return (
    <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-hairline space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="space-y-0.5">
          <span className="text-[12px] font-medium text-slate-900 font-mono flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-teal-700" />
            <span>Cross-Signal Evidence Patterns</span>
          </span>
          <div className="text-[10px] font-mono text-slate-500">
            Multi-Sensor Concurrence • Non-Causal Analytics
          </div>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      {/* Evidence Patterns */}
      {patterns.length === 0 ? (
        <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 text-[11px] text-slate-500 font-mono">
          No multi-sensor concurrence patterns detected for the selected period.
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.map((pat, idx) => (
            <div key={idx} className="p-3 rounded-xs bg-slate-50/70 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-slate-900">
                  {pat.pattern_type}
                </span>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-xs bg-teal-50 text-teal-900 border border-teal-200">
                  {pat.temporal_compatibility || "SAME_MONTH"}
                </span>
              </div>

              <p className="text-[12px] text-slate-700 leading-relaxed font-sans">
                {pat.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Signals: <strong className="text-slate-800">{(pat.supporting_signals || []).join(", ")}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Non-Causal Correlation</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exploratory Relationships & Correlations */}
      {relationships.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
            Statistical Pairwise Correlations (Non-Causal)
          </span>

          <div className="space-y-1.5">
            {relationships.map((rel, idx) => (
              <div key={idx} className="p-2.5 rounded-xs bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span className="text-slate-900 font-medium">{rel.primary_signal}</span>
                  <span className="text-slate-400 mx-1.5">↔</span>
                  <span className="text-slate-900 font-medium">{rel.secondary_signal}</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {rel.method || "PEARSON"} (Sample N = {rel.sample_size})
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-teal-800 text-xs">
                    r = {rel.correlation_coefficient !== null ? rel.correlation_coefficient.toFixed(4) : "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    p = {rel.p_value !== null ? rel.p_value.toFixed(4) : "null"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

