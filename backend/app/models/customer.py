"""Customer model — §6.1, §6.2."""

from datetime import date, datetime
from typing import Optional

from sqlalchemy import String, Date, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.enums import CustomerType, BusinessStatus


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    business_reg_no: Mapped[str] = mapped_column(String(20), unique=True, index=True, comment="사업자등록번호")
    corp_name: Mapped[str] = mapped_column(String(200), comment="법인명")
    customer_type: Mapped[str] = mapped_column(String(40), comment="고객 구분")
    domestic_flag: Mapped[bool] = mapped_column(default=True, comment="국내 여부")
    established_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, comment="법인 설립일")
    business_status: Mapped[str] = mapped_column(String(20), default="ACTIVE", comment="사업 상태")
    industry: Mapped[Optional[str]] = mapped_column(String(200), nullable=True, comment="업종")
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, comment="법인 주소")

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    account_requests = relationship("AccountRequest", back_populates="customer")
