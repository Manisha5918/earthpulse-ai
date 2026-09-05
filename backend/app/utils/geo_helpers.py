import os
from typing import Dict, Any


def format_geojson_feature(properties: Dict[str, Any], geometry: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "type": "Feature",
        "properties": properties,
        "geometry": geometry
    }


def get_dataset_file(*parts: str) -> str:
    """Find dataset or boundary file across root datasets, backend datasets, or working directory."""
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../", *parts)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../", *parts)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../", *parts)),
        os.path.abspath(os.path.join(os.getcwd(), *parts)),
        os.path.abspath(os.path.join(os.getcwd(), "backend", *parts)),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return candidates[0]

