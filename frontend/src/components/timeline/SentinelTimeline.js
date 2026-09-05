"use client";

/**
 * EarthPulse AI — Sentinel-2 Multi-Temporal Scene History (Modern Scientific Editorial)
 * Displays the 4 actual verified scenes (2021-05-30, 2022-04-05, 2023-05-20, 2024-04-29).
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Eye } from "lucide-react";

export function SentinelTimeline({ scenes = [] }) {
  // Backend observations only: an empty series renders an honest empty
  // state, never frozen fallback scenes.
  const series = Array.isArray(scenes) ? scenes : [];
  const num = (v, digits = 4) =>
    v !== undefined && v !== null && !Number.isNaN(Number(v)) ? Number(v).toFixed(digits) : "N/A";

  // Greenest scene by mean NDVI, computed from backend values only.
  const greenestIdx = series.reduce((best, s, i) => {
    const v = Number(s.mean_ndvi);
    if (Number.isNaN(v)) return best;
    if (best < 0) return i;
    return v > Number(series[best].mean_ndvi) ? i : best;
  }, -1);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Sentinel-2 scenes</span>
          </div>
          <div className="text-xs text-slate-500 font-sans">
            {series.length > 0
              ? `${series.length} cloud-free scenes · multi-temporal observations`
              : "No scenes available for this selection"}
          </div>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      {series.length === 0 ? (
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          No Sentinel-2 scenes were returned for this selection. Other sensors below are unaffected.
        </p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {series.map((scene, idx) => {
          const isLatest = idx === series.length - 1;
          return (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 gap-2">
              <span className="font-sans font-semibold text-slate-900 text-sm tracking-tight font-mono">{scene.observation_date || "N/A"}</span>
              <span className="flex items-center gap-1.5">
                {idx === greenestIdx && (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Greenest scene
                  </span>
                )}
                {isLatest && (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Latest
                  </span>
                )}
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  Scene {String(idx + 1).padStart(2, "0")}
                </span>
              </span>
            </div>

            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">NDVI (Canopy)</span>
                <span className="text-emerald-800 font-bold font-mono text-xs">{num(scene.mean_ndvi)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">NDBI (Built-Up)</span>
                <span className="text-sky-800 font-bold font-mono text-xs">{num(scene.mean_ndbi)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">NDWI (Water)</span>
                <span className="text-slate-900 font-bold font-mono text-xs">{num(scene.mean_ndwi)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 font-mono">
              <span>Cloud: <strong className="text-slate-700">{num(scene.cloud_cover_percent, 2)}%</strong></span>
              <span className="text-slate-300">|</span>
              <span>Valid: <strong className="text-slate-700">{num(scene.valid_pixel_percentage, 2)}%</strong></span>
            </div>
          </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
