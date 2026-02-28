"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ paddingTop: 60, textAlign: "center" }}>
      {/* Hero */}
      <div className="animate-in">
        <h1 style={{
          fontSize: 48,
          fontWeight: 800,
          background: "linear-gradient(135deg, #ffffff 0%, var(--orange-light) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 24,
          letterSpacing: "-0.02em",
          textShadow: "0 2px 10px rgba(245, 130, 32, 0.1)"
        }}>
          법인 서류 판정 자동화 시스템
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 650, margin: "0 auto 56px", lineHeight: 1.6 }}>
          입력값 기반 <strong>케이스 자동 분류</strong>부터 필요한 <strong>구비서류의 즉각 산출</strong>, 예외 사항 감지까지.<br />
          법인고객의 계좌개설 소요 시간을 획기적으로 단축합니다.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
        <div className="card pulse-glow" style={{ cursor: "pointer" }} onClick={() => router.push("/determination")}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>판정 시작</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
            법인 정보를 입력하고 필요 서류를 자동으로 판정합니다.
            3분 내 1차 판정이 가능합니다.
          </p>
        </div>

        <div className="card" style={{ cursor: "pointer" }} onClick={() => router.push("/admin")}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚙️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>관리자 설정</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
            문서유형, 케이스유형, 룰을 관리하고
            정책을 업데이트합니다.
          </p>
        </div>

        <div className="card" style={{ cursor: "pointer" }} onClick={() => router.push("/admin/audit")}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📊</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>감사 로그</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
            모든 판정, 변경, 승인 이력을
            추적하고 감사합니다.
          </p>
        </div>
      </div>

      {/* Stats (placeholder) */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 60, color: "var(--text-muted)", fontSize: 13 }}>
        <div><span style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)", display: "block" }}>14</span> 케이스 유형</div>
        <div><span style={{ fontSize: 24, fontWeight: 700, color: "var(--orange)", display: "block" }}>45</span> 문서 유형</div>
        <div><span style={{ fontSize: 24, fontWeight: 700, color: "var(--green)", display: "block" }}>26</span> 판정 규칙</div>
      </div>
    </div>
  );
}
