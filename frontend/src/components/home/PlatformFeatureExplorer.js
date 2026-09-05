"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Map,
  Compass,
  GitCompare,
  Sparkles,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import clsx from "clsx";

export function PlatformFeatureExplorer() {
  const [activeTab, setActiveTab] = useState("explore");

  const features = {
    explore: {
      id: "explore",
      title: "Geospatial Investigation Workstation",
      route: "/explore",
      badge: "CORE COMMAND CENTER",
      tagline: "Interactive 0.05° analytical grid map with 0–100 Regional Change Score display",
      description: "Inspect multi-sensor baselines, spatial deviations, and AI narrative briefings on an interactive Leaflet canvas. Click any cell across the Chennai pilot to evaluate localized signals.",
      metrics: ["16 Analytical Cells (0.05°)", "0–100 Change Score (phase6-v1)", "Grounded AI Narrative Panel"],
      image: "/images/earthpulse-hero-globe.svg",
      whatYouGet: "Visual investigation of where physical changes are located across the analytical grid."
    },
    region: {
      id: "region",
      title: "Regional Intelligence Dossier",
      route: "/region/IN-TN-CHE",
      badge: "DEEP DIVE TELEMETRY",
      tagline: "Statistical telemetry, spatial anomalies, and cross-signal concurrence",
      description: "Review temporal Z-scores, robust MAD metrics, 16-cell spatial percentile rankings, and exploratory correlations with strict non-causal disclosures.",
      metrics: ["Temporal Z-Scores", "Spatial Outlier Rankings", "Evidence Strength Matrix"],
      image: "/images/sentinel-canopy.svg",
      whatYouGet: "Mathematical transparency and multi-year baseline context behind regional observations."
    },
    compare: {
      id: "compare",
      title: "Multi-Region Comparative Benchmark",
      route: "/compare",
      badge: "CROSS-REGIONAL ANALYSIS",
      tagline: "Side-by-side multi-sensor delta comparison between regions",
      description: "Compare regional development trajectories, canopy indices, and nighttime radiance across multiple territories with strict data state isolation.",
      metrics: ["Side-by-Side Signal Matrix", "Comparative Anomaly Grid", "Location Isolation Guard"],
      image: "/images/viirs-radiance.svg",
      whatYouGet: "Analytical comparison across regional territories with explicit data state disclosures."
    },
    insights: {
      id: "insights",
      title: "AI Intelligence Briefings & Evidence",
      route: "/insights",
      badge: "EXECUTIVE SYNTHESIS",
      tagline: "Structured findings bound to deterministic SHA-256 evidence packages",
      description: "Read structured regional findings synthesized by grounded AI. Every claim (FIND-001) is strictly anchored to immutable physical observations (EVID-001).",
      metrics: ["Zero Synthetic Data", "SHA-256 Evidence Hashes", "Filterable Severity"],
      image: "/images/persona-policy.svg",
      whatYouGet: "Traceable briefings with verifiable evidence IDs and cryptographic hashes."
    },
    timeline: {
      id: "timeline",
      title: "Historical Temporal Console",
      route: "/timeline",
      badge: "MULTI-YEAR ARCHIVE",
      tagline: "Inspect 2021–2024 temporal alignment matrices and multi-satellite cadences",
      description: "Explore 4 years of sensor observations, temporal alignment flags (SAME_DAY, SAME_MONTH), and static vector snapshots across time.",
      metrics: ["1,461 Daily Weather Observations", "Multi-Sensor Alignment", "Cadence Coverage"],
      image: "/images/nasa-meteorology.svg",
      whatYouGet: "Longitudinal clarity on multi-sensor temporal alignment and observation cadences."
    }
  };

  const current = features[activeTab];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-emerald-700 tracking-wider">
            Six-Layer Analytical Investigation Framework
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight mt-1">
            What each section of EarthPulse AI explains
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-sans max-w-sm">
          A dedicated suite of tools tailored for spatial exploration, statistical audits, and evidence-grounded reporting.
        </p>
      </div>

      {/* Feature Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "explore", label: "1. Workstation", icon: Map },
          { id: "region", label: "2. Regional Dossier", icon: Compass },
          { id: "compare", label: "3. Multi-Region Compare", icon: GitCompare },
          { id: "insights", label: "4. AI Intelligence Feed", icon: Sparkles },
          { id: "timeline", label: "5. Temporal Timeline", icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all select-none flex items-center gap-2 border",
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
              )}
            >
              <Icon className={clsx("w-3.5 h-3.5", isSelected ? "text-white" : "text-slate-500")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Feature Showcase Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 bg-slate-50/70 border border-slate-200/80 rounded-xl">
        <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-48 sm:h-60 object-cover"
          />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5 border-b border-slate-200 pb-3">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-emerald-800">
              {current.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900">
              {current.title}
            </h3>
            <p className="text-xs font-medium text-emerald-700 font-sans">
              {current.tagline}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {current.description}
          </p>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-sans flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span><strong>Analytical utility:</strong> {current.whatYouGet}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {current.metrics.map((m, idx) => (
                <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {m}
                </span>
              ))}
            </div>

            <Link href={current.route}>
              <button className="text-xs font-mono font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors">
                <span>Launch {current.title.split(" ")[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
