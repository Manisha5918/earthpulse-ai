from typing import Dict, Any


def format_geojson_feature(properties: Dict[str, Any], geometry: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "type": "Feature",
        "properties": properties,
        "geometry": geometry
    }
