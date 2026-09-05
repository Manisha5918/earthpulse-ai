# EarthPulse AI — UI/UX Design System Specification

> **“AI that reveals how India is changing.”**

---

## 1. Design Philosophy: Scientific Geospatial Command Center

The visual language of EarthPulse AI evokes a state-of-the-art scientific intelligence command center—drawing aesthetic cues from high-density telemetry dashboards (such as Linear and analytical command consoles).

### Core Tenets:
1. **Dark-First Telemetry**: Low-light environmental monitoring UI reduces eye fatigue, enhances map contrast, and emphasizes multi-spectral color palettes.
2. **High Information Density**: Precise numerical data, coordinates, and timestamps without unnecessary whitespace or frivolous decoration.
3. **Strict Visual Provenance**: Immediate color-coded tags distinguishing `OBSERVED`, `CALCULATED`, `AI_INTERPRETED`, and `SYNTHETIC_DEMO`.
4. **Data-Centric Hierarchy**: The interactive map is the hero; analytics, anomaly cards, and AI explanations contextualize the spatial reality.

---

## 2. Color Palette & Design Tokens

### 2.1 Backgrounds & Surfaces
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `bg-primary` | `#0A0D14` | Deep space background canvas |
| `bg-surface` | `#111622` | Card and panel container surface |
| `bg-surface-elevated`| `#171F2E` | Modals, dropdowns, and hover states |
| `border-subtle` | `#1E293B` | Standard card and table borders |
| `border-accent` | `#334155` | Focused borders, active tabs |

### 2.2 Telemetry & Signal Accent Colors
| Signal | Color Token | Hex Code | Visual Meaning |
| :--- | :--- | :--- | :--- |
| **Vegetation (NDVI)** | `emerald-500` | `#10B981` | Green cover, agricultural biomass |
| **Water (NDWI)** | `cyan-500` | `#06B6D4` | Surface water bodies, reservoirs |
| **Night Lights (VIIRS)**| `amber-400` | `#FBBF24` | Nocturnal luminosity, commercial activity |
| **Temperature (T2M)** | `rose-500` | `#F43F5E` | Thermal intensity, heat stress |
| **Precipitation** | `blue-500` | `#3B82F6` | Rainfall accumulation |
| **Built-up (NDBI)** | `violet-500` | `#8B5CF6` | Urban impervious surfaces |
| **Anomaly Alert** | `red-500` | `#EF4444` | High deviation ($|Z| \ge 2.5$) |

### 2.3 Data Provenance Badges
| Type | Badge Styling | Label |
| :--- | :--- | :--- |
| `OBSERVED` | `bg-emerald-950/60 text-emerald-400 border-emerald-700` | `● OBSERVED` |
| `CALCULATED` | `bg-blue-950/60 text-blue-400 border-blue-700` | `⚡ CALCULATED` |
| `AI_INTERPRETED`| `bg-purple-950/60 text-purple-400 border-purple-700` | `✨ AI INTERPRETED` |
| `SYNTHETIC_DEMO`| `bg-amber-950/80 text-amber-300 border-amber-500 font-bold` | `⚠️ SYNTHETIC DEMO` |

---

## 3. Typography

- **Primary UI Font**: Inter, system-ui, sans-serif. Clean, neutral, high legibility at 11px–14px.
- **Telemetry & Numerical Font**: JetBrains Mono, Roboto Mono, monospace. Used for coordinates (`13.0827° N, 80.2707° E`), sensor timestamps, z-scores, and index measurements.

---

## 4. Map & Cartographic Styling

- **Basemap Style**: Dark monochrome canvas (CartoDB Dark Matter or MapLibre Positron Dark) to let satellite overlay layers stand out.
- **Grid Cell Rendering**: 0.05° fishnet polygons with dynamic fill opacity based on the active signal.
  - Hover: Thin 1.5px bright cyan outline with instantaneous tooltip showing cell code and coordinates.
  - Selected Cell: Solid 2px bright cyan outline with a subtle glowing pulse.
- **Anomaly Pins**: Minimalist glowing radar rings pulsating softly on grid cells where multi-signal anomalies are detected.

---

## 5. Component Guidelines

### 5.1 Telemetry Metric Card
- Dark slate surface (`#111622`) with a subtle 1px border (`#1E293B`).
- Signal icon with matching accent color top-left.
- Monospace numerical value (large, 24px).
- Provenance badge top-right.
- Mini sparkline or baseline comparison badge (`+0.04 vs 3-yr norm`) bottom.

### 5.2 Anomaly Feed Item
- Left border color-coded by severity:
  - Low ($|Z| \in [1.5, 2.0)$): Yellow `#EAB308`
  - Medium ($|Z| \in [2.0, 2.5)$): Orange `#F97316`
  - High ($|Z| \ge 2.5$): Red `#EF4444`
- Compact layout with timestamp, signal name, and exact deviation.

### 5.3 Responsive Behavior
- **Desktop (>= 1280px)**: 3-column split view (Left: Region navigator & signal controls; Center: Interactive Map; Right: Anomaly & AI Insight feed).
- **Tablet (768px - 1279px)**: 2-column view with bottom drawer for telemetry details.
- **Mobile (< 768px)**: Fullscreen map with slide-up modal bottom sheets.
