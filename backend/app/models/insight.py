from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, BigInteger, Text, Enum
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from app.models.observation import ProvenanceTypeEnum


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    region_id: Mapped[int] = mapped_column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    grid_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="SET NULL"), nullable=True)
    year_month: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    detailed_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_json: Mapped[list] = mapped_column(JSONB, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Numeric(4, 3), default=0.950)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    provenance_type: Mapped[ProvenanceTypeEnum] = mapped_column(
        Enum(ProvenanceTypeEnum), default=ProvenanceTypeEnum.AI_INTERPRETED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SavedRegion(Base):
    __tablename__ = "saved_regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), nullable=False)
    region_id: Mapped[int] = mapped_column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False)
    grid_id: Mapped[int] = mapped_column(Integer, ForeignKey("grid_cells.id", ondelete="CASCADE"), nullable=False)
    custom_label: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
