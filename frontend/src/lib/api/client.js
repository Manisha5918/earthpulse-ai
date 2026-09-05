/**
 * EarthPulse AI — Centralized API Client
 * Configures base URL, headers, URL normalization, and standardized error handling.
 */

function getNormalizedUrl(endpoint) {
  let base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").trim().replace(/\/+$/, "");
  
  // If base already includes /api/v1 and endpoint starts with /api/v1, strip duplicate
  if (base.endsWith("/api/v1") && endpoint.startsWith("/api/v1")) {
    base = base.substring(0, base.length - 7);
  }
  
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}

export async function apiClient(endpoint, options = {}) {
  const url = getNormalizedUrl(endpoint);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.message || errorDetail;
      } catch (_) {
        // Fallback to text status
      }
      const error = new Error(typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail));
      error.status = response.status;
      error.detail = errorDetail;
      throw error;
    }

    return await response.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      const connErr = new Error("Unable to connect to EarthPulse backend API. Ensure FastAPI server is running on " + (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"));
      connErr.status = 503;
      throw connErr;
    }
    throw err;
  }
}
