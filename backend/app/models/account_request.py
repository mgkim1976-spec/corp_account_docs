"""AccountRequest model — §6.3–6.7, §7."""

import json
from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AccountRequest(Base):
    __tablename__ = "account_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)

    account_type: Mapped[str] = mapped_column(String(40))
    applicant_type: Mapped[str] = mapped_column(String(60))

    case_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, comment="C01-C14")
    case_tags_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="JSON array of tags")

    ubo_confirmable: Mapped[bool] = mapped_column(default=True, comment="실제소유자 확인 가능 여부")
    ubo_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ownership_simple: Mapped[bool] = mapped_column(default=True)
    multi_layer_ownership: Mapped[bool] = mapped_column(default=False)
    ultimate_owner_unknown: Mapped[bool] = mapped_column(default=False)

    account_purpose: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    expected_products: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    fund_source: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    risk_flags_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(String(40), default="READY_FOR_REVIEW")
    determination_result_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    customer = relationship("Customer", back_populates="account_requests")

    @property
    def case_tags(self) -> list:
        return json.loads(self.case_tags_json) if self.case_tags_json else []

    @case_tags.setter
    def case_tags(self, value: list):
        self.case_tags_json = json.dumps(value, ensure_ascii=False)

    @property
    def risk_flags(self) -> dict:
        return json.loads(self.risk_flags_json) if self.risk_flags_json else {}

    @risk_flags.setter
    def risk_flags(self, value: dict):
        self.risk_flags_json = json.dumps(value, ensure_ascii=False)
