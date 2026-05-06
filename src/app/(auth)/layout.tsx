import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ borderBottom: "3px solid #000", background: "#fff", padding: "0 24px", height: "64px", display: "flex", alignItems: "center" }}>
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span
            style={{
              background: "#FFE500",
              border: "2px solid #000",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "2px 2px 0px #000",
            }}
          >
            🤝
          </span>
          <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "20px", color: "#000" }}>
            CollaboLab
          </span>
        </Link>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px", borderTop: "2px solid #000", fontSize: "12px", color: "#3D3D3D" }}>
        CollaboLab — Team Galatea | HIMSE Telkom University Surabaya
      </div>
    </div>
  );
}
