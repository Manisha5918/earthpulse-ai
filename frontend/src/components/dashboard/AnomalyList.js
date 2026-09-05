import React from "react";
import { AlertCircle } from "lucide-react";

export default function AnomalyList({ anomalies = [] }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-lg p-4 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-elevated text-slate-500 mb-2">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="text-xs font-semibold text-slate-300">Zero Active Anomalies</div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          No statistical deviations (|Z| &gt;= 2.0) recorded for current selection.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {anomalies.map((a, i) => (
        <div key={i} className="bg-surface border border-border-subtle rounded p-3 text-xs flex justify-between">
          <span>{a.signal_name}</span>
          <span className="font-mono text-rose-400">Z={a.z_score}</span>
        </div>
      ))}
    </div>
  );
}
