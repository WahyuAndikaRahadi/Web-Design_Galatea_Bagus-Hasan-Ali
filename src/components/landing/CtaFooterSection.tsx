import Link from "next/link";

export function CtaFooterSection() {
  return (
    <section style={{ background: "#000", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
      {/* Decorations */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          left: "-30px",
          width: "200px",
          height: "200px",
          background: "#FFE500",
          border: "3px solid #FFE500",
          transform: "rotate(20deg)",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          right: "-40px",
          width: "240px",
          height: "240px",
          background: "#00D37F",
          borderRadius: "50%",
          opacity: 0.15,
        }}
      />

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "#FFE500",
            color: "#000",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 800,
            fontSize: "11px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "2px",
            marginBottom: "24px",
          }}
        >
          🤝 BERGABUNG SEKARANG
        </span>

        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(36px, 6vw, 64px)",
            color: "#fff",
            marginBottom: "20px",
            lineHeight: 1.1,
          }}
        >
          Siap kolaborasi?{" "}
          <span
            style={{
              background: "#FFE500",
              color: "#000",
              padding: "0 12px",
              display: "inline-block",
              transform: "rotate(-1deg)",
            }}
          >
            Daftar gratis
          </span>{" "}
          sekarang.
        </h2>

        <p
          style={{
            color: "#ccc",
            fontSize: "18px",
            lineHeight: 1.7,
            marginBottom: "40px",
            maxWidth: "500px",
            margin: "0 auto 40px",
          }}
        >
          Ribuan Gen-Z sudah menemukan tim impian mereka. Giliranmu!
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/register"
            className="btn-primary btn-lg"
            id="cta-footer-register"
          >
            🚀 Mulai Gratis — 30 detik
          </Link>
          <Link
            href="/explore"
            id="cta-footer-explore"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "transparent",
              color: "#fff",
              border: "2px solid #fff",
              borderRadius: "4px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              padding: "16px 32px",
              textDecoration: "none",
              transition: "all 0.15s ease",
            }}
          >
            Lihat Project Dulu
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "🆓", label: "Gratis Selamanya" },
            { icon: "🛡️", label: "Trust Score System" },
            { icon: "🕵️", label: "Anonymous Mode" },
            { icon: "⚡", label: "Real-time Collab" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>{icon}</span>
              <span style={{ color: "#ccc", fontSize: "14px", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer credit */}
      <div
        style={{
          textAlign: "center",
          marginTop: "64px",
          paddingTop: "32px",
          borderTop: "1px solid #333",
          color: "#555",
          fontSize: "13px",
        }}
      >
        <p>CollaboLab — Team Galatea | HIMSE Telkom University Surabaya</p>
        <p style={{ marginTop: "4px" }}>SDG 8 · SDG 9 · Gen-Z TechPreneur</p>
      </div>
    </section>
  );
}
