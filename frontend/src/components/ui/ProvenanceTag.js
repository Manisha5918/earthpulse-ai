import React from "react";
import { PROVENANCE_TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ProvenanceTag({ type = "OBSERVED", className }) {
  const tier = PROVENANCE_TIERS[type] || PROVENANCE_TIERS.OBSERVED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
        tier.badgeClass,
        className
      )}
      title={tier.description}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {tier.label}
    </span>
  );
}
