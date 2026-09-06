"use client";

/**
 * EarthPulse AI — Regional Change Score Component (Modern Scientific Editorial)
 * Displays calibrated composite rating (0–100) and weighted physical observation components.
 */

import React, { useState } from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Gauge, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export function ChangeScoreCard({ changeScore }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!changeScore || changeScore.overall_score === null || changeScore.overall_score === undefined) {
    return (
      <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span>Regional change score</span>
          </span>
          <ProvenanceBadge type="CALCULATED" size="xs" />
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-sans flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>Score Unavailable: Insufficient observations or unverified extent.</span>
        </div>
      </div>
    );
  }

  const score = changeScore.overall_score;
  const components = changeScore.components || {};
  const weights = changeScore.weights || {};

  const getScoreBadgeClass = (val) => {
    if (val >= 60) return "text-rose-700 bg-rose-50 border-rose-200";
    if (val >= 35) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  const getProgressBarClass = (key, val) => {
    // Data completeness and temporal alignment: 100% is excellent, render in rich emerald green
    if (key === "data_completeness" || key === "temporal_compatibility") {
      if (val >= 0.8) return "bg-emerald-600";
      if (val >= 0.5) return "bg-teal-600";
      return "bg-amber-500";
    }
    // Anomaly magnitude & spatial deviation: elevated values render in amber/rose
    if (val >= 0.6) return "bg-rose-500";
    if (val >= 0.35) return "bg-amber-500";
    return "bg-emerald-600";
  };

  const compLabels = {
    temporal_anomaly: "Temporal Anomaly Magnitude",
    spatial_anomaly: "Spatial Anomaly Deviation",
    cross_signal_agreement: "Cross-Signal Agreement",
    data_completeness: "Data completeness",
    temporal_compatibility: "Temporal Alignment"
  };

  return (
    <div className="p-5 bg-white border border-slate-200/70 hover:border-slate-300/80 rounded-2xl shadow-xs space-y-4 transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <span className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-700" />
            <span>Regional Change Score</span>
          </span>
          <div className="text-[11px] text-slate-500 font-sans">
            Engine: <strong className="text-slate-800">{changeScore.scoring_version || "phase6-v1"}</strong> · Weighting: <strong className="text-emerald-900 font-mono font-semibold">{changeScore.weighting_method || "EXPERT_CONFIGURED"}</strong>
          </div>
        </div>
        <ProvenanceBadge type={changeScore.provenance || "CALCULATED"} size="xs" />
      </div>

      {/* Main Score Readout */}
      <div className="flex items-center gap-5 p-4 sm:p-5 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50 border border-emerald-200/80 rounded-xl">
        <div className={clsx("w-24 h-24 border-2 rounded-xl flex flex-col items-center justify-center font-mono flex-shrink-0 shadow-xs", getScoreBadgeClass(score))}>
          <span className="text-4xl font-extrabold tracking-tight">{score.toFixed(1)}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-semibold">/ 100</span>
        </div>
        <div className="space-y-1">
          <div className="font-display font-extrabold text-slate-900 text-base">
            {score >= 60 ? "Elevated Regional Change" : score >= 35 ? "Moderate Telemetry Variation" : "Nominal Regional Baseline"}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Multi-sensor synthesis of Sentinel-2 optical variance, VIIRS nighttime radiance, and NASA POWER meteorological deviations.
          </p>
        </div>
      </div>

      {/* Progressive Disclosure Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between transition-all"
        >
          <span>Observation Component Weights (5 Factors)</span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {/* 5 Component Score Bars */}
        {showDetails && (
          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 font-mono text-xs">
            {Object.entries(components).map(([key, val]) => {
              const w = weights[key] !== undefined ? (weights[key] * 100).toFixed(0) : "20";
              const normVal = val !== null && val !== undefined ? Math.min(1.0, Math.max(0, val)) : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>{compLabels[key] || key} <span className="text-slate-400">({w}%)</span></span>
                    <span className="font-bold text-slate-900">{val !== null ? (val * 100).toFixed(1) : "N/A"}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-300", getProgressBarClass(key, normVal))}
                      style={{ width: `${normVal * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
