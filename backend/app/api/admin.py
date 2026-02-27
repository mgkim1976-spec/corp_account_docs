"""
Admin API — 문서유형/케이스유형/룰 관리.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document_type import DocumentType
from app.models.case_type import CaseType, CaseTag
from app.models.rule import Rule
from app.models.audit_log import AuditLog
from app.schemas.admin import (
    DocumentTypeOut,
    DocumentTypeUpdate,
    CaseTypeOut,
    RuleOut,
    RuleCreate,
    RuleUpdate,
)

router = APIRouter(prefix="/admin")


# ── Document Types ──

@router.get("/document-types", response_model=list[DocumentTypeOut])
def list_document_types(db: Session = Depends(get_db)):
    return db.query(DocumentType).order_by(DocumentType.category, DocumentType.code).all()


@router.patch("/document-types/{doc_id}", response_model=DocumentTypeOut)
def update_document_type(doc_id: int, update: DocumentTypeUpdate, db: Session = Depends(get_db)):
    dt = db.query(DocumentType).get(doc_id)
    if not dt:
        raise HTTPException(404, "Document type not found")
    for k, v in update.model_dump(exclude_unset=True).items():
        setattr(dt, k, v)
    db.commit()
    db.refresh(dt)
    return dt


# ── Case Types ──

@router.get("/case-types", response_model=list[CaseTypeOut])
def list_case_types(db: Session = Depends(get_db)):
    return db.query(CaseType).order_by(CaseType.code).all()


@router.get("/case-tags")
def list_case_tags(db: Session = Depends(get_db)):
    tags = db.query(CaseTag).order_by(CaseTag.code).all()
    return [{"id": t.id, "code": t.code, "name": t.name} for t in tags]


# ── Rules ──

@router.get("/rules", response_model=list[RuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(Rule).order_by(Rule.priority, Rule.id).all()


@router.post("/rules", response_model=RuleOut)
def create_rule(body: RuleCreate, db: Session = Depends(get_db)):
    rule = Rule(**body.model_dump())
    db.add(rule)
    db.flush()
    # Audit
    db.add(AuditLog(
        event_type="RULE_CREATED",
        target_type="rule",
        target_id=rule.id,
        new_value=body.model_dump_json(),
        reason="관리자가 새 룰을 생성했습니다.",
    ))
    db.commit()
    db.refresh(rule)
    return rule


@router.patch("/rules/{rule_id}", response_model=RuleOut)
def update_rule(rule_id: int, body: RuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(Rule).get(rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(rule, k, v)
    db.flush()
    # Audit
    db.add(AuditLog(
        event_type="RULE_UPDATED",
        target_type="rule",
        target_id=rule.id,
        new_value=body.model_dump_json(),
        reason="관리자가 룰을 수정했습니다.",
    ))
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(Rule).get(rule_id)
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.add(AuditLog(
        event_type="RULE_DELETED",
        target_type="rule",
        target_id=rule.id,
        reason="관리자가 룰을 삭제했습니다.",
    ))
    db.delete(rule)
    db.commit()
    return {"status": "deleted"}
