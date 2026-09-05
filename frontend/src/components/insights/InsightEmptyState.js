"use client";

/**
 * EarthPulse AI — Insight Feed Empty State Handler (Editorial Style)
 */

import React from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/Button";

export function InsightEmptyState({ onResetFilters }) {
  return (
    <div className="p-8 sm:p-12 rounded-xl bg-white border-[1.5px] border-slate-900 shadow-offset text-center space-y-4 font-mono text-xs">
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-900/30 flex items-center justify-center mx-auto text-slate-900">
        <Search className="w-5 h-5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-bold text-slate-900">No Findings Match Filter Criteria</h3>
        <p className="text-xs text-slate-600 font-sans max-w-md mx-auto leading-relaxed">
          No findings match the current category and severity filters. The feed surfaces verified evidence from the Chennai pilot extent.
        </p>
      </div>
      {onResetFilters && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onResetFilters}
          className="font-mono text-xs"
        >
          RESET ALL FILTERS ↗
        </Button>
      )}
    </div>
  );
}

