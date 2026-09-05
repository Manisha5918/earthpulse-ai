"use client";

/**
 * EarthPulse AI — Cross-Signal Concurrence & Non-Causal Relationships (Modern Scientific Editorial)
 * "Do Signals Agree?" — Strict Non-Causal Disclosures with Progressive Disclosure.
 */

import React, { useState } from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { GitMerge, ShieldCheck, ChevronDown } from "lucide-react";
import clsx from "clsx";

export function RegionalRelationships({ patterns = [], relationships = [], hideHeader = false }) {
  const [showCorrelations, setShowCorrelations] = useState(false);

  return (
    <div className="space-y-5">
      {!hideHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="space-y-0.5">
            <h2 className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-600" />
              <span>Signals changing together</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Which signals agree — stated as correlation, never as causation.
            </p>
          </div>
          <ProvenanceBadge type="CALCULATED" size="xs" />
        </div>
      )}

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {patterns.length === 0 ? (
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl text-xs font-mono text-slate-500 col-span-2 shadow-sm">
            No active concurrence patterns detected for the baseline period.
          </div>
        ) : (
          patterns.map((pat, idx) => (
            <div key={idx} className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-3.5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-display font-bold text-slate-900 text-sm">{pat.pattern_type}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {pat.temporal_compatibility}
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed font-sans text-xs">
                {pat.description}
              </p>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                <div>Supporting Signals: <strong className="text-slate-900 block mt-0.5">{(pat.supporting_signals || []).join(", ")}</strong></div>
                <div>Interpretation: <strong className="text-slate-900 block mt-0.5">{pat.interpretation_status}</strong></div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  NON-CAUSAL CORRELATION
                </span>
                <span className="text-slate-500 font-medium">CONFIDENCE: {pat.confidence}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistical Relationships with Progressive Disclosure */}
      {relationships.length > 0 && (
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="font-display font-bold text-slate-900 text-sm block">
                Exploratory Cross-Signal Correlations (Spatial Grid{relationships[0]?.sample_size ? `, N=${relationships[0].sample_size}` : ""})
              </span>
              <span className="text-xs text-slate-500 font-sans mt-0.5 block">
                Non-causal statistical correlation tests across analytical cells.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                CAUSAL_CLAIM: FALSE
              </span>
              <button
                onClick={() => setShowCorrelations(!showCorrelations)}
                className="text-xs font-mono font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                <span>{showCorrelations ? "Hide Matrix" : "View Correlation Matrix"}</span>
                <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", showCorrelations && "rotate-180")} />
              </button>
            </div>
          </div>

          {showCorrelations && (
            <div className="space-y-2.5 pt-1">
              {relationships.map((rel, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-display font-bold text-sm">{rel.primary_signal}</span>
                      <span className="text-slate-400 font-mono">↔</span>
                      <span className="text-slate-900 font-display font-bold text-sm">{rel.secondary_signal}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-sans">
                      Method: {rel.method} (Sample Size N = {rel.sample_size}) • Status: {rel.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">CORRELATION</span>
                      <span className="text-slate-900 font-bold text-base font-mono">r = {rel.correlation_coefficient?.toFixed(4) || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block uppercase tracking-wider">P-VALUE</span>
                      <span className="text-slate-600 text-xs font-medium font-mono">p = {rel.p_value?.toFixed(4) || "null"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
