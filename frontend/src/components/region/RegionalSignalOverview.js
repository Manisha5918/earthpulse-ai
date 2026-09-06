"use client";

/**
 * EarthPulse AI — Regional Physical Observational Telemetry
 * Integrates authentic scientific satellite imagery previews (Sentinel-2 NDVI & VIIRS Radiance)
 * with progressive disclosure alongside quantitative metrics.
 */

import React, { useState } from "react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Activity, ChevronDown, ChevronUp, Eye, Sparkles, CloudSun, Building2, Image as ImageIcon, X, Maximize2 } from "lucide-react";
import clsx from "clsx";

export function RegionalSignalOverview({ baselines = {}, latestObservations = {}, osmSummary = null }) {
  const [expandedDetails, setExpandedDetails] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState(null);

  const baseMap = baselines?.baselines || baselines || {};
  const ndviB = baseMap.ndvi || {};
  const ndbiB = baseMap.ndbi || {};
  const viirsB = baseMap.viirs_radiance || {};
  const tempB = baseMap.temperature_2m || {};
  const precipB = baseMap.precipitation || {};

  // Latest VIIRS annual composite, taken from backend observations only.
  // Never a frozen value: missing data renders as N/A.
  const viirsSeries = Array.isArray(latestObservations?.viirs) ? latestObservations.viirs : [];
  const latestViirs = viirsSeries.length > 0 ? viirsSeries[viirsSeries.length - 1] : null;
  const latestViirsText =
    latestViirs && latestViirs.mean_radiance !== undefined && latestViirs.mean_radiance !== null
      ? `${Number(latestViirs.mean_radiance).toFixed(2)} nW (${latestViirs.period || "latest"})`
      : "N/A";

  // OSM snapshot numbers come from the backend snapshot summary only.
  const osmRoads = osmSummary?.total_road_length_km;
  const osmDensity = osmSummary?.road_density_km_per_km2;
  const osmBuildings = osmSummary?.mapped_building_count;
  const osmPois = osmSummary?.poi_counts?.total;
  const hasOsmNumbers =
    osmRoads !== undefined && osmRoads !== null &&
    osmBuildings !== undefined && osmBuildings !== null;
  const numOrNA = (value, digits) =>
    value !== undefined && value !== null && !Number.isNaN(Number(value))
      ? Number(value).toFixed(digits)
      : "N/A";
  const countOrNA = (count, unit) =>
    count !== undefined && count !== null ? `${count} ${unit}` : "N/A";
  const precipTotalMm =
    precipB.mean !== undefined && precipB.mean !== null &&
    precipB.observation_count !== undefined && precipB.observation_count !== null
      ? `${Math.round(Number(precipB.mean) * Number(precipB.observation_count)).toLocaleString("en-US")} mm`
      : "N/A";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 transition-all">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="space-y-0.5 border-l-3 border-emerald-600 pl-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-display font-bold text-slate-900">
              What the Sensors Observed
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Vegetation canopy reflectance, nocturnal light radiance, daily meteorology, and mapped infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-sans font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>{expandedDetails ? "Hide Technical Details" : "View Technical Parameters"}</span>
            {expandedDetails ? <ChevronUp className="w-3.5 h-3.5 text-emerald-700" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />}
          </button>
          <ProvenanceBadge type="OBSERVED" size="xs" />
        </div>
      </div>

      {/* 4 Clean Essential Signal Cards with Scientific Imagery Integration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Sentinel-2 NDVI */}
        <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 flex flex-col justify-between group shadow-xs hover:shadow-sm transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                VEGETATION HEALTH
              </span>
              <button
                type="button"
                onClick={() => setActiveImageModal({
                  title: "Sentinel-2 Multispectral Vegetation Index (NDVI)",
                  source: "ESA Sentinel-2 MSI (10m Ground Sample Distance)",
                  image: "/images/india-vegetation-ndvi.jpg",
                  caption: "Subcontinental and regional multispectral vegetation canopy reflectance (B4 Red + B8 NIR). Green tones indicate robust canopy density, while pale/brown tones reflect dry or stressed vegetative cover relative to April baseline.",
                  stat: `Observed Mean: ${numOrNA(ndviB.mean, 4)}`
                })}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-mono font-semibold flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
                title="Inspect Satellite Scene"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="underline">Scene</span>
              </button>
            </div>

            {/* Compact Satellite Scene Thumbnail */}
            <div
              onClick={() => setActiveImageModal({
                title: "Sentinel-2 Multispectral Vegetation Index (NDVI)",
                source: "ESA Sentinel-2 MSI (10m Ground Sample Distance)",
                image: "/images/india-vegetation-ndvi.jpg",
                caption: "Subcontinental and regional multispectral vegetation canopy reflectance (B4 Red + B8 NIR). Green tones indicate robust canopy density, while pale/brown tones reflect dry or stressed vegetative cover relative to April baseline.",
                stat: `Observed Mean: ${numOrNA(ndviB.mean, 4)}`
              })}
              className="relative h-20 w-full rounded-lg overflow-hidden border border-emerald-200/80 cursor-pointer bg-slate-950"
            >
              <img
                src="/images/india-vegetation-ndvi.jpg"
                alt="Sentinel-2 Multispectral Vegetation Index"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/20 hover:bg-transparent transition-colors" />
              <div className="absolute bottom-1 right-1 bg-slate-900/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>10m MSI</span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Canopy Index (NDVI)
              </h3>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-display font-bold text-emerald-900">
                  {numOrNA(ndviB.mean, 4)}
                </span>
                <span className="text-xs font-mono text-slate-500">mean</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              4 cloud-filtered scenes (2021–2024). Reflects regional green canopy density.
            </p>
          </div>

          {expandedDetails && (
            <div className="pt-2 border-t border-emerald-200/70 font-mono text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Std Dev:</span> <strong>{numOrNA(ndviB.stddev, 4)}</strong></div>
              <div className="flex justify-between"><span>Archive:</span> <strong>{countOrNA(ndviB.observation_count, "Scenes")}</strong></div>
              <div className="flex justify-between"><span>Semantics:</span> <strong className="text-emerald-800">MULTI_TEMPORAL</strong></div>
            </div>
          )}
        </div>

        {/* Card 2: Sentinel-2 NDBI */}
        <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 flex flex-col justify-between group shadow-xs hover:shadow-sm transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                BUILT-UP DENSITY
              </span>
              <button
                type="button"
                onClick={() => setActiveImageModal({
                  title: "High-Resolution Optical Satellite Context (Chennai Corridors)",
                  source: "ESA Sentinel-2 Surface Reflectance (EPSG:32644)",
                  image: "/images/chennai-satellite-context.jpg",
                  caption: "High-resolution satellite view of the Chennai Metropolitan Extent showing urban corridors (Poonamallee, Ambattur, Tambaram, Minjur) and built-up land coverage.",
                  stat: `Observed Mean NDBI: ${numOrNA(ndbiB.mean, 4)}`
                })}
                className="text-sky-700 hover:text-sky-800 text-[11px] font-mono font-medium flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                title="Inspect Urban Satellite Context"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="underline">Context</span>
              </button>
            </div>

            {/* Compact Satellite Scene Thumbnail */}
            <div
              onClick={() => setActiveImageModal({
                title: "High-Resolution Optical Satellite Context (Chennai Corridors)",
                source: "ESA Sentinel-2 Surface Reflectance (EPSG:32644)",
                image: "/images/chennai-satellite-context.jpg",
                caption: "High-resolution satellite view of the Chennai Metropolitan Extent showing urban corridors (Poonamallee, Ambattur, Tambaram, Minjur) and built-up land coverage.",
                stat: `Observed Mean NDBI: ${numOrNA(ndbiB.mean, 4)}`
              })}
              className="relative h-20 w-full rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-950"
            >
              <img
                src="/images/chennai-satellite-context.jpg"
                alt="Chennai Urban Satellite Corridor Context"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/20 hover:bg-transparent transition-colors" />
              <div className="absolute bottom-1 right-1 bg-slate-900/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Urban Grid</span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Built-Up Land (NDBI)
              </h3>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-display font-bold text-slate-900">
                  {numOrNA(ndbiB.mean, 4)}
                </span>
                <span className="text-xs font-mono text-slate-500">mean</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Measures built-up surface reflectance across 16 analytical grid cells.
            </p>
          </div>

          {expandedDetails && (
            <div className="pt-2 border-t border-slate-200 font-mono text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Std Dev:</span> <strong>{numOrNA(ndbiB.stddev, 4)}</strong></div>
              <div className="flex justify-between"><span>Archive:</span> <strong>{countOrNA(ndbiB.observation_count, "Scenes")}</strong></div>
              <div className="flex justify-between"><span>Confidence:</span> <strong className="text-amber-800">LIMITED</strong></div>
            </div>
          )}
        </div>

        {/* Card 3: VIIRS Nighttime Radiance */}
        <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 flex flex-col justify-between group shadow-xs hover:shadow-sm transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                NIGHTLIGHT EMISSION
              </span>
              <button
                type="button"
                onClick={() => setActiveImageModal({
                  title: "VIIRS Nocturnal Light Radiance Composite",
                  source: "NOAA VIIRS Day/Night Band (750m Nocturnal Photometry)",
                  image: "/images/india-nightlights-viirs.png",
                  caption: "Calibrated nocturnal radiance in nW/(cm²·sr) captured by NOAA VIIRS Day/Night Band. Highlights concentrated nocturnal lighting, urban infrastructure cores, and arterial electrification.",
                  stat: `Observed Mean: ${numOrNA(viirsB.mean, 1)} nW/(cm²·sr)`
                })}
                className="text-amber-700 hover:text-amber-800 text-[11px] font-mono font-medium flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
                title="Inspect VIIRS Radiance"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="underline">DNB</span>
              </button>
            </div>

            {/* Compact Satellite Scene Thumbnail */}
            <div
              onClick={() => setActiveImageModal({
                title: "VIIRS Nocturnal Light Radiance Composite",
                source: "NOAA VIIRS Day/Night Band (750m Nocturnal Photometry)",
                image: "/images/india-nightlights-viirs.png",
                caption: "Calibrated nocturnal radiance in nW/(cm²·sr) captured by NOAA VIIRS Day/Night Band. Highlights concentrated nocturnal lighting, urban infrastructure cores, and arterial electrification.",
                stat: `Observed Mean: ${numOrNA(viirsB.mean, 1)} nW/(cm²·sr)`
              })}
              className="relative h-20 w-full rounded-lg overflow-hidden border border-slate-200 cursor-pointer bg-slate-950"
            >
              <img
                src="/images/india-nightlights-viirs.png"
                alt="VIIRS Nocturnal Light Radiance Composite"
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/20 hover:bg-transparent transition-colors" />
              <div className="absolute bottom-1 right-1 bg-slate-900/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>750m DNB</span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Night Radiance Mean
              </h3>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-display font-bold text-slate-900">
                  {numOrNA(viirsB.mean, 1)}
                </span>
                <span className="text-xs font-mono text-slate-500">nW/(cm²·sr)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              April multi-year baseline observations (2021–2024). High urban concentration.
            </p>
          </div>

          {expandedDetails && (
            <div className="pt-2 border-t border-slate-200 font-mono text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Latest composite:</span> <strong>{latestViirsText}</strong></div>
              <div className="flex justify-between"><span>Archive:</span> <strong>4 April Baselines</strong></div>
              <div className="flex justify-between"><span>Semantics:</span> <strong className="text-amber-800">ANNUAL_BASELINE</strong></div>
            </div>
          )}
        </div>

        {/* Card 4: NASA POWER Weather */}
        <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl space-y-3 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                DAILY METEOROLOGY
              </span>
              <CloudSun className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            {/* Meteorological Telemetry Highlight Box */}
            <div className="h-20 w-full rounded-lg border border-emerald-200/80 bg-white p-2.5 flex flex-col justify-between text-xs font-mono">
              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span>Precipitation (Total):</span>
                <span className="font-bold text-emerald-900 font-mono">{precipTotalMm}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span>Temp Range:</span>
                <span className="font-bold text-slate-900 font-mono">{tempB.min !== undefined && tempB.min !== null && tempB.max !== undefined && tempB.max !== null ? `${Number(tempB.min).toFixed(1)}°C – ${Number(tempB.max).toFixed(1)}°C` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800 text-[11px] pt-1 border-t border-emerald-100">
                <span>Record Depth:</span>
                <span className="font-bold font-mono text-emerald-900">{countOrNA(tempB.observation_count, "Days")}</span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">
                Surface Temperature
              </h3>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-display font-bold text-emerald-900">
                  {tempB.mean !== undefined && tempB.mean !== null ? `${Number(tempB.mean).toFixed(1)}°C` : "N/A"}
                </span>
                <span className="text-xs font-mono text-slate-500">daily mean</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              {countOrNA(tempB.observation_count, "daily meteorological observations (2021–2024)")}. Atmospheric context.
            </p>
          </div>

          {expandedDetails && (
            <div className="pt-2 border-t border-emerald-200/70 font-mono text-[11px] space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Rainfall Total:</span> <strong>{precipTotalMm}</strong></div>
              <div className="flex justify-between"><span>Records:</span> <strong>{countOrNA(tempB.observation_count, "Days")}</strong></div>
              <div className="flex justify-between"><span>Confidence:</span> <strong className="text-emerald-800">HIGH (N={tempB.observation_count ?? "N/A"})</strong></div>
            </div>
          )}
        </div>

      </div>

      {/* OSM Spatial Context Bar */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            <strong className="text-emerald-950 font-bold">OpenStreetMap Context Snapshot:</strong>{" "}
            {hasOsmNumbers ? (
              <>{Number(osmRoads).toLocaleString("en-US", { maximumFractionDigits: 1 })} km road network ({numOrNA(osmDensity, 2)} km/km²), {Number(osmBuildings).toLocaleString("en-US")} mapped buildings{osmPois !== undefined && osmPois !== null ? `, and ${Number(osmPois).toLocaleString("en-US")} POIs` : ""}.</>
            ) : (
              <>mapped road network, buildings and places.</>
            )}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 uppercase tracking-wider flex-shrink-0 font-semibold">
          STATIC SPATIAL SNAPSHOT
        </span>
      </div>

      {/* Progressive Disclosure Scientific Imagery Modal */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-200 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-semibold uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {activeImageModal.source}
                </span>
                <h3 className="font-serif font-semibold text-lg text-slate-900">
                  {activeImageModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveImageModal(null)}
                aria-label="Close satellite scene inspection"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="px-5">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                <img
                  src={activeImageModal.image}
                  alt={activeImageModal.title}
                  className="w-full max-h-80 object-contain mx-auto"
                />
              </div>
            </div>

            {/* Metadata & Caption */}
            <div className="p-5 pt-0 space-y-3 font-sans text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs flex justify-between items-center">
                <span>Quantitative Value:</span>
                <strong className="text-slate-900">{activeImageModal.stat}</strong>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {activeImageModal.caption}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveImageModal(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

