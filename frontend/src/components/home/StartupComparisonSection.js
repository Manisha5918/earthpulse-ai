"use client";

import React, { useState } from "react";
import {
  XCircle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";
import clsx from "clsx";

export function StartupComparisonSection() {
  const [openFaq, setOpenFaq] = useState(0);

  const comparisons = [
    {
      feature: "Data Ingestion & Accessibility",
      traditional: "Siloed GeoTIFF rasters requiring specialized GIS software, manual workflows, and independent data prep.",
      earthpulse: "Unified presentation layer harmonizing 4 data sources into structured analytical summaries."
    },
    {
      feature: "Cross-Sensor Intelligence",
      traditional: "Disparate archives evaluated without explicit temporal compatibility checks or multi-sensor concurrence verification.",
      earthpulse: "Automated temporal compatibility checks (SAME_DAY, SAME_MONTH) evaluating physical concurrence with non-causal disclosures."
    },
    {
      feature: "AI Grounding & Provenance",
      traditional: "Unconstrained generative text prone to hallucinating trends and making unsupported causal claims.",
      earthpulse: "Deterministic grounding with SHA-256 evidence package hashing where every claim is bound to physical observations."
    },
    {
      feature: "Decision Support Index",
      traditional: "Isolated raw spectral indices and complex band histograms without a standardized multi-dimensional metric.",
      earthpulse: "Transparent 0–100 Regional Change Score (phase6-v1) with expert-configured weights across 5 analytical dimensions."
    }
  ];

  const faqs = [
    {
      question: "What is EarthPulse AI in scientific terms?",
      answer: "EarthPulse AI is an evidence-grounded regional change intelligence platform. It synthesizes Sentinel-2 multi-temporal scenes, NOAA VIIRS annual April baselines, NASA POWER daily meteorological observations, and OpenStreetMap snapshot context across an analytical 0.05° grid to detect statistical anomalies and cross-signal concurrence."
    },
    {
      question: "How does EarthPulse AI prevent AI hallucinations?",
      answer: "Every finding generated in executive briefings (FIND-001) is strictly bound to a numbered evidence token (EVID-001) with deterministic SHA-256 evidence package hashing. If a statement contains unsupported numbers or unverified trends, the grounding validator rejects it. Zero synthetic production data is introduced."
    },
    {
      question: "How is the 0–100 Regional Change Score calculated?",
      answer: "The Change Score is computed using an expert-configured weighting model (version: phase6-v1) across 5 transparent dimensions: Temporal Anomaly (25%), Spatial Anomaly (25%), Cross-Signal Agreement (20%), Data Completeness (15%), and Temporal Compatibility (15%). It is an analytical comparison signal, not an authoritative economic or predictive metric."
    },
    {
      question: "Why does EarthPulse enforce a strict non-causal disclosure policy?",
      answer: "Spaceborne and atmospheric observations detect co-occurring physical phenomena (such as rising nighttime radiance alongside canopy reduction). While they exhibit spatial and temporal concurrence, asserting causation without localized ground truth studies is scientifically invalid. EarthPulse transparently discloses all correlations as non-causal (CAUSAL_CLAIM: FALSE)."
    }
  ];

  return (
    <div className="space-y-12">
      {/* 1. Comparison Matrix */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-emerald-700 tracking-wider">
              Analytical Architecture Comparison
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight mt-1">
              Traditional Earth Observation vs EarthPulse AI Framework
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Six-Layer Investigation Framework
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-700">
                <th className="py-3 px-4 w-1/4">Capability</th>
                <th className="py-3 px-4 w-3/8 text-slate-500 bg-slate-50 rounded-tl-lg">Traditional Earth Observation</th>
                <th className="py-3 px-4 w-3/8 text-emerald-900 bg-emerald-50/80 rounded-tr-lg font-bold">EarthPulse AI Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisons.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-display font-bold text-slate-900 text-xs">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-slate-600 bg-slate-50/50 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{row.traditional}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-900 bg-emerald-50/30 font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{row.earthpulse}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Interactive FAQ Accordion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-mono font-semibold uppercase text-emerald-700 tracking-wider">
            Methodology & Verification FAQ
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-xl overflow-hidden transition-all bg-slate-50/60"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 select-none hover:bg-white transition-colors"
                >
                  <span className="font-display font-bold text-sm text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown className={clsx("w-4 h-4 text-slate-500 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
