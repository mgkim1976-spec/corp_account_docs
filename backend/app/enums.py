"""Enum definitions from corp_account.md §6."""

import enum


class CustomerType(str, enum.Enum):
    """§6.2 고객유형"""
    FOR_PROFIT_CORP_DOMESTIC = "FOR_PROFIT_CORP_DOMESTIC"   # 국내 영리법인
    NON_PROFIT_CORP = "NON_PROFIT_CORP"                     # 비영리법인
    NON_CORPORATE_ORG = "NON_CORPORATE_ORG"                 # 법인격 없는 단체
    FOREIGN_CORP = "FOREIGN_CORP"                           # 외국법인
    FOREIGN_ORG = "FOREIGN_ORG"                             # 외국단체
    SOLE_PROPRIETOR = "SOLE_PROPRIETOR"                     # 개인사업자


class AccountType(str, enum.Enum):
    """§6.3 계좌유형"""
    BROKERAGE_GENERAL = "BROKERAGE_GENERAL"       # 일반 위탁/종합
    CMA_SETTLEMENT = "CMA_SETTLEMENT"             # CMA/입출금성
    FOREIGN_SECURITIES = "FOREIGN_SECURITIES"     # 해외주식/외화
    DERIVATIVES = "DERIVATIVES"                   # 선물/옵션/파생
    BOND_REPO = "BOND_REPO"                       # 채권/RP
    OTHER_PRODUCT = "OTHER_PRODUCT"               # 기타 상품성 계좌


class ApplicantType(str, enum.Enum):
    """§6.4 내점/신청자 유형"""
    REPRESENTATIVE_SELF = "REPRESENTATIVE_SELF"                       # 대표자 본인
    INTERNAL_EMPLOYEE_PROXY = "INTERNAL_EMPLOYEE_PROXY"               # 임직원 대리
    EXTERNAL_PROXY = "EXTERNAL_PROXY"                                 # 외부 대리인
    JOINT_REP_SINGLE_ACTION_ALLOWED = "JOINT_REP_SINGLE_ACTION_ALLOWED"  # 공동대표 단독 가능
    JOINT_REP_JOINT_ACTION_REQUIRED = "JOINT_REP_JOINT_ACTION_REQUIRED"  # 공동대표 공동행사
    NON_FACE_TO_FACE_REQUEST = "NON_FACE_TO_FACE_REQUEST"             # 비대면 사전접수


class BusinessStatus(str, enum.Enum):
    """§6.1 사업 상태"""
    ACTIVE = "ACTIVE"             # 계속
    SUSPENDED = "SUSPENDED"       # 휴업
    CLOSED = "CLOSED"             # 폐업
    UNKNOWN = "UNKNOWN"           # 확인불가


class RequestStatus(str, enum.Enum):
    """§11.3 출력 상태"""
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    NEEDS_SUPPLEMENT = "NEEDS_SUPPLEMENT"
    ESCALATION_REQUIRED = "ESCALATION_REQUIRED"
    BLOCKED = "BLOCKED"
    APPROVAL_PENDING = "APPROVAL_PENDING"
    APPROVED_FOR_RECEPTION = "APPROVED_FOR_RECEPTION"


class UserRole(str, enum.Enum):
    """§5 핵심 사용자 역할"""
    STAFF = "STAFF"               # 영업점 직원
    REVIEWER = "REVIEWER"         # 심사/승인 담당
    ADMIN = "ADMIN"               # 운영 관리자
    COMPLIANCE = "COMPLIANCE"     # 준법/AML

class DocumentCategory(str, enum.Enum):
    """§8 서류 카테고리"""
    BASIC = "BASIC"                 # 공통 기본서류
    PROXY_AUTH = "PROXY_AUTH"       # 대리/권한 관련
    UBO_GOVERNANCE = "UBO_GOVERNANCE"  # 실제소유자/지배구조
    TRANSACTION = "TRANSACTION"     # 거래목적/자금원천
    FOREIGN = "FOREIGN"             # 해외/외국법인
    PRODUCT_SPECIFIC = "PRODUCT_SPECIFIC"  # 상품별 추가
    EXCEPTION = "EXCEPTION"         # 예외/심사
