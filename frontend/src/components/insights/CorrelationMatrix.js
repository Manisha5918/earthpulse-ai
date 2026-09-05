import React from "react";

export default function CorrelationMatrix({ correlations = [] }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-4">
      <div className="text-xs font-mono uppercase text-slate-400 mb-2">Cross-Signal Correlation Matrix</div>
      <div className="text-xs text-slate-500 font-mono italic">
        Pairwise Pearson coefficients computed once multi-signal observations are loaded.
      </div>
    </div>
  );
}
