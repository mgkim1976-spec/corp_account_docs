"use client";

import { useState } from "react";
import {
    determine,
    DeterminationInput,
    DeterminationResult,
    RiskFlags,
    CUSTOMER_TYPE_LABELS,
    ACCOUNT_TYPE_LABELS,
    APPLICANT_TYPE_LABELS,
    BUSINESS_STATUS_LABELS,
    STATUS_LABELS,
    STATUS_COLORS,
    DOC_NAME_MAP,
} from "@/lib/api";

const STEPS = ["기본정보", "고객/대표유형", "계좌/상품", "UBO/위험", "판정 결과"];

const DEFAULT_RISK: RiskFlags = {
    high_risk_country: false,
    pep_sanction: false,
    special_review: false,
    document_mismatch: false,
    proxy_authority_unclear: false,
    dormant_suspicious: false,
};

const DEFAULT_INPUT: DeterminationInput = {
    business_reg_no: "",
    corp_name: "",
    customer_type: "FOR_PROFIT_CORP_DOMESTIC",
    domestic_flag: true,
    business_status: "ACTIVE",
    account_type: "BROKERAGE_GENERAL",
    applicant_type: "REPRESENTATIVE_SELF",
    ubo_confirmable: true,
    ownership_simple: true,
    multi_layer_ownership: false,
    ultimate_owner_unknown: false,
    risk_flags: { ...DEFAULT_RISK },
    is_new_corp: false,
};

function SelectField({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Record<string, string>;
}) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label className="form-label">{label}</label>
            <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
                {Object.entries(options).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            className={`toggle-btn ${checked ? "active" : ""}`}
            onClick={() => onChange(!checked)}
        >
            {checked ? "✅ " : "⬜ "}{label}
        </button>
    );
}

export default function DeterminationPage() {
    const [step, setStep] = useState(0);
    const [input, setInput] = useState<DeterminationInput>({ ...DEFAULT_INPUT });
    const [result, setResult] = useState<DeterminationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const update = (partial: Partial<DeterminationInput>) =>
        setInput(prev => ({ ...prev, ...partial }));

    const updateRisk = (key: keyof RiskFlags, val: boolean) =>
        setInput(prev => ({ ...prev, risk_flags: { ...prev.risk_flags, [key]: val } }));

    const canNext = () => {
        if (step === 0) return input.business_reg_no.length > 0 && input.corp_name.length > 0;
        return true;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await determine(input);
            setResult(res);
            setStep(4);
        } catch (err: any) {
            setError(err.message || "판정 실패");
        } finally {
            setLoading(false);
        }
    };

    const statusBadgeClass = (status: string) => {
        const map: Record<string, string> = {
            BLOCKED: "badge-blocked",
            ESCALATION_REQUIRED: "badge-escalation",
            NEEDS_SUPPLEMENT: "badge-supplement",
            READY_FOR_REVIEW: "badge-ready",
            APPROVAL_PENDING: "badge-pending",
            APPROVED_FOR_RECEPTION: "badge-approved",
        };
        return map[status] || "badge-ready";
    };

    const renderDocName = (code: string) => DOC_NAME_MAP[code] || code;

    return (
        <div className="animate-in" style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>📋 법인 계좌개설 서류 판정</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
                입력 정보를 기반으로 필요 서류를 자동 판정합니다.
            </p>

            {/* Step Bar */}
            <div className="step-bar">
                {STEPS.map((s, i) => (
                    <div key={i} className={`step-dot ${i === step ? "active" : i < step ? "complete" : ""}`} />
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, fontSize: 11, color: "var(--text-muted)" }}>
                {STEPS.map((s, i) => (
                    <span key={i} style={{ color: i === step ? "var(--text-primary)" : undefined, fontWeight: i === step ? 600 : 400 }}>{s}</span>
                ))}
            </div>

            {/* Step 0: 기본정보 */}
            {step === 0 && (
                <div className="card animate-in">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>1. 기본 법인 정보</h3>
                    <div style={{ marginBottom: 16 }}>
                        <label className="form-label">사업자등록번호 *</label>
                        <input className="form-input" placeholder="예: 123-45-67890" value={input.business_reg_no}
                            onChange={e => update({ business_reg_no: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label className="form-label">법인명 *</label>
                        <input className="form-input" placeholder="법인명을 입력하세요" value={input.corp_name}
                            onChange={e => update({ corp_name: e.target.value })} />
                    </div>
                    <SelectField label="사업자 상태" value={input.business_status} onChange={v => update({ business_status: v })} options={BUSINESS_STATUS_LABELS} />
                    <div className="toggle-group" style={{ marginTop: 12 }}>
                        <Toggle label="국내 법인" checked={input.domestic_flag} onChange={v => update({ domestic_flag: v })} />
                        <Toggle label="신설법인" checked={input.is_new_corp} onChange={v => update({ is_new_corp: v })} />
                    </div>
                </div>
            )}

            {/* Step 1: 고객유형/대표유형 */}
            {step === 1 && (
                <div className="card animate-in">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>2. 고객 유형 및 신청자 유형</h3>
                    <SelectField label="고객 유형" value={input.customer_type} onChange={v => update({ customer_type: v })} options={CUSTOMER_TYPE_LABELS} />
                    <SelectField label="신청자 유형" value={input.applicant_type} onChange={v => update({ applicant_type: v })} options={APPLICANT_TYPE_LABELS} />
                </div>
            )}

            {/* Step 2: 계좌유형 */}
            {step === 2 && (
                <div className="card animate-in">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>3. 계좌 유형 및 상품</h3>
                    <SelectField label="계좌 유형" value={input.account_type} onChange={v => update({ account_type: v })} options={ACCOUNT_TYPE_LABELS} />
                    <div style={{ marginBottom: 16 }}>
                        <label className="form-label">계좌 개설 목적 (선택)</label>
                        <input className="form-input" placeholder="예: 법인 운영자금 관리" value={input.account_purpose || ""}
                            onChange={e => update({ account_purpose: e.target.value })} />
                    </div>
                    <div>
                        <label className="form-label">예상 자금원천 (선택)</label>
                        <input className="form-input" placeholder="예: 영업수익" value={input.fund_source || ""}
                            onChange={e => update({ fund_source: e.target.value })} />
                    </div>
                </div>
            )}

            {/* Step 3: UBO / 위험 */}
            {step === 3 && (
                <div className="card animate-in">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>4. 실제소유자 및 위험 플래그</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 16 }}>해당 항목을 선택하세요.</p>
                    <div style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ marginBottom: 10 }}>실제소유자 확인</label>
                        <div className="toggle-group">
                            <Toggle label="실제소유자 확인 가능" checked={input.ubo_confirmable} onChange={v => update({ ubo_confirmable: v })} />
                            <Toggle label="지분구조 단순" checked={input.ownership_simple} onChange={v => update({ ownership_simple: v })} />
                            <Toggle label="2단계 이상 소유구조" checked={input.multi_layer_ownership} onChange={v => update({ multi_layer_ownership: v })} />
                            <Toggle label="최종 지배자 불명" checked={input.ultimate_owner_unknown} onChange={v => update({ ultimate_owner_unknown: v })} />
                        </div>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 10 }}>위험 플래그</label>
                        <div className="toggle-group">
                            <Toggle label="고위험 국가 관련" checked={input.risk_flags.high_risk_country} onChange={v => updateRisk("high_risk_country", v)} />
                            <Toggle label="PEP/제재 대상" checked={input.risk_flags.pep_sanction} onChange={v => updateRisk("pep_sanction", v)} />
                            <Toggle label="특수 심사 필요" checked={input.risk_flags.special_review} onChange={v => updateRisk("special_review", v)} />
                            <Toggle label="서류 불일치" checked={input.risk_flags.document_mismatch} onChange={v => updateRisk("document_mismatch", v)} />
                            <Toggle label="대리권 불명확" checked={input.risk_flags.proxy_authority_unclear} onChange={v => updateRisk("proxy_authority_unclear", v)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: 결과 */}
            {step === 4 && result && (
                <div className="animate-in">
                    {/* Status Header */}
                    <div className="card" style={{ marginBottom: 16, textAlign: "center" }}>
                        <div style={{ marginBottom: 12 }}>
                            <span className={`badge ${statusBadgeClass(result.status)}`} style={{ fontSize: 14, padding: "6px 20px" }}>
                                {STATUS_LABELS[result.status] || result.status}
                            </span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: STATUS_COLORS[result.status] || "#fff" }}>
                            {result.case_code}
                        </div>
                        {result.case_tags.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                                {result.case_tags.map(t => (
                                    <span key={t} style={{
                                        padding: "3px 10px",
                                        borderRadius: 6,
                                        fontSize: 11,
                                        background: "rgba(255,255,255,0.06)",
                                        color: "var(--text-secondary)",
                                        border: "1px solid var(--border)",
                                    }}>{t}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Blocked/Escalation Banner */}
                    {result.blocked && (
                        <div style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: 8,
                            padding: "12px 20px",
                            marginBottom: 16,
                            color: "#ef4444",
                            fontWeight: 600,
                            fontSize: 14,
                        }}>
                            🚫 필수 서류 미제출 시 접수가 차단됩니다.
                        </div>
                    )}
                    {result.escalate && (
                        <div style={{
                            background: "rgba(249, 115, 22, 0.1)",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            borderRadius: 8,
                            padding: "12px 20px",
                            marginBottom: 16,
                            color: "#f97316",
                            fontWeight: 600,
                            fontSize: 14,
                        }}>
                            ⚠️ 심사/승인 담당자 확인이 필요합니다.
                        </div>
                    )}

                    {/* Required Documents */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "var(--red)" }}>●</span> 필수 서류 ({result.required_documents.length}건)
                        </h4>
                        {result.required_documents.map(d => (
                            <div key={d} className="doc-item doc-required">
                                <span style={{ fontSize: 13 }}>📄 {renderDocName(d)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Optional Documents */}
                    {result.optional_documents.length > 0 && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "var(--yellow)" }}>●</span> 조건부 서류 ({result.optional_documents.length}건)
                            </h4>
                            {result.optional_documents.map(d => (
                                <div key={d} className="doc-item doc-optional">
                                    <span style={{ fontSize: 13 }}>📋 {renderDocName(d)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Document Groups (substitutable) */}
                    {result.document_groups.length > 0 && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "var(--blue)" }}>●</span> 대체 가능 서류
                            </h4>
                            {result.document_groups.map(g => (
                                <div key={g.group_code} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: "3px solid var(--blue)" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 6 }}>{g.description}</p>
                                    {g.documents.map(d => (
                                        <div key={d} className="doc-item doc-group" style={{ paddingLeft: 0, borderLeft: "none" }}>
                                            <span style={{ fontSize: 13 }}>🔄 {renderDocName(d)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Explanations */}
                    {result.explanations.length > 0 && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📝 판정 사유</h4>
                            {result.explanations.map((e, i) => (
                                <div key={i} className="explanation-item" style={{ marginBottom: i < result.explanations.length - 1 ? 8 : 0 }}>
                                    <span style={{ color: "var(--navy)", fontWeight: 600 }}>•</span>
                                    <span>{e}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Matched Rules */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🔧 적용된 규칙</h4>
                        {result.matched_rules.map((r, i) => (
                            <div key={i} style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 0" }}>
                                #{i + 1} {r}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "12px 16px", color: "#ef4444", fontSize: 13, marginTop: 16 }}>
                    {error}
                </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                {step > 0 && step < 4 && (
                    <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>← 이전</button>
                )}
                {step === 4 && (
                    <button className="btn-secondary" onClick={() => { setStep(0); setResult(null); setError(""); setInput({ ...DEFAULT_INPUT }); }}>
                        🔄 새 판정 시작
                    </button>
                )}
                {step < 3 && (
                    <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)} style={{ marginLeft: "auto" }}>
                        다음 →
                    </button>
                )}
                {step === 3 && (
                    <button className="btn-primary" disabled={loading} onClick={handleSubmit} style={{ marginLeft: "auto" }}>
                        {loading ? "⏳ 판정 중..." : "🔍 판정 실행"}
                    </button>
                )}
            </div>
        </div>
    );
}
