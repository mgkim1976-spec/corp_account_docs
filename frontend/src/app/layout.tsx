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
          background: "rgba(10, 15, 30, 0.95)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 24px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
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
              gap: 10,
              textDecoration: "none",
              color: "var(--text-primary)",
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, var(--navy), var(--orange))",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}>
                MA
              </div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>법인 계좌개설 판정</span>
            </a>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="/determination" className="btn-secondary" style={{ padding: "6px 16px", fontSize: 13, textDecoration: "none" }}>
                📋 판정 시작
              </a>
              <a href="/admin" className="btn-secondary" style={{ padding: "6px 16px", fontSize: 13, textDecoration: "none" }}>
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
