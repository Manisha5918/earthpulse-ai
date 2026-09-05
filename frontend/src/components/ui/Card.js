/**
 * EarthPulse AI — Card Primitive (Modern Scientific Editorial)
 * Clean white cards with hairline slate borders and soft natural elevations.
 */

import React from "react";
import clsx from "clsx";

export function Card({ children, className = "", hoverable = false, shadow = true, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white border border-slate-200/80 rounded-xl overflow-hidden transition-all duration-200",
        shadow && "shadow-sm",
        hoverable && "hover:shadow-md hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", dashed = false, ...props }) {
  return (
    <div
      className={clsx(
        "px-5 py-4 flex items-center justify-between bg-white",
        dashed ? "border-b border-dashed border-slate-200" : "border-b border-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={clsx("text-sm font-display font-bold text-slate-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={clsx("p-5", className)} {...props}>
      {children}
    </div>
  );
}
