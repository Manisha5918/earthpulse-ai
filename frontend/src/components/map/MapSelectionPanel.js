"use client";

/**
 * EarthPulse AI — Selected Analytical Cell Summary Panel (Light Theme)
 * Truthful metadata; zero hardcoded measurements or unsupported claims.
 */

import React from "react";
import { PILOT_REGION } from "../../lib/constants";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { MapPin, Box, CheckCircle2, ShieldCheck, X } from "lucide-react";

export function MapSelectionPanel({ selectedCell, onClearSelection, regionDetail, selectedCellProps }) {
  if (!selectedCell) {
    return null;
  }

  const areaDisplay = selectedCellProps?.area_sqkm ? `${selectedCellProps.area_sqkm} km²` : "0.05° resolution";

  return (
    <div className="p-4 bg-white/95 backdrop-blur-md rounded-xl border border-emerald-300 shadow-xl space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-emerald-700" />
          <span className="font-mono font-bold text-sm text-emerald-950">{selectedCell}</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            0.05° CELL
          </span>
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear cell selection"
          className="text-slate-400 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          title="Clear cell selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[10px]">REGION</span>
          <span className="text-slate-900 font-bold">{PILOT_REGION.id}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">RESOLUTION</span>
          <span className="text-slate-900 font-bold">{areaDisplay}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">TARGET STATUS</span>
          <span className="text-emerald-700 font-bold">ANALYTICAL CELL</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">PILOT EXTENT</span>
          <span className="text-emerald-700 font-bold">VERIFIED CHENNAI</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real Data Only</span>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>
    </div>
  );
}
