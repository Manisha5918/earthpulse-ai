"use client";

/**
 * EarthPulse AI — Location & Target Selector (Modern Scientific Editorial)
 * Clean white panel, subtle slate borders, and soft active indicators.
 */

import React from "react";
import { PILOT_REGION } from "../../lib/constants";
import { MapPin, Navigation } from "lucide-react";
import clsx from "clsx";

export function LocationSelector({
  locationMode = "region",
  setLocationMode,
  selectedRegion = "IN-TN-CHE",
  setSelectedRegion,
  selectedCell = null,
  setSelectedCell,
  customCoords = { lat: 13.0827, lon: 80.2707 },
  setCustomCoords
}) {
  const quickPresets = [
    { label: "Chennai Pilot (IN-TN-CHE)", mode: "region", regionCode: "IN-TN-CHE", cell: null, coords: [13.0827, 80.2707] },
    { label: "Bengaluru Test (12.97°N, 77.59°E)", mode: "point", regionCode: null, cell: null, coords: [12.9716, 77.5946] },
    { label: "London Test (51.51°N, -0.13°E)", mode: "point", regionCode: null, cell: null, coords: [51.5074, -0.1278] }
  ];

  return (
    <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <label className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Region</span>
        </label>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-sans">
          {locationMode === "region" ? "Region" : locationMode === "grid_cell" ? "Grid cell" : "Point"}
        </span>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-1 gap-2">
        {quickPresets.map((preset, idx) => {
          const isActive =
            (preset.mode === "region" && locationMode === "region" && selectedRegion === preset.regionCode && !selectedCell) ||
            (preset.mode === "point" && locationMode === "point" && Math.abs(customCoords.lat - preset.coords[0]) < 0.01);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setLocationMode(preset.mode);
                if (preset.regionCode) setSelectedRegion(preset.regionCode);
                if (preset.cell !== undefined) setSelectedCell(preset.cell);
                if (preset.coords) setCustomCoords({ lat: preset.coords[0], lon: preset.coords[1] });
              }}
              className={clsx(
                "px-3.5 py-2.5 text-left text-xs transition-all border rounded-lg select-none font-sans flex items-center justify-between",
                isActive
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
              )}
            >
              <div className="truncate text-xs">{preset.label}</div>
              {isActive && <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Mode Specific Controls */}
      {locationMode === "point" && (
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">LATITUDE (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={customCoords.lat}
              onChange={(e) => setCustomCoords({ ...customCoords, lat: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">LONGITUDE (°E)</label>
            <input
              type="number"
              step="0.0001"
              value={customCoords.lon}
              onChange={(e) => setCustomCoords({ ...customCoords, lon: parseFloat(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {selectedCell && (
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-center justify-between text-xs font-mono text-emerald-950">
          <span>Target Cell: <strong>{selectedCell}</strong></span>
          <button
            type="button"
            onClick={() => setSelectedCell(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
          >
            Reset to Region
          </button>
        </div>
      )}
    </div>
  );
}
