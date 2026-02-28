import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "법인 계좌개설 서류 판정 시스템",
  description: "미래에셋증권 법인 계좌개설 서류 자동 판정 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Navigation */}
        <nav style={{
          background: "linear-gradient(90deg, var(--navy) 0%, var(--navy-dark) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <a href="/" style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: "white",
            }}>
              <div style={{
                width: 36,
                height: 36,
                background: "var(--orange)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                color: "white",
                boxShadow: "0 2px 4px rgba(245, 130, 32, 0.3)",
              }}>
                M
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "var(--orange)", lineHeight: 1.2 }}>Mirae Asset</span>
                <span style={{ fontWeight: 600, fontSize: 12, letterSpacing: "-0.01em", color: "white", opacity: 0.9 }}>미래에셋증권 법인계좌개설</span>
              </div>
            </a>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="/determination" className="btn-primary" style={{ padding: "8px 20px", fontSize: 14, textDecoration: "none", boxShadow: "0 4px 12px rgba(4, 59, 114, 0.4)" }}>
                📋 판정 시작
              </a>
              <a href="/admin" className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14, textDecoration: "none", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                ⚙️ 관리자
              </a>
            </div>
          </div>
        </nav>
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
