import React from "react";
import ProvenanceTag from "@/components/ui/ProvenanceTag";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  unit,
  baselineDiff,
  provenanceType = "CALCULATED",
  icon: Icon,
  accentColor = "emerald"
}) {
  const isAvailable = value !== null && value !== undefined;
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-4 flex flex-col justify-between hover:border-border-accent transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="text-xs font-medium text-slate-400">{title}</span>
        </div>
        <ProvenanceTag type={provenanceType} />
      </div>

      <div className="my-2">
        {isAvailable ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-semibold text-slate-100">{value}</span>
            {unit && <span className="text-xs font-mono text-slate-500">{unit}</span>}
          </div>
        ) : (
          <div className="text-sm font-mono text-slate-500 italic">Awaiting Ingestion</div>
        )}
      </div>

      {baselineDiff && (
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 border-t border-border-subtle/50 pt-2 mt-1">
          <span>vs 3-yr norm:</span>
          <span className={cn(baselineDiff.startsWith("+") ? "text-emerald-400" : "text-rose-400")}>
            {baselineDiff}
          </span>
        </div>
      )}
    </div>
  );
}
