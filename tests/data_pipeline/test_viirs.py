import unittest
import os
import sys
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.data_sources.viirs import (
    tiff_lzw_decode,
    aggregate_viirs_radiance_cell
)


class TestVIIRS(unittest.TestCase):

    def test_tiff_lzw_decode_basic(self):
        """Test TIFF LZW decoder decompression."""
        compressed = b'\x80\x00\x41\x00\x80\x80'
        decoded = tiff_lzw_decode(compressed)
        self.assertIsInstance(decoded, bytes)

    def test_aggregate_viirs_radiance_cell(self):
        """Test radiance extraction and aggregation across sensor pixels."""
        pixels = np.array([10.0, 10.0, 10.0, 10.0, 10.0], dtype=np.float32)
        stats = aggregate_viirs_radiance_cell(pixels)
        self.assertEqual(stats["valid_pixels"], 5)
        self.assertAlmostEqual(stats["mean_rad"], 10.0, places=2)

    def test_viirs_negative_nodata_filtering(self):
        """Test that negative background values and NoData pixels are correctly filtered."""
        pixels = np.array([-999.0, 5.0, -1.0, 5.0, 0.0], dtype=np.float32)
        stats = aggregate_viirs_radiance_cell(pixels)
        self.assertEqual(stats["valid_pixels"], 3)
        self.assertAlmostEqual(stats["mean_rad"], (5.0 + 5.0 + 0.0) / 3.0, places=2)


if __name__ == "__main__":
    unittest.main()
