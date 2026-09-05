import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))
from app.geospatial.grid import generate_regular_grid, grid_to_geojson


def test_generate_chennai_grid_cells():
    cells = generate_regular_grid(
        min_lat=12.90, min_lon=80.15,
        max_lat=13.10, max_lon=80.35,
        resolution_deg=0.0500, prefix="CHE"
    )
    assert len(cells) == 16
    assert cells[0]["cell_code"] == "CHE_G001"
    assert cells[-1]["cell_code"] == "CHE_G016"
    assert round(cells[0]["area_sqkm"], 2) == 30.25


def test_grid_to_geojson():
    cells = generate_regular_grid(12.90, 80.15, 13.10, 80.35, 0.0500, "CHE")
    geojson = grid_to_geojson(cells)
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 16
    first_feature = geojson["features"][0]
    assert first_feature["properties"]["cell_code"] == "CHE_G001"
    assert first_feature["geometry"]["type"] == "Polygon"
