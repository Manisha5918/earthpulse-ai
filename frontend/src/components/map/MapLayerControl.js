"use client";

/**
 * EarthPulse AI — Scientific Map Layer Switcher (Light Theme)
 * Collapsible overlay to preserve clear map canvas visibility.
 */

import React, { useState } from "react";
import clsx from "clsx";
import { ANALYTICAL_LAYERS } from "../../lib/constants";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Layers, ChevronDown, ChevronUp } from "lucide-react";

export function MapLayerControl({ activeLayer, onSelectLayer }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLayerObj = ANALYTICAL_LAYERS.find((l) => l.id === activeLayer) || ANALYTICAL_LAYERS[0];

  const getStatusBadge = (status) => {
    switch (status) {
      case "PROCESSING_REQUIRED":
        return <span className="text-[10px] font-mono text-amber-700 font-semibold">○ INGESTION REQUIRED</span>;
      case "DAILY_OBSERVATIONS":
        return <span className="text-[10px] font-mono text-sky-700 font-semibold">● DAILY ARCHIVE</span>;
      case "SNAPSHOT":
        return <span className="text-[10px] font-mono text-slate-600 font-semibold">◐ STATIC SNAPSHOT</span>;
      default:
        return <span className="text-[10px] font-mono text-slate-500 font-semibold">○ {status}</span>;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs font-sans pointer-events-auto">
      {/* Collapsible Header Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Collapse signal layer list" : "Expand signal layer list"}
        aria-expanded={isOpen}
        className="w-full p-2.5 flex items-center justify-between gap-3 text-slate-900 font-semibold hover:bg-slate-50 transition-colors rounded-xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="flex items-center gap-2 truncate">
          <Layers className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span className="truncate font-mono text-[11px]">
            LAYER: <strong className="text-slate-900">{currentLayerObj?.label}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
            {ANALYTICAL_LAYERS.length}
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>
      <p className="px-2.5 pb-2 text-[10px] font-mono text-slate-400 leading-snug">
        Signal context selector — the grid renders the analytical extent; per-signal values appear in the evidence panels below.
      </p>

      {/* Expanded Layer List */}
      {isOpen && (
        <div className="p-2.5 pt-0 space-y-1 border-t border-slate-100 max-h-64 overflow-y-auto mt-1">
          {ANALYTICAL_LAYERS.map((layer) => {
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => {
                  onSelectLayer(layer.id);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors text-xs select-none",
                  isSelected
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-xs font-semibold"
                    : "hover:bg-slate-50 text-slate-700 border border-transparent"
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span>{layer.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {layer.temporalSemantics}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 ml-2">
                  <ProvenanceBadge type={layer.provenance} size="xs" />
                  {getStatusBadge(layer.status)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

