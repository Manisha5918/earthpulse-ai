"use client";

/**
 * EarthPulse AI — Dynamic Scientific Map Legend (Light Theme)
 */

import React from "react";
import { ANALYTICAL_LAYERS } from "../../lib/constants";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export function MapLegend({ activeLayerId = "change_score" }) {
  const layer = ANALYTICAL_LAYERS.find((l) => l.id === activeLayerId) || ANALYTICAL_LAYERS[0];

  return (
    <div className="p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md space-y-2 text-xs">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          Active Layer
        </span>
        <ProvenanceBadge type={layer.provenance} size="xs" />
      </div>

      <div>
        <div className="font-bold text-slate-900 text-xs">{layer.label}</div>
        <div className="text-[12px] text-slate-600 mt-0.5 leading-snug">
          {layer.description}
        </div>
      </div>

      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Unit: <strong className="text-slate-800">{layer.unit}</strong></span>
        <span>{layer.temporalSemantics}</span>
      </div>

      {/* Grid Legend State */}
      <div className="flex items-center gap-3 pt-1.5 border-t border-slate-100 text-[11px] font-mono text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs border border-sky-600 bg-sky-100" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs border border-slate-400 bg-slate-100" />
          <span>Grid Cell</span>
        </div>
      </div>
    </div>
  );
}
