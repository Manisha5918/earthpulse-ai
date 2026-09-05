"""EarthPulse AI — Statistical Intelligence & Change Detection Configuration.
Centralized thresholds, weights, and sample size constraints for Phase 6.
Strict Provenance: Zero fabricated values.
"""

# Minimum Sample Size Thresholds for Statistical Methods
MIN_OBS_ZSCORE = 3
MIN_OBS_MAD = 3
MIN_OBS_TREND = 3
MIN_OBS_STRONG_TREND = 4
MIN_OBS_CORRELATION = 4
MIN_ELIGIBLE_CELLS_SPATIAL = 3

# Data Quality & Sensor Confidence Classifications
CONFIDENCE_HIGH = "HIGH"
CONFIDENCE_MEDIUM = "MEDIUM"
CONFIDENCE_LIMITED = "LIMITED"
CONFIDENCE_INSUFFICIENT = "INSUFFICIENT"

SENTINEL2_DEFAULT_CONFIDENCE = CONFIDENCE_LIMITED  # 4 scenes in verified archive
VIIRS_DEFAULT_CONFIDENCE = CONFIDENCE_LIMITED      # 4 April composites
NASA_POWER_DEFAULT_CONFIDENCE = CONFIDENCE_HIGH    # 1,461 daily observations
OSM_DEFAULT_CONFIDENCE = "HIGH_SNAPSHOT"           # Static baseline extract

# Anomaly Severity Thresholds
Z_THRESHOLD_CRITICAL = 3.0
Z_THRESHOLD_HIGH = 2.0
Z_THRESHOLD_MEDIUM = 1.5

# Regional Change Score Configuration
SCORING_VERSION = "phase6-v1"
WEIGHTING_METHOD = "EXPERT_CONFIGURED"

SCORE_WEIGHTS = {
    "temporal_anomaly": 0.30,
    "spatial_anomaly": 0.25,
    "cross_signal_agreement": 0.25,
    "data_completeness": 0.10,
    "temporal_compatibility": 0.10
}
