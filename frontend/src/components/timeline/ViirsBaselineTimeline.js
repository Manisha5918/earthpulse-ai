"use client";

/**
 * EarthPulse AI — VIIRS April Annual Baseline Sequence (Modern Scientific Editorial)
 * Preserves strict ANNUAL BASELINE semantics; zero continuous monthly claims.
 */

import React from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Sparkles } from "lucide-react";

export function ViirsBaselineTimeline({ viirsComposites = [] }) {
  // Backend composites only: an empty series renders an honest empty
  // state, never frozen fallback baselines.
  const series = Array.isArray(viirsComposites) ? viirsComposites : [];
  const num = (v, digits = 2) =>
    v !== undefined && v !== null && !Number.isNaN(Number(v)) ? Number(v).toFixed(digits) : "N/A";

  // First-to-last trend, computed from backend composites only.
  const numericMeans = series
    .map((v) => ({ period: v.period, mean: Number(v.mean_radiance) }))
    .filter((p) => p.period && !Number.isNaN(p.mean));
  const trend = numericMeans.length >= 2
    ? (() => {
        const first = numericMeans[0];
        const last = numericMeans[numericMeans.length - 1];
        const dir = last.mean > first.mean ? "rose" : last.mean < first.mean ? "fell" : "held steady";
        const mono = numericMeans.every((p, i, a) => i === 0 || (last.mean >= first.mean ? p.mean >= a[i - 1].mean : p.mean <= a[i - 1].mean));
        return `Mean radiance ${dir} from ${first.mean.toFixed(2)} to ${last.mean.toFixed(2)} nW between ${first.period} and ${last.period}${mono && dir !== "held steady" ? " (steady trend)" : ""}.`;
      })()
    : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Nighttime lights</span>
          </div>
          <div className="text-xs text-slate-500 font-sans">
            {series.length > 0
              ? `April baseline each year · ${series.length} annual composites`
              : "No composites available for this selection"}
          </div>
        </div>
        <ProvenanceBadge type="CALCULATED" size="xs" />
      </div>

      {series.length === 0 ? (
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          No VIIRS composites were returned for this selection. Other sensors below are unaffected.
        </p>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {series.map((v, idx) => {
          const isLatest = idx === series.length - 1;
          return (
          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 gap-2">
              <span className="font-sans font-semibold text-slate-900 text-sm tracking-tight font-mono">{v.period || "N/A"}</span>
              <span className="flex items-center gap-1.5">
                {isLatest && (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Latest
                  </span>
                )}
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Baseline {String(idx + 1).padStart(2, "0")}
                </span>
              </span>
            </div>

            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">Mean Radiance</span>
                <span className="text-amber-800 font-bold font-mono text-xs">{num(v.mean_radiance)} nW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">Median Radiance</span>
                <span className="text-slate-800 font-semibold font-mono text-xs">{num(v.median_radiance)} nW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-sans">Peak Radiance</span>
                <span className="text-slate-600 font-mono text-xs">{num(v.max_radiance, 1)} nW</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 font-mono flex items-center justify-between">
              <span>Std Dev:</span>
              <span className="font-semibold text-slate-700">{num(v.std_radiance, 3)} nW/(cm²·sr)</span>
            </div>
          </div>
          );
        })}
      </div>
      )}
      {trend && (
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
          <strong className="text-slate-900 font-semibold">Trend: </strong>{trend}
        </div>
      )}
    </div>
  );
}
