'use client';

import React from "react";

export default function MultiSignalChart({ signals = [] }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-4">
      <div className="text-xs font-mono uppercase text-slate-400 mb-3">Multi-Signal Overlay Matrix</div>
      <div className="w-full h-48 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-border-subtle rounded">
        Multi-signal normalization requires at least 2 populated observation feeds.
      </div>
    </div>
  );
}
