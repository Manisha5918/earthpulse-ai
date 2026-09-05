"use client";

/**
 * EarthPulse AI — Timeline: Temporal Investigation Console (Phase E4)
 * Multi-sensor observation schedules, multi-temporal optical scenes, annual baselines, and daily meteorology.
 * Zero synthetic analytical measurements.
 */

import React, { useState, useEffect } from "react";
import { TimelineHeader } from "../../components/timeline/TimelineHeader";
import { TemporalCoverage } from "../../components/timeline/TemporalCoverage";
import { SentinelTimeline } from "../../components/timeline/SentinelTimeline";
import { ViirsBaselineTimeline } from "../../components/timeline/ViirsBaselineTimeline";
import { NasaTemporalView } from "../../components/timeline/NasaTemporalView";
import { OsmSnapshotContext } from "../../components/timeline/OsmSnapshotContext";
import { TemporalAlignmentMatrix } from "../../components/timeline/TemporalAlignmentMatrix";
import { DataStateView } from "../../components/common/DataStateView";

import { getRegionDetail } from "../../lib/api/regions";
import { getRegionalAnomalies, getRegionalRelationships } from "../../lib/api/intelligence";
import { Loader2 } from "lucide-react";

export default function TimelinePage() {
  const [selectedTarget, setSelectedTarget] = useState("IN-TN-CHE");
  const [loading, setLoading] = useState(false);
  const [regionDetail, setRegionDetail] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (selectedTarget === "IN-TN-CHE") {
        setLoading(true);
        setError(null);
        try {
          const [detailData, anomData] = await Promise.all([
            getRegionDetail("IN-TN-CHE"),
            getRegionalAnomalies("IN-TN-CHE")
          ]);
          setRegionDetail(detailData);
          setAnomalies(anomData.temporal_anomalies || []);
        } catch (e) {
          setError(e.message || "Failed to load temporal telemetry.");
        } finally {
          setLoading(false);
        }
      } else {
        setRegionDetail(null);
        setAnomalies([]);
      }
    }
    loadData();
  }, [selectedTarget]);

  const status = selectedTarget === "IN-TN-CHE" ? "AVAILABLE" : selectedTarget === "BLR_TEST" ? "PROCESSING_REQUIRED" : "DATA_UNAVAILABLE";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header */}
      <TimelineHeader
        selectedTarget={selectedTarget}
        onSelectTarget={setSelectedTarget}
        status={status}
      />

      {/* Explicit Unverified States */}
      {status !== "AVAILABLE" && (
        <DataStateView
          status={status}
          locationName={selectedTarget === "BLR_TEST" ? "Bengaluru (Karnataka, India)" : "London (United Kingdom)"}
        />
      )}

      {/* Verified Chennai Temporal Console */}
      {status === "AVAILABLE" && (
        <>
          {/* 2. Temporal Coverage Overview */}
          <TemporalCoverage />

          {/* 3. Sensor Timelines */}
          <div className="space-y-6">
            {/* Sentinel-2 4 Scenes */}
            <SentinelTimeline scenes={regionDetail?.profile?.sentinel2 || []} />

            {/* VIIRS April Annual Baselines */}
            <ViirsBaselineTimeline viirsComposites={regionDetail?.profile?.viirs || []} />

            {/* NASA POWER Daily Meteorology */}
            <NasaTemporalView nasaSummary={regionDetail?.profile?.nasa_power} />

            {/* Cross-Signal Temporal Alignment Matrix */}
            <TemporalAlignmentMatrix />

            {/* OSM Static Spatial Context Snapshot */}
            <OsmSnapshotContext osmSummary={regionDetail?.profile?.osm} />
          </div>
        </>
      )}
    </div>
  );
}
