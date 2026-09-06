"use client";

/**
 * EarthPulse AI — Compare: Comparative Regional Intelligence (Phase E2)
 * Side-by-side evidence, baselines, and anomaly comparison.
 * Strict Location Isolation: Zero synthetic analytical data.
 */

import React, { useState, useEffect } from "react";
import { CompareLocationSelector } from "../../components/compare/CompareLocationSelector";
import { CompareHeader } from "../../components/compare/CompareHeader";
import { CompareScoreComparison } from "../../components/compare/CompareScoreComparison";
import { CompareSignalMatrix } from "../../components/compare/CompareSignalMatrix";
import { CompareAnomalyMatrix } from "../../components/compare/CompareAnomalyMatrix";
import { CompareRelationships } from "../../components/compare/CompareRelationships";
import { CompareEvidenceQuality } from "../../components/compare/CompareEvidenceQuality";
import { DataStateView } from "../../components/common/DataStateView";

import { getRegionalChangeProfile, getRegionalBaselines, getRegionalAnomalies, getRegionalRelationships } from "../../lib/api/intelligence";
import { getRegionDetail } from "../../lib/api/regions";
import { Loader2, Info, AlertTriangle, ArrowRight } from "lucide-react";

export default function ComparePage() {
  const [targetA, setTargetA] = useState("IN-TN-CHE");
  const [targetB, setTargetB] = useState("BLR_TEST");

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const [profileA, setProfileA] = useState(null);
  const [baselinesA, setBaselinesA] = useState(null);
  const [detailA, setDetailA] = useState(null);
  const [anomaliesA, setAnomaliesA] = useState([]);
  const [relationshipsA, setRelationshipsA] = useState([]);

  const [profileB, setProfileB] = useState(null);
  const [baselinesB, setBaselinesB] = useState(null);
  const [detailB, setDetailB] = useState(null);
  const [anomaliesB, setAnomaliesB] = useState([]);
  const [relationshipsB, setRelationshipsB] = useState([]);

  // Load Target A Data
  useEffect(() => {
    async function loadDataA() {
      const isTargetAVerified = targetA === "IN-TN-CHE" || targetA.startsWith("CHE_G");
      if (isTargetAVerified) {
        setLoadingA(true);
        try {
          const [prof, base, anom, rel, det] = await Promise.all([
            getRegionalChangeProfile(targetA),
            getRegionalBaselines(targetA),
            getRegionalAnomalies(targetA),
            getRegionalRelationships(targetA),
            getRegionDetail(targetA)
          ]);
          setProfileA(prof);
          setBaselinesA(base);
          setDetailA(det);
          setAnomaliesA(anom.temporal_anomalies || []);
          setRelationshipsA(rel.relationships || []);
        } catch (e) {
          // Graceful handling
        } finally {
          setLoadingA(false);
        }
      } else {
        setProfileA(null);
        setBaselinesA(null);
        setDetailA(null);
        setAnomaliesA([]);
        setRelationshipsA([]);
      }
    }
    loadDataA();
  }, [targetA]);

  // Load Target B Data
  useEffect(() => {
    async function loadDataB() {
      const isTargetBVerified = targetB === "IN-TN-CHE" || targetB.startsWith("CHE_G");
      if (isTargetBVerified) {
        setLoadingB(true);
        try {
          const [prof, base, anom, rel, det] = await Promise.all([
            getRegionalChangeProfile(targetB),
            getRegionalBaselines(targetB),
            getRegionalAnomalies(targetB),
            getRegionalRelationships(targetB),
            getRegionDetail(targetB)
          ]);
          setProfileB(prof);
          setBaselinesB(base);
          setDetailB(det);
          setAnomaliesB(anom.temporal_anomalies || []);
          setRelationshipsB(rel.relationships || []);
        } catch (e) {
          // Graceful handling
        } finally {
          setLoadingB(false);
        }
      } else {
        setProfileB(null);
        setBaselinesB(null);
        setDetailB(null);
        setAnomaliesB([]);
        setRelationshipsB([]);
      }
    }
    loadDataB();
  }, [targetB]);

  const isVerifiedA = targetA === "IN-TN-CHE" || targetA.startsWith("CHE_G");
  const isVerifiedB = targetB === "IN-TN-CHE" || targetB.startsWith("CHE_G");

  const statusA = isVerifiedA ? "AVAILABLE" : targetA === "BLR_TEST" ? "PROCESSING_REQUIRED" : "DATA_UNAVAILABLE";
  const statusB = isVerifiedB ? "AVAILABLE" : targetB === "BLR_TEST" ? "PROCESSING_REQUIRED" : "DATA_UNAVAILABLE";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header */}
      <CompareHeader
        targetA={targetA}
        statusA={statusA}
        targetB={targetB}
        statusB={statusB}
      />

      {/* 2. Location Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompareLocationSelector
          label="Location A (Baseline)"
          selectedTarget={targetA}
          onSelectTarget={setTargetA}
        />
        <CompareLocationSelector
          label="Location B (Comparison Target)"
          selectedTarget={targetB}
          onSelectTarget={setTargetB}
        />
      </div>

      {/* 3. Transparent Regional Context & Ingestion Reason Banner */}
      {!isVerifiedB && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/90 to-emerald-50/50 border-2 border-amber-300/70 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-amber-900 font-sans font-bold text-sm">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Why is {targetB === "BLR_TEST" ? "Bengaluru (BLR_TEST)" : targetB} showing "Processing Required" or "Not Available"?</span>
          </div>
          <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-2 pl-7">
            <p>
              <strong>Zero-Synthetic Data Policy:</strong> EarthPulse AI never fabricates or hallucinates satellite sensor measurements or AI interpretations. The production multi-sensor data pipeline is currently active and verified for the <strong>Chennai Metropolitan Area (IN-TN-CHE)</strong> and its 16 0.05° analytical grid cells.
            </p>
            <p>
              {targetB === "BLR_TEST" ? (
                <span>
                  <strong>Bengaluru Urban</strong> is registered as an upcoming expansion target. Ingestion of its multi-temporal Sentinel-2 optical scenes (MGRS tile 43PGP), NOAA VIIRS nighttime lights, and NASA POWER meteorology has not yet been executed. Therefore, it truthfully reports <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">PROCESSING_REQUIRED</code> instead of fabricating fake data.
                </span>
              ) : (
                <span>
                  This target is outside the active verified pilot extent. Ingestion and calibration pipelines are required before analytical scoring can take place.
                </span>
              )}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-600 font-medium">Want to see live side-by-side delta scores now?</span>
              <button
                type="button"
                onClick={() => setTargetB("CHE_G005")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold shadow-xs transition-colors"
              >
                Compare with Chennai Urban Core (CHE_G005)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTargetB("CHE_G001")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-sans text-xs font-semibold transition-colors"
              >
                Compare with Coastal Cell (CHE_G001)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Regional Change Score Comparison */}
      <CompareScoreComparison
        scoreA={profileA?.regional_change_score}
        scoreB={profileB?.regional_change_score}
        targetA={targetA}
        targetB={targetB}
      />

      {/* 5. Signal-by-Signal Physical Matrix */}
      <CompareSignalMatrix
        targetA={targetA}
        targetB={targetB}
        baselinesA={baselinesA}
        baselinesB={baselinesB}
        osmA={detailA?.profile?.osm || null}
        osmB={detailB?.profile?.osm || null}
      />

      {/* 6. Statistical Anomaly Matrix */}
      <CompareAnomalyMatrix
        targetA={targetA}
        targetB={targetB}
        anomaliesA={anomaliesA}
        anomaliesB={anomaliesB}
        hasB={isVerifiedB}
      />

      {/* 7. Cross-Signal Agreement Comparison */}
      <CompareRelationships
        targetA={targetA}
        targetB={targetB}
        relationshipsA={relationshipsA}
        relationshipsB={relationshipsB}
        hasB={isVerifiedB}
      />

      {/* 8. Evidence Quality & Coverage */}
      <CompareEvidenceQuality
        targetA={targetA}
        targetB={targetB}
        hasA={isVerifiedA && !!baselinesA}
        hasB={isVerifiedB && !!baselinesB}
      />
    </div>
  );
}
