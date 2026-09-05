import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.models.base import Base


class AdminLevelEnum(str, enum.Enum):
    NATIONAL = "NATIONAL"
    STATE = "STATE"
    DISTRICT = "DISTRICT"
    SUB_DISTRICT = "SUB_DISTRICT"
    METRO_ZONE = "METRO_ZONE"


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India")
    admin_level: Mapped[AdminLevelEnum] = mapped_column(Enum(AdminLevelEnum), nullable=False)
    boundary_geom = mapped_column(Geometry("MULTIPOLYGON", srid=4326), nullable=True)
    centroid_geom = mapped_column(Geometry("POINT", srid=4326), nullable=True)
    area_sqkm: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    grid_cells: Mapped[List["GridCell"]] = relationship("GridCell", back_populates="region", cascade="all, delete-orphan")


class GridCell(Base):
    __tablename__ = "grid_cells"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    region_id: Mapped[int] = mapped_column(Integer, ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    cell_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    center_lat: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    center_lon: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    cell_geom = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    center_point = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    area_sqkm: Mapped[float] = mapped_column(Numeric(8, 2), default=30.25)
    resolution_deg: Mapped[float] = mapped_column(Numeric(6, 4), default=0.0500)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    region: Mapped["Region"] = relationship("Region", back_populates="grid_cells")
