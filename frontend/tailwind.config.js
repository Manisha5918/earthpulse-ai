/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",  // Clean light slate-50 background
        surface: "#FFFFFF",     // Crisp pure white card / panel
        "surface-muted": "#F1F5F9", // Slate-100 muted section background
        brand: {
          DEFAULT: "#059669",   // Emerald 600
          hover: "#047857",     // Emerald 700
          emerald: "#059669",
          teal: "#0284C7",      // Sky / Ocean Teal
          light: "#ECFDF5",     // Emerald 50
          ring: "#A7F3D0"      // Emerald 200
        },
        telemetry: {
          ndvi: "#059669",
          ndwi: "#0284C7",
          night: "#D97706",
          temp: "#E11D48",
          precip: "#2563EB",
          built: "#7C3AED",
          anomaly: "#DC2626"
        }
      },
      boxShadow: {
        hairline: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 25px -5px rgba(5, 150, 105, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        offset: "0 2px 8px -1px rgba(15, 23, 42, 0.08)",
        "offset-sm": "0 1px 4px -1px rgba(15, 23, 42, 0.06)",
        "offset-lg": "0 10px 20px -3px rgba(15, 23, 42, 0.1)",
        "offset-yellow": "0 4px 12px -2px rgba(234, 179, 8, 0.2)",
        "offset-teal": "0 4px 12px -2px rgba(13, 148, 136, 0.2)",
        "emerald-glow": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "emerald-card": "0 4px 20px -2px rgba(5, 150, 105, 0.08)"
      },
      fontFamily: {
        serif: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Roboto Mono", "monospace"]
      }
    }
  },
  plugins: []
};
