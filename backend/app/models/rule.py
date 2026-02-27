"""Rule, RequiredDocumentMapping, PolicyVersion models — §11, §18."""

import json
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    version: Mapped[str] = mapped_column(String(20), unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    effective_from: Mapped[str] = mapped_column(String(20))
    effective_to: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())

    rules = relationship("Rule", back_populates="policy_version")


class Rule(Base):
    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(200))
    enabled: Mapped[bool] = mapped_column(default=True)
    priority: Mapped[int] = mapped_column(Integer, default=100)

    conditions_json: Mapped[str] = mapped_column(Text)
    required_documents_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    optional_documents_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    blocked_if_missing: Mapped[bool] = mapped_column(default=False)
    escalate_if_true: Mapped[bool] = mapped_column(default=False)

    output_case_tags_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    output_status: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)

    explanation_template: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    policy_version_id: Mapped[Optional[int]] = mapped_column(ForeignKey("policy_versions.id"), nullable=True)
    valid_from: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    valid_to: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    created_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[Optional[str]] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    policy_version = relationship("PolicyVersion", back_populates="rules")
    document_mappings = relationship("RequiredDocumentMapping", back_populates="rule", cascade="all, delete-orphan")

    @property
    def conditions(self) -> dict:
        return json.loads(self.conditions_json) if self.conditions_json else {}

    @conditions.setter
    def conditions(self, value: dict):
        self.conditions_json = json.dumps(value, ensure_ascii=False)

    @property
    def required_documents(self) -> list:
        return json.loads(self.required_documents_json) if self.required_documents_json else []

    @required_documents.setter
    def required_documents(self, value: list):
        self.required_documents_json = json.dumps(value, ensure_ascii=False)

    @property
    def optional_documents(self) -> list:
        return json.loads(self.optional_documents_json) if self.optional_documents_json else []

    @optional_documents.setter
    def optional_documents(self, value: list):
        self.optional_documents_json = json.dumps(value, ensure_ascii=False)


class RequiredDocumentMapping(Base):
    __tablename__ = "required_document_mappings"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("rules.id"), index=True)
    document_type_code: Mapped[str] = mapped_column(String(60))
    group_code: Mapped[str] = mapped_column(String(40))
    group_min_count: Mapped[int] = mapped_column(Integer, default=1)

    rule = relationship("Rule", back_populates="document_mappings")
