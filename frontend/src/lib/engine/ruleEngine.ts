// Rule Engine — §11
// JSON condition evaluator + rule matcher + determination compiler

export interface RuleMatch {
    ruleId: number;
    ruleName: string;
    requiredDocuments: string[];
    optionalDocuments: string[];
    blocked: boolean;
    escalate: boolean;
    outputStatus: string | null;
    outputCaseTags: string[];
    explanation: string;
}

export interface DeterminationResult {
    caseCode: string;
    caseTags: string[];
    status: string;
    requiredDocuments: string[];
    optionalDocuments: string[];
    blocked: boolean;
    escalate: boolean;
    explanations: string[];
    matchedRules: string[];
}

function resolveField(context: Record<string, any>, fieldPath: string): any {
    const parts = fieldPath.split(".");
    let obj: any = context;
    for (const part of parts) {
        if (obj && typeof obj === "object") {
            obj = obj[part];
        } else {
            return undefined;
        }
    }
    return obj;
}

export function evaluateCondition(condition: Record<string, any>, context: Record<string, any>): boolean {
    if ("all" in condition) {
        return (condition.all as any[]).every(c => evaluateCondition(c, context));
    }
    if ("any" in condition) {
        return (condition.any as any[]).some(c => evaluateCondition(c, context));
    }
    if ("not" in condition) {
        return !evaluateCondition(condition.not, context);
    }

    const fieldName = condition.field;
    if (!fieldName) return false;

    const value = resolveField(context, fieldName);

    if ("eq" in condition) return value === condition.eq;
    if ("neq" in condition) return value !== condition.neq;
    if ("in" in condition) return (condition.in as any[]).includes(value);
    if ("not_in" in condition) return !(condition.not_in as any[]).includes(value);
    if ("is_true" in condition) return !!value;
    if ("is_false" in condition) return !value;
    if ("exists" in condition) return condition.exists ? value != null : value == null;

    return false;
}

export function evaluateRules(rulesData: any[], context: Record<string, any>): RuleMatch[] {
    const sorted = [...rulesData].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    const matches: RuleMatch[] = [];

    for (const rule of sorted) {
        if (!rule.enabled) continue;
        const conditions = rule.conditions || {};
        if (Object.keys(conditions).length === 0) continue;

        if (evaluateCondition(conditions, context)) {
            matches.push({
                ruleId: rule.id,
                ruleName: rule.rule_name,
                requiredDocuments: rule.required_documents || [],
                optionalDocuments: rule.optional_documents || [],
                blocked: rule.blocked_if_missing || false,
                escalate: rule.escalate_if_true || false,
                outputStatus: rule.output_status || null,
                outputCaseTags: rule.output_case_tags || [],
                explanation: rule.explanation_template || "",
            });
        }
    }

    return matches;
}

const STATUS_PRIORITY: Record<string, number> = {
    BLOCKED: 6,
    ESCALATION_REQUIRED: 5,
    APPROVAL_PENDING: 4,
    NEEDS_SUPPLEMENT: 3,
    READY_FOR_REVIEW: 2,
    APPROVED_FOR_RECEPTION: 1,
};

function higherStatus(current: string, incoming: string): string {
    return (STATUS_PRIORITY[incoming] ?? 0) > (STATUS_PRIORITY[current] ?? 0) ? incoming : current;
}

export function compileDetermination(
    caseCode: string,
    caseTags: string[],
    matches: RuleMatch[],
): DeterminationResult {
    const allRequired: string[] = [];
    const allOptional: string[] = [];
    let blocked = false;
    let escalate = false;
    const explanations: string[] = [];
    const matchedNames: string[] = [];
    let finalStatus = "READY_FOR_REVIEW";
    const extraTags: string[] = [];

    for (const m of matches) {
        allRequired.push(...m.requiredDocuments);
        allOptional.push(...m.optionalDocuments);
        if (m.blocked) blocked = true;
        if (m.escalate) escalate = true;
        if (m.explanation) explanations.push(m.explanation);
        matchedNames.push(m.ruleName);
        if (m.outputCaseTags.length) extraTags.push(...m.outputCaseTags);
        if (m.outputStatus) finalStatus = higherStatus(finalStatus, m.outputStatus);
    }

    if (blocked) finalStatus = "BLOCKED";
    else if (escalate) finalStatus = higherStatus(finalStatus, "ESCALATION_REQUIRED");

    const uniqueRequired = [...new Set(allRequired)];
    const reqSet = new Set(uniqueRequired);
    const uniqueOptional = [...new Set(allOptional)].filter(d => !reqSet.has(d));
    const combinedTags = [...new Set([...caseTags, ...extraTags])];

    return {
        caseCode,
        caseTags: combinedTags,
        status: finalStatus,
        requiredDocuments: uniqueRequired,
        optionalDocuments: uniqueOptional,
        blocked,
        escalate,
        explanations,
        matchedRules: matchedNames,
    };
}
