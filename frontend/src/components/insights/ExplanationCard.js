import React from "react";
import { Sparkles } from "lucide-react";
import ProvenanceTag from "@/components/ui/ProvenanceTag";

export default function ExplanationCard({ title, summary, evidence = [], confidence = 0.95 }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-mono">
          <Sparkles className="w-4 h-4" />
          <span>AI REASONING BRIEF</span>
        </div>
        <ProvenanceTag type="AI_INTERPRETED" />
      </div>

      <h3 className="text-sm font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">{summary}</p>

      {evidence.length > 0 && (
        <div className="border-t border-border-subtle pt-3">
          <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">Cited Physical Evidence:</div>
          <div className="flex flex-wrap gap-2">
            {evidence.map((e, idx) => (
              <span key={idx} className="bg-surface-elevated border border-border-subtle rounded px-2 py-1 text-[10px] font-mono text-cyan-300">
                {e.signal}: {e.observed} (Z={e.z_score})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
