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
import { Loader2 } from "lucide-react";

export default function ComparePage() {
  const [targetA, setTargetA] = useState("IN-TN-CHE");
  const [targetB, setTargetB] = useState("BLR_TEST");

  const [loading, setLoading] = useState(false);
  const [profileA, setProfileA] = useState(null);
  const [baselinesA, setBaselinesA] = useState(null);
  const [detailA, setDetailA] = useState(null);
  const [anomaliesA, setAnomaliesA] = useState([]);
  const [relationshipsA, setRelationshipsA] = useState([]);

  useEffect(() => {
    async function loadDataA() {
      if (targetA === "IN-TN-CHE") {
        setLoading(true);
        try {
          const [prof, base, anom, rel, det] = await Promise.all([
            getRegionalChangeProfile("IN-TN-CHE"),
            getRegionalBaselines("IN-TN-CHE"),
            getRegionalAnomalies("IN-TN-CHE"),
            getRegionalRelationships("IN-TN-CHE"),
            getRegionDetail("IN-TN-CHE")
          ]);
          setProfileA(prof);
          setBaselinesA(base);
          setDetailA(det);
          setAnomaliesA(anom.temporal_anomalies || []);
          setRelationshipsA(rel.relationships || []);
        } catch (e) {
          // Graceful handling
        } finally {
          setLoading(false);
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

  const statusA = targetA === "IN-TN-CHE" ? "AVAILABLE" : targetA === "BLR_TEST" ? "PROCESSING_REQUIRED" : "DATA_UNAVAILABLE";
  const statusB = targetB === "IN-TN-CHE" ? "AVAILABLE" : targetB === "BLR_TEST" ? "PROCESSING_REQUIRED" : "DATA_UNAVAILABLE";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompareLocationSelector
          label="Location A"
          selectedTarget={targetA}
          onSelectTarget={setTargetA}
        />
        <CompareLocationSelector
          label="Location B"
          selectedTarget={targetB}
          onSelectTarget={setTargetB}
        />
      </div>

      {/* 3. No-data notice when neither side is ingested */}
      {!baselinesA && targetB !== "IN-TN-CHE" && (
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-xs font-sans text-slate-600 leading-relaxed">
          No data ingested for the selected locations yet. Matrices below show available values only — unverified locations never borrow Chennai values.
        </div>
      )}

      {/* 3. Regional Change Score Comparison */}
      <CompareScoreComparison
        scoreA={profileA?.regional_change_score}
        scoreB={null}
        targetA={targetA}
        targetB={targetB}
      />

      {/* 4. Signal-by-Signal Physical Matrix */}
      <CompareSignalMatrix
        targetA={targetA}
        targetB={targetB}
        baselinesA={baselinesA}
        baselinesB={null}
        osmA={detailA?.profile?.osm || null}
      />

      {/* 5. Statistical Anomaly Matrix */}
      <CompareAnomalyMatrix
        targetA={targetA}
        targetB={targetB}
        anomaliesA={anomaliesA}
        anomaliesB={[]}
      />

      {/* 6. Cross-Signal Agreement Comparison */}
      <CompareRelationships
        targetA={targetA}
        targetB={targetB}
        relationshipsA={relationshipsA}
        relationshipsB={[]}
      />

      {/* 7. Evidence Quality & Coverage */}
      <CompareEvidenceQuality targetA={targetA} targetB={targetB} hasA={!!baselinesA} />
    </div>
  );
}
