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
    { label: "Chennai Pilot (IN-TN-CHE)", sub: "Verified Metropolitan Pilot Extent", id: "IN-TN-CHE", status: "VERIFIED" },
    { label: "Chennai Core Urban (CHE_G005)", sub: "T. Nagar / Urban Grid Cell", id: "CHE_G005", status: "VERIFIED" },
    { label: "Chennai Port / Coastal (CHE_G001)", sub: "Royapuram / Coastal Grid Cell", id: "CHE_G001", status: "VERIFIED" },
    { label: "Bengaluru Test (12.97°N, 77.59°E)", sub: "Expansion Candidate — Ingestion Pending", id: "BLR_TEST", status: "PROCESSING_REQUIRED" },
    { label: "London Control (51.51°N, -0.13°E)", sub: "Global Reference — Outside India Domain", id: "LON_TEST", status: "DATA_UNAVAILABLE" }
  ];
  const statusLabel = (s) => (s === "VERIFIED" ? "Verified" : formatStatus(s));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 transition-all">
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
                  ? "bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-400/30"
                  : "bg-white border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30"
              )}
            >
              <div className="truncate pr-2">
                <div className="text-xs font-medium text-slate-900">{p.label}</div>
                <div className="text-[11px] text-slate-500 font-sans font-normal truncate">{p.sub}</div>
              </div>
              <span className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full font-sans font-semibold border flex-shrink-0",
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
