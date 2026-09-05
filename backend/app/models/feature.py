from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, BigInteger, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.observation import ProvenanceTypeEnum


class RegionalFeature(Base):
    __tablename__ = "regional_features"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    grid_id: Mapped[int] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="CASCADE"), nullable=False, index=True)
    year_month: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ndvi: Mapped[Optional[float]] = mapped_column(Numeric(6, 4), nullable=True)
    ndwi: Mapped[Optional[float]] = mapped_column(Numeric(6, 4), nullable=True)
    ndbi: Mapped[Optional[float]] = mapped_column(Numeric(6, 4), nullable=True)
    night_light: Mapped[Optional[float]] = mapped_column(Numeric(10, 4), nullable=True)
    temp_celsius: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    rainfall_mm: Mapped[Optional[float]] = mapped_column(Numeric(8, 2), nullable=True)
    built_up_pct: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    provenance_type: Mapped[ProvenanceTypeEnum] = mapped_column(
        Enum(ProvenanceTypeEnum), default=ProvenanceTypeEnum.CALCULATED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("grid_id", "year_month", name="uq_grid_time"),
    )
