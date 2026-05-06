"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      style={{
        background: "#F5F0E8",
        borderBottom: "3px solid #000",
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Big yellow block top-right */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "280px",
            height: "280px",
            background: "#FFE500",
            border: "3px solid #000",
            transform: "rotate(15deg)",
            boxShadow: "8px 8px 0px #000",
          }}
        />
        {/* Blue block bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "-20px",
            width: "160px",
            height: "160px",
            background: "#0047FF",
            border: "3px solid #000",
            transform: "rotate(-8deg)",
            boxShadow: "6px 6px 0px #000",
          }}
        />
        {/* Green circle bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            right: "15%",
            width: "120px",
            height: "120px",
            background: "#00D37F",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "4px 4px 0px #000",
          }}
        />
        {/* Small coral square */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "5%",
            width: "60px",
            height: "60px",
            background: "#FF4D4D",
            border: "3px solid #000",
            transform: "rotate(20deg)",
            boxShadow: "3px 3px 0px #000",
          }}
        />
        {/* Dashed outline square top-left */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "40px",
            width: "80px",
            height: "80px",
            border: "3px dashed #000",
            transform: "rotate(-12deg)",
          }}
        />
        {/* Small dot pattern */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "48%",
            display: "grid",
            gridTemplateColumns: "repeat(5, 12px)",
            gap: "10px",
            opacity: 0.25,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-label">🏆 Team Galatea — Gen-Z TechPreneur</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px, 7vw, 80px)",
              lineHeight: 1.05,
              color: "#000",
              marginBottom: "24px",
            }}
          >
            Temukan Tim-mu.{" "}
            <span
              style={{
                background: "#FFE500",
                borderBottom: "4px solid #000",
                padding: "0 8px",
                display: "inline-block",
              }}
            >
              Build Together.
            </span>
          </motion.h1>

          {/* Sub-tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: "18px",
              color: "#3D3D3D",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "520px",
            }}
          >
            Platform kolaborasi untuk Gen-Z — temukan partner project, join lomba, dan bangun portofolio bersama.
            Sistem <strong>Trust Score</strong> menjaga ekosistem tetap sehat & anti-spam.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
          >
            <Link href="/register" className="btn-primary btn-lg" id="hero-cta-register">
              🚀 Mulai Gratis
            </Link>
            <Link href="/explore" className="btn-secondary btn-lg" id="hero-cta-explore">
              Lihat Project →
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar stack */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {["🧑‍💻", "👩‍🎨", "🧑‍🔬", "👨‍💼"].map((emoji, i) => (
                <div
                  key={i}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "2px solid #000",
                    background: ["#FFE500", "#00D37F", "#0047FF", "#FF4D4D"][i],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    marginLeft: i === 0 ? 0 : "-10px",
                    zIndex: 4 - i,
                    position: "relative",
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                Ribuan Gen-Z sudah kolaborasi
              </p>
              <p style={{ fontSize: "12px", color: "#3D3D3D", margin: 0 }}>
                dari berbagai universitas Indonesia 🇮🇩
              </p>
            </div>

            {/* SDG Badges */}
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <span
                style={{
                  background: "#A21942",
                  color: "#fff",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                }}
              >
                SDG 8
              </span>
              <span
                style={{
                  background: "#FD6925",
                  color: "#fff",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "11px",
                }}
              >
                SDG 9
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
