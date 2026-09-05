"use client";

/**
 * EarthPulse AI — Settings: Configuration & Engine Telemetry (Modern Scientific Editorial)
 */

import React, { useState, useEffect } from "react";
import { ProvenanceBadge } from "../../components/common/ProvenanceBadge";
import { HealthBadge } from "../../components/common/HealthBadge";
import { getBackendHealth } from "../../lib/api/health";
import { getRegions } from "../../lib/api/regions";
import { PILOT_REGION } from "../../lib/constants";
import {
  Sliders,
  Server,
  Lock,
  RefreshCw,
  Cpu,
  Layers
} from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function SettingsPage() {
  const [healthData, setHealthData] = useState(null);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const [h, r] = await Promise.all([getBackendHealth(), getRegions()]);
      setHealthData(h);
      setRegions(r);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      setHealthData({ status: "UNAVAILABLE", error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>System Console & Telemetry Registry</span>
          </div>
          <span>Engine: FastAPI / Async Core</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h1 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 tracking-tight">
                System Configuration & Engine Telemetry
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-sans">
              Runtime environment parameters, intelligence versioning, deterministic cache keys, and pilot extent telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <HealthBadge />
            <Button size="xs" variant="secondary" onClick={fetchHealth} disabled={loading} className="gap-1.5 font-sans text-xs">
              <RefreshCw className={`w-3 h-3 text-slate-600 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Backend Connection & Runtime */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-sans font-semibold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Backend API Environment</span>
            </span>
            <ProvenanceBadge type="CALCULATED" size="xs" />
          </div>

          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">API BASE URL:</span>
              <span className="text-slate-900 font-bold">{process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">HEALTH STATUS:</span>
              <span className={healthData?.status === "healthy" || healthData?.status === "ok" ? "text-emerald-800 font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px]" : "text-amber-800 font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px]"}>
                {healthData?.status?.toUpperCase() || "CHECKING..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">FRAMEWORK:</span>
              <span className="text-slate-700 font-medium">FastAPI / Python (Async Core)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">LAST HEARTBEAT:</span>
              <span className="text-slate-500">{lastChecked || "Just now"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Intelligence Engine & Cache Versioning */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-sans font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Intelligence Versioning & Cache</span>
            </span>
            <ProvenanceBadge type="CALCULATED" size="xs" />
          </div>

          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">INTELLIGENCE VERSION:</span>
              <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">phase6-v1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">CACHE IDENTITY:</span>
              <span className="text-slate-700 font-medium">SHA-256 Composite Key</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">KEY PARAMETERS:</span>
              <span className="text-slate-500 truncate max-w-[200px]">source:product:location:dates:ver</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">GROUNDING VALIDATOR:</span>
              <span className="text-emerald-800 font-bold">STRICT CLAIM-LEVEL</span>
            </div>
          </div>
        </div>

        {/* Section 3: Pilot Extent & Analytical Grid */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-sans font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Analytical Grid Specifications</span>
            </span>
            <ProvenanceBadge type="CALCULATED" size="xs" />
          </div>

          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">PILOT REGION:</span>
              <span className="text-slate-900 font-bold">{PILOT_REGION.name} ({PILOT_REGION.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">BOUNDING BOX:</span>
              <span className="text-slate-700 font-mono">[12.90, 80.15, 13.10, 80.35]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">GRID RESOLUTION:</span>
              <span className="text-slate-700 font-medium">0.05° (~5.5 km cell)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">INGESTED CELLS:</span>
              <span className="text-emerald-800 font-bold">16 / 16 Cells (100%)</span>
            </div>
          </div>
        </div>

        {/* Section 4: Data Governance & Integrity */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-sans font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Data Governance Safeguards</span>
            </span>
            <ProvenanceBadge type="OBSERVED" size="xs" />
          </div>

          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">SYNTHETIC INGESTION:</span>
              <span className="text-rose-700 font-bold">PROHIBITED (0% Synthetic)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">CAUSAL CLAIMS:</span>
              <span className="text-amber-800 font-bold">REJECTED (Non-Causal)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">SAMPLE SIZE GATING:</span>
              <span className="text-slate-700 font-medium">N ≥ 3 Required for Baselines</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">PROVENANCE TRACKING:</span>
              <span className="text-emerald-800 font-bold">END-TO-END AUDITABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
