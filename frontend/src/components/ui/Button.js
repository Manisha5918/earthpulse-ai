/**
 * EarthPulse AI — Button Primitive (Modern Scientific Editorial)
 * Sleek modern buttons with subtle borders and soft shadows.
 */

import React from "react";
import clsx from "clsx";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:translate-y-px",
    black: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:translate-y-px",
    secondary: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm active:translate-y-px",
    outline: "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 active:translate-y-0",
    teal: "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow active:translate-y-px",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:translate-y-px"
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs min-h-[28px] gap-1",
    sm: "px-3 py-1.5 text-xs min-h-[34px] gap-1.5",
    md: "px-4 py-2 text-sm min-h-[40px] gap-2",
    lg: "px-5 py-2.5 text-sm min-h-[44px] gap-2 font-semibold"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    >
      {children}
    </button>
  );
}
