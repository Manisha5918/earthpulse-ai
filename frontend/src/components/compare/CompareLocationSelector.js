"use client";

/**
 * EarthPulse AI — Comparative Location Selector (Location A & B)
 */

import React from "react";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import { formatStatus } from "../../lib/utils";

export function CompareLocationSelector({
  label = "Location A",
  selectedTarget = "IN-TN-CHE",
  onSelectTarget
}) {
  const presets = [
    { label: "Chennai Pilot (IN-TN-CHE)", id: "IN-TN-CHE", status: "VERIFIED" },
    { label: "Bengaluru Test (12.97°N, 77.59°E)", id: "BLR_TEST", status: "PROCESSING_REQUIRED" },
    { label: "London Test (51.51°N, -0.13°E)", id: "LON_TEST", status: "DATA_UNAVAILABLE" }
  ];
  const statusLabel = (s) => (s === "VERIFIED" ? "Verified" : formatStatus(s));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{label}</span>
        </span>
        <span className="text-xs font-mono text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {selectedTarget}
        </span>
      </div>

      <div className="space-y-2">
        {presets.map((p) => {
          const isSelected = selectedTarget === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectTarget(p.id)}
              className={clsx(
                "w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-center justify-between select-none",
                isSelected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="truncate text-xs">{p.label}</span>
              <span className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border",
                p.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                p.status === "PROCESSING_REQUIRED" ? "bg-amber-50 text-amber-800 border-amber-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {statusLabel(p.status)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
