import { NextRequest, NextResponse } from "next/server";
import { classifyCase } from "@/lib/engine/caseClassifier";
import { evaluateRules, compileDetermination } from "@/lib/engine/ruleEngine";
import { resolveDocuments } from "@/lib/engine/documentResolver";
import { rules } from "@/lib/engine/seedData";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Build context
        const context: Record<string, any> = {
            customer_type: body.customer_type || "FOR_PROFIT_CORP_DOMESTIC",
            account_type: body.account_type || "BROKERAGE_GENERAL",
            applicant_type: body.applicant_type || "REPRESENTATIVE_SELF",
            business_status: body.business_status || "ACTIVE",
            domestic_flag: body.domestic_flag ?? true,
            ubo_confirmable: body.ubo_confirmable ?? true,
            ownership_simple: body.ownership_simple ?? true,
            multi_layer_ownership: body.multi_layer_ownership ?? false,
            ultimate_owner_unknown: body.ultimate_owner_unknown ?? false,
            is_new_corp: body.is_new_corp ?? false,
            risk_flags: body.risk_flags || {},
        };

        // 1. Case classification
        const { caseCode, tags } = classifyCase(context);

        // 2. Rule evaluation
        const matches = evaluateRules(rules, context);
        const result = compileDetermination(caseCode, tags, matches);

        // 3. Document resolver (fallback)
        const docPkg = resolveDocuments(caseCode, tags, context.account_type);

        // Merge
        const mergedRequired = [...new Set([...result.requiredDocuments, ...docPkg.required])];
        const reqSet = new Set(mergedRequired);
        const mergedOptional = [...new Set([...result.optionalDocuments, ...docPkg.conditional])].filter(
            d => !reqSet.has(d)
        );
        const mergedExplanations = [...new Set([...result.explanations, ...docPkg.explanations])];

        return NextResponse.json({
            case_code: result.caseCode,
            case_tags: result.caseTags,
            status: result.status,
            required_documents: mergedRequired,
            optional_documents: mergedOptional,
            document_groups: docPkg.groups,
            blocked: result.blocked,
            escalate: result.escalate,
            explanations: mergedExplanations,
            matched_rules: result.matchedRules,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
