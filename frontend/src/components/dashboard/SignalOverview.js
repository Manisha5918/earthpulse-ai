import React from "react";
import { SIGNALS } from "@/lib/constants";

export default function SignalOverview() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {Object.entries(SIGNALS).map(([key, sig]) => (
        <div key={key} className="bg-surface border border-border-subtle rounded p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase">{sig.name}</span>
          <div className="text-xs font-mono text-slate-400 mt-2">— {sig.unit}</div>
        </div>
      ))}
    </div>
  );
}
