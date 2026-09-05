"use client";

/**
 * EarthPulse AI — Backend Health & Connection Monitor
 * Clean pill indicator with soft natural shadow and status beacon.
 */

import React, { useState, useEffect } from "react";
import { getBackendHealth } from "../../lib/api/health";
import { Activity, XCircle } from "lucide-react";

export function HealthBadge() {
  const [health, setHealth] = useState({ status: "checking", data: null });

  useEffect(() => {
    let isMounted = true;

    async function check() {
      try {
        const data = await getBackendHealth();
        if (isMounted) {
          setHealth({ status: "healthy", data });
        }
      } catch (err) {
        if (isMounted) {
          setHealth({ status: "disconnected", data: null });
        }
      }
    }

    check();
    const interval = setInterval(check, 30000); // 30s heartbeat
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (health.status === "healthy") {
    return (
      <div
        title={`Backend API Connected: ${health.data?.service || "EarthPulse AI"} (${health.data?.version || "1.0.0"}) — Pilot: ${health.data?.pilot_region || "Chennai"}`}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-mono font-medium shadow-sm select-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="hidden sm:inline">Live</span>
        <span className="sm:hidden">Live</span>
      </div>
    );
  }

  if (health.status === "disconnected") {
    return (
      <div
        title="Unable to connect to FastAPI backend on http://localhost:8000"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-mono font-medium shadow-sm select-none"
      >
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Offline</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono font-medium select-none">
      <Activity className="w-3.5 h-3.5 animate-spin text-slate-500" />
      <span>Connecting…</span>
    </div>
  );
}
