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
    <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-20 w-full">

      {/* 1. Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-5">
          <p className="text-sm font-sans font-semibold text-emerald-700">
            EarthPulse AI
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-slate-900 tracking-tight leading-[1.04]">
            AI that reveals how{" "}
            <span className="italic font-normal text-emerald-700">India is changing.</span>
          </h1>
          <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
            Connect satellite, environmental and geospatial signals to understand regional change.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/explore">
              <Button size="lg" variant="primary" className="gap-2 text-sm font-semibold px-7">
                <span>Open workspace</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="secondary" className="gap-2 text-sm font-semibold px-7">
                <span>How it works</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <ProvenanceBadge type="OBSERVED" size="xs" />
            <ProvenanceBadge type="CALCULATED" size="xs" />
            <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
          <img
            src="/images/india-space-hero.jpg"
            alt="India and the Indian Ocean seen from space"
            className="w-full h-72 sm:h-96 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 text-[11px] font-sans text-slate-200 flex items-center justify-between">
            <span className="truncate">Pilot extent: Chennai metropolitan area</span>
            <span className="text-emerald-400 font-bold ml-2 flex-shrink-0">16 cells</span>
          </div>
        </div>
      </div>

      {/* 2. What EarthPulse brings together */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-sans font-semibold text-emerald-700">
            What EarthPulse brings together
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 tracking-tight">
            Four independent signals, one analytical grid
          </h2>
          <p className="text-sm text-slate-600 font-sans leading-relaxed">
            Each source keeps its own timing and resolution. EarthPulse aligns them so change can be compared honestly.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.name} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-serif font-semibold text-base text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. How an investigation works */}
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-sans font-semibold text-emerald-700">
            How an investigation works
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 tracking-tight">
            From a region to an evidence-backed briefing
          </h2>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none">
          {STEPS.map((s) => (
            <li key={s.num} className="relative bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-sans font-bold text-xs flex items-center justify-center">
                {s.num}
              </span>
              <h3 className="font-serif font-semibold text-base text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">{s.detail}</p>
            </li>
          ))}
        </ol>
        <div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Start with the Chennai pilot region</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
