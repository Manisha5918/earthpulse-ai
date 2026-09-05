import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["strict_provenance_enforced"] is True


def test_list_regions():
    response = client.get("/api/v1/regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 1
    assert regions[0]["code"] == "IN-TN-CHE"


def test_get_chennai_grid():
    response = client.get("/api/v1/regions/1/grid")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 16


def test_empty_observations_graceful_handling():
    # Verify zero-fake-data contract: initially returns empty array
    response = client.get("/api/v1/observations")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["results"] == []


def test_empty_anomalies_graceful_handling():
    response = client.get("/api/v1/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0
    assert data["results"] == []
