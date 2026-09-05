"use client";

/**
 * EarthPulse AI — Normalized Finding Feed Card (Modern Scientific Editorial)
 */

import React, { useState } from "react";
import Link from "next/link";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { MapPin, ChevronDown, ChevronUp, ArrowUpRight, Sparkles, AlertCircle, TrendingUp, GitMerge } from "lucide-react";
import { Button } from "../ui/Button";
import clsx from "clsx";

export function InsightFindingCard({ finding, citations = {} }) {
  const [expanded, setExpanded] = useState(false);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "GROUNDED_FINDING":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case "TEMPORAL_ANOMALY":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "SPATIAL_DEVIATION":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "EXPLORATORY_CORRELATION":
        return <GitMerge className="w-4 h-4 text-sky-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch ((sev || "").toUpperCase()) {
      case "CRITICAL":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "HIGH":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "MEDIUM":
        return "text-sky-700 bg-sky-50 border-sky-200";
      default:
        return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs hover:border-slate-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {getCategoryIcon(finding.category)}
          <span className="font-display font-bold text-slate-900 uppercase tracking-wider text-xs">
            {finding.category.replace(/_/g, " ")}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{finding.region_name} ({finding.region_code})</span>
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {finding.severity && (
            <span className={clsx("text-[10px] px-2.5 py-0.5 rounded-full font-semibold border", getSeverityBadge(finding.severity))}>
              {finding.severity}
            </span>
          )}
          <ProvenanceBadge type={finding.provenance || "CALCULATED"} size="xs" />
        </div>
      </div>

      {/* Main Finding Statement */}
      <p className="text-sm text-slate-900 font-sans leading-relaxed font-medium">
        {finding.title}
      </p>

      {/* Context Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs font-mono">
        {finding.z_score !== undefined && (
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Z-SCORE</span>
            <span className="text-slate-900 font-bold">{finding.z_score !== null ? `z = ${finding.z_score.toFixed(3)}` : "N/A"}</span>
          </div>
        )}
        {finding.correlation !== undefined && (
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">CORRELATION</span>
            <span className="text-slate-900 font-bold">r = {finding.correlation?.toFixed(3)}</span>
          </div>
        )}
        {finding.temporal_semantics && (
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">TEMPORAL SEMANTICS</span>
            <span className="text-slate-700 font-medium">{finding.temporal_semantics}</span>
          </div>
        )}
        {finding.confidence && (
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">CONFIDENCE</span>
            <span className="text-slate-700 font-medium">{finding.confidence}</span>
          </div>
        )}
        {finding.causal_claim !== undefined && (
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">CAUSAL CLAIM</span>
            <span className="text-emerald-800 font-bold">FALSE (Non-Causal)</span>
          </div>
        )}
      </div>

      {/* Action Footer & Expandable Evidence Drawer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition-colors uppercase tracking-wider text-[11px]"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          <span>{expanded ? "Hide Evidence Details" : "Inspect Grounding Evidence"}</span>
        </button>

        <div className="flex items-center gap-2">
          <Link href={`/region/${finding.region_code}`}>
            <Button size="xs" variant="secondary" className="gap-1 font-sans text-xs">
              <span>Dossier</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="xs" variant="outline" className="gap-1 font-sans text-xs">
              <span>Map</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Evidence Drawer */}
      {expanded && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-200 pb-2">
            Evidence Citations & Observation Provenance
          </span>
          {finding.evidence_ids && finding.evidence_ids.length > 0 ? (
            finding.evidence_ids.map((eid) => {
              const cit = citations[eid];
              return (
                <div key={eid} className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-slate-900 font-semibold">
                    <span>CITATION: {eid}</span>
                    <span className="text-slate-500 font-normal">{cit?.source_dataset || "Physical Dataset"}</span>
                  </div>
                  {cit && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>Period: <strong>{cit.observation_period}</strong></div>
                      <div>Canonical Value: <strong className="text-emerald-800 font-semibold">{cit.canonical_value} {cit.unit}</strong></div>
                    </div>
                  )}
                  {cit?.calculation && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1">
                      Calculation: {cit.calculation}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-slate-600 text-xs font-sans">
              Derived directly from backend statistical anomaly distribution across the 16-cell analytical grid.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
