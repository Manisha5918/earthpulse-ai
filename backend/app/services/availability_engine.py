"""EarthPulse AI — Real Data Availability Engine.
Strictly separates location type support from real data availability.
Zero fabricated availability: never claims data exists where it has not been verified.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import date, datetime
import json

from app.schemas.analysis import (
    LocationType,
    LocationSpec,
    SignalType,
    AvailabilityStatus,
    SignalAvailability,
    ResolvedLocation
)

# Chennai MVP Pilot Extent
CHENNAI_BBOX = [12.90, 80.15, 13.10, 80.35]  # [min_lat, min_lon, max_lat, max_lon]
CHENNAI_CENTROID = {"lat": 13.00, "lon": 80.25}
INDIA_BBOX = [6.5, 68.0, 37.5, 97.5]

CHENNAI_GRID_CELLS = [f"CHE_G{i:03d}" for i in range(1, 17)]

# Verified Temporal Bounds for Chennai MVP
NASA_POWER_RANGE = {"start": "2021-01-01", "end": "2024-12-31"}
SENTINEL2_DATES = ["2021-05-30", "2022-04-05", "2023-05-20", "2024-04-29"]
VIIRS_PERIODS = ["2021-04", "2022-04", "2023-04", "2024-04"]
OSM_TIMESTAMP = "2026-09-03T09:25:28.596075+00:00"


def is_inside_bbox(lat: float, lon: float, bbox: List[float]) -> bool:
    """Check if point falls inside [min_lat, min_lon, max_lat, max_lon]."""
    return bbox[0] <= lat <= bbox[2] and bbox[1] <= lon <= bbox[3]


def bboxes_intersect(b1: List[float], b2: List[float]) -> bool:
    """Check if two bounding boxes [min_lat, min_lon, max_lat, max_lon] intersect."""
    return not (b1[2] < b2[0] or b1[0] > b2[2] or b1[3] < b2[1] or b1[1] > b2[3])


def resolve_location(loc: LocationSpec) -> ResolvedLocation:
    """Resolve location specification into concrete spatial bounds and verify pilot coverage."""
    if loc.type == LocationType.REGION:
        code = (loc.region_code or "").upper()
        if code in ["IN-TN-CHE", "CHENNAI", "1"]:
            return ResolvedLocation(
                location_type=LocationType.REGION,
                matched_region="IN-TN-CHE",
                matched_cells=CHENNAI_GRID_CELLS,
                bounding_box=CHENNAI_BBOX,
                centroid=CHENNAI_CENTROID,
                is_verified_pilot_extent=True
            )
        else:
            return ResolvedLocation(
                location_type=LocationType.REGION,
                matched_region=code,
                matched_cells=[],
                bounding_box=[0.0, 0.0, 0.0, 0.0],
                centroid={"lat": 0.0, "lon": 0.0},
                is_verified_pilot_extent=False
            )

    elif loc.type == LocationType.GRID_CELL:
        code = (loc.cell_code or "").upper()
        if code in CHENNAI_GRID_CELLS:
            idx = int(code.split("CHE_G")[1]) - 1
            row = idx // 4
            col = idx % 4
            min_lat = round(12.90 + row * 0.05, 4)
            max_lat = round(min_lat + 0.05, 4)
            min_lon = round(80.15 + col * 0.05, 4)
            max_lon = round(min_lon + 0.05, 4)
            return ResolvedLocation(
                location_type=LocationType.GRID_CELL,
                matched_region="IN-TN-CHE",
                matched_cells=[code],
                bounding_box=[min_lat, min_lon, max_lat, max_lon],
                centroid={"lat": round((min_lat + max_lat) / 2, 4), "lon": round((min_lon + max_lon) / 2, 4)},
                is_verified_pilot_extent=True
            )
        else:
            return ResolvedLocation(
                location_type=LocationType.GRID_CELL,
                matched_region=None,
                matched_cells=[code] if code else [],
                bounding_box=[0.0, 0.0, 0.0, 0.0],
                centroid={"lat": 0.0, "lon": 0.0},
                is_verified_pilot_extent=False
            )

    elif loc.type == LocationType.BBOX:
        coords = loc.coordinates  # [min_lat, min_lon, max_lat, max_lon]
        c_lat = round((coords[0] + coords[2]) / 2, 4)
        c_lon = round((coords[1] + coords[3]) / 2, 4)
        in_pilot = bboxes_intersect(coords, CHENNAI_BBOX)
        matched = []
        if in_pilot:
            for cell_code in CHENNAI_GRID_CELLS:
                idx = int(cell_code.split("CHE_G")[1]) - 1
                row = idx // 4
                col = idx % 4
                cell_box = [12.90 + row * 0.05, 80.15 + col * 0.05, 12.90 + (row + 1) * 0.05, 80.15 + (col + 1) * 0.05]
                if bboxes_intersect(coords, cell_box):
                    matched.append(cell_code)
        return ResolvedLocation(
            location_type=LocationType.BBOX,
            matched_region="IN-TN-CHE" if in_pilot else None,
            matched_cells=matched,
            bounding_box=coords,
            centroid={"lat": c_lat, "lon": c_lon},
            is_verified_pilot_extent=in_pilot and len(matched) > 0
        )

    elif loc.type == LocationType.POINT:
        coords = loc.coordinates
        if isinstance(coords, list):
            lat, lon = coords[0], coords[1]
        elif isinstance(coords, dict):
            lat, lon = coords["lat"], coords["lon"]
        else:
            lat, lon = 0.0, 0.0
        in_pilot = is_inside_bbox(lat, lon, CHENNAI_BBOX)
        matched = []
        if in_pilot:
            row = int((lat - 12.90) / 0.05)
            col = int((lon - 80.15) / 0.05)
            if 0 <= row < 4 and 0 <= col < 4:
                matched = [f"CHE_G{row * 4 + col + 1:03d}"]
        return ResolvedLocation(
            location_type=LocationType.POINT,
            matched_region="IN-TN-CHE" if in_pilot else None,
            matched_cells=matched,
            bounding_box=[lat - 0.025, lon - 0.025, lat + 0.025, lon + 0.025],
            centroid={"lat": lat, "lon": lon},
            is_verified_pilot_extent=in_pilot and len(matched) > 0
        )

    return ResolvedLocation(
        location_type=loc.type,
        bounding_box=[0.0, 0.0, 0.0, 0.0],
        centroid={"lat": 0.0, "lon": 0.0},
        is_verified_pilot_extent=False
    )


class AvailabilityEngine:

    @staticmethod
    def evaluate_signal_availability(
        signal: SignalType,
        location: ResolvedLocation,
        start_date: date,
        end_date: date
    ) -> SignalAvailability:
        req_start = start_date.isoformat()
        req_end = end_date.isoformat()
        req_period = {"start": req_start, "end": req_end}

        # Check geographic domain
        c_lat = location.centroid["lat"]
        c_lon = location.centroid["lon"]
        in_india = is_inside_bbox(c_lat, c_lon, INDIA_BBOX)

        # 1. Location outside verified pilot extent
        if not location.is_verified_pilot_extent:
            if in_india:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.PROCESSING_REQUIRED,
                    requested_period=req_period,
                    actual_available_period=None,
                    spatial_coverage="Outside Chennai MVP extent (Inside India domain)",
                    native_spatial_resolution="Variable by sensor",
                    temporal_resolution="Variable by sensor",
                    temporal_semantics="CONTINUOUS_OBSERVATIONS",
                    provenance_type="CALCULATED",
                    source_name=f"External {signal.value.upper()} Service",
                    source_url="API endpoint requires live acquisition",
                    notes="Location is outside verified Chennai MVP baseline. Real data acquisition pipeline must be triggered for these coordinates."
                )
            else:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.DATA_UNAVAILABLE,
                    requested_period=req_period,
                    actual_available_period=None,
                    spatial_coverage="Outside India operational extent",
                    native_spatial_resolution="N/A",
                    temporal_resolution="N/A",
                    temporal_semantics="CONTINUOUS_OBSERVATIONS",
                    provenance_type="CALCULATED",
                    source_name="N/A",
                    source_url="N/A",
                    notes="Location falls outside the operational geographic boundary of EarthPulse AI."
                )

        # 2. Location IS inside verified Chennai extent
        if signal == SignalType.NASA_POWER:
            # Check date overlap with 2021-01-01 to 2024-12-31
            p_start = date.fromisoformat(NASA_POWER_RANGE["start"])
            p_end = date.fromisoformat(NASA_POWER_RANGE["end"])
            if start_date <= p_end and end_date >= p_start:
                actual_s = max(start_date, p_start).isoformat()
                actual_e = min(end_date, p_end).isoformat()
                is_full = (start_date >= p_start and end_date <= p_end)
                status = AvailabilityStatus.AVAILABLE if is_full else AvailabilityStatus.PARTIAL_DATA
                return SignalAvailability(
                    signal=signal,
                    status=status,
                    requested_period=req_period,
                    actual_available_period={"start": actual_s, "end": actual_e},
                    spatial_coverage="Chennai Metropolitan Area (13.0827°N, 80.2707°E)",
                    native_spatial_resolution="0.5° x 0.5° meteorological model reanalysis",
                    temporal_resolution="Daily (24-hour aggregate)",
                    temporal_semantics="CONTINUOUS_OBSERVATIONS",
                    provenance_type="OBSERVED",
                    source_name="NASA POWER API (LaRC)",
                    source_url="https://power.larc.nasa.gov/api/temporal/daily/point",
                    notes="Daily 2m air temperature (T2M) and precipitation (PRECTOTCORR) observations."
                )
            else:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.DATA_UNAVAILABLE,
                    requested_period=req_period,
                    actual_available_period=None,
                    spatial_coverage="Chennai Metropolitan Area",
                    native_spatial_resolution="0.5° x 0.5°",
                    temporal_resolution="Daily",
                    temporal_semantics="CONTINUOUS_OBSERVATIONS",
                    provenance_type="OBSERVED",
                    source_name="NASA POWER API",
                    source_url="https://power.larc.nasa.gov/api/temporal/daily/point",
                    notes=f"Requested date range {req_start} to {req_end} falls outside verified 2021–2024 daily dataset."
                )

        elif signal == SignalType.SENTINEL2:
            matched_scenes = [d for d in SENTINEL2_DATES if req_start <= d <= req_end]
            if matched_scenes:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.AVAILABLE,
                    requested_period=req_period,
                    actual_available_period=matched_scenes,
                    spatial_coverage="MGRS 44PMV (Chennai Analytical Grid 16 Cells)",
                    native_spatial_resolution="10m/20m optical bands resampled to 0.05° grid",
                    temporal_resolution="Multi-temporal cloud-free scene archive",
                    temporal_semantics="MULTI_TEMPORAL_SCENES",
                    provenance_type="CALCULATED",
                    source_name="ESA Sentinel-2 Level-2A (AWS Open Data COG)",
                    source_url="https://sentinel-cogs.s3.us-west-2.amazonaws.com",
                    notes=f"{len(matched_scenes)} verified cloud-free scenes match requested date range (NDVI, NDWI, NDBI)."
                )
            else:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.INSUFFICIENT_OBSERVATIONS,
                    requested_period=req_period,
                    actual_available_period=[],
                    spatial_coverage="MGRS 44PMV (Chennai)",
                    native_spatial_resolution="10m/20m",
                    temporal_resolution="Multi-temporal scenes",
                    temporal_semantics="MULTI_TEMPORAL_SCENES",
                    provenance_type="CALCULATED",
                    source_name="ESA Sentinel-2 L2A",
                    source_url="https://sentinel-cogs.s3.us-west-2.amazonaws.com",
                    notes="No verified cloud-free Sentinel-2 scenes in archive for the requested date filter."
                )

        elif signal == SignalType.VIIRS:
            matched_periods = [p for p in VIIRS_PERIODS if req_start[:7] <= p <= req_end[:7]]
            if matched_periods:
                # VIIRS is an ANNUAL April baseline, so querying a continuous multi-year range returns PARTIAL_DATA
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.PARTIAL_DATA,
                    requested_period=req_period,
                    actual_available_period=matched_periods,
                    spatial_coverage="NOAA/EOG/World Bank Tile 75N060E (Chennai 16 Cells)",
                    native_spatial_resolution="15 arc-seconds (~500m per pixel)",
                    temporal_resolution="Annual April Monthly Cloud-Free Baseline (2021–2024)",
                    temporal_semantics="ANNUAL_BASELINE",
                    provenance_type="CALCULATED",
                    source_name="NOAA / EOG / World Bank Open Night Lights",
                    source_url="https://globalnightlight.s3.amazonaws.com",
                    notes="Verified VIIRS dataset provides annual April cloud-free baseline composites, not continuous monthly data."
                )
            else:
                return SignalAvailability(
                    signal=signal,
                    status=AvailabilityStatus.INSUFFICIENT_OBSERVATIONS,
                    requested_period=req_period,
                    actual_available_period=[],
                    spatial_coverage="Chennai 16 Cells",
                    native_spatial_resolution="15 arc-seconds",
                    temporal_resolution="Annual April Baseline",
                    temporal_semantics="ANNUAL_BASELINE",
                    provenance_type="CALCULATED",
                    source_name="NOAA / EOG / World Bank",
                    source_url="https://globalnightlight.s3.amazonaws.com",
                    notes="Requested period does not intersect verified April 2021–2024 annual baseline composites."
                )

        elif signal == SignalType.OSM:
            return SignalAvailability(
                signal=signal,
                status=AvailabilityStatus.AVAILABLE,
                requested_period=req_period,
                actual_available_period={"timestamp": OSM_TIMESTAMP},
                spatial_coverage="Chennai 16 Analytical Grid Cells (CHE_G001 to CHE_G016)",
                native_spatial_resolution="Vector features aggregated to 0.05° grid in UTM Zone 44N",
                temporal_resolution="Static spatial baseline extract",
                temporal_semantics="SNAPSHOT",
                provenance_type="CALCULATED",
                source_name="OpenStreetMap Overpass API",
                source_url="https://overpass-api.de/api/interpreter",
                notes="OpenStreetMap data is a static spatial snapshot as of access timestamp, not continuous observations."
            )

        return SignalAvailability(
            signal=signal,
            status=AvailabilityStatus.DATA_UNAVAILABLE,
            requested_period=req_period,
            actual_available_period=None,
            spatial_coverage="Unknown",
            native_spatial_resolution="N/A",
            temporal_resolution="N/A",
            temporal_semantics="CONTINUOUS_OBSERVATIONS",
            provenance_type="CALCULATED",
            source_name="N/A",
            source_url="N/A",
            notes="Unrecognized signal."
        )

    @classmethod
    def evaluate_request(
        cls,
        location: LocationSpec,
        start_date: date,
        end_date: date,
        signals: List[SignalType]
    ) -> Tuple[ResolvedLocation, Dict[str, SignalAvailability], AvailabilityStatus]:
        resolved = resolve_location(location)
        availabilities = {}
        for sig in signals:
            availabilities[sig.value] = cls.evaluate_signal_availability(sig, resolved, start_date, end_date)

        statuses = [a.status for a in availabilities.values()]
        if not statuses or all(s == AvailabilityStatus.DATA_UNAVAILABLE for s in statuses):
            overall = AvailabilityStatus.DATA_UNAVAILABLE
        elif any(s == AvailabilityStatus.PROCESSING_REQUIRED for s in statuses):
            overall = AvailabilityStatus.PROCESSING_REQUIRED
        elif any(s == AvailabilityStatus.PARTIAL_DATA for s in statuses):
            overall = AvailabilityStatus.PARTIAL_DATA
        elif all(s == AvailabilityStatus.AVAILABLE for s in statuses):
            overall = AvailabilityStatus.AVAILABLE
        else:
            overall = AvailabilityStatus.PARTIAL_DATA

        return resolved, availabilities, overall
