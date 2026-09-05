"use client";

/**
 * EarthPulse AI — Async Background Job Polling Modal (Light Theme)
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

export function AsyncProgressModal({
  jobId,
  jobStatus,
  progress = 0,
  currentStep = "Processing telemetry...",
  onCancel,
  onComplete
}) {
  if (!jobId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-700 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Async Analysis Job Active
          </h3>
          <p className="text-xs font-mono text-sky-800 font-semibold">Job ID: {jobId}</p>
        </div>

        <div className="space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-700">
            <span>Status:</span>
            <span className="font-bold text-amber-800">{jobStatus || "PROCESSING"}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Current Step:</span>
            <span className="text-slate-600 truncate max-w-[200px] font-sans">{currentStep}</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
            <div
              className="h-full bg-sky-700 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            />
          </div>
        </div>

        <div className="text-[12px] text-slate-500 font-sans">
          Polling real backend job status every 1.5 seconds. Zero simulated progress.
        </div>

        {onCancel && (
          <Button variant="secondary" size="md" onClick={onCancel} className="w-full">
            Cancel Polling
          </Button>
        )}
      </div>
    </div>
  );
}
