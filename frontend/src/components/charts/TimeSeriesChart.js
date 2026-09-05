'use client';

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function TimeSeriesChart({ data = [], signalName = "Signal", color = "#10B981", unit = "" }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-xs font-mono text-slate-500 bg-surface/40 border border-border-subtle rounded">
        Awaiting time-series observations
      </div>
    );
  }

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10, fill: "#64748B" }} />
          <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: "#64748B" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111622", borderColor: "#1E293B", fontSize: 11 }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
