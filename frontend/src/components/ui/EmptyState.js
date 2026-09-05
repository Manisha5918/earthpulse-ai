import React from "react";
import { Database, ArrowRight } from "lucide-react";

export default function EmptyState({
  title = "No Ingested Observations",
  message = "Observational tables are currently empty to guarantee zero fabricated data. Ingest real NASA POWER, Sentinel-2, or VIIRS feeds to view metrics.",
  actionLabel,
  onAction
}) {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50/80 rounded-xl p-8 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 mb-4 border border-slate-200 shadow-sm">
        <Database className="w-6 h-6 text-sky-700" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-md">{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-sky-700 hover:text-sky-800 transition-colors"
        >
          {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
