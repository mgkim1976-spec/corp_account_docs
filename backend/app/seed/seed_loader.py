"""Seed data loader — loads JSON seed files into the database."""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.document_type import DocumentType
from app.models.case_type import CaseType, CaseTag
from app.models.rule import Rule, PolicyVersion
from app.models.user import User

SEED_DIR = Path(__file__).parent


def load_seed_data(db: Session) -> dict:
    """
    시드 데이터를 DB에 로드한다. 이미 존재하는 레코드는 건너뛴다.
    """
    counts = {}

    # 1. Policy version
    pv = db.query(PolicyVersion).filter_by(version="v1.0").first()
    if not pv:
        pv = PolicyVersion(version="v1.0", description="초기 정책 버전", effective_from="2026-01-01")
        db.add(pv)
        db.flush()

    # 2. Document types
    with open(SEED_DIR / "document_types.json", encoding="utf-8") as f:
        doc_types = json.load(f)
    inserted = 0
    for dt in doc_types:
        if not db.query(DocumentType).filter_by(code=dt["code"]).first():
            db.add(DocumentType(
                code=dt["code"],
                name=dt["name"],
                category=dt["category"],
                policy_version_id=pv.id,
            ))
            inserted += 1
    counts["document_types"] = inserted

    # 3. Case types + tags
    with open(SEED_DIR / "case_types.json", encoding="utf-8") as f:
        case_data = json.load(f)

    inserted = 0
    for ct in case_data["case_types"]:
        if not db.query(CaseType).filter_by(code=ct["code"]).first():
            db.add(CaseType(code=ct["code"], name=ct["name"], description=ct.get("description")))
            inserted += 1
    counts["case_types"] = inserted

    inserted = 0
    for tag in case_data["case_tags"]:
        if not db.query(CaseTag).filter_by(code=tag["code"]).first():
            db.add(CaseTag(code=tag["code"], name=tag["name"]))
            inserted += 1
    counts["case_tags"] = inserted

    # 4. Rules
    with open(SEED_DIR / "rules.json", encoding="utf-8") as f:
        rules = json.load(f)
    inserted = 0
    for r in rules:
        if not db.query(Rule).filter_by(rule_name=r["rule_name"]).first():
            db.add(Rule(
                rule_name=r["rule_name"],
                priority=r["priority"],
                conditions_json=json.dumps(r["conditions"], ensure_ascii=False),
                required_documents_json=json.dumps(r.get("required_documents", []), ensure_ascii=False),
                optional_documents_json=json.dumps(r.get("optional_documents", []), ensure_ascii=False),
                blocked_if_missing=r.get("blocked_if_missing", False),
                escalate_if_true=r.get("escalate_if_true", False),
                output_status=r.get("output_status"),
                explanation_template=r.get("explanation_template"),
                policy_version_id=pv.id,
            ))
            inserted += 1
    counts["rules"] = inserted

    # 5. Users
    sample_users = [
        {"name": "김영업", "role": "STAFF", "department": "강남센터"},
        {"name": "이심사", "role": "REVIEWER", "department": "심사부"},
        {"name": "박관리", "role": "ADMIN", "department": "운영팀"},
        {"name": "최준법", "role": "COMPLIANCE", "department": "준법감시부"},
    ]
    inserted = 0
    for u in sample_users:
        if not db.query(User).filter_by(name=u["name"]).first():
            db.add(User(**u))
            inserted += 1
    counts["users"] = inserted

    db.commit()
    return counts
