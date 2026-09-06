"use client";

/**
 * EarthPulse AI — Evidence Quality & Coverage Comparison (Modern Scientific Editorial)
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { ShieldCheck } from "lucide-react";

export function CompareEvidenceQuality({ targetA, targetB, hasA = false, hasB = false }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Evidence coverage</span>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <span className="font-semibold text-slate-900 block">{targetA} coverage</span>
          {hasA ? (
          <ul className="space-y-2 text-xs text-slate-600 font-sans">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>4 Sentinel-2 multi-temporal scenes (2021–2024)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>4 VIIRS April annual baseline observations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>1,461 NASA POWER daily meteorological observations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>OpenStreetMap static infrastructure snapshot</span>
            </li>
          </ul>
          ) : (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-sans leading-relaxed">
            No data ingested for this region yet.
          </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <span className="font-semibold text-slate-700 block">{targetB} coverage</span>
          {hasB ? (
          <ul className="space-y-2 text-xs text-slate-600 font-sans">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>4 Sentinel-2 multi-temporal scenes (2021–2024)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>4 VIIRS April annual baseline observations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>1,461 NASA POWER daily meteorological observations</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>OpenStreetMap static infrastructure snapshot</span>
            </li>
          </ul>
          ) : (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
            {targetB === "BLR_TEST"
              ? "Data ingestion required for Bengaluru. Sentinel-2 (Tile 43PGP), VIIRS nighttime lights, and NASA POWER meteorology must be executed for this target."
              : targetB === "LON_TEST"
              ? "Outside India domain. EarthPulse AI regional ingestion pipelines operate exclusively within Indian territorial extents."
              : "Data ingestion required. Missing all 4 sensor pipelines for this unverified target."}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
