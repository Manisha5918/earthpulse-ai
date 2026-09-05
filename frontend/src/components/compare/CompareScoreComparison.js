"use client";

/**
 * EarthPulse AI — Comparative Regional Change Score (Modern Scientific Editorial)
 * Strictly labels difference as CALCULATED COMPARISON; zero causal/ranking terms.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Gauge } from "lucide-react";

export function CompareScoreComparison({ scoreA, scoreB, targetA, targetB }) {
  const hasA = scoreA && scoreA.overall_score !== null && scoreA.overall_score !== undefined;
  const hasB = scoreB && scoreB.overall_score !== null && scoreB.overall_score !== undefined;

  const scoreValA = hasA ? scoreA.overall_score : null;
  const scoreValB = hasB ? scoreB.overall_score : null;
  const diff = (hasA && hasB) ? (scoreValA - scoreValB) : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600" />
            <span>Change score comparison</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Composite 0–100 rating with disclosed weights.
          </p>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score A Card */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span className="font-semibold">LOCATION A ({targetA})</span>
            <span className="text-emerald-800 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px]">
              {hasA ? "VALID" : "UNAVAILABLE"}
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-display font-bold text-slate-900">
            {hasA ? scoreValA.toFixed(1) : "N/A"} <span className="text-xs font-mono text-slate-400 font-normal">/ 100</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {hasA ? "Calculated across 4 sensor signals." : "Regional profile not yet ingested for this target."}
          </p>
        </div>

        {/* Score B Card */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span className="font-semibold">LOCATION B ({targetB})</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              hasB ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {hasB ? "VALID" : "UNAVAILABLE"}
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-display font-bold text-slate-400">
            {hasB ? scoreValB.toFixed(1) : "N/A"} <span className="text-xs font-mono text-slate-400 font-normal">/ 100</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {hasB ? "Calculated across sensor signals." : "Regional profile required; no score available."}
          </p>
        </div>

        {/* Comparison Difference Card */}
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-500 font-semibold">
            <span className="uppercase tracking-wider">CALCULATED COMPARISON</span>
            <ProvenanceBadge type="CALCULATED" size="xs" />
          </div>
          {diff !== null ? (
            <div className="space-y-2">
              <div className="text-3xl font-display font-bold text-slate-900">
                Δ = {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} pts
              </div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Location A score is {Math.abs(diff).toFixed(1)} pts {diff > 0 ? "higher" : "lower"} than Location B.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="font-semibold font-mono text-slate-900">Comparison Unavailable</div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Requires valid processed regional change scores for both target locations before computing delta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
