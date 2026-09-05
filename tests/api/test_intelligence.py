import unittest
import os
import sys
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app


class TestIntelligenceAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_get_region_baselines_chennai(self):
        """Test GET /api/v1/regions/IN-TN-CHE/baselines returns multi-sensor baselines."""
        r = self.client.get("/api/v1/regions/IN-TN-CHE/baselines")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["region_id"], "IN-TN-CHE")
        self.assertIn("ndvi", data["baselines"])
        self.assertIn("viirs_radiance", data["baselines"])
        self.assertIn("temperature_2m", data["baselines"])
        self.assertEqual(data["provenance"], "CALCULATED")

    def test_get_cell_baselines_che_g006(self):
        """Test GET /api/v1/regions/CHE_G006/baselines returns cell-specific baselines."""
        r = self.client.get("/api/v1/regions/CHE_G006/baselines")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["cell_code"], "CHE_G006")
        self.assertEqual(data["baselines"]["ndvi"]["observation_count"], 4)
        self.assertEqual(data["baselines"]["ndvi"]["confidence"], "LIMITED")

    def test_get_region_anomalies(self):
        """Test GET /api/v1/regions/IN-TN-CHE/anomalies returns temporal and spatial anomalies."""
        r = self.client.get("/api/v1/regions/IN-TN-CHE/anomalies")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("temporal_anomalies", data)
        self.assertIn("spatial_anomalies", data)
        self.assertGreater(len(data["temporal_anomalies"]), 0)
        self.assertGreater(len(data["spatial_anomalies"]), 0)

    def test_get_region_relationships(self):
        """Test GET /api/v1/regions/IN-TN-CHE/relationships returns exploratory correlations."""
        r = self.client.get("/api/v1/regions/IN-TN-CHE/relationships")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("relationships", data)
        self.assertGreater(len(data["relationships"]), 0)
        rel = data["relationships"][0]
        self.assertFalse(rel["causal_claim"])
        self.assertEqual(rel["relationship_type"], "CORRELATION")

    def test_get_full_change_profile_chennai(self):
        """Test GET /api/v1/regions/IN-TN-CHE/change-profile returns unified change intelligence."""
        r = self.client.get("/api/v1/regions/IN-TN-CHE/change-profile")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["region_id"], "IN-TN-CHE")
        self.assertIn("baselines", data)
        self.assertIn("temporal_anomalies", data)
        self.assertIn("spatial_anomalies", data)
        self.assertIn("regional_change_score", data)
        score = data["regional_change_score"]
        self.assertEqual(score["score_status"], "VALID")
        self.assertGreaterEqual(score["overall_score"], 0.0)

    def test_get_full_change_profile_cell_che_g006(self):
        """Test GET /api/v1/regions/CHE_G006/change-profile returns cell change intelligence."""
        r = self.client.get("/api/v1/regions/CHE_G006/change-profile")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["cell_code"], "CHE_G006")
        self.assertIsNotNone(data["spatial_context"])
        self.assertEqual(data["spatial_context"]["temporal_semantics"], "SNAPSHOT")

    def test_invalid_region_id_returns_404(self):
        """Test that an unsupported region returns HTTP 404."""
        r = self.client.get("/api/v1/regions/IN-KA-BLR/change-profile")
        self.assertEqual(r.status_code, 404)


if __name__ == "__main__":
    unittest.main()
