"use client";

import { useEffect, useState } from "react";
import { fetchAdminData } from "@/lib/api";

export default function AdminPage() {
    const [tab, setTab] = useState<"docs" | "cases" | "rules">("docs");
    const [docs, setDocs] = useState<any[]>([]);
    const [cases, setCases] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const data = await fetchAdminData();
                setDocs(data.documentTypes || []);
                setCases(data.caseTypes || []);
                setRules(data.rules || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const tabs = [
        { key: "docs" as const, label: "📄 문서유형", count: docs.length },
        { key: "cases" as const, label: "📂 케이스유형", count: cases.length },
        { key: "rules" as const, label: "⚙️ 룰 관리", count: rules.length },
    ];

    return (
        <div className="animate-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>⚙️ 관리자 대시보드</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
                문서유형, 케이스유형, 룰을 관리합니다.
            </p>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        className={`toggle-btn ${tab === t.key ? "active" : ""}`}
                        onClick={() => setTab(t.key)}
                        style={{ padding: "8px 18px" }}
                    >
                        {t.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>({t.count})</span>
                    </button>
                ))}
            </div>

            {loading && <p style={{ color: "var(--text-muted)" }}>로딩 중...</p>}

            {/* Document Types Table */}
            {!loading && tab === "docs" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "rgba(0,61,165,0.1)", textAlign: "left" }}>
                                <th style={{ padding: "10px 16px" }}>코드</th>
                                <th style={{ padding: "10px 16px" }}>명칭</th>
                                <th style={{ padding: "10px 16px" }}>카테고리</th>
                                <th style={{ padding: "10px 16px" }}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map((d: any) => (
                                <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                                    <td style={{ padding: "8px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{d.code}</td>
                                    <td style={{ padding: "8px 16px" }}>{d.name}</td>
                                    <td style={{ padding: "8px 16px" }}>
                                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "rgba(255,255,255,0.05)" }}>{d.category}</span>
                                    </td>
                                    <td style={{ padding: "8px 16px" }}>
                                        <span style={{ color: d.enabled ? "var(--green)" : "var(--red)" }}>{d.enabled ? "활성" : "비활성"}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Case Types Table */}
            {!loading && tab === "cases" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "rgba(0,61,165,0.1)", textAlign: "left" }}>
                                <th style={{ padding: "10px 16px" }}>코드</th>
                                <th style={{ padding: "10px 16px" }}>명칭</th>
                                <th style={{ padding: "10px 16px" }}>설명</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((c: any) => (
                                <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                                    <td style={{ padding: "8px 16px", fontWeight: 700, color: "var(--navy)" }}>{c.code}</td>
                                    <td style={{ padding: "8px 16px" }}>{c.name}</td>
                                    <td style={{ padding: "8px 16px", color: "var(--text-muted)", fontSize: 12 }}>{c.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rules Table */}
            {!loading && tab === "rules" && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "rgba(0,61,165,0.1)", textAlign: "left" }}>
                                <th style={{ padding: "10px 16px" }}>우선순위</th>
                                <th style={{ padding: "10px 16px" }}>룰 명</th>
                                <th style={{ padding: "10px 16px" }}>차단</th>
                                <th style={{ padding: "10px 16px" }}>에스컬</th>
                                <th style={{ padding: "10px 16px" }}>출력상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((r: any) => (
                                <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                                    <td style={{ padding: "8px 16px", fontWeight: 700 }}>{r.priority}</td>
                                    <td style={{ padding: "8px 16px" }}>{r.rule_name}</td>
                                    <td style={{ padding: "8px 16px" }}>{r.blocked_if_missing ? "🔴" : "—"}</td>
                                    <td style={{ padding: "8px 16px" }}>{r.escalate_if_true ? "🟡" : "—"}</td>
                                    <td style={{ padding: "8px 16px" }}>
                                        {r.output_status && (
                                            <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "rgba(255,255,255,0.05)" }}>
                                                {r.output_status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
