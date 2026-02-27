"""
Case Classifier — §7
입력값으로부터 케이스 코드(C01–C14)와 태그를 결정한다.
"""

from app.enums import (
    CustomerType,
    AccountType,
    ApplicantType,
    BusinessStatus,
)


def classify_case(ctx: dict) -> tuple[str, list[str]]:
    """
    입력 컨텍스트로부터 (case_code, [tags]) 를 반환한다.

    Parameters
    ----------
    ctx : dict
        customer_type, account_type, applicant_type,
        business_status, ubo_confirmable, ownership_simple,
        multi_layer_ownership, ultimate_owner_unknown,
        risk_flags (dict), domestic_flag, established_date …

    Returns
    -------
    (case_code, tags) : tuple[str, list[str]]
    """
    customer_type = ctx.get("customer_type")
    applicant_type = ctx.get("applicant_type")
    account_type = ctx.get("account_type")
    business_status = ctx.get("business_status", BusinessStatus.ACTIVE)
    ubo_confirmable = ctx.get("ubo_confirmable", True)
    risk_flags = ctx.get("risk_flags", {})
    domestic_flag = ctx.get("domestic_flag", True)

    tags: list[str] = []

    # ---- 기본 케이스 결정 (§7.1) ----

    # C09: 외국법인
    if customer_type in (CustomerType.FOREIGN_CORP, CustomerType.FOREIGN_ORG):
        case_code = "C09"
        tags.append("FOREIGN_RELATED")

    # C08: 법인격 없는 단체
    elif customer_type == CustomerType.NON_CORPORATE_ORG:
        case_code = "C08"

    # C06 / C07: 비영리법인
    elif customer_type == CustomerType.NON_PROFIT_CORP:
        if applicant_type in (
            ApplicantType.INTERNAL_EMPLOYEE_PROXY,
            ApplicantType.EXTERNAL_PROXY,
        ):
            case_code = "C07"
        else:
            case_code = "C06"

    # C04 / C05: 공동대표
    elif applicant_type == ApplicantType.JOINT_REP_SINGLE_ACTION_ALLOWED:
        case_code = "C04"

    elif applicant_type == ApplicantType.JOINT_REP_JOINT_ACTION_REQUIRED:
        case_code = "C05"

    # C14: 비대면
    elif applicant_type == ApplicantType.NON_FACE_TO_FACE_REQUEST:
        case_code = "C14"

    # C03: 외부 대리인
    elif applicant_type == ApplicantType.EXTERNAL_PROXY:
        case_code = "C03"

    # C02: 임직원 대리
    elif applicant_type == ApplicantType.INTERNAL_EMPLOYEE_PROXY:
        case_code = "C02"

    # C01: 대표자 본인 + 일반
    else:
        case_code = "C01"

    # ---- 추가 태그 부착 (§7.2) ----

    # 신설법인
    if ctx.get("is_new_corp", False):
        tags.append("NEW_CORP")
        # 신설이면 C10 으로 override
        if case_code in ("C01", "C02"):
            case_code = "C10"

    # 실제소유자 확인 곤란 → C11
    if not ubo_confirmable or ctx.get("multi_layer_ownership", False) or ctx.get("ultimate_owner_unknown", False):
        tags.append("UBO_COMPLEX")
        if case_code not in ("C09",):  # 외국법인은 이미 별도 처리
            case_code = "C11"

    # 고위험 플래그 → C12
    high_risk = risk_flags.get("high_risk_country", False) or \
                risk_flags.get("pep_sanction", False) or \
                risk_flags.get("special_review", False)
    if high_risk:
        tags.append("HIGH_RISK")
        case_code = "C12"

    # 상품 추가 (해외/파생/CMA 등) → C13 태그 추가 (케이스 코드는 유지)
    if account_type and account_type != AccountType.BROKERAGE_GENERAL:
        product_tag = f"{account_type.value}_PRODUCT"
        tags.append(product_tag)
        # 특수 상품이 포함되면 C13 태그도 부착하되 기본 케이스코드는 유지
        if "C1" not in case_code or case_code in ("C01", "C02"):
            tags.append("PRODUCT_ADDITIONAL")

    # 사업자 상태 이상
    if business_status in (BusinessStatus.SUSPENDED, BusinessStatus.CLOSED, BusinessStatus.UNKNOWN):
        tags.append("BUSINESS_STATUS_ABNORMAL")

    # 서류 불일치
    if risk_flags.get("document_mismatch", False):
        tags.append("DOCUMENT_MISMATCH")

    # 대리권 불명확
    if risk_flags.get("proxy_authority_unclear", False):
        tags.append("PROXY_UNCLEAR")

    return case_code, tags
