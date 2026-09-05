"use client";

/**
 * EarthPulse AI — Grounded Narrative Intelligence Briefing Panel (Modern Scientific Editorial)
 * Renders verified GroundedNarrative from POST /api/v1/intelligence
 * with numbered key findings and interactive evidence citations.
 */

import React, { useState } from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Sparkles, ShieldAlert, Hash, X } from "lucide-react";
import clsx from "clsx";

export function GroundedNarrativePanel({ narrative }) {
  const [activeCitationId, setActiveCitationId] = useState(null);

  if (!narrative) {
    return (
      <div className="p-5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-500 font-mono shadow-sm">
        Narrative briefing unavailable. Execute analysis to generate grounded intelligence.
      </div>
    );
  }

  const citations = narrative.evidence_citations || {};
  const activeCitation = activeCitationId ? citations[activeCitationId] : null;

  return (
    <div className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <span className="text-sm font-sans font-semibold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Summary of the evidence</span>
          </span>
          <div className="text-[11px] text-slate-500 font-sans">
            From: <strong className="text-slate-800 font-mono">{narrative.generator_type}</strong>
          </div>
        </div>
        <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
      </div>

      {/* Headline & Executive Summary */}
      <div className="space-y-2 p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
        <h4 className="text-lg sm:text-xl font-display font-bold text-slate-900 leading-snug">
          {narrative.headline}
        </h4>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-normal">
          {narrative.executive_summary}
        </p>
      </div>

      {/* Key Findings List */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
          Verified Evidence Findings (Traceable Citations)
        </span>

        <div className="space-y-3">
          {(narrative.key_findings || []).map((finding) => (
            <div
              key={finding.finding_id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {finding.finding_id}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  CONFIDENCE: {finding.confidence}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {finding.statement}
              </p>

              {/* Evidence IDs Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <span className="font-semibold text-slate-700">CITATIONS:</span>
                {(finding.evidence_ids || []).map((eid) => (
                  <button
                    key={eid}
                    type="button"
                    onClick={() => setActiveCitationId(activeCitationId === eid ? null : eid)}
                    className={clsx(
                      "px-2.5 py-0.5 rounded-md border transition-all font-mono font-medium select-none text-[11px]",
                      activeCitationId === eid
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-white"
                    )}
                  >
                    {eid}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citation Inspector Modal */}
      {activeCitation && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 text-xs font-mono shadow-sm">
          <div className="flex items-center justify-between text-emerald-950 font-bold border-b border-emerald-200/60 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>EVIDENCE TRACE: {activeCitation.evidence_id}</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveCitationId(null)}
              aria-label="Close evidence trace"
              className="text-emerald-800 hover:bg-emerald-200 p-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scientific Imagery Thumbnail for Satellite Signals */}
          {(activeCitation.source_dataset === "SENTINEL_2" || activeCitation.source_dataset?.toLowerCase().includes("sentinel") || activeCitation.evidence_id?.includes("NDVI") || activeCitation.evidence_id?.includes("NDBI")) && (
            <div className="flex items-center gap-3 p-2 bg-white/90 rounded-lg border border-emerald-200/80">
              <img
                src="/images/india-vegetation-ndvi.jpg"
                alt="Sentinel-2 Multispectral Surface Reflectance"
                className="w-16 h-12 rounded object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="text-[11px] font-sans text-slate-700 leading-tight">
                <span className="font-mono font-bold text-emerald-800 text-[10px] block">ESA SENTINEL-2 MSI (10m)</span>
                Multispectral surface reflectance observation scene used in baseline deviation calculation.
              </div>
            </div>
          )}

          {(activeCitation.source_dataset === "VIIRS" || activeCitation.source_dataset?.toLowerCase().includes("viirs") || activeCitation.evidence_id?.includes("VIIRS") || activeCitation.evidence_id?.includes("DNB")) && (
            <div className="flex items-center gap-3 p-2 bg-white/90 rounded-lg border border-amber-200/80">
              <img
                src="/images/india-nightlights-viirs.png"
                alt="VIIRS Nocturnal Light Radiance"
                className="w-16 h-12 rounded object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="text-[11px] font-sans text-slate-700 leading-tight">
                <span className="font-mono font-bold text-amber-800 text-[10px] block">NOAA VIIRS DNB (750m)</span>
                Calibrated nocturnal radiance composite used in annual baseline comparison.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
            <div>Sensor / Dataset: <strong className="font-semibold text-slate-900">{activeCitation.source_dataset}</strong></div>
            <div>Period: <strong className="font-semibold text-slate-900">{activeCitation.observation_period}</strong></div>
            <div>Canonical Value: <strong className="font-semibold text-slate-900">{activeCitation.canonical_value} {activeCitation.unit}</strong></div>
            <div>Semantics: <strong className="font-semibold text-slate-900">{activeCitation.temporal_semantics}</strong></div>
          </div>
          {activeCitation.calculation && (
            <div className="text-[11px] text-slate-800 border-t border-emerald-200/60 pt-1.5 font-mono">
              Formula: <span className="font-semibold text-slate-900">{activeCitation.calculation}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-emerald-200/60">
            <span>Provenance: <strong className="text-slate-900">{activeCitation.provenance_type || "CALCULATED"}</strong></span>
            <span>Confidence: <strong className="text-slate-900">{activeCitation.confidence || "LIMITED"}</strong></span>
          </div>
        </div>
      )}

      {/* Uncertainty & Limitations */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Observational Constraints & Limitations</span>
        </span>
        <p className="text-xs text-slate-700 leading-relaxed font-sans">
          {narrative.uncertainty_and_limitations}
        </p>
      </div>

      {/* Verification Hash */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          <span>Package: {narrative.evidence_package_hash ? narrative.evidence_package_hash.substring(0, 16) : "N/A"}...</span>
        </span>
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          GROUNDING VALIDATED
        </span>
      </div>
    </div>
  );
}
