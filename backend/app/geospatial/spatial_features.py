"""Spatial Geometry Helper Functions.
Supports pure-Python execution with optional Shapely acceleration.
"""

from typing import Tuple, Dict, Any, List

try:
    from shapely.geometry import Point, Polygon
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False


def get_bounding_box(min_lat: float, min_lon: float, max_lat: float, max_lon: float) -> Dict[str, Any]:
    """Create a bounding box polygon coordinate ring."""
    coords = [
        [min_lon, min_lat],
        [max_lon, min_lat],
        [max_lon, max_lat],
        [min_lon, max_lat],
        [min_lon, min_lat]
    ]
    if HAS_SHAPELY:
        return Polygon(coords)
    return {"type": "Polygon", "coordinates": [coords]}


def point_in_polygon(lat: float, lon: float, polygon_coords: List[List[float]]) -> bool:
    """Ray casting point-in-polygon algorithm in pure Python."""
    n = len(polygon_coords)
    inside = False
    p1x, p1y = polygon_coords[0]
    for i in range(n + 1):
        p2x, p2y = polygon_coords[i % n]
        if min(p1y, p2y) < lat <= max(p1y, p2y):
            if lon <= max(p1x, p2x):
                if p1y != p2y:
                    xinters = (lat - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                if p1x == p2x or lon <= xinters:
                    inside = not inside
        p1x, p1y = p2x, p2y
    return inside
