import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.data_sources.nasa_power import normalize_nasa_power_response


class TestNASAPower(unittest.TestCase):

    def test_normalize_weather_data(self):
        """Test normalization and QC of raw NASA POWER API payload."""
        mock_raw = {
            "properties": {
                "parameter": {
                    "T2M": {"202401": 25.5, "202402": 26.0},
                    "PRECTOTCORR": {"202401": 0.0, "202402": 5.2}
                }
            }
        }
        records = normalize_nasa_power_response(mock_raw, grid_id=1)
        self.assertEqual(len(records), 4)
        t_records = [r for r in records if r["signal_name"] == "temperature_2m"]
        p_records = [r for r in records if r["signal_name"] == "precipitation"]
        self.assertEqual(len(t_records), 2)
        self.assertEqual(len(p_records), 2)
        self.assertEqual(t_records[0]["signal_value"], 25.5)
        self.assertEqual(p_records[1]["signal_value"], 5.2)
        self.assertEqual(records[0]["provenance_type"], "OBSERVED")


if __name__ == "__main__":
    unittest.main()
