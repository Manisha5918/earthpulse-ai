"use client";

/**
 * EarthPulse AI — Pilot Extent Coverage Disclosure Box (Modern Scientific Editorial)
 */

import React from "react";
import { ShieldAlert } from "lucide-react";

export function InsightCoverage() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs space-y-2 text-xs font-mono text-slate-900">
      <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
        <span>Current Ingestion Scope: Processed Pilot Region Only</span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed font-sans">
        This intelligence feed surfaces findings only from verified ingested regions (Chennai <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-slate-900 font-mono text-xs">IN-TN-CHE</code>). Additional locations require executing dedicated ingestion pipelines and will display <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-mono text-xs">PROCESSING_REQUIRED</code> rather than generating synthetic findings.
      </p>
    </div>
  );
}
