import React from "react";
import { ChevronDown, MapPin } from "lucide-react";

export default function RegionSelector({ currentRegion = "Chennai", onSelect }) {
  return (
    <div className="relative inline-block text-left">
      <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-elevated border border-border-subtle rounded text-xs text-slate-200 hover:border-slate-500 transition-colors">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        <span>{currentRegion}</span>
        <ChevronDown className="w-3 h-3 text-slate-500 ml-1" />
      </button>
    </div>
  );
}
