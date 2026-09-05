"use client";

/**
 * EarthPulse AI — Intelligence used (compact MoE summary).
 * Lists which specialized analytical modules examined the evidence and how
 * strongly each one applies. Plain language only; no router internals.
 * Renders nothing when the investigation produced no MoE report
 * (e.g. unverified locations).
 */

import React from "react";
import clsx from "clsx";

function statusLabel(output) {
  if (output.relevance === "HIGH") return { text: "Strong evidence coverage", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  if (output.relevance === "MODERATE") return { text: "Moderate evidence coverage", cls: "bg-slate-100 text-slate-700 border-slate-200" };
  if (output.relevance === "LOW") return { text: "Limited evidence coverage", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  if (output.status === "NO_RELEVANT_SIGNAL") return { text: "Not relevant", cls: "bg-slate-50 text-slate-500 border-slate-200" };
  return { text: "Not enough evidence", cls: "bg-slate-50 text-slate-500 border-slate-200" };
}

export function IntelligenceUsedPanel({ moe }) {
  if (!moe || !Array.isArray(moe.expert_outputs) || moe.expert_outputs.length === 0) {
    return null;
  }

  return (
    <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <h3 className="text-sm font-sans font-semibold text-slate-900">
            Intelligence used
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            EarthPulse activates specialized analytical modules based on the available evidence.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex-shrink-0">
          {moe.moe_version || "moe-v1"}
        </span>
      </div>

      <ul className="space-y-2.5">
        {moe.expert_outputs.map((output) => {
          const label = statusLabel(output);
          const isActive = output.relevance === "HIGH" || output.relevance === "MODERATE" || output.relevance === "LOW";
          return (
            <li key={output.expert} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={clsx(
                  "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                  isActive ? "bg-emerald-500" : "bg-slate-300"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-slate-900">
                    {output.display_name || output.expert}
                  </span>
                  <span className={clsx("text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border", label.cls)}>
                    {label.text}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-sans leading-relaxed mt-0.5">
                  {output.plain_summary}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {moe.observed_signal_strength && (
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 pb-1">
            Observed signal strength
          </p>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            {moe.observed_signal_strength.statement}
          </p>
        </div>
      )}
    </div>
  );
}
