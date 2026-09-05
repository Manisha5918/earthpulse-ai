"""MoE API tests: backward-compatible response, isolation via HTTP."""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.moe.models import MOE_VERSION

client = TestClient(app)


def test_intelligence_response_includes_moe_block():
    r = client.post("/api/v1/intelligence", json={
        "location": {"type": "region", "region_code": "IN-TN-CHE"},
    })
    assert r.status_code == 200
    data = r.json()
    # Existing contract intact.
    assert data["evidence_package_hash"]
    assert data["narrative"] is not None
    assert data["regional_change_score"] is not None
    assert len(data["narrative"]["key_findings"]) > 0
    # New additive MoE block.
    moe = data["moe"]
    assert moe["moe_version"] == MOE_VERSION
    assert moe["evidence_package_hash"] == data["evidence_package_hash"]
    assert len(moe["active_experts"]) + len(moe["inactive_experts"]) == 5
    assert len(moe["expert_outputs"]) == 5
    assert moe["cross_signal_reasoning"]["causal_claim"] is False


def test_bengaluru_returns_processing_required_with_null_moe():
    r = client.post("/api/v1/intelligence", json={
        "location": {"type": "point", "coordinates": [12.9716, 77.5946]},
    })
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "PROCESSING_REQUIRED"
    assert data["moe"] is None
    assert data["narrative"] is None
    body = r.text
    assert "CHE_G" not in body
    assert "0.1602" not in body


def test_london_returns_unavailable_with_null_moe():
    r = client.post("/api/v1/intelligence", json={
        "location": {"type": "point", "coordinates": [51.5074, -0.1278]},
    })
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "DATA_UNAVAILABLE"
    assert data["moe"] is None
    assert data["narrative"] is None
