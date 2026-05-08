"use client";

import { motion } from "framer-motion";
import { TiltWrapper } from "./TiltWrapper";

const painPoints = [
  {
    icon: "🧩",
    problem: "Punya ide tapi tidak ada tim?",
    solution:
      "Temukan kolaborator berdasarkan skill yang kamu butuhkan — bukan hanya pertemanan.",
    color: "#FFE500",
    id: "why-card-team",
  },
  {
    icon: "🫣",
    problem: "Susah mulai kenalan online?",
    solution:
      "Anonymous Ice-Breaker Mode: bergabung dulu dengan nama anonim, reveal kapan kamu siap.",
    color: "#00D37F",
    id: "why-card-introvert",
  },
  {
    icon: "🚫",
    problem: "Komunitas penuh spam?",
    solution:
      "Sistem Trust Score multi-layer memastikan hanya orang serius yang ada di projectmu.",
    color: "#FF4D4D",
    id: "why-card-trust",
  },
];

export function WhySection() {
  return (
    <section
      id="why"
      style={{
        background: "#FFFFFF",
        borderBottom: "3px solid #000",
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>

        {/* Yellow Floating Box bottom-right */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [12, 18, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "5%",
            right: "2%",
            width: "120px",
            height: "120px",
            background: "#FFE500",
            border: "3px solid #000",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.6,
          }}
        />

        {/* Coral Triangle middle-left */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "30%",
            left: "4%",
            width: "60px",
            height: "60px",
            opacity: 0.4,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="#FF4D4D" stroke="#000" strokeWidth="6" style={{ filter: "drop-shadow(3px 3px 0px #000)" }} />
          </svg>
        </motion.div>

        {/* Small Mint square top-right */}
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "15%",
            right: "10%",
            width: "40px",
            height: "40px",
            background: "#00D37F",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.5,
            transform: "rotate(-15deg)",
          }}
        />
        
        {/* Dot pattern accent */}
        <div style={{ position: "absolute", top: "50%", right: "5%", display: "grid", gridTemplateColumns: "repeat(3, 8px)", gap: "6px", opacity: 0.1 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* NEW: Blue dashed circle top-left */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "5%",
            left: "15%",
            width: "100px",
            height: "100px",
            border: "2px dashed #0047FF",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        {/* NEW: Floating Yellow square bottom-left */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "8%",
            width: "30px",
            height: "30px",
            background: "#FFE500",
            border: "1.5px solid #000",
            boxShadow: "3px 3px 0px #000",
            opacity: 0.4,
          }}
        />

        {/* NEW: Coral outline triangle middle-right */}
        <motion.div
          animate={{ rotate: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            right: "25%",
            width: "60px",
            height: "60px",
            opacity: 0.2,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="none" stroke="#FF4D4D" strokeWidth="6" strokeDasharray="10 5" />
          </svg>
        </motion.div>

        {/* NEW: Dot patterns scattered - MOAR */}
        <div style={{ position: "absolute", top: "20%", left: "40%", display: "grid", gridTemplateColumns: "repeat(6, 6px)", gap: "6px", opacity: 0.1 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "15%", right: "15%", display: "grid", gridTemplateColumns: "repeat(4, 10px)", gap: "8px", opacity: 0.1 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "5px", height: "5px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* NEW: Floating symbols */}
        <div style={{ position: "absolute", top: "35%", left: "5%", fontSize: "24px", fontWeight: 900, opacity: 0.08 }}>O</div>
        <div style={{ position: "absolute", bottom: "30%", left: "20%", fontSize: "32px", fontWeight: 900, opacity: 0.05, transform: "rotate(45deg)" }}>+</div>
        <div style={{ position: "absolute", top: "15%", right: "8%", fontSize: "28px", fontWeight: 900, opacity: 0.06 }}>×</div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="section-label">❓ KENAPA COLLABOLAB?</span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 52px)",
              marginTop: "8px",
            }}
          >
            Kita semua pernah merasakan ini.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px", // Increased gap
            padding: "20px", // Added padding
          }}
        >
          {painPoints.map((item, index) => (
            <TiltWrapper
              key={item.id}
              index={index}
              style={{
                perspective: "1000px",
                zIndex: 1, // Default z-index
              }}
            >
              <div
                id={item.id}
                style={{
                  background: "#fff",
                  border: "3px solid #000",
                  borderRadius: "8px",
                  boxShadow: "6px 6px 0px #000",
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  minHeight: "260px",
                }}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "6px",
                    background: item.color,
                    borderBottom: "2px solid #000",
                  }}
                />

                {/* Icon */}
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    background: item.color,
                    border: "2px solid #000",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    marginBottom: "20px",
                    boxShadow: "3px 3px 0px #000",
                  }}
                >
                  {item.icon}
                </div>

                {/* Problem */}
                <h3
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 800,
                    fontSize: "20px",
                    marginBottom: "12px",
                    lineHeight: 1.3,
                  }}
                >
                  {item.problem}
                </h3>

                {/* Solution */}
                <p
                  style={{
                    color: "#3D3D3D",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.solution}
                </p>
              </div>
            </TiltWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
