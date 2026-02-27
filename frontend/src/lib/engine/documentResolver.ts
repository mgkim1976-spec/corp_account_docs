// Document Resolver — §9, §18
// Generates document packages from case code + tags

export interface DocumentGroup {
    group_code: string;
    documents: string[];
    min_required: number;
    description: string;
}

export interface DocumentPackage {
    required: string[];
    conditional: string[];
    groups: DocumentGroup[];
    explanations: string[];
}

const C01_BASE = [
    "DOC_BUSINESS_REGISTRATION", "DOC_CORPORATE_REGISTRY", "DOC_REPRESENTATIVE_ID",
    "DOC_ACCOUNT_OPENING_FORM", "DOC_CUSTOMER_DUE_DILIGENCE_FORM",
    "DOC_CORPORATE_SEAL_OR_SIGNATURE", "DOC_BENEFICIAL_OWNER_DECLARATION",
    "DOC_TRANSACTION_PURPOSE_FORM",
];
const C01_CONDITIONAL = ["DOC_FINANCIAL_STATEMENT", "DOC_SOURCE_OF_FUNDS_EXPLANATION"];
const PROXY_DOCS = ["DOC_PROXY_ID", "DOC_POWER_OF_ATTORNEY"];
const INTERNAL_PROXY_EXTRA = ["DOC_EMPLOYMENT_CERTIFICATE"];
const EXTERNAL_PROXY_EXTRA = ["DOC_AUTHORIZATION_PROOF", "DOC_BOARD_RESOLUTION"];
const JOINT_REP_DOCS = ["DOC_JOINT_REP_AUTH_PROOF"];
const NON_PROFIT_DOCS = ["DOC_ARTICLES_OF_INCORPORATION", "DOC_BYLAWS_OR_RULES"];
const NON_CORP_ORG_DOCS = ["DOC_BYLAWS_OR_RULES"];
const FOREIGN_CORP_DOCS = [
    "DOC_FOREIGN_INCORPORATION_CERT", "DOC_FOREIGN_REGISTRY_EXTRACT",
    "DOC_KOREAN_TRANSLATION", "DOC_NOTARIZATION_OR_APOSTILLE",
    "DOC_PASSPORT_OR_FOREIGN_ID", "DOC_TAX_RESIDENCY_FORM",
];
const NEW_CORP_DOCS = ["DOC_OFFICE_LEASE", "DOC_BUSINESS_WEBSITE_OR_PHOTO"];
const UBO_COMPLEX_DOCS = [
    "DOC_OWNERSHIP_STRUCTURE_CHART", "DOC_SHAREHOLDER_REGISTER",
    "DOC_CONTROL_PERSON_EXPLANATION", "DOC_AML_REVIEW_NOTE",
];
const HIGH_RISK_DOCS = ["DOC_AML_REVIEW_NOTE", "DOC_COMPLIANCE_APPROVAL"];

const PRODUCT_DOCS: Record<string, string[]> = {
    FOREIGN_SECURITIES: ["DOC_FOREIGN_SECURITIES_AGREEMENT"],
    DERIVATIVES: ["DOC_DERIVATIVES_RISK_DISCLOSURE", "DOC_PRODUCT_SUITABILITY_FORM"],
    CMA_SETTLEMENT: ["DOC_CMA_ADDITIONAL_TERMS"],
    BOND_REPO: ["DOC_TRADING_AUTHORITY_FORM"],
    OTHER_PRODUCT: ["DOC_OTHER_PRODUCT_SPECIFIC_FORM"],
};

export function resolveDocuments(
    caseCode: string,
    caseTags: string[],
    accountType?: string,
): DocumentPackage {
    const pkg: DocumentPackage = { required: [], conditional: [], groups: [], explanations: [] };

    pkg.required.push(...C01_BASE);
    pkg.conditional.push(...C01_CONDITIONAL);
    pkg.explanations.push("기본 법인 계좌개설 필수서류가 포함됩니다.");

    if (["C02", "C03", "C07"].includes(caseCode)) {
        pkg.required.push(...PROXY_DOCS);
        pkg.explanations.push("대리 신청이므로 대리인 신분증과 위임장이 필요합니다.");
        pkg.groups.push({
            group_code: "SEAL_CERT_GROUP",
            documents: ["DOC_CORPORATE_SEAL_CERTIFICATE", "DOC_USE_OF_SEAL_FORM"],
            min_required: 1,
            description: "법인 인감증명서 또는 사용인감계 중 1개 이상",
        });
    }

    if (caseCode === "C02") {
        pkg.required.push(...INTERNAL_PROXY_EXTRA);
        pkg.explanations.push("임직원 대리이므로 재직증명서가 필요합니다.");
    }
    if (caseCode === "C03") {
        pkg.required.push(...EXTERNAL_PROXY_EXTRA);
        pkg.explanations.push("외부 대리인이므로 대리권 소명자료와 결의서가 필요합니다.");
    }
    if (["C04", "C05"].includes(caseCode)) {
        pkg.required.push(...JOINT_REP_DOCS);
        pkg.explanations.push("공동대표 구조이므로 권한 확인 서류가 필요합니다.");
        if (caseCode === "C05")
            pkg.explanations.push("공동행사가 필요하므로 전원의 서명/날인이 확인되어야 합니다.");
    }
    if (["C06", "C07"].includes(caseCode)) {
        pkg.required.push(...NON_PROFIT_DOCS);
        pkg.explanations.push("비영리법인이므로 정관/규약이 필요합니다.");
    }
    if (caseCode === "C08") {
        pkg.required.push(...NON_CORP_ORG_DOCS);
        pkg.explanations.push("법인격 없는 단체이므로 회칙/규약이 필요합니다.");
    }
    if (caseCode === "C09") {
        pkg.required.push(...FOREIGN_CORP_DOCS);
        pkg.explanations.push("외국법인이므로 설립증빙, 번역문, 공증 서류가 필요합니다.");
    }
    if (caseCode === "C10" || caseTags.includes("NEW_CORP")) {
        pkg.required.push(...NEW_CORP_DOCS);
        pkg.conditional.push("DOC_STARTUP_SUPPORT_PROOF");
        pkg.explanations.push("신설법인이므로 사업장 증빙이 필요합니다.");
    }
    if (caseCode === "C11" || caseTags.includes("UBO_COMPLEX")) {
        pkg.required.push(...UBO_COMPLEX_DOCS);
        pkg.explanations.push("실제소유자 확인 곤란으로 추가 지배구조 서류가 필요합니다.");
    }
    if (caseCode === "C12" || caseTags.includes("HIGH_RISK")) {
        pkg.required.push(...HIGH_RISK_DOCS);
        pkg.explanations.push("고위험 플래그로 인해 강화된 심사 서류가 필요합니다.");
    }

    if (accountType && accountType !== "BROKERAGE_GENERAL") {
        const productDocs = PRODUCT_DOCS[accountType] || [];
        if (productDocs.length) {
            pkg.required.push(...productDocs);
            pkg.explanations.push(`${accountType} 상품 관련 추가 서류가 필요합니다.`);
        }
    }

    if (!pkg.required.includes("DOC_SHAREHOLDER_REGISTER")) {
        pkg.groups.push({
            group_code: "OWNERSHIP_PROOF_GROUP",
            documents: ["DOC_SHAREHOLDER_REGISTER", "DOC_MEMBER_REGISTER"],
            min_required: 1,
            description: "주주명부 또는 사원명부/출자자명부 중 1개",
        });
    }

    pkg.required = [...new Set(pkg.required)];
    const reqSet = new Set(pkg.required);
    pkg.conditional = [...new Set(pkg.conditional)].filter(d => !reqSet.has(d));

    return pkg;
}
