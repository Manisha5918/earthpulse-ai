"""Centralized Configuration Management for EarthPulse AI."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "EarthPulse AI"
    DEBUG: bool = True
    VERSION: str = "0.1.0"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://earthpulse:earthpulse_dev_password@localhost:5432/earthpulse_db"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Data Providers
    NASA_POWER_API_BASE: str = "https://power.larc.nasa.gov/api/temporal"
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    
    # LLM Inference
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Strict Provenance Enforcement
    ENFORCE_PROVENANCE_TAGS: bool = True
    ALLOW_SYNTHETIC_FALLBACK: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
