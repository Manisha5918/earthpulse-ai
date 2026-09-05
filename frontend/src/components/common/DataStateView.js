/**
 * EarthPulse AI — Truthful Data State Indicator (Modern Scientific Editorial)
 * Handles explicit domain states:
 * - PROCESSING_REQUIRED (e.g. for Bengaluru: explains real pipeline ingestion is needed)
 * - DATA_UNAVAILABLE (e.g. for London: outside Indian domain)
 * - PARTIAL_DATA (some sensors active, others outside range)
 * - INSUFFICIENT_OBSERVATIONS (when N < minimum samples)
 * - LOADING / ASYNC_POLLING
 * - ERROR
 */

import React from "react";
import { Clock, Globe, RefreshCw, XCircle, Info } from "lucide-react";
import { Button } from "../ui/Button";

export function DataStateView({
  status = "DATA_UNAVAILABLE",
  locationName = "Requested Location",
  customMessage = null,
  onRetry = null,
  currentStep = null,
  progress = null
}) {
  const norm = (status || "").toUpperCase();

  if (norm === "PROCESSING_REQUIRED") {
    return (
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm text-left max-w-2xl mx-auto my-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[11px] text-slate-500 font-medium">
          <span>Data state: processing required</span>
          <span>Ingestion status: pending</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 tracking-tight">
              Processing required for {locationName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              This location is within India, but multi-sensor satellite and meteorological ingestion pipelines
              have not yet been executed for this extent.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans text-slate-800">
              Zero synthetic data policy enforced. Pre-computed verified pilot extent is currently Chennai (IN-TN-CHE).
            </div>
            {onRetry && (
              <Button size="sm" variant="secondary" onClick={onRetry} className="mt-2 font-sans text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry ingestion
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (norm === "DATA_UNAVAILABLE") {
    return (
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 shadow-sm text-left max-w-2xl mx-auto my-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-[11px] text-slate-500 font-medium">
          <span>Data state: unavailable</span>
          <span>Outside supported bounds</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 tracking-tight">
              Location outside analytical domain
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              EarthPulse AI is focused exclusively on Indian regional change intelligence.
              The requested coordinates ({locationName}) lie outside supported spatial boundaries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (norm === "INSUFFICIENT_OBSERVATIONS") {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs flex items-start gap-3 my-4">
        <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 font-sans">
          <span className="font-semibold text-slate-900">Not enough observations:</span>{" "}
          {customMessage || "Fewer than the minimum required observations (N < 3) are available to compute a statistically reliable historical anomaly or change score."}
        </div>
      </div>
    );
  }

  if (norm === "LOADING" || norm === "PROCESSING" || norm === "RETRIEVING_DATA") {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-6 text-xs">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-900">
            {currentStep || "Loading real data…"}
          </h4>
          <p className="text-[11px] text-slate-500 font-sans">
            {progress !== null ? `Progress: ${(progress * 100).toFixed(0)}%` : "Querying multi-sensor baselines"}
          </p>
        </div>
      </div>
    );
  }

  if (norm === "ERROR" || norm === "FAILED") {
    return (
      <div className="p-6 rounded-xl bg-white border border-rose-200 shadow-sm text-left max-w-2xl mx-auto my-6 space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-950">Analysis error</h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">{customMessage || "An unexpected error occurred while communicating with the backend."}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
