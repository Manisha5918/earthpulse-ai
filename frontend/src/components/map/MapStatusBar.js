"use client";

/**
 * EarthPulse AI — Bottom Map Telemetry Strip
 * Displays current projection metadata, grid resolution, active selection, and provenance.
 */

import React from "react";
import { PILOT_REGION } from "../../lib/constants";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Globe, Grid, Layers } from "lucide-react";

export function MapStatusBar({ selectedCell, activeLayerId }) {
  return (
    <div className="h-8 px-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-600 select-none">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1.5 text-slate-900 font-medium">
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>{PILOT_REGION.name} ({PILOT_REGION.id})</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
          <Grid className="w-3 h-3 text-slate-400" />
          <span>EPSG:4326 · {PILOT_REGION.gridResolution} ({PILOT_REGION.cellCount} cells)</span>
        </div>

        {selectedCell && (
          <div className="flex items-center gap-1 text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
            <span>Cell {selectedCell}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden md:inline text-[10px] text-slate-400 font-sans">
          Real pilot observations
        </span>
        <ProvenanceBadge type="OBSERVED" size="xs" />
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>
    </div>
  );
}

