"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaFooterSection() {
  return (
    <section style={{ background: "#F5F0E8", padding: "120px 24px 80px", position: "relative", overflow: "hidden" }}>
      {/* Wavy Divider */}
      {/* Dashed Top Divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          borderTop: "4px dashed #000",
          zIndex: 10,
        }}
      />
      {/* Decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Big Yellow Square rotating bottom-left */}
        <motion.div
          animate={{ rotate: [15, 30, 15], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "240px",
            height: "240px",
            background: "#FFE500",
            border: "3px solid #000",
            boxShadow: "8px 8px 0px #000",
            opacity: 0.15,
          }}
        />

        {/* Green Circle top-right */}
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "100px",
            right: "2%",
            width: "180px",
            height: "180px",
            background: "#00D37F",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.15,
          }}
        />

        {/* Blue Triangle floating middle-left */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "40%",
            left: "5%",
            width: "80px",
            height: "80px",
            opacity: 0.1,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="none" stroke="#0047FF" strokeWidth="4" />
          </svg>
        </motion.div>

        {/* Dot patterns */}
        <div style={{ position: "absolute", bottom: "10%", right: "10%", display: "grid", gridTemplateColumns: "repeat(4, 10px)", gap: "10px", opacity: 0.1 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
      </div>

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
            background: "#000",
            color: "#FFE500",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 800,
            fontSize: "11px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: "4px",
            marginBottom: "24px",
            boxShadow: "3px 3px 0px #FFE500",
          }}
        >
          🤝 BERGABUNG SEKARANG
        </span>

        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(36px, 6vw, 64px)",
            color: "#000",
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
              border: "3px solid #000",
              boxShadow: "4px 4px 0px #000",
            }}
          >
            Daftar gratis
          </span>{" "}
          sekarang.
        </h2>

        <p
          style={{
            color: "#3D3D3D",
            fontSize: "18px",
            lineHeight: 1.7,
            marginBottom: "40px",
            maxWidth: "500px",
            margin: "0 auto 40px",
          }}
        >
          Ribuan Gen-Z sudah menemukan tim impian mereka. Giliranmu!
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link
            href="/register"
            className="btn-primary btn-lg"
            id="cta-footer-register"
            style={{ fontSize: "18px", padding: "18px 40px" }}
          >
            🚀 Mulai Gratis — 30 detik
          </Link>
        </div>

        {/* Dashed Divider for Features */}
        <div style={{ marginTop: "48px", borderTop: "2px dashed #000", width: "100%", opacity: 0.2 }} />

        {/* Trust indicators */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            "Gratis Selamanya",
            "Trust Score System",
            "Anonymous Mode",
            "Real-time Collab",
          ].map((label) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "6px", height: "6px", background: "#FFE500", border: "1.5px solid #000", borderRadius: "50%" }} />
              <span style={{ color: "#000", fontSize: "14px", fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer credit */}
      <div
        style={{
          textAlign: "center",
          marginTop: "64px",
          color: "#3D3D3D",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        <p>© {new Date().getFullYear()} CollaboLab — Team Galatea</p>
        <p style={{ marginTop: "4px", opacity: 0.7 }}>Gen-Z TechPreneur</p>
      </div>
    </section>
  );
}
