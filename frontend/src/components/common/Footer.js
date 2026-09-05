/**
 * EarthPulse AI — Global Footer (Modern Scientific Editorial System)
 * Clean white substrate, subtle slate borders, and cryptographic provenance tags.
 */

import React from "react";
import Link from "next/link";
import { ProvenanceBadge } from "./ProvenanceBadge";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="font-display font-bold text-slate-900 text-sm tracking-tight flex items-center justify-center md:justify-start gap-2">
              <span>EarthPulse AI</span>
              <span className="text-slate-300">•</span>
              <span className="font-sans text-xs font-medium text-slate-600">Regional Change Intelligence</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Pilot Extent: Chennai Metropolitan Area (IN-TN-CHE) • 0.05° Analytical Grid (16 Cells)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProvenanceBadge type="OBSERVED" size="xs" />
            <ProvenanceBadge type="CALCULATED" size="xs" />
            <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
          </div>

          <div className="text-xs font-mono text-slate-500 text-center md:text-right space-y-0.5">
            <div>Zero Synthetic Production Data • Non-Causal Analytics</div>
            <div className="text-slate-400 text-[11px]">Deterministic Cryptographic Grounding Stamped</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
