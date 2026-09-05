"use client";

/**
 * EarthPulse AI — Insights: Regional Intelligence Feed (Phase E3)
 * Surfaces strongest evidence-backed findings from processed pilot regions.
 * Zero synthetic analytical measurements.
 */

import React, { useState, useEffect } from "react";
import { IntelligenceHeader } from "../../components/insights/IntelligenceHeader";
import { InsightCoverage } from "../../components/insights/InsightCoverage";
import { InsightFilters } from "../../components/insights/InsightFilters";
import { InsightFindingCard } from "../../components/insights/InsightFindingCard";
import { InsightEmptyState } from "../../components/insights/InsightEmptyState";
import { DataStateView } from "../../components/common/DataStateView";

import { getRegionalAnomalies, getRegionalRelationships, generateNarrativeIntelligence } from "../../lib/api/intelligence";
import { Loader2 } from "lucide-react";

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);
  const [citations, setCitations] = useState({});
  const [error, setError] = useState(null);

  // Filters State
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSeverity, setActiveSeverity] = useState("ALL");

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const [anomData, relData, narData] = await Promise.all([
          getRegionalAnomalies("IN-TN-CHE"),
          getRegionalRelationships("IN-TN-CHE"),
          generateNarrativeIntelligence({
            location: { type: "region", region_code: "IN-TN-CHE" },
            start_date: "2021-01-01",
            end_date: "2024-12-31",
            async_mode: false
          })
        ]);

        const items = [];

        // 1. Grounded Findings from Narrative Intelligence
        if (narData?.narrative?.key_findings) {
          narData.narrative.key_findings.forEach((kf) => {
            items.push({
              id: kf.finding_id,
              region_code: "IN-TN-CHE",
              region_name: "Chennai Metropolitan Area",
              category: "GROUNDED_FINDING",
              title: kf.statement,
              confidence: kf.confidence,
              evidence_ids: kf.evidence_ids,
              severity: "NORMAL",
              provenance: "AI_INTERPRETED"
            });
          });
        }

        // 2. Temporal Baseline Anomalies
        if (anomData?.temporal_anomalies) {
          anomData.temporal_anomalies.forEach((ta) => {
            items.push({
              id: `TEMP_${ta.signal}`,
              region_code: "IN-TN-CHE",
              region_name: "Chennai Metropolitan Area",
              category: "TEMPORAL_ANOMALY",
              title: `Historical baseline anomaly recorded for ${ta.signal.toUpperCase()} (Observed: ${ta.observed_value}, Baseline Mean: ${ta.baseline_mean?.toFixed(4) || "N/A"}).`,
              z_score: ta.z_score,
              severity: ta.severity || "NORMAL",
              temporal_semantics: ta.signal === "viirs_radiance" ? "ANNUAL_BASELINE" : "MULTI-TEMPORAL SCENES",
              confidence: ta.confidence || "LIMITED",
              provenance: ta.provenance || "CALCULATED"
            });
          });
        }

        // 3. Top Spatial Regional Deviations
        if (anomData?.spatial_anomalies) {
          const outliers = anomData.spatial_anomalies.filter((s) => s.is_spatial_outlier || Math.abs(s.spatial_z_score || 0) > 1.2);
          outliers.slice(0, 4).forEach((spat) => {
            items.push({
              id: `SPAT_${spat.cell_code}_${spat.signal}`,
              region_code: "IN-TN-CHE",
              region_name: "Chennai Metropolitan Area",
              category: "SPATIAL_DEVIATION",
              title: `Spatial deviation detected in cell ${spat.cell_code} for ${spat.signal} (Value: ${spat.cell_value?.toFixed(4)}, Regional Mean: ${spat.regional_mean?.toFixed(4)}).`,
              z_score: spat.spatial_z_score,
              severity: "MEDIUM",
              temporal_semantics: "GRID DISTRIBUTION",
              confidence: "LIMITED",
              provenance: "CALCULATED"
            });
          });
        }

        // 4. Exploratory Correlation Relationships
        if (relData?.relationships) {
          relData.relationships.forEach((rel) => {
            items.push({
              id: `REL_${rel.primary_signal}_${rel.secondary_signal}`,
              region_code: "IN-TN-CHE",
              region_name: "Chennai Metropolitan Area",
              category: "EXPLORATORY_CORRELATION",
              title: `Exploratory spatial correlation between ${rel.primary_signal} and ${rel.secondary_signal} across 16 analytical grid cells.`,
              correlation: rel.correlation_coefficient,
              p_value: rel.p_value,
              sample_size: rel.sample_size,
              relationship_type: rel.relationship_type,
              causal_claim: rel.causal_claim,
              severity: "NORMAL",
              confidence: rel.confidence || "HIGH",
              provenance: rel.provenance || "CALCULATED"
            });
          });
        }

        setFeedItems(items);
        setCitations(narData?.narrative?.evidence_citations || {});
      } catch (err) {
        setError(err.message || "Failed to load intelligence feed.");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  // Filter items deterministically
  const filteredItems = feedItems.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
    if (activeSeverity !== "ALL" && (item.severity || "").toUpperCase() !== activeSeverity) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header */}
      <IntelligenceHeader totalFindings={feedItems.length} processedRegions={1} />

      {/* 2. Coverage Limitation Disclosure */}
      <InsightCoverage />

      {/* 3. Filter Controls */}
      <InsightFilters
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeSeverity={activeSeverity}
        setActiveSeverity={setActiveSeverity}
      />

      {/* 4. Loading / Error / Feed List */}
      {loading ? (
        <div className="p-16 text-center space-y-3 font-mono text-xs text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mx-auto" />
          <div className="uppercase tracking-wider text-[11px]">Aggregating multi-sensor telemetry findings...</div>
        </div>
      ) : error ? (
        <DataStateView status="ERROR" customMessage={error} />
      ) : filteredItems.length === 0 ? (
        <InsightEmptyState onResetFilters={() => { setActiveCategory("ALL"); setActiveSeverity("ALL"); }} />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <InsightFindingCard
              key={item.id}
              finding={item}
              citations={citations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
