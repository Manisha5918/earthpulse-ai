/**
 * EarthPulse AI — Scientific Tabs Primitive (Light Theme)
 */

import React from "react";
import clsx from "clsx";

export function Tabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div className={clsx("flex border-b border-slate-200 gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-3.5 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 select-none",
              isActive
                ? "border-sky-700 text-sky-900 bg-sky-50 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5 flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono border border-slate-200">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
