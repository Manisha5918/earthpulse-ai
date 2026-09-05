"""Analytical 0.05° Regular Spatial Grid Generator.
Divides any target geographic boundary into standardized analytical fishnet cells (~5.5 km).
Supports pure-Python execution with optional Shapely acceleration.
"""

from typing import List, Dict, Any

try:
    from shapely.geometry import Polygon, mapping
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False


def generate_regular_grid(
    min_lat: float,
    min_lon: float,
    max_lat: float,
    max_lon: float,
    resolution_deg: float = 0.0500,
    prefix: str = "CHE"
) -> List[Dict[str, Any]]:
    """Generate regular 0.05 deg grid cells within a bounding box.

    Returns a list of cell dictionaries containing geometry, center point, and cell codes.
    """
    cells = []
    lat_steps = int(round((max_lat - min_lat) / resolution_deg))
    lon_steps = int(round((max_lon - min_lon) / resolution_deg))
    cell_idx = 1

    for row in range(lat_steps):
        cell_min_lat = min_lat + (row * resolution_deg)
        cell_max_lat = cell_min_lat + resolution_deg

        for col in range(lon_steps):
            cell_min_lon = min_lon + (col * resolution_deg)
            cell_max_lon = cell_min_lon + resolution_deg

            center_lat = round(cell_min_lat + (resolution_deg / 2.0), 6)
            center_lon = round(cell_min_lon + (resolution_deg / 2.0), 6)

            coords = [
                [cell_min_lon, cell_min_lat],
                [cell_max_lon, cell_min_lat],
                [cell_max_lon, cell_max_lat],
                [cell_min_lon, cell_max_lat],
                [cell_min_lon, cell_min_lat]
            ]

            cell_code = f"{prefix}_G{cell_idx:03d}"

            cell_dict = {
                "cell_code": cell_code,
                "center_lat": center_lat,
                "center_lon": center_lon,
                "min_lat": round(cell_min_lat, 6),
                "min_lon": round(cell_min_lon, 6),
                "max_lat": round(cell_max_lat, 6),
                "max_lon": round(cell_max_lon, 6),
                "resolution_deg": resolution_deg,
                "area_sqkm": 30.25,
                "coordinates": coords,
                "geojson_geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                }
            }

            if HAS_SHAPELY:
                poly = Polygon(coords)
                cell_dict["polygon"] = poly

            cells.append(cell_dict)
            cell_idx += 1

    return cells


def grid_to_geojson(cells: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convert grid cell objects to a GeoJSON FeatureCollection."""
    features = []
    for c in cells:
        features.append({
            "type": "Feature",
            "properties": {
                "cell_code": c["cell_code"],
                "center_lat": c["center_lat"],
                "center_lon": c["center_lon"],
                "area_sqkm": c["area_sqkm"],
                "resolution_deg": c["resolution_deg"]
            },
            "geometry": c["geojson_geometry"]
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }
