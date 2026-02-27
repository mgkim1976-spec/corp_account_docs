"""Pydantic schemas for the determination API."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.enums import (
    CustomerType,
    AccountType,
    ApplicantType,
    BusinessStatus,
)


# ── Request ──

class RiskFlagsInput(BaseModel):
    high_risk_country: bool = False
    pep_sanction: bool = False
    special_review: bool = False
    document_mismatch: bool = False
    proxy_authority_unclear: bool = False
    dormant_suspicious: bool = False


class DeterminationRequest(BaseModel):
    """직원이 판정을 요청할 때 보내는 입력값."""
    # §6.1
    business_reg_no: str = Field(..., min_length=1, max_length=20)
    corp_name: str = Field(..., min_length=1, max_length=200)
    # §6.2
    customer_type: CustomerType
    domestic_flag: bool = True
    business_status: BusinessStatus = BusinessStatus.ACTIVE
    # §6.3
    account_type: AccountType = AccountType.BROKERAGE_GENERAL
    # §6.4
    applicant_type: ApplicantType = ApplicantType.REPRESENTATIVE_SELF
    # §6.5
    ubo_confirmable: bool = True
    ownership_simple: bool = True
    multi_layer_ownership: bool = False
    ultimate_owner_unknown: bool = False
    # §6.6
    account_purpose: str | None = None
    fund_source: str | None = None
    # §6.7
    risk_flags: RiskFlagsInput = Field(default_factory=RiskFlagsInput)
    # 신설법인 여부
    is_new_corp: bool = False


# ── Response ──

class DocumentGroupResponse(BaseModel):
    group_code: str
    documents: list[str]
    min_required: int
    description: str


class DeterminationResponse(BaseModel):
    """판정 결과."""
    case_code: str
    case_tags: list[str]
    status: str
    required_documents: list[str]
    optional_documents: list[str]
    document_groups: list[DocumentGroupResponse] = []
    blocked: bool
    escalate: bool
    explanations: list[str]
    matched_rules: list[str]


# ── AccountRequest list ──

class AccountRequestSummary(BaseModel):
    id: int
    business_reg_no: str
    corp_name: str
    case_code: str | None
    status: str
    created_at: str

    class Config:
        from_attributes = True
