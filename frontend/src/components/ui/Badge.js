/**
 * EarthPulse AI — Badge Primitive (Modern Scientific Editorial)
 * Clean rounded tags with soft tints and subtle borders.
 */

import React from "react";
import clsx from "clsx";

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center font-mono font-medium rounded-full border tracking-wider uppercase transition-colors select-none";

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    dark: "bg-slate-900 text-white border-slate-900",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    insufficient: "bg-rose-50 text-rose-700 border-rose-200",
    processing: "bg-sky-50 text-sky-700 border-sky-200",
    unavailable: "bg-slate-100 text-slate-500 border-slate-200",
    teal: "bg-sky-50 text-sky-700 border-sky-200",
    yellow: "bg-amber-50 text-amber-800 border-amber-200",
    outline: "bg-white text-slate-700 border-slate-300 shadow-xs"
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[10px] leading-tight",
    sm: "px-2.5 py-0.5 text-[11px] leading-snug",
    md: "px-3 py-1 text-xs"
  };

  return (
    <span className={clsx(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.sm, className)} {...props}>
      {children}
    </span>
  );
}
