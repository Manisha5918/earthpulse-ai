# EarthPulse AI — AI Architecture & Statistical Change Detection

> **"AI that reveals how India is changing."**
> **Current Status**: Phase 6 Complete & Validated (Phase 7 Boundary Preserved)

---

## 1. Analytical Pipeline

```
REAL OBSERVATIONS (Phase 1–5: S2, VIIRS, NASA, OSM)
        ↓
TEMPORAL ALIGNMENT SERVICE (SAME_DAY, SAME_MONTH, AGGREGATED_WINDOW, INCOMPATIBLE)
        ↓
TEMPORAL BASELINES (Mean, Median, Stddev, Min, Max, N >= 3)
        ↓
TEMPORAL ANOMALIES (Z-Score & Robust MAD, N=3,4 -> LIMITED/EXPLORATORY)
        ↓
SPATIAL BASELINES & ANOMALIES (Eligible Cells Filter, Percentile Ranks)
        ↓
CROSS-SIGNAL AGREEMENT (Evidence Patterns, Non-Causal Assertions)
        ↓
EXPLORATORY RELATIONSHIPS (Pearson & Spearman, causal_claim: False)
        ↓
REGIONAL CHANGE SCORE (Expert-Configured Weighted Synthesis 0–100)
        ↓
REGIONAL CHANGE PROFILE (Unified Structured Intelligence Payload)
```

---

## 2. Statistical Methodology & Constraints

1. **Small-Sample Semantics**:
   - $N < 3$: `INSUFFICIENT_OBSERVATIONS`, `z_score = None`, `robust_mad_score = None`.
   - $N \in [3, 4]$: `confidence: "LIMITED"`, `status: "EXPLORATORY"` (applies to Sentinel-2 and VIIRS annual baselines).
   - $N \ge 10$: `confidence: "HIGH"`.
2. **Temporal Alignment Rules**:
   - Cross-signal patterns are only evaluated when temporal compatibility is established.
   - If observations are from different incompatible periods, no pattern is formed (`temporal_compatibility = INCOMPATIBLE`).
3. **Correlation is NOT Causation**:
   - Every correlation and pattern explicitly carries `relationship_type: "CORRELATION"` and `causal_claim: false`.
4. **Spatial Eligibility**:
   - Only terrestrial cells with valid observations are included in regional distributions. Ocean/empty cells are excluded.
5. **Regional Change Score**:
   - Configured in `backend/app/config/intelligence.py`:
     $$\text{Score} = 100 \times [0.30 \times \text{Temporal} + 0.25 \times \text{Spatial} + 0.25 \times \text{CrossSignal} + 0.10 \times \text{Completeness} + 0.10 \times \text{Compatibility}]$$
   - Version stamped: `scoring_version: "phase6-v1"`, `weighting_method: "EXPERT_CONFIGURED"`.
