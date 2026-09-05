"use client";

/**
 * EarthPulse AI — Regional Intelligence Profile Header (Editorial & Geospatial)
 * Integrates authentic Chennai satellite context image beside region identity.
 */

import React from "react";
import Link from "next/link";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { ArrowLeft, Layers, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "../ui/Button";

export function RegionHeader({ regionDetail, regionId }) {
  const name = regionDetail?.name || regionId;
  const code = regionDetail?.code || regionId;
  const area = regionDetail?.area_sqkm ? `${regionDetail.area_sqkm} km²` : "Area derived from grid bounds";
  const cellsCount = regionDetail?.grid_cells_count ? `${regionDetail.grid_cells_count} Cells` : "16 Cells";
  const isPilot = regionDetail?.code === "IN-TN-CHE" || regionId === "IN-TN-CHE";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Region profile</span>
        </div>
        <span className="font-mono">Code: {code}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Region Identity & Meta on the Left */}
        <div className="lg:col-span-7 space-y-4 font-sans">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explore</span>
          </Link>

          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-slate-900 tracking-tight leading-[1.08]">
                {name}
              </h1>
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {code}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2 font-normal leading-relaxed">
              {regionDetail?.state ? `${regionDetail.state}, ${regionDetail.country || "India"}` : "India Regional Extent"} — Autonomous multi-sensor spatial observation grid across 16 analytical cells.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isPilot ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>VERIFIED PILOT DATASET</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-semibold">
                <span>PROCESSING REQUIRED</span>
              </span>
            )}
            <ProvenanceBadge type="CALCULATED" size="sm" />
            <Link href="/explore">
              <Button size="sm" variant="secondary" className="gap-2 text-xs font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Map View ↗</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Authentic Chennai Regional Satellite Image on the Right */}
        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 relative group">
            <img
              src="/images/chennai-satellite-context.jpg"
              alt="High-Resolution Satellite Imagery of Chennai Regional Corridors"
              className="w-full h-48 sm:h-56 object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">SATELLITE GROUND TRUTH CONTEXT</span>
              </div>
              <span className="text-slate-400">EPSG:32644</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">ADMIN LEVEL</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{regionDetail?.admin_level || "DISTRICT"}</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">COVERAGE AREA</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{area}</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">GRID RESOLUTION</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">0.05° (~5.5 km)</span>
        </div>
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">INGESTED CELLS</span>
          <span className="font-bold text-slate-900 text-sm mt-0.5 block">{cellsCount} (100%)</span>
        </div>
      </div>
    </div>
  );
}
