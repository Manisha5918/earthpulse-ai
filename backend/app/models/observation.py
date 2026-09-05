import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Enum, BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class ProvenanceTypeEnum(str, enum.Enum):
    OBSERVED = "OBSERVED"
    CALCULATED = "CALCULATED"
    AI_INTERPRETED = "AI_INTERPRETED"
    SYNTHETIC_DEMO = "SYNTHETIC_DEMO"


class Observation(Base):
    __tablename__ = "observations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    grid_id: Mapped[int] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id: Mapped[str] = mapped_column(String(50), ForeignKey("datasets.id"), nullable=False, index=True)
    signal_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    signal_value: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    acquisition_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    processing_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    cloud_cover_pct: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    quality_flag: Mapped[str] = mapped_column(String(50), default="GOOD")
    provenance_type: Mapped[ProvenanceTypeEnum] = mapped_column(
        Enum(ProvenanceTypeEnum), default=ProvenanceTypeEnum.OBSERVED, nullable=False, index=True
    )
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
