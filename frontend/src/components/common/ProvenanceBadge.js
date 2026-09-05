/**
 * EarthPulse AI — Provenance Tier Badge (Modern Scientific Editorial)
 * Communicates the exact evidentiary status of every metric/finding:
 * - OBSERVED: Directly recorded physical measurement (NASA POWER, S2, VIIRS)
 * - CALCULATED: Mathematically derived index, baseline, Z-score, MAD, change score
 * - AI_INTERPRETED: Synthesized narrative briefing grounded strictly in evidence
 */

import React from "react";
import clsx from "clsx";
import { Eye, Calculator, Sparkles, AlertCircle } from "lucide-react";

export function ProvenanceBadge({ type = "CALCULATED", size = "sm", className = "" }) {
  const normType = (type || "").toUpperCase();

  const configs = {
    OBSERVED: {
      label: "OBSERVED",
      description: "Direct physical observation from verified archive",
      icon: Eye,
      styles: "bg-sky-50 text-sky-700 border-sky-200"
    },
    CALCULATED: {
      label: "CALCULATED",
      description: "Mathematically derived baseline, deviation, or composite score",
      icon: Calculator,
      styles: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    AI_INTERPRETED: {
      label: "AI_INTERPRETED",
      description: "Evidence-grounded narrative briefing and structured findings",
      icon: Sparkles,
      styles: "bg-slate-100 text-slate-700 border-slate-300"
    },
    SYNTHETIC_DEMO: {
      label: "SYNTHETIC_DEMO",
      description: "Non-production demonstration fixture",
      icon: AlertCircle,
      styles: "bg-rose-50 text-rose-700 border-rose-200"
    }
  };

  const config = configs[normType] || configs.CALCULATED;
  const IconComponent = config.icon;

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    sm: "text-[11px] px-2.5 py-0.5 gap-1.5 font-semibold",
    md: "text-xs px-3 py-1 gap-2 font-semibold"
  };

  return (
    <span
      title={`${config.label}: ${config.description}`}
      className={clsx(
        "inline-flex items-center font-mono rounded-md border tracking-wider select-none shadow-xs",
        config.styles,
        sizeStyles[size] || sizeStyles.sm,
        className
      )}
    >
      <IconComponent className="w-3 h-3 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
