// Case Classifier — §7
// Determines case code (C01-C14) and tags from input context

export interface ClassifyResult {
    caseCode: string;
    tags: string[];
}

export function classifyCase(ctx: Record<string, any>): ClassifyResult {
    const customerType = ctx.customer_type || "";
    const applicantType = ctx.applicant_type || "";
    const accountType = ctx.account_type || "";
    const businessStatus = ctx.business_status || "ACTIVE";
    const uboConfirmable = ctx.ubo_confirmable ?? true;
    const riskFlags = ctx.risk_flags || {};

    const tags: string[] = [];
    let caseCode: string;

    // §7.1 — primary case code
    if (["FOREIGN_CORP", "FOREIGN_ORG"].includes(customerType)) {
        caseCode = "C09";
        tags.push("FOREIGN_RELATED");
    } else if (customerType === "NON_CORPORATE_ORG") {
        caseCode = "C08";
    } else if (customerType === "NON_PROFIT_CORP") {
        caseCode = ["INTERNAL_EMPLOYEE_PROXY", "EXTERNAL_PROXY"].includes(applicantType) ? "C07" : "C06";
    } else if (applicantType === "JOINT_REP_SINGLE_ACTION_ALLOWED") {
        caseCode = "C04";
    } else if (applicantType === "JOINT_REP_JOINT_ACTION_REQUIRED") {
        caseCode = "C05";
    } else if (applicantType === "NON_FACE_TO_FACE_REQUEST") {
        caseCode = "C14";
    } else if (applicantType === "EXTERNAL_PROXY") {
        caseCode = "C03";
    } else if (applicantType === "INTERNAL_EMPLOYEE_PROXY") {
        caseCode = "C02";
    } else {
        caseCode = "C01";
    }

    // §7.2 — additional tags
    if (ctx.is_new_corp) {
        tags.push("NEW_CORP");
        if (["C01", "C02"].includes(caseCode)) caseCode = "C10";
    }

    if (!uboConfirmable || ctx.multi_layer_ownership || ctx.ultimate_owner_unknown) {
        tags.push("UBO_COMPLEX");
        if (caseCode !== "C09") caseCode = "C11";
    }

    const highRisk = riskFlags.high_risk_country || riskFlags.pep_sanction || riskFlags.special_review;
    if (highRisk) {
        tags.push("HIGH_RISK");
        caseCode = "C12";
    }

    if (accountType && accountType !== "BROKERAGE_GENERAL") {
        tags.push(`${accountType}_PRODUCT`);
        if (!caseCode.startsWith("C1") || ["C01", "C02"].includes(caseCode)) {
            tags.push("PRODUCT_ADDITIONAL");
        }
    }

    if (["SUSPENDED", "CLOSED", "UNKNOWN"].includes(businessStatus)) {
        tags.push("BUSINESS_STATUS_ABNORMAL");
    }
    if (riskFlags.document_mismatch) tags.push("DOCUMENT_MISMATCH");
    if (riskFlags.proxy_authority_unclear) tags.push("PROXY_UNCLEAR");

    return { caseCode, tags };
}
