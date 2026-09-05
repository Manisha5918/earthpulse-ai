"use client";

/**
 * EarthPulse AI — About: Scientific Methodology & Investigation Framework
 * Editorial Scientific Typography System:
 * - Playfair Display: Editorial Headings & Major Finding Quotes
 * - Manrope: Body Prose & Explanatory Deliverables
 * - JetBrains Mono: Technical Identifiers, Sensor Bands, Provenance
 */

import React from "react";
import Link from "next/link";
import { ProvenanceBadge } from "../../components/common/ProvenanceBadge";
import { ArrowUpRight, ShieldCheck, Database, Cpu, Layers, Sparkles, Gauge, GitMerge } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function AboutPage() {
  const workflowStages = [
    {
      num: "01",
      circleColor: "bg-emerald-600",
      name: "Multispectral & Radiance Ingestion",
      stage: "OBSERVE",
      tagline: "Verifiable Physical Observational Ingestion",
      desc: "Ingests raw, calibrated physical observations from ESA Sentinel-2 L2A optical surface reflectance, NOAA VIIRS Day/Night Band nocturnal radiance, NASA POWER daily meteorology, and OpenStreetMap spatial infrastructure. Zero synthetic production data.",
      provenance: "OBSERVED",
      deliverables: [
        "Sentinel-2 Surface Reflectance (Tile 44PMV)",
        "VIIRS DNB Annual Radiance Composites",
        "1,461 Daily NASA POWER Meteorological Observations",
        "OSM Road & Footprint Spatial Context"
      ]
    },
    {
      num: "02",
      circleColor: "bg-emerald-600",
      name: "Statistical Deviation Engine",
      stage: "DETECT",
      tagline: "Temporal Baselines & Spatial Percentiles",
      desc: "Calculates robust temporal baseline deviations (Z-scores and Median Absolute Deviation / MAD) alongside 0.05° spatial regional cross-cell percentiles. Distinguishes genuine physical shifts from invariant baseline series.",
      provenance: "CALCULATED",
      deliverables: [
        "Z-Score & MAD Statistical Anomaly Metrics",
        "0.05° Analytical Grid Cross-Cell Percentiles",
        "Multiple-Hypothesis Adjusted Significance",
        "Invariant Baseline Contextual Isolation"
      ]
    },
    {
      num: "03",
      circleColor: "bg-emerald-600",
      name: "Temporal Compatibility & Concurrence",
      stage: "CONNECT",
      tagline: "Non-Causal Multi-Signal Alignment",
      desc: "Evaluates multi-sensor temporal compatibility (SAME_DAY, SAME_MONTH, AGGREGATED_WINDOW) before executing cross-signal reasoning. Discloses exploratory correlations (r, p, N) with strict non-causal integrity (causal_claim: false).",
      provenance: "CALCULATED",
      deliverables: [
        "Temporal Alignment Matrix Evaluation",
        "Exploratory Correlation (r, p, N)",
        "Mandatory causal_claim: false Disclosures",
        "Rejection of Prohibited Causal Verbs"
      ]
    },
    {
      num: "04",
      circleColor: "bg-emerald-600",
      name: "Claim-Level Grounded Intelligence",
      stage: "EXPLAIN",
      tagline: "Cryptographically Stamped Narrative Briefings",
      desc: "Produces structured briefings with numbered key findings (FIND-001) linked directly to underlying evidence items (EVID-001). Deterministic claim-level validation enforces factual numerical exactness and verifies SHA-256 package hashes.",
      provenance: "AI_INTERPRETED",
      deliverables: [
        "Numbered Finding to Citation Binding",
        "Deterministic Factual Exactness Audit",
        "Immutable SHA-256 Evidence Package Hash",
        "Observational Constraints & Limitations"
      ]
    },
    {
      num: "05",
      circleColor: "bg-emerald-600",
      name: "Composite Regional Change Score",
      stage: "DECIDE",
      tagline: "Calibrated 0–100 Multi-Factor Rating",
      desc: "Synthesizes multi-sensor evidence into an expert-configured 0–100 change score (phase6-v1) across temporal anomalies (25%), spatial deviations (25%), cross-signal agreement (20%), data completeness (15%), and temporal compatibility (15%).",
      provenance: "CALCULATED",
      deliverables: [
        "Weighted 5-Factor Mathematical Synthesis",
        "Expert-Configured Weighting (phase6-v1)",
        "Progressive Component Weight Disclosure",
        "Unified Scientific Rating Scale"
      ]
    }
  ];

  const sensors = [
    {
      tag: "OPTICAL SURFACE REFLECTANCE",
      name: "ESA Sentinel-2 MSI (Level-2A)",
      product: "Surface Reflectance Cloud-Filtered COGs",
      resolution: "10m – 20m Spatial Resolution",
      schedule: "MULTI-TEMPORAL SCENES (4 Cloud-Filtered Scenes: 2021–2024)",
      metrics: "NDVI (Vegetation Index), NDBI (Built-up Index), NDWI (Water Index)",
      provenance: "CALCULATED"
    },
    {
      tag: "NOCTURNAL RADIANCE PHOTOMETRY",
      name: "NOAA VIIRS Day/Night Band (DNB)",
      product: "Stray-Light Corrected Radiance Composites",
      resolution: "750m Pixel Footprint (0.05° Grid Aggregate)",
      schedule: "ANNUAL APRIL BASELINE (Multi-Year April 2021–2024)",
      metrics: "Nighttime Radiance Mean (nW/(cm²·sr)), Spatial Radiance Clusters",
      provenance: "OBSERVED"
    },
    {
      tag: "DAILY SURFACE METEOROLOGY",
      name: "NASA POWER Meteorology",
      product: "Daily Point Surface Meteorology Reanalysis",
      resolution: "0.5° × 0.625° Reanalysis Grid",
      schedule: "1,461 DAILY OBSERVATIONS (2021-01-01 to 2024-12-31)",
      metrics: "T2M (Air Temperature °C), PRECTOTCORR (Precipitation mm/day)",
      provenance: "OBSERVED"
    },
    {
      tag: "SPATIAL INFRASTRUCTURE CONTEXT",
      name: "OpenStreetMap (Overpass API)",
      product: "Vector Infrastructure Topology",
      resolution: "Physical Geometry Mapped in EPSG:32644 (UTM Zone 44N)",
      schedule: "SNAPSHOT (Static Baseline Spatial Infrastructure Context)",
      metrics: "Road Network Density (km/km²), Building Footprint & Count, POIs",
      provenance: "CALCULATED"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
      
      {/* 1. Hero Publication Title Block */}
      <div className="border-b border-slate-200 pb-10 space-y-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full tracking-wider">
            Research Memo • EP-METHOD-2026
          </span>
          <span className="text-xs text-slate-500 font-sans">
            Six-layer analytical investigation framework
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-slate-900 tracking-tight leading-[1.06] max-w-4xl">
          An architecture for <span className="italic font-normal text-emerald-700">regional change intelligence.</span>
        </h1>

        {/* Plain-language introduction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-1.5">
            <h2 className="font-serif font-semibold text-base text-slate-900">What EarthPulse does</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">It watches how Indian regions change — vegetation, night lights, weather and infrastructure — and turns satellite observations into evidence you can check.</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-1.5">
            <h2 className="font-serif font-semibold text-base text-slate-900">How it works</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">Observe real data, detect unusual change, connect signals without claiming causation, explain with cited evidence, and support decisions. Details follow below.</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-1.5">
            <h2 className="font-serif font-semibold text-base text-slate-900">Where the data comes from</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">Sentinel-2 satellites, VIIRS night lights, NASA weather records and OpenStreetMap — every number carries its source and timestamp.</p>
          </div>
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-1.5">
            <h2 className="font-serif font-semibold text-base text-slate-900">How AI is used</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">AI writes structured briefings strictly from verified evidence, with every claim linked to a numbered citation. It cannot invent numbers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          <div className="lg:col-span-8">
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans font-normal">
              EarthPulse AI is engineered to bridge satellite remote sensing, nocturnal photometry, meteorological reanalysis, and vector infrastructure into verifiable regional intelligence. It replaces speculative hallucinations with deterministic claim-level evidence packages, non-causal statistical rigor, and cryptographic provenance.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Link href="/explore">
              <Button size="md" variant="primary" className="w-full gap-2 text-xs font-sans font-semibold">
                <span>Open workspace</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/region/IN-TN-CHE">
              <Button size="md" variant="secondary" className="w-full text-xs font-sans font-semibold">
                <span>View Chennai Pilot Dossier</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational Scientific Workflow Sequence */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-24 space-y-4">
              <span className="text-xs font-sans font-semibold text-emerald-700 block border-b border-slate-200 pb-1">
                How the analysis runs, step by step
              </span>
              <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 leading-[1.15]">
                OBSERVE → DETECT → CONNECT → EXPLAIN → DECIDE
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                From raw physical observations to an explainable, cryptographically grounded intelligence briefing. Every calculation executes deterministically in the backend engine without synthetic extrapolation.
              </p>
              <div className="pt-2">
                <ProvenanceBadge type="CALCULATED" size="sm" />
              </div>
            </div>
          </div>

          {/* Right Column: Numbered Stage Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowStages.map((stage) => (
              <div
                key={stage.num}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all font-sans"
              >
                <div className="space-y-4">
                  {/* Top Numbered Badge & Stage Label */}
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-full ${stage.circleColor} text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs`}>
                      {stage.num}
                    </div>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      STAGE • {stage.stage}
                    </span>
                  </div>

                  {/* Heading */}
                  <h3 className="font-serif font-semibold text-lg text-slate-900 leading-snug">
                    {stage.name}
                  </h3>

                  {/* Body Copy */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-normal">
                    {stage.desc}
                  </p>

                  {/* Deliverables List */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 font-mono text-xs text-slate-600">
                    {stage.deliverables.map((d, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase text-[10px]">PROVENANCE</span>
                  <ProvenanceBadge type={stage.provenance} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Four Data Sources Architecture with Scientific Satellite Mosaic Anchor */}
      <div className="space-y-8 pt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-sans font-semibold text-emerald-700">
              Multi-source ingestion specs
            </span>
            <h2 className="font-serif font-semibold text-2xl sm:text-4xl text-slate-900 tracking-tight leading-[1.12]">
              Four Data Sources Under Unified Grid Alignment
            </h2>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              EarthPulse AI establishes physical truth by harmonizing optical reflectance, nocturnal photometry, meteorological reanalysis, and vector topology. Every observation is geometrically reprojected to EPSG:32644 (UTM Zone 44N) and mapped onto a standardized 0.05° grid mesh (~5.5 km × 5.5 km) for rigorous multi-sensor cross-evaluation.
            </p>
          </div>

          {/* Authentic Scientific Earth Observation Mosaic Anchor */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
              <img
                src="/images/india-optical-mosaic.jpg"
                alt="Subcontinental Satellite Earth Observation Mosaic — Land Surface Reflectance"
                className="w-full h-56 sm:h-64 object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between text-white text-[11px] font-sans">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="truncate">MULTISPECTRAL SATELLITE MOSAIC</span>
                </div>
                <span className="text-emerald-400 font-bold ml-2 flex-shrink-0">EPSG:32644</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Sensor Specification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {sensors.map((sensor, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md hover:border-slate-300 transition-all font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {sensor.tag.charAt(0) + sensor.tag.slice(1).toLowerCase()}
                </span>
                <ProvenanceBadge type={sensor.provenance} size="xs" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-lg text-slate-900">
                  {sensor.name}
                </h3>
                <p className="font-mono text-xs text-slate-500">
                  {sensor.product}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="text-slate-700 font-semibold">{sensor.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cadence / Scope:</span>
                  <span className="text-slate-700 font-semibold">{sensor.schedule}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-400">Key Metrics:</span>
                  <span className="text-slate-900 font-bold">{sensor.metrics}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. What EarthPulse cannot conclude */}
      <div className="space-y-4 pt-8 border-t border-slate-200">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-sans font-semibold text-emerald-700">
            Limits
          </p>
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            What EarthPulse cannot conclude
          </h2>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            Clear boundaries keep the science honest. EarthPulse measures observed change — it does not predict disasters, economies, health outcomes or legal facts.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "No disaster or flood forecasting",
            "No economic collapse prediction",
            "No disease or health diagnosis",
            "No land-title or legal advice",
            "No welfare-scheme eligibility decisions",
            "No causal claims — correlation only, always disclosed"
          ].map((limit) => (
            <div key={limit} className="p-4 bg-white border border-slate-200/80 rounded-xl text-xs font-sans text-slate-700 leading-relaxed">
              {limit}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
