"""Pydantic schemas for admin API."""

from __future__ import annotations

from pydantic import BaseModel


class DocumentTypeOut(BaseModel):
    id: int
    code: str
    name: str
    category: str
    description: str | None = None
    enabled: bool

    class Config:
        from_attributes = True


class DocumentTypeUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    enabled: bool | None = None


class CaseTypeOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    enabled: bool

    class Config:
        from_attributes = True


class RuleOut(BaseModel):
    id: int
    rule_name: str
    enabled: bool
    priority: int
    conditions_json: str
    required_documents_json: str | None = None
    optional_documents_json: str | None = None
    blocked_if_missing: bool
    escalate_if_true: bool
    output_status: str | None = None
    explanation_template: str | None = None

    class Config:
        from_attributes = True


class RuleCreate(BaseModel):
    rule_name: str
    priority: int = 100
    conditions_json: str
    required_documents_json: str | None = None
    optional_documents_json: str | None = None
    blocked_if_missing: bool = False
    escalate_if_true: bool = False
    output_status: str | None = None
    explanation_template: str | None = None


class RuleUpdate(BaseModel):
    rule_name: str | None = None
    enabled: bool | None = None
    priority: int | None = None
    conditions_json: str | None = None
    required_documents_json: str | None = None
    optional_documents_json: str | None = None
    blocked_if_missing: bool | None = None
    escalate_if_true: bool | None = None
    output_status: str | None = None
    explanation_template: str | None = None


class AuditLogOut(BaseModel):
    id: int
    event_type: str
    actor_id: int | None = None
    target_type: str
    target_id: int | None = None
    old_value: str | None = None
    new_value: str | None = None
    reason: str | None = None
    created_at: str

    class Config:
        from_attributes = True
