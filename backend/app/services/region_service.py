"""Region and Grid Cell Service."""

from typing import List, Dict, Any, Optional
from app.geospatial.grid import generate_regular_grid, grid_to_geojson


class RegionService:
    @staticmethod
    def get_pilot_regions() -> List[Dict[str, Any]]:
        """Return initial supported pilot regions."""
        return [
            {
                "id": 1,
                "code": "IN-TN-CHE",
                "name": "Chennai Metropolitan Area",
                "state": "Tamil Nadu",
                "country": "India",
                "admin_level": "DISTRICT",
                "area_sqkm": 426.0,
                "grid_cells_count": 16,
                "bbox": [12.90, 80.15, 13.10, 80.35],
                "centroid": {"lat": 13.05, "lon": 80.225}
            }
        ]

    @staticmethod
    def get_region_grid(region_code: str = "IN-TN-CHE") -> Dict[str, Any]:
        """Generate/fetch 0.05° analytical grid cells for the region."""
        cells = generate_regular_grid(
            min_lat=12.90, min_lon=80.15,
            max_lat=13.10, max_lon=80.35,
            resolution_deg=0.0500, prefix="CHE"
        )
        return grid_to_geojson(cells)
