"use client";

/**
 * EARTHPULSE AI — FINAL UNIFIED INVESTIGATION WORKSTATION
 * 
 * Single primary investigation command center:
 * 1. Investigation Map (0.05° Analytical Grid)
 * 2. Regional Change Score (Composite 0–100, 5 Components)
 * 3. Multi-Sensor Evidence ("What Changed?")
 * 4. Anomaly Analysis ("Is it Unusual?" — Temporal vs Spatial)
 * 5. Cross-Signal Intelligence ("Do Signals Agree?" — Non-Causal Chains)
 * 6. Temporal Evidence (Discrete Scene Schedules & Alignment Matrix)
 * 7. Grounded AI Briefing ("What Does the Evidence Support?")
 * 8. Evidence & Provenance (Source Classes & Disclosures)
 * 
 * Strict Location Isolation:
 * - Chennai (IN-TN-CHE) -> Full verified pilot data
 * - Bengaluru -> PROCESSING_REQUIRED (Zero Chennai data leakage)
 * - London -> DATA_UNAVAILABLE (Zero fabricated data)
 * - Zero frontend scientific calculations. All metrics come from backend.
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import clsx from "clsx";

// Components
import { MapContainer } from "../../components/map/MapContainer";
import { LocationSelector } from "../../components/investigation/LocationSelector";
import { AnalysisControlPanel } from "../../components/investigation/AnalysisControlPanel";
import { ChangeScoreCard } from "../../components/investigation/ChangeScoreCard";
import { RegionalSignalOverview } from "../../components/region/RegionalSignalOverview";
import { RegionalAnomalySection } from "../../components/region/RegionalAnomalySection";
import { RegionalRelationships } from "../../components/region/RegionalRelationships";
import { EvidenceStrength } from "../../components/region/EvidenceStrength";
import { GroundedNarrativePanel } from "../../components/investigation/GroundedNarrativePanel";
import { IntelligenceUsedPanel } from "../../components/investigation/IntelligenceUsedPanel";
import { TemporalAlignmentMatrix } from "../../components/timeline/TemporalAlignmentMatrix";
import { SentinelTimeline } from "../../components/timeline/SentinelTimeline";
import { ViirsBaselineTimeline } from "../../components/timeline/ViirsBaselineTimeline";
import { NasaTemporalView } from "../../components/timeline/NasaTemporalView";
import { OsmSnapshotContext } from "../../components/timeline/OsmSnapshotContext";
import { AsyncProgressModal } from "../../components/investigation/AsyncProgressModal";
import { DataStateView } from "../../components/common/DataStateView";
import { ProvenanceBadge } from "../../components/common/ProvenanceBadge";
import { Button } from "../../components/ui/Button";

// APIs
import {
  generateNarrativeIntelligence,
  getRegionalChangeProfile,
  getRegionalBaselines,
  getRegionalAnomalies,
  getRegionalRelationships
} from "../../lib/api/intelligence";
import {
  executeUnifiedAnalysis,
  getJobStatus,
  checkDataAvailability
} from "../../lib/api/analysis";
import { getRegionDetail } from "../../lib/api/regions";
import { formatStatus } from "../../lib/utils";

// Icons
import {
  Layers,
  MapPin,
  Sparkles,
  Activity,
  GitMerge,
  Clock,
  ShieldCheck,
  Compass,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Globe2,
  Eye
} from "lucide-react";

export default function ExplorePage() {
  // -------------------------------------------------------------
  // 1. Target Location State
  // -------------------------------------------------------------
  const [locationMode, setLocationMode] = useState("region"); // "region" | "grid_cell" | "point"
  const [selectedRegion, setSelectedRegion] = useState("IN-TN-CHE");
  const [selectedCell, setSelectedCell] = useState(null);
  const [customCoords, setCustomCoords] = useState({ lat: 13.0827, lon: 80.2707 });

  // -------------------------------------------------------------
  // 2. Analysis Parameters
  // -------------------------------------------------------------
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [selectedSignals, setSelectedSignals] = useState(["sentinel2", "viirs", "nasa_power", "osm"]);
  const [asyncMode, setAsyncMode] = useState(false);

  // -------------------------------------------------------------
  // 3. Investigation Results & Domain State
  // -------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [domainStatus, setDomainStatus] = useState("AVAILABLE"); // "AVAILABLE" | "PARTIAL_DATA" | "PROCESSING_REQUIRED" | "DATA_UNAVAILABLE" | "ERROR"
  const [result, setResult] = useState(null);
  const [regionDetail, setRegionDetail] = useState(null);
  const [changeProfile, setChangeProfile] = useState(null);
  const [baselines, setBaselines] = useState({});
  const [anomalies, setAnomalies] = useState({ temporal_anomalies: [], spatial_anomalies: [] });
  const [relationships, setRelationships] = useState({ patterns: [], relationships: [] });
  const [availabilityData, setAvailabilityData] = useState(null);
  const [error, setError] = useState(null);

  // -------------------------------------------------------------
  // 4. Async Job State
  // -------------------------------------------------------------
  const [activeJob, setActiveJob] = useState(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState("QUEUED");
  const [jobStep, setJobStep] = useState("Initializing background telemetry...");
  const pollingRef = useRef(null);
  // Monotonic investigation sequence: late responses from superseded runs
  // are ignored so rapid cell clicks can never overwrite newer results.
  const requestSeqRef = useRef(0);

  // -------------------------------------------------------------
  // 5. Section Visibility / Collapse Toggles
  // -------------------------------------------------------------
  // Progressive disclosure across the four investigation steps.
  // Overview and evidence open initially; relationships and the briefing
  // expand on demand.
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    evidence: true,
    relationships: false,
    briefing: false
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Build LocationSpec payload
  const buildLocationSpec = () => {
    if (selectedCell) {
      return { type: "grid_cell", cell_code: selectedCell };
    }
    if (locationMode === "point") {
      return { type: "point", coordinates: [customCoords.lat, customCoords.lon] };
    }
    return { type: "region", region_code: selectedRegion };
  };

  // -------------------------------------------------------------
  // 6. Complete Location Reset (Strict Location Isolation)
  // -------------------------------------------------------------
  const clearAllLocationState = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setResult(null);
    setRegionDetail(null);
    setChangeProfile(null);
    setBaselines({});
    setAnomalies({ temporal_anomalies: [], spatial_anomalies: [] });
    setRelationships({ patterns: [], relationships: [] });
    setAvailabilityData(null);
    setError(null);
    setActiveJob(null);
  };

  // -------------------------------------------------------------
  // 7. Run Investigation Handler
  // -------------------------------------------------------------
  const handleRunInvestigation = async (overrideParams = {}) => {
    clearAllLocationState();
    setLoading(true);
    setError(null);
    const seq = ++requestSeqRef.current;
    const isStale = () => seq !== requestSeqRef.current;

    const activeLocMode = overrideParams.locationMode || locationMode;
    const activeReg = overrideParams.selectedRegion || selectedRegion;
    const activeCell = overrideParams.selectedCell !== undefined ? overrideParams.selectedCell : selectedCell;
    const activeCoords = overrideParams.customCoords || customCoords;

    let locationSpec;
    if (activeCell) {
      locationSpec = { type: "grid_cell", cell_code: activeCell };
    } else if (activeLocMode === "point") {
      locationSpec = { type: "point", coordinates: [activeCoords.lat, activeCoords.lon] };
    } else {
      locationSpec = { type: "region", region_code: activeReg };
    }

    const reqPayload = {
      location: locationSpec,
      start_date: startDate,
      end_date: endDate,
      signals: selectedSignals,
      narrative_mode: "EXECUTIVE_BRIEFING",
      async_mode: asyncMode
    };

    try {
      if (asyncMode) {
        // Async Execution
        const asyncResp = await generateNarrativeIntelligence(reqPayload);
        if (isStale()) return;
        if (asyncResp.job_id || (asyncResp.detail && asyncResp.detail.job_id)) {
          const jId = asyncResp.job_id || asyncResp.detail.job_id;
          setActiveJob(jId);
          startJobPolling(jId, locationSpec, seq, activeCell);
        } else {
          handleSuccessfulResult(asyncResp, activeReg, activeLocMode, seq, activeCell);
        }
      } else {
        // Synchronous Execution
        const data = await generateNarrativeIntelligence(reqPayload);
        if (isStale()) return;
        handleSuccessfulResult(data, activeReg, activeLocMode, seq, activeCell);
      }
    } catch (err) {
      if (isStale()) return;
      if (err.status === 202 && err.detail?.job_id) {
        setActiveJob(err.detail.job_id);
        startJobPolling(err.detail.job_id, locationSpec, seq, activeCell);
      } else {
        setError(err.message || "Investigation execution failed.");
        setDomainStatus("ERROR");
      }
    } finally {
      if (!asyncMode && !isStale()) {
        setLoading(false);
      }
    }
  };

  // Handle Successful Narrative Result
  const handleSuccessfulResult = async (data, regionCode, locMode, seq, cellCode = null) => {
    if (seq !== undefined && seq !== requestSeqRef.current) return;
    setResult(data);
    setDomainStatus(data.status);

    // If verified pilot data available (e.g. Chennai), fetch full detailed profiles
    if (data.status === "AVAILABLE" || data.status === "PARTIAL_DATA") {
      try {
        const targetId = cellCode || (selectedCell !== undefined ? selectedCell : null) || regionCode || "IN-TN-CHE";
        const [regData, profData, baseData, anomData, relData] = await Promise.all([
          getRegionDetail(regionCode || "IN-TN-CHE"),
          getRegionalChangeProfile(targetId),
          getRegionalBaselines(targetId),
          getRegionalAnomalies(targetId),
          getRegionalRelationships(targetId)
        ]);
        if (seq !== undefined && seq !== requestSeqRef.current) return;
        setRegionDetail(regData);
        setChangeProfile(profData);
        setBaselines(baseData?.baselines || baseData);
        setAnomalies(anomData);
        setRelationships(relData);
      } catch (_) {
        // Graceful handling for subsidiary telemetry
      }
    } else {
      // Unverified location (Bengaluru -> PROCESSING_REQUIRED, London -> DATA_UNAVAILABLE)
      // Clear all analytical profile data to guarantee zero leakage
      setRegionDetail(null);
      setChangeProfile(null);
      setBaselines({});
      setAnomalies({ temporal_anomalies: [], spatial_anomalies: [] });
      setRelationships({ patterns: [], relationships: [] });
    }
  };

  // Async Polling Worker
  const startJobPolling = (jobId, locSpec, seq, cellCode = null) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      if (seq !== undefined && seq !== requestSeqRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        return;
      }
      try {
        const statusResp = await getJobStatus(jobId);
        setJobStatus(statusResp.status);
        setJobProgress(statusResp.progress || 0.5);
        setJobStep(statusResp.current_step || "Processing multi-sensor telemetry...");

        if (statusResp.status === "COMPLETED" || statusResp.status === "PARTIAL") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setActiveJob(null);
          setLoading(false);

          // Fetch final narrative
          const syncData = await generateNarrativeIntelligence({
            location: locSpec,
            start_date: startDate,
            end_date: endDate,
            signals: selectedSignals,
            async_mode: false
          });
          handleSuccessfulResult(syncData, selectedRegion, locationMode, seq, cellCode);
        } else if (statusResp.status === "FAILED") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setActiveJob(null);
          setLoading(false);
          if (seq === undefined || seq === requestSeqRef.current) {
            setError(statusResp.error_message || "Async background processing failed.");
            setDomainStatus("ERROR");
          }
        }
      } catch (e) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setActiveJob(null);
        setLoading(false);
        if (seq === undefined || seq === requestSeqRef.current) {
          setError("Job polling connection lost.");
          setDomainStatus("ERROR");
        }
      }
    }, 1500);
  };

  // Check Availability Handler
  const handleCheckAvailability = async () => {
    try {
      const loc = buildLocationSpec();
      const params = {
        start_date: startDate,
        end_date: endDate,
        signals: selectedSignals
      };
      if (loc.type === "point") {
        params.lat = loc.coordinates[0];
        params.lon = loc.coordinates[1];
      } else if (loc.type === "grid_cell") {
        params.cell_code = loc.cell_code;
      } else {
        params.region_code = loc.region_code;
      }
      const avail = await checkDataAvailability(params);
      setAvailabilityData(avail);
      if (avail?.status) {
        setDomainStatus(avail.status);
      }
    } catch (e) {
      setError("Availability check failed: " + e.message);
    }
  };

  // Location Selector Change Wrapper (Guarantees immediate reset)
  const handleLocationModeChange = (mode) => {
    clearAllLocationState();
    setLocationMode(mode);
  };

  const handleRegionChange = (regionCode) => {
    clearAllLocationState();
    setSelectedRegion(regionCode);
    setSelectedCell(null);
  };

  const handleCellChange = async (cellCode) => {
    setSelectedCell(cellCode);
    const target = cellCode || selectedRegion || "IN-TN-CHE";
    try {
      const [profData, baseData, anomData, relData] = await Promise.all([
        getRegionalChangeProfile(target),
        getRegionalBaselines(target),
        getRegionalAnomalies(target),
        getRegionalRelationships(target)
      ]);
      setChangeProfile(profData);
      setBaselines(baseData?.baselines || baseData);
      setAnomalies(anomData);
      setRelationships(relData);
    } catch (_) {}
  };

  const handleCoordsChange = (coords) => {
    clearAllLocationState();
    setCustomCoords(coords);
  };

  // Initial Load: Execute default Chennai pilot investigation
  useEffect(() => {
    handleRunInvestigation();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const isVerifiedData = domainStatus === "AVAILABLE" || domainStatus === "PARTIAL_DATA";
  const locationDisplayName = selectedCell || selectedRegion || `${customCoords.lat.toFixed(4)}°N, ${customCoords.lon.toFixed(4)}°E`;

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50/70">
      {/* Breadcrumb + page header */}
      <div className="border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full space-y-2">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-800 font-bold">Explore</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">{selectedCell ? `Cell ${selectedCell}` : locationMode === "point" ? "Custom point" : "Chennai Pilot"}</span>
            <span
              className={clsx(
                "ml-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold",
                domainStatus === "AVAILABLE" && "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs",
                domainStatus === "PARTIAL_DATA" && "bg-amber-50 text-amber-800 border-amber-300",
                domainStatus === "PROCESSING_REQUIRED" && "bg-sky-50 text-sky-800 border-sky-300",
                domainStatus === "DATA_UNAVAILABLE" && "bg-slate-100 text-slate-600 border-slate-300",
                domainStatus === "ERROR" && "bg-rose-50 text-rose-800 border-rose-300"
              )}
            >
              {formatStatus(domainStatus)}
            </span>
          </nav>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mt-0.5">
              Explore Regional Intelligence
            </h1>
            <p className="text-sm text-slate-600 font-sans mt-1 max-w-2xl">
              Inspect multi-sensor baselines, spatial deviations, and AI narrative briefings across the analytical grid.
            </p>
          </div>
          {/* Investigation step anchors */}
          <nav aria-label="Investigation steps" className="flex flex-wrap items-center gap-2 pt-1">
            {[
              { href: "#section-overview", num: "1", label: "Overview" },
              { href: "#section-evidence", num: "2", label: "Evidence" },
              { href: "#section-relationships", num: "3", label: "Relationships" },
              { href: "#section-summary", num: "4", label: "Summary" }
            ].map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs font-sans font-semibold text-emerald-950 hover:bg-emerald-100/80 hover:border-emerald-300 transition-all shadow-xs"
              >
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                  {s.num}
                </span>
                <span>{s.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Workstation Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Top Investigation Command Console */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Select a region
              </span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
                Choose What to Investigate
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Chennai is the verified pilot region. Unverified locations explain what is missing instead of showing data.
              </p>
            </div>
            {availabilityData && (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-mono">
                <span className="text-emerald-700 font-medium">Extent:</span>
                <strong className="text-emerald-900 font-bold">{formatStatus(availabilityData.status)}</strong>
                {availabilityData.is_verified_pilot_extent && (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">VERIFIED PILOT</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Location Selection */}
            <div className="lg:col-span-5 space-y-4">
              <LocationSelector
                locationMode={locationMode}
                setLocationMode={handleLocationModeChange}
                selectedRegion={selectedRegion}
                setSelectedRegion={handleRegionChange}
                selectedCell={selectedCell}
                setSelectedCell={handleCellChange}
                customCoords={customCoords}
                setCustomCoords={handleCoordsChange}
              />
            </div>

            {/* Right: Analysis Parameters & Execution */}
            <div className="lg:col-span-7 space-y-4">
              <AnalysisControlPanel
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedSignals={selectedSignals}
                setSelectedSignals={setSelectedSignals}
                asyncMode={asyncMode}
                setAsyncMode={setAsyncMode}
                onRunAnalysis={() => handleRunInvestigation()}
                loading={loading}
                onCheckAvailability={handleCheckAvailability}
              />
            </div>
          </div>
        </div>

        {/* Primary Investigation Surface */}
        <div className="space-y-10">
          {/* Explicit Error State */}
          {error && (
            <DataStateView status="ERROR" customMessage={error} onRetry={() => handleRunInvestigation()} />
          )}

          {/* Explicit Domain Status View for Unverified Locations (e.g. Bengaluru, London) */}
          {!isVerifiedData && domainStatus !== "LOADING" && (
            <div className="space-y-4 max-w-4xl mx-auto w-full py-6">
              <DataStateView status={domainStatus} locationName={locationDisplayName} />
              
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Strict Provenance & Location Isolation Safeguard</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 font-sans">
                  EarthPulse AI operates with a strict zero-synthetic-data policy. When an unverified region or point coordinate is selected, no analytical telemetry, anomaly metrics, or narrative interpretations from the Chennai pilot extent are leaked. To view active multi-sensor data, select <strong>Chennai Pilot (IN-TN-CHE)</strong>.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedRegion("IN-TN-CHE");
                      setSelectedCell(null);
                      setLocationMode("region");
                      handleRunInvestigation({ selectedRegion: "IN-TN-CHE", locationMode: "region", selectedCell: null });
                    }}
                  >
                    Switch to Verified Chennai Pilot Extent
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Verified Pilot Workstation View (All 8 Sections) */}
          {isVerifiedData && (
            <>
              {/* STEP 1: OVERVIEW — map, selected region, change score */}
              <div id="section-overview" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="space-y-0.5 border-l-3 border-emerald-500 pl-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                      Step 1 · Analytical Spatial Extent
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      Map & Regional Change Score
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Select a grid cell to investigate local telemetry. The composite score summarizes multi-sensor variance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge type="CALCULATED" size="xs" />
                    <button
                      type="button"
                      onClick={() => toggleSection("overview")}
                      aria-label="Toggle overview section"
                      aria-expanded={expandedSections.overview}
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border border-slate-200"
                      title="Toggle Section"
                    >
                      {expandedSections.overview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedSections.overview && (
                <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 pb-2 flex items-center justify-between">
                    <span>0.05° Analytical Spatial Grid</span>
                    <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">16 Cells · Chennai Pilot Extent</span>
                  </h3>
                  <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-white">
                    <MapContainer
                      regionId={selectedRegion}
                      selectedCell={selectedCell}
                      onSelectCell={handleCellChange}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-sans pt-2">
                    Click any cell on the grid to inspect localized physical observations. Click again to reset to regional view.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 pb-2 flex items-center justify-between">
                    <span>Multi-Sensor Composite Change Score</span>
                    <span className="text-xs font-mono font-normal text-slate-500">Scale: 0–100</span>
                  </h3>
                  <div className="space-y-3">
                    <ChangeScoreCard changeScore={selectedCell ? (changeProfile?.regional_change_score || result?.regional_change_score) : (result?.regional_change_score || changeProfile?.regional_change_score)} />
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      A 0–100 mathematical synthesis of observed variance across physical sensors. Not a disaster prediction or economic ranking.
                    </p>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-mono text-slate-700 shadow-xs">
                      <span className="text-emerald-800 font-bold">Scientific Disclosure:</span> Regional Change Score is an evidence-grounded physical metric derived from verifiable satellite and atmospheric observations.
                    </div>
                  </div>
                </div>
                </div>
                )}
              </div>

              {/* STEP 2: EVIDENCE — signals, anomalies, observation timing */}
              <div id="section-evidence" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="space-y-0.5 border-l-3 border-emerald-500 pl-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                      Step 2 · Verifiable Observations
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      Physical Sensor Evidence
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Direct physical observations, statistical z-scores, and temporal observation schedules.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge type="OBSERVED" size="xs" />
                    <button
                      type="button"
                      onClick={() => toggleSection("evidence")}
                      aria-label="Toggle sensor evidence section"
                      aria-expanded={expandedSections.evidence}
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border border-slate-200"
                      title="Toggle Section"
                    >
                      {expandedSections.evidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedSections.evidence && (
                <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 pb-2">Physical Telemetry & Baselines</h3>
                  <RegionalSignalOverview
                    baselines={baselines}
                    latestObservations={regionDetail?.profile}
                    osmSummary={regionDetail?.profile?.osm}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 pb-1 flex items-center gap-2">
                    <span>Statistical Deviation & Anomaly Detection</span>
                    <span className="text-xs font-mono font-normal text-slate-500">Temporal Z-Scores & Spatial Deviation</span>
                  </h3>
                  <RegionalAnomalySection
                    temporalAnomalies={anomalies.temporal_anomalies || changeProfile?.temporal_anomalies || []}
                    spatialAnomalies={anomalies.spatial_anomalies || changeProfile?.spatial_anomalies || []}
                    hideHeader={true}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-display font-bold text-slate-900 pb-1 flex items-center gap-2">
                    <span>Observation Schedules & Temporal Coverage</span>
                    <span className="text-xs font-mono font-normal text-slate-500">Discrete Sensor Sequences (2021–2024)</span>
                  </h3>
                  <div className="space-y-6">
                    {/* Multi-Sensor Schedule Sequences */}
                    <SentinelTimeline scenes={regionDetail?.profile?.sentinel2 || []} />
                    <ViirsBaselineTimeline viirsComposites={regionDetail?.profile?.viirs || []} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <NasaTemporalView nasaSummary={regionDetail?.profile?.nasa_power} />
                      <OsmSnapshotContext osmSummary={regionDetail?.profile?.osm} />
                    </div>

                    {/* Temporal Compatibility Matrix */}
                    <TemporalAlignmentMatrix />
                  </div>
                </div>
                </div>
              )}
              </div>

              {/* STEP 3: RELATIONSHIPS — signals changing together */}
              <div id="section-relationships" className="space-y-4 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="space-y-0.5 border-l-3 border-emerald-500 pl-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                      Step 3 · Cross-Signal Concurrence
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      Signals Changing Together
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Non-causal statistical correlation between physical signals over time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge type="CALCULATED" size="xs" />
                    <button
                      type="button"
                      onClick={() => toggleSection("relationships")}
                      aria-label="Toggle relationships section"
                      aria-expanded={expandedSections.relationships}
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border border-slate-200"
                      title="Toggle Section"
                    >
                      {expandedSections.relationships ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedSections.relationships && (
                  <div className="space-y-3">
                    <RegionalRelationships
                      patterns={relationships.patterns || changeProfile?.cross_signal_patterns || []}
                      relationships={relationships.relationships || changeProfile?.relationships || []}
                      hideHeader={true}
                    />
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs font-mono text-slate-800 flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong className="text-emerald-950 font-bold">Strict Non-Causal Disclosure:</strong> All cross-signal relationships represent statistical associations (correlation), not causal claims. Causal inferences are strictly prohibited.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: SUMMARY — grounded narrative + provenance */}
              <div id="section-summary" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="space-y-0.5 border-l-3 border-emerald-500 pl-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 tracking-wider">
                      Step 4 · Evidence Synthesis
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      Grounded AI Executive Briefing
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      A verifiable briefing strictly grounded in immutable physical observation metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
                    <button
                      type="button"
                      onClick={() => toggleSection("briefing")}
                      aria-label="Toggle summary section"
                      aria-expanded={expandedSections.briefing}
                      className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border border-slate-200"
                      title="Toggle Section"
                    >
                      {expandedSections.briefing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedSections.briefing && (
                <div className="space-y-6">
                  <GroundedNarrativePanel narrative={result?.narrative} />

                  <IntelligenceUsedPanel moe={result?.moe} />

                  <div>
                    <h3 className="text-sm font-sans font-semibold text-slate-900 pb-2">Where the data comes from</h3>

                  <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-6 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-display font-bold text-slate-900 uppercase tracking-wide text-xs">
                        Provenance Taxonomy & Governance
                      </span>
                      <ProvenanceBadge type="CALCULATED" size="xs" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-sky-50/60 border border-sky-200/80 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-sky-900">
                          <ProvenanceBadge type="OBSERVED" size="xs" />
                        </div>
                        <p className="text-slate-600 font-sans leading-relaxed text-xs">
                          Direct physical sensor telemetry from official sources (NASA POWER 1,461 daily meteorological records). Zero manipulation.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                          <ProvenanceBadge type="CALCULATED" size="xs" />
                        </div>
                        <p className="text-slate-600 font-sans leading-relaxed text-xs">
                          Derived mathematical metrics (Sentinel-2 NDVI/NDBI, VIIRS April radiance baselines, Z-scores, Robust MAD, Regional Change Score).
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
                        </div>
                        <p className="text-slate-600 font-sans leading-relaxed text-xs">
                          Structured factual briefings synthesized strictly from immutable EvidencePackage items with explicit citations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Async Polling Modal */}
      {activeJob && (
        <AsyncProgressModal
          jobId={activeJob}
          jobStatus={jobStatus}
          progress={jobProgress}
          currentStep={jobStep}
          onCancel={() => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setActiveJob(null);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
