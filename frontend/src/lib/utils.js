import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCoordinate(val, type) {
  if (val === null || val === undefined) return "—";
  const num = Math.abs(val).toFixed(4);
  if (type === "lat") return `${num}° ${val >= 0 ? "N" : "S"}`;
  if (type === "lon") return `${num}° ${val >= 0 ? "E" : "W"}`;
  return num;
}

// User-facing labels for backend data-state codes. The codes themselves
// (AVAILABLE, PARTIAL_DATA, ...) stay unchanged in logic and debug views.
export function formatStatus(status) {
  const map = {
    AVAILABLE: "Available",
    PARTIAL_DATA: "Partial data",
    PROCESSING_REQUIRED: "Processing required",
    DATA_UNAVAILABLE: "Data unavailable",
    INSUFFICIENT_OBSERVATIONS: "Not enough observations",
    PROCESSING: "Processing",
    PARTIAL: "Partial",
    ERROR: "Error",
    FAILED: "Failed",
    LOADING: "Loading",
  };
  const key = (status || "").toUpperCase();
  return map[key] || status || "";
}
