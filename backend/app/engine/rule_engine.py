"""
Rule Engine — §11
JSON 조건을 평가하여 서류 요구, 차단, 에스컬레이션을 결정한다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


# ──────────────────────────────────────────────
# 조건 평가 (§11.2)
# ──────────────────────────────────────────────

def evaluate_condition(condition: dict, context: dict) -> bool:
    """
    단일 조건 또는 논리 연산자(all/any/not)를 재귀적으로 평가한다.

    조건 형식 예시:
      {"field": "customer_type", "eq": "FOR_PROFIT_CORP_DOMESTIC"}
      {"all": [...conditions...]}
      {"any": [...conditions...]}
      {"not": {condition}}
    """
    # 논리 연산자
    if "all" in condition:
        return all(evaluate_condition(c, context) for c in condition["all"])
    if "any" in condition:
        return any(evaluate_condition(c, context) for c in condition["any"])
    if "not" in condition:
        return not evaluate_condition(condition["not"], context)

    # 필드 비교
    field_name = condition.get("field")
    if field_name is None:
        return False

    # 중첩 필드 지원: "risk_flags.high_risk_country"
    value = _resolve_field(context, field_name)

    # 연산자
    if "eq" in condition:
        return value == condition["eq"]
    if "neq" in condition:
        return value != condition["neq"]
    if "in" in condition:
        return value in condition["in"]
    if "not_in" in condition:
        return value not in condition["not_in"]
    if "is_true" in condition:
        return bool(value) is True
    if "is_false" in condition:
        return not bool(value)
    if "exists" in condition:
        return value is not None if condition["exists"] else value is None

    return False


def _resolve_field(context: dict, field_path: str) -> Any:
    """점(.)으로 구분된 중첩 필드를 해석한다."""
    parts = field_path.split(".")
    obj = context
    for part in parts:
        if isinstance(obj, dict):
            obj = obj.get(part)
        else:
            return None
    return obj


# ──────────────────────────────────────────────
# 룰 평가 결과
# ──────────────────────────────────────────────

@dataclass
class RuleMatch:
    """단일 룰이 매칭되었을 때의 결과."""
    rule_id: int
    rule_name: str
    required_documents: list[str] = field(default_factory=list)
    optional_documents: list[str] = field(default_factory=list)
    blocked: bool = False
    escalate: bool = False
    output_status: str | None = None
    output_case_tags: list[str] = field(default_factory=list)
    explanation: str = ""


@dataclass
class DeterminationResult:
    """전체 판정 결과."""
    case_code: str
    case_tags: list[str]
    status: str  # RequestStatus value
    required_documents: list[str] = field(default_factory=list)
    optional_documents: list[str] = field(default_factory=list)
    document_groups: list[dict] = field(default_factory=list)  # 대체서류 그룹
    blocked: bool = False
    escalate: bool = False
    explanations: list[str] = field(default_factory=list)
    matched_rules: list[str] = field(default_factory=list)


# ──────────────────────────────────────────────
# 룰 엔진
# ──────────────────────────────────────────────

def evaluate_rules(rules_data: list[dict], context: dict) -> list[RuleMatch]:
    """
    활성 룰을 우선순위 순으로 평가하여 매칭된 결과를 반환한다.

    Parameters
    ----------
    rules_data : list[dict]
        DB에서 조회한 룰 딕셔너리(직렬화된 형태).
        각 항목: {id, rule_name, priority, conditions, required_documents,
                   optional_documents, blocked_if_missing, escalate_if_true,
                   output_status, output_case_tags, explanation_template}
    context : dict
        입력 컨텍스트 (customer_type, applicant_type, … risk_flags.* 포함)

    Returns
    -------
    list[RuleMatch]
    """
    # 우선순위 순 정렬 (priority 낮을수록 우선)
    sorted_rules = sorted(rules_data, key=lambda r: r.get("priority", 999))

    matches: list[RuleMatch] = []
    for rule in sorted_rules:
        if not rule.get("enabled", True):
            continue
        conditions = rule.get("conditions", {})
        if not conditions:
            continue
        if evaluate_condition(conditions, context):
            match = RuleMatch(
                rule_id=rule["id"],
                rule_name=rule["rule_name"],
                required_documents=rule.get("required_documents", []),
                optional_documents=rule.get("optional_documents", []),
                blocked=rule.get("blocked_if_missing", False),
                escalate=rule.get("escalate_if_true", False),
                output_status=rule.get("output_status"),
                output_case_tags=rule.get("output_case_tags", []),
                explanation=rule.get("explanation_template", ""),
            )
            matches.append(match)

    return matches


def compile_determination(
    case_code: str,
    case_tags: list[str],
    matches: list[RuleMatch],
) -> DeterminationResult:
    """
    매칭된 룰들의 결과를 병합하여 최종 판정을 생성한다.
    """
    all_required: list[str] = []
    all_optional: list[str] = []
    blocked = False
    escalate = False
    explanations: list[str] = []
    matched_names: list[str] = []
    final_status = "READY_FOR_REVIEW"
    extra_tags: list[str] = []

    for m in matches:
        all_required.extend(m.required_documents)
        all_optional.extend(m.optional_documents)
        if m.blocked:
            blocked = True
        if m.escalate:
            escalate = True
        if m.explanation:
            explanations.append(m.explanation)
        matched_names.append(m.rule_name)
        if m.output_case_tags:
            extra_tags.extend(m.output_case_tags)
        # 상태 우선순위: BLOCKED > ESCALATION_REQUIRED > APPROVAL_PENDING > NEEDS_SUPPLEMENT > READY_FOR_REVIEW
        if m.output_status:
            final_status = _higher_priority_status(final_status, m.output_status)

    if blocked:
        final_status = "BLOCKED"
    elif escalate:
        final_status = _higher_priority_status(final_status, "ESCALATION_REQUIRED")

    # 중복 제거
    all_required = list(dict.fromkeys(all_required))
    all_optional = [d for d in dict.fromkeys(all_optional) if d not in all_required]
    combined_tags = list(dict.fromkeys(case_tags + extra_tags))

    return DeterminationResult(
        case_code=case_code,
        case_tags=combined_tags,
        status=final_status,
        required_documents=all_required,
        optional_documents=all_optional,
        blocked=blocked,
        escalate=escalate,
        explanations=explanations,
        matched_rules=matched_names,
    )


_STATUS_PRIORITY = {
    "BLOCKED": 6,
    "ESCALATION_REQUIRED": 5,
    "APPROVAL_PENDING": 4,
    "NEEDS_SUPPLEMENT": 3,
    "READY_FOR_REVIEW": 2,
    "APPROVED_FOR_RECEPTION": 1,
}


def _higher_priority_status(current: str, incoming: str) -> str:
    if _STATUS_PRIORITY.get(incoming, 0) > _STATUS_PRIORITY.get(current, 0):
        return incoming
    return current
