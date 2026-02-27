export interface RiskFlags {
  high_risk_country: boolean;
  pep_sanction: boolean;
  special_review: boolean;
  document_mismatch: boolean;
  proxy_authority_unclear: boolean;
  dormant_suspicious: boolean;
}

export interface DeterminationInput {
  business_reg_no: string;
  corp_name: string;
  customer_type: string;
  domestic_flag: boolean;
  business_status: string;
  account_type: string;
  applicant_type: string;
  ubo_confirmable: boolean;
  ownership_simple: boolean;
  multi_layer_ownership: boolean;
  ultimate_owner_unknown: boolean;
  account_purpose?: string;
  fund_source?: string;
  risk_flags: RiskFlags;
  is_new_corp: boolean;
}

export interface DocumentGroup {
  group_code: string;
  documents: string[];
  min_required: number;
  description: string;
}

export interface DeterminationResult {
  case_code: string;
  case_tags: string[];
  status: string;
  required_documents: string[];
  optional_documents: string[];
  document_groups: DocumentGroup[];
  blocked: boolean;
  escalate: boolean;
  explanations: string[];
  matched_rules: string[];
}

export async function determine(input: DeterminationInput): Promise<DeterminationResult> {
  const res = await fetch("/api/determine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchAdminData(): Promise<{ documentTypes: any[]; caseTypes: any[]; rules: any[] }> {
  const res = await fetch("/api/admin");
  return res.json();
}

// Enum display labels
export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  FOR_PROFIT_CORP_DOMESTIC: "국내 영리법인",
  NON_PROFIT_CORP: "비영리법인",
  NON_CORPORATE_ORG: "법인격 없는 단체",
  FOREIGN_CORP: "외국법인",
  FOREIGN_ORG: "외국단체",
  SOLE_PROPRIETOR: "개인사업자",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BROKERAGE_GENERAL: "일반 위탁/종합",
  CMA_SETTLEMENT: "CMA/입출금성",
  FOREIGN_SECURITIES: "해외주식/외화",
  DERIVATIVES: "선물/옵션/파생",
  BOND_REPO: "채권/RP",
  OTHER_PRODUCT: "기타 상품",
};

export const APPLICANT_TYPE_LABELS: Record<string, string> = {
  REPRESENTATIVE_SELF: "대표자 본인",
  INTERNAL_EMPLOYEE_PROXY: "임직원 대리",
  EXTERNAL_PROXY: "외부 대리인",
  JOINT_REP_SINGLE_ACTION_ALLOWED: "공동대표 (단독 가능)",
  JOINT_REP_JOINT_ACTION_REQUIRED: "공동대표 (공동행사 필요)",
  NON_FACE_TO_FACE_REQUEST: "비대면 사전접수",
};

export const BUSINESS_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "계속(정상)",
  SUSPENDED: "휴업",
  CLOSED: "폐업",
  UNKNOWN: "확인불가",
};

export const STATUS_LABELS: Record<string, string> = {
  READY_FOR_REVIEW: "접수 검토 가능",
  NEEDS_SUPPLEMENT: "보완 필요",
  ESCALATION_REQUIRED: "심사/승인 필요",
  BLOCKED: "접수 차단",
  APPROVAL_PENDING: "승인 대기",
  APPROVED_FOR_RECEPTION: "접수 승인 완료",
};

export const STATUS_COLORS: Record<string, string> = {
  READY_FOR_REVIEW: "#22c55e",
  NEEDS_SUPPLEMENT: "#f59e0b",
  ESCALATION_REQUIRED: "#f97316",
  BLOCKED: "#ef4444",
  APPROVAL_PENDING: "#3b82f6",
  APPROVED_FOR_RECEPTION: "#10b981",
};

export const DOC_NAME_MAP: Record<string, string> = {
  DOC_BUSINESS_REGISTRATION: "사업자등록증",
  DOC_CORPORATE_REGISTRY: "법인 등기사항전부증명서",
  DOC_ACCOUNT_OPENING_FORM: "계좌개설 신청서",
  DOC_CUSTOMER_DUE_DILIGENCE_FORM: "고객확인서(기본정보서)",
  DOC_REPRESENTATIVE_ID: "대표자 신분증",
  DOC_CORPORATE_SEAL_OR_SIGNATURE: "거래 인감/서명",
  DOC_CONTACT_INFO_VERIFICATION: "연락처/주소 확인",
  DOC_PROXY_ID: "대리인 신분증",
  DOC_POWER_OF_ATTORNEY: "위임장",
  DOC_CORPORATE_SEAL_CERTIFICATE: "법인 인감증명서",
  DOC_USE_OF_SEAL_FORM: "사용인감계",
  DOC_EMPLOYMENT_CERTIFICATE: "재직증명서",
  DOC_AUTHORIZATION_PROOF: "대리권 확인 서류",
  DOC_BOARD_RESOLUTION: "이사회 의사록/결의서",
  DOC_JOINT_REP_AUTH_PROOF: "공동대표 권한확인서류",
  DOC_SHAREHOLDER_REGISTER: "주주명부",
  DOC_MEMBER_REGISTER: "사원명부/출자자명부",
  DOC_BENEFICIAL_OWNER_DECLARATION: "실제소유자 확인서",
  DOC_OWNERSHIP_STRUCTURE_CHART: "지배구조도",
  DOC_ARTICLES_OF_INCORPORATION: "정관",
  DOC_BYLAWS_OR_RULES: "규약/회칙",
  DOC_CONTROL_PERSON_EXPLANATION: "사실상 지배자 소명자료",
  DOC_TRANSACTION_PURPOSE_FORM: "금융거래 목적 확인서",
  DOC_SOURCE_OF_FUNDS_EXPLANATION: "자금원천 설명서",
  DOC_FINANCIAL_STATEMENT: "재무제표",
  DOC_TAX_INVOICE_OR_CONTRACT: "세금계산서/거래계약서",
  DOC_OFFICE_LEASE: "사업장 임대차계약서",
  DOC_BUSINESS_WEBSITE_OR_PHOTO: "홈페이지/사업장 사진",
  DOC_STARTUP_SUPPORT_PROOF: "창업지원기관 확인",
  DOC_FOREIGN_INCORPORATION_CERT: "외국법인 설립증빙",
  DOC_FOREIGN_REGISTRY_EXTRACT: "외국 등기/등록증빙",
  DOC_NOTARIZATION_OR_APOSTILLE: "공증/아포스티유",
  DOC_PASSPORT_OR_FOREIGN_ID: "외국 대표자 여권",
  DOC_KOREAN_TRANSLATION: "번역문",
  DOC_TAX_RESIDENCY_FORM: "세무거주지/FATCA/CRS",
  DOC_FOREIGN_SECURITIES_AGREEMENT: "해외상품 약정서",
  DOC_DERIVATIVES_RISK_DISCLOSURE: "파생상품 위험고지서",
  DOC_PRODUCT_SUITABILITY_FORM: "투자자 적합성 확인서",
  DOC_TRADING_AUTHORITY_FORM: "매매거래 권한 확인서",
  DOC_CMA_ADDITIONAL_TERMS: "CMA 추가약관 동의서",
  DOC_OTHER_PRODUCT_SPECIFIC_FORM: "기타 상품별 양식",
  DOC_AML_REVIEW_NOTE: "AML 심사 기록",
  DOC_COMPLIANCE_APPROVAL: "준법감시 승인서",
  DOC_EXCEPTION_REVIEW_MEMO: "예외심사 메모",
  DOC_REJECTION_REASON_RECORD: "반려 사유 기록",
};
