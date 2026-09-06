/**
 * EarthPulse AI — Home: concise landing page.
 * Three areas only: hero, what EarthPulse brings together,
 * how an investigation works. All CTAs lead to the product.
 */

import Link from "next/link";
import { ArrowUpRight, ArrowRight, Satellite, MoonStar, CloudSun, Building2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";

const SOURCES = [
  {
    icon: Satellite,
    name: "Sentinel-2",
    detail: "Vegetation, built-up and water indices from 4 cloud-free scenes (2021–2024)."
  },
  {
    icon: MoonStar,
    name: "VIIRS",
    detail: "Nighttime radiance from the annual April baseline (2021–2024)."
  },
  {
    icon: CloudSun,
    name: "NASA POWER",
    detail: "Daily temperature and rainfall context from 1,461 observations."
  },
  {
    icon: Building2,
    name: "OpenStreetMap",
    detail: "Roads, buildings and places as a static spatial snapshot."
  }
];

const STEPS = [
  {
    num: "1",
    name: "Overview",
    detail: "Select the Chennai pilot region and inspect the analytical map and change score."
  },
  {
    num: "2",
    name: "Evidence",
    detail: "See what each satellite and weather source observed, and how unusual it is."
  },
  {
    num: "3",
    name: "Relationships",
    detail: "See which signals changed together — stated as correlation, never causation."
  },
  {
    num: "4",
    name: "Briefing",
    detail: "Read a grounded summary where every claim links to its evidence."
  }
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24 w-full">

      {/* 1. Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          {/* Glowing Green Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              India Geospatial Intelligence Platform
            </span>
          </div>

          {/* Bold Attractive Heading with Unified Brand Emerald */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.06]">
            AI that reveals how{" "}
            <span className="text-emerald-600 font-black">
              India is changing.
            </span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
            Connect multi-spectral satellite imagery, nocturnal illumination, meteorological records, and spatial infrastructure into a unified regional continuum.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link href="/explore">
              <Button size="lg" variant="primary" className="gap-2 text-sm font-bold px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
                <span>Launch Workspace</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="secondary" className="gap-2 text-sm font-semibold px-7 py-3.5 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-all">
                <span>Scientific Methodology</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <ProvenanceBadge type="OBSERVED" size="xs" />
            <ProvenanceBadge type="CALCULATED" size="xs" />
            <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
          </div>
        </div>

        {/* Hero Satellite Graphic */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-950 group">
          <img
            src="/images/india-space-hero.jpg"
            alt="India and the Indian Ocean seen from space"
            className="w-full h-80 sm:h-[420px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-xs font-sans text-slate-200 flex items-center justify-between p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-medium text-slate-100">Pilot Extent: Chennai Metropolitan Area</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 text-[11px]">
              16 Grid Cells
            </span>
          </div>
        </div>
      </div>

      {/* 2. What EarthPulse brings together */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2 border-l-4 border-emerald-600 pl-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
            Multi-Source Fusion Engine
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Four independent signals, one analytical grid
          </h2>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            Each physical source maintains its native sensor frequency and resolution. EarthPulse unifies them onto a standardized spatial continuum.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="bg-white border border-slate-200/70 hover:border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. How an investigation works */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2 border-l-4 border-emerald-600 pl-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
            5-Stage Analytical Lifecycle
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            From regional observations to evidence-backed briefings
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none">
          {STEPS.map((s) => (
            <li
              key={s.num}
              className="bg-white border border-slate-200/70 hover:border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs shadow-emerald-700/30">
                  {s.num}
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Phase 0{s.num}
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.detail}</p>
            </li>
          ))}
        </ol>

        <div className="pt-2">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 px-5 py-2.5 rounded-xl border border-emerald-200/80 shadow-xs transition-all"
          >
            <span>Start with the Chennai Pilot Region</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </Link>
        </div>
      </div>

    </div>
  );
}
