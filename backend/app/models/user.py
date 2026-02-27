"""User model — §5."""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20))
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
