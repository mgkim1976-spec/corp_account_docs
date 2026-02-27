"""CaseType and CaseTag models — §7."""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class CaseType(Base):
    __tablename__ = "case_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class CaseTag(Base):
    __tablename__ = "case_tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
