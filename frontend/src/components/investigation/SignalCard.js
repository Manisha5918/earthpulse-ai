"use client";

/**
 * EarthPulse AI — Multi-Sensor Signal Evidence Card
 * Displays rigorous physical telemetry breakdown:
 * 1. Observed Value
 * 2. Historical Baseline
 * 3. Absolute Deviation
 * 4. Anomaly Z-Score
 * 5. Evidence Sample & Constraints
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import clsx from "clsx";

export function SignalCard({
  sensorName = "Sentinel-2",
  metricName = "NDVI",
  observedValue = null,
  baselineValue = null,
  unit = "index",
  observationPeriod = "2024-04-29",
  temporalSemantics = "MULTI_TEMPORAL_SCENES",
  zScore = null,
  severity = "NORMAL",
  observationCount = 4,
  confidence = "LIMITED",
  provenance = "CALCULATED",
  limitations = "Derived from multi-temporal observations."
}) {
  const diff = observedValue !== null && baselineValue !== null ? (observedValue - baselineValue) : null;

  const getSeverityStyle = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "text-rose-900 bg-rose-50 border-rose-200";
      case "HIGH":
        return "text-amber-900 bg-amber-50 border-amber-200";
      case "MEDIUM":
        return "text-teal-900 bg-teal-50 border-teal-200";
      default:
        return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-hairline space-y-2.5">
      {/* Sensor Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span className="font-semibold text-[13px] text-slate-900 font-sans">{sensorName}</span>
          <span className="text-[11px] font-mono text-slate-500 block">{metricName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ProvenanceBadge type={provenance} size="xs" />
          <span className={clsx("text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-xs border shadow-hairline", getSeverityStyle(severity))}>
            {severity}
          </span>
        </div>
      </div>

      {/* Observational Telemetry Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xs border border-slate-200/80">
        <div>
          <span className="text-slate-500 block text-[9px] font-medium uppercase tracking-wider">1. OBSERVED</span>
          <span className="text-slate-900 font-bold text-xs">{observedValue !== null ? observedValue : "N/A"} <span className="text-slate-400 text-[9px] font-normal">{unit}</span></span>
        </div>

        <div>
          <span className="text-slate-500 block text-[9px] font-medium uppercase tracking-wider">2. BASELINE</span>
          <span className="text-slate-700 font-medium text-xs">{baselineValue !== null ? baselineValue : "N/A"} <span className="text-slate-400 text-[9px] font-normal">{unit}</span></span>
        </div>

        <div>
          <span className="text-slate-500 block text-[9px] font-medium uppercase tracking-wider">3. DEVIATION</span>
          <span className={clsx("font-medium", diff > 0 ? "text-teal-800" : diff < 0 ? "text-amber-800" : "text-slate-700")}>
            {diff !== null ? `${diff > 0 ? "+" : ""}${diff.toFixed(4)}` : "N/A"}
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[9px] font-medium uppercase tracking-wider">4. Z-SCORE</span>
          <span className="text-slate-900 font-bold">{zScore !== null ? `z = ${zScore.toFixed(3)}` : "z = N/A"}</span>
        </div>
      </div>

      {/* 5. Supporting Sample Size & Limitations */}
      <div className="space-y-1 pt-0.5 text-[10px] font-mono text-slate-500">
        <div className="flex items-center justify-between">
          <span>SAMPLE: <strong className="text-slate-800">N = {observationCount}</strong></span>
          <span>CONFIDENCE: <strong className="text-slate-800">{confidence}</strong></span>
        </div>
        <div className="text-slate-500 text-[9px] leading-tight border-t border-slate-100 pt-1 font-sans">
          {limitations}
        </div>
      </div>
    </div>
  );
}

