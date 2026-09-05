"""EarthPulse AI — Multi-Tier Caching Service.
Deterministic cache key hashing based on source, product, location, date range, resolution,
processing version, schema version, and intelligence version.
Caches only verified real observations/results; zero synthetic production data.
"""

import os
import json
import hashlib
import time
from typing import Optional, Dict, Any, Union
from datetime import date

CACHE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/cache"))
os.makedirs(CACHE_DIR, exist_ok=True)

SCHEMA_VERSION = "1.0.0"
PROCESSING_VERSION = "2026.09.v1"
INTELLIGENCE_VERSION = "phase6-v1"


class CacheService:
    _in_memory_cache: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def generate_cache_key(
        cls,
        source: str,
        product: str,
        location_repr: str,
        start_date: Union[date, str],
        end_date: Union[date, str],
        resolution: str = "0.05deg",
        intelligence_version: str = INTELLIGENCE_VERSION
    ) -> str:
        """Generate a deterministic SHA-256 composite cache identity key including intelligence_version."""
        raw_key = (
            f"{source.lower()}:{product.lower()}:{location_repr}:"
            f"{start_date}:{end_date}:{resolution}:"
            f"{PROCESSING_VERSION}:{SCHEMA_VERSION}:{intelligence_version}"
        )
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    @classmethod
    def get(cls, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve an entry from memory or disk cache if not expired."""
        now = time.time()
        # 1. Check in-memory cache
        if key in cls._in_memory_cache:
            entry = cls._in_memory_cache[key]
            if entry.get("expires_at", float("inf")) > now:
                return entry["data"]
            else:
                del cls._in_memory_cache[key]

        # 2. Check disk cache
        disk_path = os.path.join(CACHE_DIR, f"{key}.json")
        if os.path.exists(disk_path):
            try:
                with open(disk_path, "r", encoding="utf-8") as f:
                    entry = json.load(f)
                if entry.get("expires_at", float("inf")) > now:
                    cls._in_memory_cache[key] = entry
                    return entry["data"]
                else:
                    os.remove(disk_path)
            except Exception:
                pass
        return None

    @classmethod
    def set(cls, key: str, data: Dict[str, Any], ttl_seconds: int = 86400) -> None:
        """Persist an entry to memory and disk cache."""
        now = time.time()
        entry = {
            "key": key,
            "created_at": now,
            "expires_at": now + ttl_seconds,
            "data": data
        }
        cls._in_memory_cache[key] = entry
        disk_path = os.path.join(CACHE_DIR, f"{key}.json")
        try:
            with open(disk_path, "w", encoding="utf-8") as f:
                json.dump(entry, f)
        except Exception:
            pass

    @classmethod
    def clear(cls) -> None:
        """Clear memory and disk cache for testing."""
        cls._in_memory_cache.clear()
        if os.path.exists(CACHE_DIR):
            for f in os.listdir(CACHE_DIR):
                if f.endswith(".json"):
                    try:
                        os.remove(os.path.join(CACHE_DIR, f))
                    except Exception:
                        pass
