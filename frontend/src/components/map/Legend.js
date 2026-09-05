import React from "react";

export default function Legend({ activeSignal = "NDVI" }) {
  return (
    <div className="bg-surface/90 backdrop-blur border border-border-subtle rounded p-2 text-[10px] font-mono text-slate-400 flex items-center gap-3">
      <span>Low</span>
      <div className="w-20 h-2 rounded bg-gradient-to-r from-slate-800 via-cyan-800 to-emerald-400" />
      <span>High</span>
    </div>
  );
}
