"use client";

/**
 * EarthPulse AI — Investigation Control Panel (Modern Scientific Editorial)
 * Configures date windows, telemetry signals, async execution mode, and runs analysis.
 */

import React from "react";
import { Sliders, Calendar, CheckSquare, Zap, Clock, Play, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import clsx from "clsx";

export function AnalysisControlPanel({
  startDate = "2021-01-01",
  setStartDate,
  endDate = "2024-12-31",
  setEndDate,
  selectedSignals = ["sentinel2", "viirs", "nasa_power", "osm"],
  setSelectedSignals,
  asyncMode = false,
  setAsyncMode,
  onRunAnalysis,
  loading = false,
  onCheckAvailability
}) {
  const signalOptions = [
    { id: "sentinel2", label: "Sentinel-2", desc: "Vegetation and land-surface signals · 4 scenes", prov: "CALCULATED" },
    { id: "viirs", label: "VIIRS", desc: "Nighttime light intensity · April annual baseline", prov: "CALCULATED" },
    { id: "nasa_power", label: "NASA POWER", desc: "Temperature and precipitation · Daily observations", prov: "OBSERVED" },
    { id: "osm", label: "OpenStreetMap", desc: "Mapped roads, buildings and places · Spatial snapshot", prov: "CALCULATED" }
  ];

  const toggleSignal = (id) => {
    if (selectedSignals.includes(id)) {
      if (selectedSignals.length > 1) {
        setSelectedSignals(selectedSignals.filter((s) => s !== id));
      }
    } else {
      setSelectedSignals([...selectedSignals, id]);
    }
  };

  return (
    <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-emerald-600" />
          <span>Time and data</span>
        </span>
        <button
          type="button"
          onClick={onCheckAvailability}
          className="text-xs font-sans font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          Check availability
        </button>
      </div>

      {/* Date Range Selection */}
      <div className="space-y-2">
        <label className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Date range</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1 font-mono font-semibold uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              min="2021-01-01"
              max="2024-12-31"
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1 font-mono font-semibold uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              min="2021-01-01"
              max="2024-12-31"
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Multi-Signal Selector */}
      <div className="space-y-2">
        <label className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Data sources</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {signalOptions.map((sig) => {
            const isChecked = selectedSignals.includes(sig.id);
            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => toggleSignal(sig.id)}
                className={clsx(
                  "p-3 border rounded-xl text-left text-xs transition-all flex items-start gap-3 select-none",
                  isChecked
                    ? "bg-emerald-50/50 border-emerald-300 text-slate-900 font-medium shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-sans font-semibold text-xs text-slate-900 leading-tight">{sig.label}</div>
                  <div className="text-[11px] text-slate-500 font-sans leading-tight">{sig.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution Mode Toggle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-sans gap-2">
        <span className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
          {asyncMode ? <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> : <Zap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
          <span className="truncate">{asyncMode ? "Async Job Polling" : "Synchronous Execution"}</span>
        </span>
        <button
          type="button"
          onClick={() => setAsyncMode(!asyncMode)}
          className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap flex-shrink-0"
        >
          Switch to {asyncMode ? "Sync" : "Async"}
        </button>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="md"
        className="w-full gap-2 text-xs font-semibold"
        disabled={loading || selectedSignals.length === 0}
        onClick={onRunAnalysis}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading real data…</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Investigation</span>
          </>
        )}
      </Button>
    </div>
  );
}
