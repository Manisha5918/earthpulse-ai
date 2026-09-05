import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, BigInteger, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class AnomalySeverityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    grid_id: Mapped[int] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="CASCADE"), nullable=False, index=True)
    year_month: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    signal_name: Mapped[str] = mapped_column(String(50), nullable=False)
    observed_value: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    baseline_mean: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    baseline_std: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    z_score: Mapped[float] = mapped_column(Numeric(8, 3), nullable=False)
    severity: Mapped[AnomalySeverityEnum] = mapped_column(Enum(AnomalySeverityEnum), nullable=False, index=True)
    anomaly_type: Mapped[str] = mapped_column(String(50), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SignalRelationship(Base):
    __tablename__ = "signal_relationships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    grid_id: Mapped[int] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="CASCADE"), nullable=False, index=True)
    primary_signal: Mapped[str] = mapped_column(String(50), nullable=False)
    secondary_signal: Mapped[str] = mapped_column(String(50), nullable=False)
    correlation_coefficient: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    lag_months: Mapped[int] = mapped_column(Integer, default=0)
    p_value: Mapped[Optional[float]] = mapped_column(Numeric(8, 6), nullable=True)
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=True)
    sample_size: Mapped[int] = mapped_column(Integer, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
