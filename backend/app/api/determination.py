"""
Determination API — POST /api/v1/determine
입력 → 케이스 분류 → 룰 평가 → 서류 판정 → 결과 반환
"""

from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.determination import (
    DeterminationRequest,
    DeterminationResponse,
    DocumentGroupResponse,
    AccountRequestSummary,
)
from app.engine.case_classifier import classify_case
from app.engine.rule_engine import evaluate_rules, compile_determination
from app.engine.document_resolver import resolve_documents
from app.models.rule import Rule
from app.models.customer import Customer
from app.models.account_request import AccountRequest
from app.models.audit_log import AuditLog
from app.enums import BusinessStatus

router = APIRouter()


@router.post("/determine", response_model=DeterminationResponse)
def determine(req: DeterminationRequest, db: Session = Depends(get_db)):
    """
    법인 계좌개설 서류 판정.
    1. 입력 컨텍스트 구성
    2. 케이스 분류 (case_classifier)
    3. DB 룰 평가 (rule_engine)
    4. 서류 패키지 보완 (document_resolver — fallback)
    5. 결과 반환 + DB 저장 + 감사 로그
    """
    # ── 1. 컨텍스트 구성 ──
    context = {
        "customer_type": req.customer_type.value,
        "account_type": req.account_type.value,
        "applicant_type": req.applicant_type.value,
        "business_status": req.business_status.value,
        "domestic_flag": req.domestic_flag,
        "ubo_confirmable": req.ubo_confirmable,
        "ownership_simple": req.ownership_simple,
        "multi_layer_ownership": req.multi_layer_ownership,
        "ultimate_owner_unknown": req.ultimate_owner_unknown,
        "is_new_corp": req.is_new_corp,
        "risk_flags": req.risk_flags.model_dump(),
    }

    # ── 2. 케이스 분류 ──
    case_code, case_tags = classify_case(context)

    # ── 3. DB 룰 평가 ──
    active_rules = db.query(Rule).filter(Rule.enabled == True).all()  # noqa: E712
    rules_data = []
    for r in active_rules:
        rules_data.append({
            "id": r.id,
            "rule_name": r.rule_name,
            "priority": r.priority,
            "conditions": r.conditions,
            "required_documents": r.required_documents,
            "optional_documents": r.optional_documents,
            "blocked_if_missing": r.blocked_if_missing,
            "escalate_if_true": r.escalate_if_true,
            "output_status": r.output_status,
            "output_case_tags": json.loads(r.output_case_tags_json) if r.output_case_tags_json else [],
            "explanation_template": r.explanation_template,
            "enabled": r.enabled,
        })

    matches = evaluate_rules(rules_data, context)
    result = compile_determination(case_code, case_tags, matches)

    # ── 4. fallback: document_resolver로 서류 패키지 보완 ──
    doc_pkg = resolve_documents(case_code, case_tags, req.account_type.value)

    # 룰 결과의 서류에 resolver 서류를 병합 (중복 제거)
    merged_required = list(dict.fromkeys(result.required_documents + doc_pkg.required))
    merged_optional = list(dict.fromkeys(
        [d for d in (result.optional_documents + doc_pkg.conditional) if d not in merged_required]
    ))

    result.required_documents = merged_required
    result.optional_documents = merged_optional
    result.explanations = list(dict.fromkeys(result.explanations + doc_pkg.explanations))

    # document groups
    doc_groups = [
        DocumentGroupResponse(
            group_code=g.group_code,
            documents=g.documents,
            min_required=g.min_required,
            description=g.description,
        )
        for g in doc_pkg.groups
    ]

    # ── 5. DB 저장 ──
    # Customer upsert
    customer = db.query(Customer).filter_by(business_reg_no=req.business_reg_no).first()
    if not customer:
        customer = Customer(
            business_reg_no=req.business_reg_no,
            corp_name=req.corp_name,
            customer_type=req.customer_type,
            domestic_flag=req.domestic_flag,
            business_status=req.business_status,
        )
        db.add(customer)
        db.flush()

    acct_req = AccountRequest(
        customer_id=customer.id,
        account_type=req.account_type,
        applicant_type=req.applicant_type,
        case_code=case_code,
        ubo_confirmable=req.ubo_confirmable,
        ownership_simple=req.ownership_simple,
        multi_layer_ownership=req.multi_layer_ownership,
        ultimate_owner_unknown=req.ultimate_owner_unknown,
        account_purpose=req.account_purpose,
        fund_source=req.fund_source,
        status=result.status,
    )
    acct_req.case_tags = result.case_tags
    acct_req.risk_flags = req.risk_flags.model_dump()
    acct_req.determination_result_json = json.dumps({
        "case_code": result.case_code,
        "case_tags": result.case_tags,
        "status": result.status,
        "required_documents": result.required_documents,
        "optional_documents": result.optional_documents,
        "blocked": result.blocked,
        "escalate": result.escalate,
        "explanations": result.explanations,
        "matched_rules": result.matched_rules,
    }, ensure_ascii=False)
    db.add(acct_req)
    db.flush()

    # Audit log
    db.add(AuditLog(
        event_type="CASE_CREATED",
        target_type="account_request",
        target_id=acct_req.id,
        new_value=acct_req.determination_result_json,
        reason="자동 판정 생성",
    ))
    db.commit()

    return DeterminationResponse(
        case_code=result.case_code,
        case_tags=result.case_tags,
        status=result.status,
        required_documents=result.required_documents,
        optional_documents=result.optional_documents,
        document_groups=doc_groups,
        blocked=result.blocked,
        escalate=result.escalate,
        explanations=result.explanations,
        matched_rules=result.matched_rules,
    )


@router.get("/requests")
def list_requests(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """판정 내역 목록."""
    rows = (
        db.query(AccountRequest)
        .join(Customer)
        .order_by(AccountRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "business_reg_no": r.customer.business_reg_no,
            "corp_name": r.customer.corp_name,
            "case_code": r.case_code,
            "status": r.status.value if r.status else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


@router.get("/requests/{request_id}")
def get_request(request_id: int, db: Session = Depends(get_db)):
    """판정 상세 조회."""
    r = db.query(AccountRequest).filter_by(id=request_id).first()
    if not r:
        from fastapi import HTTPException
        raise HTTPException(404, "Request not found")
    return {
        "id": r.id,
        "customer": {
            "business_reg_no": r.customer.business_reg_no,
            "corp_name": r.customer.corp_name,
            "customer_type": r.customer.customer_type.value,
        },
        "case_code": r.case_code,
        "case_tags": r.case_tags,
        "status": r.status.value,
        "risk_flags": r.risk_flags,
        "determination_result": json.loads(r.determination_result_json) if r.determination_result_json else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }
