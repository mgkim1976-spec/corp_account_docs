"""
Audit Log API — 감사 로그 조회.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.admin import AuditLogOut

router = APIRouter()


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    event_type: str | None = None,
    target_type: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(AuditLog)
    if event_type:
        q = q.filter(AuditLog.event_type == event_type)
    if target_type:
        q = q.filter(AuditLog.target_type == target_type)
    rows = q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        AuditLogOut(
            id=r.id,
            event_type=r.event_type,
            actor_id=r.actor_id,
            target_type=r.target_type,
            target_id=r.target_id,
            old_value=r.old_value,
            new_value=r.new_value,
            reason=r.reason,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in rows
    ]
