"""
Document Resolver — §9, §18
케이스 코드+태그 → 서류 패키지 생성 (대체 가능 서류 그룹 포함).
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class DocumentGroup:
    """대체 가능 서류 그룹 (§18)."""
    group_code: str
    documents: list[str]
    min_required: int = 1  # 그룹 내 최소 제출 수
    description: str = ""


@dataclass
class DocumentPackage:
    """케이스에 대한 서류 패키지."""
    required: list[str] = field(default_factory=list)
    conditional: list[str] = field(default_factory=list)
    groups: list[DocumentGroup] = field(default_factory=list)
    explanations: list[str] = field(default_factory=list)


# ──────────────────────────────────────────────
# §9 케이스별 기본 서류 매핑 (초기 설정)
# 실제 운영에서는 DB rules를 통해 관리
# ──────────────────────────────────────────────

# C01 기본 필수 서류
_C01_BASE = [
    "DOC_BUSINESS_REGISTRATION",
    "DOC_CORPORATE_REGISTRY",
    "DOC_REPRESENTATIVE_ID",
    "DOC_ACCOUNT_OPENING_FORM",
    "DOC_CUSTOMER_DUE_DILIGENCE_FORM",
    "DOC_CORPORATE_SEAL_OR_SIGNATURE",
    "DOC_BENEFICIAL_OWNER_DECLARATION",
    "DOC_TRANSACTION_PURPOSE_FORM",
]

_C01_CONDITIONAL = [
    "DOC_FINANCIAL_STATEMENT",
    "DOC_SOURCE_OF_FUNDS_EXPLANATION",
]

# 대리인 추가 서류
_PROXY_DOCS = [
    "DOC_PROXY_ID",
    "DOC_POWER_OF_ATTORNEY",
]

_INTERNAL_PROXY_EXTRA = [
    "DOC_EMPLOYMENT_CERTIFICATE",
]

_EXTERNAL_PROXY_EXTRA = [
    "DOC_AUTHORIZATION_PROOF",
    "DOC_BOARD_RESOLUTION",
]

# 공동대표
_JOINT_REP_DOCS = [
    "DOC_JOINT_REP_AUTH_PROOF",
]

# 비영리법인
_NON_PROFIT_DOCS = [
    "DOC_ARTICLES_OF_INCORPORATION",
    "DOC_BYLAWS_OR_RULES",
]

# 법인격 없는 단체
_NON_CORP_ORG_DOCS = [
    "DOC_BYLAWS_OR_RULES",
]

# 외국법인
_FOREIGN_CORP_DOCS = [
    "DOC_FOREIGN_INCORPORATION_CERT",
    "DOC_FOREIGN_REGISTRY_EXTRACT",
    "DOC_KOREAN_TRANSLATION",
    "DOC_NOTARIZATION_OR_APOSTILLE",
    "DOC_PASSPORT_OR_FOREIGN_ID",
    "DOC_TAX_RESIDENCY_FORM",
]

# 신설법인 추가
_NEW_CORP_DOCS = [
    "DOC_OFFICE_LEASE",
    "DOC_BUSINESS_WEBSITE_OR_PHOTO",
]

# UBO 관련
_UBO_COMPLEX_DOCS = [
    "DOC_OWNERSHIP_STRUCTURE_CHART",
    "DOC_SHAREHOLDER_REGISTER",
    "DOC_CONTROL_PERSON_EXPLANATION",
    "DOC_AML_REVIEW_NOTE",
]

# 고위험
_HIGH_RISK_DOCS = [
    "DOC_AML_REVIEW_NOTE",
    "DOC_COMPLIANCE_APPROVAL",
]

# 상품별 추가
_PRODUCT_DOCS = {
    "FOREIGN_SECURITIES": ["DOC_FOREIGN_SECURITIES_AGREEMENT"],
    "DERIVATIVES": ["DOC_DERIVATIVES_RISK_DISCLOSURE", "DOC_PRODUCT_SUITABILITY_FORM"],
    "CMA_SETTLEMENT": ["DOC_CMA_ADDITIONAL_TERMS"],
    "BOND_REPO": ["DOC_TRADING_AUTHORITY_FORM"],
    "OTHER_PRODUCT": ["DOC_OTHER_PRODUCT_SPECIFIC_FORM"],
}


def resolve_documents(case_code: str, case_tags: list[str], account_type: str | None = None) -> DocumentPackage:
    """
    케이스 코드 + 태그 + 계좌유형으로 필요 서류 패키지를 생성한다.
    이 함수는 룰 엔진의 DB 룰이 없을 때 fallback으로 사용되며,
    실제 운영에서는 DB 룰의 결과가 우선한다.
    """
    pkg = DocumentPackage()

    # ── 기본 서류 (모든 케이스 공통) ──
    pkg.required.extend(_C01_BASE)
    pkg.conditional.extend(_C01_CONDITIONAL)
    pkg.explanations.append("기본 법인 계좌개설 필수서류가 포함됩니다.")

    # ── 케이스별 추가 ──
    if case_code in ("C02", "C03", "C07"):
        # 대리인 서류
        pkg.required.extend(_PROXY_DOCS)
        pkg.explanations.append("대리 신청이므로 대리인 신분증과 위임장이 필요합니다.")
        # 인감증명/사용인감 대체 그룹
        pkg.groups.append(DocumentGroup(
            group_code="SEAL_CERT_GROUP",
            documents=["DOC_CORPORATE_SEAL_CERTIFICATE", "DOC_USE_OF_SEAL_FORM"],
            min_required=1,
            description="법인 인감증명서 또는 사용인감계 중 1개 이상",
        ))

    if case_code == "C02":
        pkg.required.extend(_INTERNAL_PROXY_EXTRA)
        pkg.explanations.append("임직원 대리이므로 재직증명서가 필요합니다.")

    if case_code == "C03":
        pkg.required.extend(_EXTERNAL_PROXY_EXTRA)
        pkg.explanations.append("외부 대리인이므로 대리권 소명자료와 결의서가 필요합니다.")

    if case_code in ("C04", "C05"):
        pkg.required.extend(_JOINT_REP_DOCS)
        pkg.explanations.append("공동대표 구조이므로 권한 확인 서류가 필요합니다.")
        if case_code == "C05":
            pkg.explanations.append("공동행사가 필요하므로 전원의 서명/날인이 확인되어야 합니다.")

    if case_code in ("C06", "C07"):
        pkg.required.extend(_NON_PROFIT_DOCS)
        pkg.explanations.append("비영리법인이므로 정관/규약이 필요합니다.")

    if case_code == "C08":
        pkg.required.extend(_NON_CORP_ORG_DOCS)
        pkg.explanations.append("법인격 없는 단체이므로 회칙/규약이 필요합니다.")

    if case_code == "C09":
        pkg.required.extend(_FOREIGN_CORP_DOCS)
        pkg.explanations.append("외국법인이므로 설립증빙, 번역문, 공증 서류가 필요합니다.")

    if case_code == "C10" or "NEW_CORP" in case_tags:
        pkg.required.extend(_NEW_CORP_DOCS)
        pkg.conditional.append("DOC_STARTUP_SUPPORT_PROOF")
        pkg.explanations.append("신설법인이므로 사업장 증빙이 필요합니다.")

    if case_code == "C11" or "UBO_COMPLEX" in case_tags:
        pkg.required.extend(_UBO_COMPLEX_DOCS)
        pkg.explanations.append("실제소유자 확인 곤란으로 추가 지배구조 서류가 필요합니다.")

    if case_code == "C12" or "HIGH_RISK" in case_tags:
        pkg.required.extend(_HIGH_RISK_DOCS)
        pkg.explanations.append("고위험 플래그로 인해 강화된 심사 서류가 필요합니다.")

    # ── 상품별 추가 (C13) ──
    if account_type and account_type != "BROKERAGE_GENERAL":
        product_docs = _PRODUCT_DOCS.get(account_type, [])
        if product_docs:
            pkg.required.extend(product_docs)
            pkg.explanations.append(f"{account_type} 상품 관련 추가 서류가 필요합니다.")

    # ── 대체 가능 서류 공통 그룹 (§18) ──
    if "DOC_SHAREHOLDER_REGISTER" not in pkg.required:
        pkg.groups.append(DocumentGroup(
            group_code="OWNERSHIP_PROOF_GROUP",
            documents=["DOC_SHAREHOLDER_REGISTER", "DOC_MEMBER_REGISTER"],
            min_required=1,
            description="주주명부 또는 사원명부/출자자명부 중 1개",
        ))

    # 중복 제거
    pkg.required = list(dict.fromkeys(pkg.required))
    pkg.conditional = [d for d in dict.fromkeys(pkg.conditional) if d not in pkg.required]

    return pkg
