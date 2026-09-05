"""NASA POWER API Client for Meteorological Observations.
Fetches actual 2m Air Temperature (T2M) and Corrected Precipitation (PRECTOTCORR).
API Base: https://power.larc.nasa.gov/api/temporal
"""

import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
# import httpx (deferred)

logger = logging.getLogger(__name__)

NASA_POWER_BASE = "https://power.larc.nasa.gov/api/temporal"


def fetch_nasa_power_point(
    latitude: float,
    longitude: float,
    start_year: int,
    end_year: int,
    temporal_api: str = "monthly",
    community: str = "RE",
    timeout: float = 30.0
) -> Dict[str, Any]:
    """Fetch real meteorological telemetry from NASA POWER API for a given coordinate.

    Parameters:
        latitude: Target latitude in decimal degrees (e.g. 13.0827)
        longitude: Target longitude in decimal degrees (e.g. 80.2707)
        start_year: Beginning year (e.g. 2021)
        end_year: Ending year (e.g. 2024)
        temporal_api: 'monthly' or 'daily'
        community: 'RE' (Renewable Energy), 'AG' (Agroclimatology), or 'SB' (Sustainable Buildings)
    """
    endpoint = f"{NASA_POWER_BASE}/{temporal_api}/point"
    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": community,
        "longitude": round(longitude, 4),
        "latitude": round(latitude, 4),
        "start": str(start_year),
        "end": str(end_year),
        "format": "JSON"
    }

    logger.info(f"Querying NASA POWER API for point ({latitude}, {longitude}) [{start_year}-{end_year}]")

    import httpx
    with httpx.Client(timeout=timeout) as client:
        response = client.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()
        return data


def normalize_nasa_power_response(
    raw_json: Dict[str, Any],
    grid_id: int,
    provenance_type: str = "OBSERVED"
) -> List[Dict[str, Any]]:
    """Transform raw NASA POWER API JSON response into normalized observation records.
    Discards invalid missing values (e.g. -999.0) and attaches complete provenance metadata.
    """
    records = []
    properties = raw_json.get("properties", {})
    parameters = properties.get("parameter", {})

    t2m_series = parameters.get("T2M", {})
    precip_series = parameters.get("PRECTOTCORR", {})

    header = raw_json.get("header", {})
    source_url = "https://power.larc.nasa.gov/api/temporal"

    # Monthly keys format: 'YYYYMM' (e.g. '202405')
    for yyyymm, temp_val in t2m_series.items():
        if len(yyyymm) == 6 and not yyyymm.endswith("13"):  # Exclude annual summary month 13
            year = int(yyyymm[:4])
            month = int(yyyymm[4:])
            dt = datetime(year, month, 1)

            if temp_val is not None and temp_val > -900:
                records.append({
                    "grid_id": grid_id,
                    "dataset_id": "nasa_power_t2m_monthly",
                    "signal_name": "temperature_2m",
                    "signal_value": float(temp_val),
                    "unit": "Celsius",
                    "acquisition_timestamp": dt.isoformat() + "Z",
                    "quality_flag": "VALID_OBSERVATION",
                    "provenance_type": provenance_type,
                    "metadata": {
                        "source_name": "NASA POWER",
                        "source_url": source_url,
                        "temporal_api": "monthly",
                        "nasa_parameter": "T2M"
                    }
                })

            precip_val = precip_series.get(yyyymm)
            if precip_val is not None and precip_val > -900:
                records.append({
                    "grid_id": grid_id,
                    "dataset_id": "nasa_power_prectotcorr_monthly",
                    "signal_name": "precipitation",
                    "signal_value": float(precip_val),
                    "unit": "mm",
                    "acquisition_timestamp": dt.isoformat() + "Z",
                    "quality_flag": "VALID_OBSERVATION",
                    "provenance_type": provenance_type,
                    "metadata": {
                        "source_name": "NASA POWER",
                        "source_url": source_url,
                        "temporal_api": "monthly",
                        "nasa_parameter": "PRECTOTCORR"
                    }
                })

    return records
