"use client";

/**
 * EarthPulse AI — Feed Category & Severity Filters (Modern Scientific Editorial)
 */

import React from "react";
import { Filter } from "lucide-react";
import clsx from "clsx";

export function InsightFilters({
  activeCategory,
  setActiveCategory,
  activeSeverity,
  setActiveSeverity
}) {
  const categories = [
    { id: "ALL", label: "All Findings" },
    { id: "GROUNDED_FINDING", label: "Grounded Briefings" },
    { id: "TEMPORAL_ANOMALY", label: "Temporal Anomalies" },
    { id: "SPATIAL_DEVIATION", label: "Spatial Deviations" },
    { id: "EXPLORATORY_CORRELATION", label: "Correlations" }
  ];

  const severities = ["ALL", "NORMAL", "MEDIUM", "HIGH", "CRITICAL"];

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 text-[10px] uppercase tracking-wider mr-1 flex items-center gap-1.5 font-semibold">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Category:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all border font-sans select-none",
              activeCategory === cat.id
                ? "bg-slate-900 text-white border-slate-900 font-semibold shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
        <span className="text-slate-400 text-[10px] uppercase font-semibold">Severity:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {severities.map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setActiveSeverity(sev)}
              className={clsx(
                "px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all border select-none",
                activeSeverity === sev
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
