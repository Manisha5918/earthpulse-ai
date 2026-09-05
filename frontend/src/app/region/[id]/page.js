"use client";

/**
 * EarthPulse AI — Regional Intelligence Profile Page (Phase E1)
 * "What is happening in this region, how unusual is it, do independent signals agree,
 * and what evidence supports that interpretation?"
 */

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RegionHeader } from "../../../components/region/RegionHeader";
import { ChangeScoreCard } from "../../../components/investigation/ChangeScoreCard";
import { RegionalSignalOverview } from "../../../components/region/RegionalSignalOverview";
import { RegionalAnomalySection } from "../../../components/region/RegionalAnomalySection";
import { RegionalRelationships } from "../../../components/region/RegionalRelationships";
import { EvidenceStrength } from "../../../components/region/EvidenceStrength";
import { GroundedNarrativePanel } from "../../../components/investigation/GroundedNarrativePanel";
import { DataStateView } from "../../../components/common/DataStateView";
import { ProvenanceBadge } from "../../../components/common/ProvenanceBadge";

import { getRegionDetail } from "../../../lib/api/regions";
import { getRegionalChangeProfile, getRegionalBaselines, getRegionalAnomalies, getRegionalRelationships, generateNarrativeIntelligence } from "../../../lib/api/intelligence";
import { Loader2 } from "lucide-react";

export default function RegionProfilePage() {
  const params = useParams();
  const regionId = params?.id ? decodeURIComponent(params.id) : "IN-TN-CHE";

  const [loading, setLoading] = useState(true);
  const [regionDetail, setRegionDetail] = useState(null);
  const [changeProfile, setChangeProfile] = useState(null);
  const [baselines, setBaselines] = useState({});
  const [anomalies, setAnomalies] = useState({ temporal_anomalies: [], spatial_anomalies: [] });
  const [relationships, setRelationships] = useState({ patterns: [], relationships: [] });
  const [narrativeData, setNarrativeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [regData, profData, baseData, anomData, relData, narResp] = await Promise.all([
          getRegionDetail(regionId),
          getRegionalChangeProfile(regionId),
          getRegionalBaselines(regionId),
          getRegionalAnomalies(regionId),
          getRegionalRelationships(regionId),
          generateNarrativeIntelligence({
            location: { type: "region", region_code: regionId },
            start_date: "2021-01-01",
            end_date: "2024-12-31",
            async_mode: false
          })
        ]);

        setRegionDetail(regData);
        setChangeProfile(profData);
        setBaselines(baseData);
        setAnomalies(anomData);
        setRelationships(relData);
        setNarrativeData(narResp);
      } catch (err) {
        setError(err.message || "Failed to load regional intelligence profile.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [regionId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        <div className="text-xs font-mono uppercase tracking-widest text-slate-600">
          Compiling Regional Intelligence Dossier: {regionId}...
        </div>
      </div>
    );
  }

  // Handle unverified locations (e.g. Bengaluru -> PROCESSING_REQUIRED, London -> DATA_UNAVAILABLE)
  if (narrativeData && narrativeData.status !== "AVAILABLE" && narrativeData.status !== "PARTIAL_DATA") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <RegionHeader regionDetail={regionDetail} regionId={regionId} />
        <DataStateView status={narrativeData.status} locationName={regionId} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <RegionHeader regionDetail={regionDetail} regionId={regionId} />
        <DataStateView status="ERROR" customMessage={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Region Header */}
      <RegionHeader regionDetail={regionDetail} regionId={regionId} />

      {/* 2. Regional Change Score Hero */}
      {changeProfile?.regional_change_score && (
        <ChangeScoreCard changeScore={changeProfile.regional_change_score} />
      )}

      {/* 3. What Changed? — Multi-Sensor Observational Telemetry */}
      <RegionalSignalOverview
        baselines={baselines}
        latestObservations={regionDetail?.profile}
        osmSummary={regionDetail?.profile?.osm}
      />

      {/* 4. Is it Unusual? — Statistical Anomaly Telemetry */}
      <RegionalAnomalySection
        temporalAnomalies={anomalies.temporal_anomalies || changeProfile?.temporal_anomalies || []}
        spatialAnomalies={anomalies.spatial_anomalies || changeProfile?.spatial_anomalies || []}
      />

      {/* 5. Do Signals Agree? — Cross-Signal Concurrence & Non-Causal Relationships */}
      <RegionalRelationships
        patterns={relationships.patterns || changeProfile?.cross_signal_patterns || []}
        relationships={relationships.relationships || changeProfile?.relationships || []}
      />

      {/* 6. Evidence Quality & Sample Size Disclosures */}
      <EvidenceStrength
        dailyCount={baselines?.temperature_2m?.observation_count ?? null}
        osmRoadsKm={regionDetail?.profile?.osm?.total_road_length_km ?? null}
        osmBuildings={regionDetail?.profile?.osm?.mapped_building_count ?? null}
        sceneCount={Array.isArray(regionDetail?.profile?.sentinel2) ? regionDetail.profile.sentinel2.length : null}
      />

      {/* 7. Grounded Narrative Intelligence Briefing */}
      {narrativeData?.narrative && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-900/20">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-50 text-xs font-mono font-bold flex items-center justify-center">
                04
              </span>
              <h2 className="text-sm font-mono uppercase tracking-widest font-bold text-slate-900">
                Grounded briefing
              </h2>
            </div>
            <ProvenanceBadge type="AI_INTERPRETED" size="xs" />
          </div>
          <GroundedNarrativePanel narrative={narrativeData.narrative} />
        </div>
      )}
    </div>
  );
}
