import unittest
import os
import sys
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app


class TestIntelligenceNarrativeAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_http_post_intelligence_synchronous_200(self):
        """Test POST /api/v1/intelligence with async_mode=false returns HTTP 200 with grounded narrative."""
        payload = {
            "location": {"type": "region", "region_code": "IN-TN-CHE"},
            "start_date": "2021-01-01",
            "end_date": "2024-12-31",
            "narrative_mode": "EXECUTIVE_BRIEFING",
            "async_mode": False
        }
        r = self.client.post("/api/v1/intelligence", json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("narrative", data)
        self.assertIsNotNone(data["narrative"])
        self.assertGreater(len(data["narrative"]["key_findings"]), 0)
        self.assertEqual(data["narrative"]["provenance_type"], "AI_INTERPRETED")

    def test_http_post_intelligence_async_202(self):
        """Test POST /api/v1/intelligence with async_mode=true returns HTTP 202 Accepted with job_id."""
        payload = {
            "location": {"type": "region", "region_code": "IN-TN-CHE"},
            "start_date": "2021-01-01",
            "end_date": "2024-12-31",
            "async_mode": True
        }
        r = self.client.post("/api/v1/intelligence", json=payload)
        self.assertEqual(r.status_code, 202)
        data = r.json()
        self.assertIn("job_id", data["detail"])
        self.assertTrue(data["detail"]["job_id"].startswith("job_"))

    def test_http_post_intelligence_bengaluru_isolation(self):
        """Test POST /api/v1/intelligence for Bengaluru returns PROCESSING_REQUIRED and null narrative."""
        payload = {
            "location": {"type": "point", "coordinates": [12.9716, 77.5946]},
            "async_mode": False
        }
        r = self.client.post("/api/v1/intelligence", json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "PROCESSING_REQUIRED")
        self.assertIsNone(data["narrative"])

    def test_http_post_intelligence_london_data_unavailable(self):
        """Test POST /api/v1/intelligence for London returns DATA_UNAVAILABLE and null narrative."""
        payload = {
            "location": {"type": "point", "coordinates": [51.5074, -0.1278]},
            "async_mode": False
        }
        r = self.client.post("/api/v1/intelligence", json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "DATA_UNAVAILABLE")
        self.assertIsNone(data["narrative"])


if __name__ == "__main__":
    unittest.main()
