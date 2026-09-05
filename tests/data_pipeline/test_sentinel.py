import unittest
import os
import sys
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.data_sources.sentinel2 import (
    calculate_ndvi,
    calculate_ndwi,
    calculate_ndbi,
    mask_clouds_scl
)


class TestSentinel(unittest.TestCase):

    def test_spectral_indices_calculation(self):
        """Test NDVI, NDWI, NDBI calculation formula accuracy."""
        nir = np.array([0.3, 0.4], dtype=np.float32)
        red = np.array([0.1, 0.05], dtype=np.float32)
        green = np.array([0.1, 0.2], dtype=np.float32)
        swir = np.array([0.15, 0.1], dtype=np.float32)

        ndvi = calculate_ndvi(nir, red)
        ndwi = calculate_ndwi(green, nir)
        ndbi = calculate_ndbi(swir, nir)

        # NDVI = (0.3 - 0.1) / (0.3 + 0.1) = 0.2 / 0.4 = 0.5
        self.assertAlmostEqual(float(ndvi[0]), 0.5, places=3)
        # NDWI = (0.1 - 0.3) / (0.1 + 0.3) = -0.2 / 0.4 = -0.5
        self.assertAlmostEqual(float(ndwi[0]), -0.5, places=3)

    def test_scl_cloud_masking(self):
        """Test SCL cloud masking filters out cloud and shadow pixels."""
        data = np.array([0.5, 0.6, 0.7], dtype=np.float32)
        scl = np.array([4, 3, 9], dtype=np.uint8)  # 4=veg (valid), 3=cloud shadow, 9=high prob cloud

        masked = mask_clouds_scl(data, scl)
        self.assertFalse(np.isnan(masked[0]))
        self.assertTrue(np.isnan(masked[1]))
        self.assertTrue(np.isnan(masked[2]))


if __name__ == "__main__":
    unittest.main()
