# EarthPulse AI — Demo Script: "Show me something unusual about this region"

> One discovery, progressively revealed. Total: ~5 minutes.
> All values below are live backend outputs (Chennai pilot, 2021–2024),
> not slides. If any step disagrees with these numbers, stop — the data changed.

## 0. Opening (15s)

Home → **Open workspace**. Say: *"EarthPulse investigates regional change from
real satellite evidence. Watch one question unfold: show me something unusual
about Chennai."*

## 1. Change (30s) — Overview step

- Region is pre-selected: **Chennai (IN-TN-CHE)**.
- Point at **Regional change score: 33.4 / 100** (phase6-v1).
- Read the one-liner aloud: an analytical result, not a prediction or ranking.

## 2. Evidence (60s) — Evidence step

- **Sensor evidence**: NDVI mean 0.1602, VIIRS April baseline, 1,461 daily
  weather records, OSM snapshot — every number carries a provenance badge.
- **How unusual is this location?** All current deviations are mild
  (strongest: NORMAL). Say it plainly — honesty first.
- **When were these collected?** 4 Sentinel scenes, April VIIRS baselines,
  daily NASA series. No invented continuity.

## 3. Expert activation (45s) — Briefing step, "Intelligence used"

- Vegetation — **Strong evidence coverage**
- Urban dynamics — **Strong evidence coverage**
- Spatial context — **Strong evidence coverage**
- Climate context — **Moderate evidence coverage**
- Cross-signal reasoning — **Exploratory**
- Then: **Observed signal strength — No strong anomaly detected in the
  current pilot evidence.**
- The line that wins: *"Coverage tells you which experts looked.
  Strength tells you what they found. They are different things."*

## 4. Relationships (45s)

- Show one concurrence pattern + correlation (r, N=16 cells).
- Read the disclosure: *"Statistical association, never a causal claim."*

## 5. Explanation + limitations (45s)

- Open the briefing: headline, one key finding, its EVID citations.
- Close on **limitations**: 4-scene archive, April-only VIIRS, snapshot OSM.

## 6. Generalization proof (60s)

- Location selector → **Bengaluru Test** → Run: **PROCESSING_REQUIRED**.
  *"Same experts, same architecture — no data, no answers. Nothing borrowed
  from Chennai."*
- Location selector → **London Test** → Run: **DATA_UNAVAILABLE**.
- Back to Chennai. End: *"One region fully evidenced today; the pipeline is
  region-independent by construction."*

## Fallbacks

- If live compute stalls: the async toggle shows the job modal; narrate
  while it polls.
- If the network drops: `docs/` holds the architecture; the 106-test suite
  is the offline proof.
