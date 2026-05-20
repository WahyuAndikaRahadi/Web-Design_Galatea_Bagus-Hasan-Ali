"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { MagnetWrapper } from "./MagnetWrapper";

export function HeroSection() {
  return (
    <section
      style={{
        background: "#F5F0E8",
        borderBottom: "3px solid #000",
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 72px)",
        padding: "40px 0",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background patterns */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)", 
          backgroundSize: "40px 40px", 
          opacity: 0.05,
          zIndex: 0 
        }} 
      />

      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Big yellow block top-right */}
        <MagnetWrapper strength={40}>
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [15, 12, 15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "clamp(180px, 30vw, 280px)",
              height: "clamp(180px, 30vw, 280px)",
              background: "#FFE500",
              border: "3px solid #000",
              boxShadow: "12px 12px 0px #000",
              opacity: 0.8,
            }}
          />
        </MagnetWrapper>

        {/* Blue block bottom-left */}
        <MagnetWrapper strength={-30}>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [-8, -12, -8] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: "60px",
              left: "-20px",
              width: "160px",
              height: "160px",
              background: "#0047FF",
              border: "3px solid #000",
              boxShadow: "8px 8px 0px #000",
              opacity: 0.8,
            }}
          />
        </MagnetWrapper>
        {/* Green circle bottom-right */}
        <MagnetWrapper strength={20}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: "-30px",
              right: "15%",
              width: "120px",
              height: "120px",
              background: "#00D37F",
              border: "3px solid #000",
              borderRadius: "50%",
              boxShadow: "6px 6px 0px #000",
              opacity: 0.8,
            }}
          />
        </MagnetWrapper>
        {/* Small coral square */}
        <MagnetWrapper strength={50}>
          <motion.div
            className="hidden sm:block"
            animate={{ rotate: [20, 380] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              top: "25%",
              right: "25%",
              width: "50px",
              height: "50px",
              background: "#FF4D4D",
              border: "3px solid #000",
              boxShadow: "4px 4px 0px #000",
              opacity: 0.7,
            }}
          />
        </MagnetWrapper>
        {/* Dashed outline square top-left */}
        <MagnetWrapper strength={-15}>
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "60px",
              left: "40px",
              width: "100px",
              height: "100px",
              border: "4px dashed #000",
              transform: "rotate(-12deg)",
              opacity: 0.2,
            }}
          />
        </MagnetWrapper>

        {/* Floating Mint bar center-left */}
        {/* Floating Mint bar center-left - Hidden on small mobile */}
        <MagnetWrapper strength={30}>
          <motion.div
            className="hidden sm:block"
            animate={{ x: [-10, 10, -10], rotate: [45, 50, 45] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "40%",
              left: "5%",
              width: "120px",
              height: "20px",
              background: "#00D37F",
              border: "2px solid #000",
              boxShadow: "3px 3px 0px #000",
              opacity: 0.3,
            }}
          />
        </MagnetWrapper>

        {/* Scattered Dot patterns - MOAR */}
        <div style={{ position: "absolute", top: "20%", left: "10%", display: "grid", gridTemplateColumns: "repeat(4, 10px)", gap: "8px", opacity: 0.25 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "25%", left: "15%", display: "grid", gridTemplateColumns: "repeat(6, 8px)", gap: "6px", opacity: 0.2 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: "10%", right: "30%", display: "grid", gridTemplateColumns: "repeat(6, 8px)", gap: "6px", opacity: 0.2 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* Floating "X" and "+" symbols */}
        <motion.div
          className="hidden sm:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "45%", right: "8%", fontSize: "32px", fontWeight: 900, opacity: 0.15, color: "#000" }}
        >
          ×
        </motion.div>
        <motion.div
          className="hidden sm:block"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", bottom: "35%", left: "8%", fontSize: "40px", fontWeight: 900, opacity: 0.1, color: "#0047FF" }}
        >
          +
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(60px, 10vh, 120px) 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="section-label">Bangun Project Impianmu Sekarang</span>
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
              marginTop: "16px",
              position: "relative",
            }}
          >
            Temukan Partner. <br />
            <span
              style={{
                background: "#FFE500",
                borderBottom: "4px solid #000",
                padding: "0 12px",
                display: "inline-block",
                transform: "rotate(-1.5deg)",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              Build Future.
            </span>
          </motion.h1>

          {/* Sub-tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: "clamp(16px, 2.5vw, 18px)",
              color: "#3D3D3D",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "600px",
              position: "relative",
              padding: "0 10px",
            }}
          >
            Platform kolaborasi untuk{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              Gen-Z
              {/* Hand-drawn Underline Accent */}
              <svg
                viewBox="0 0 100 20"
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: 0,
                  width: "100%",
                  height: "12px",
                  pointerEvents: "none",
                }}
              >
                <motion.path
                  d="M5,15 Q50,10 95,15"
                  fill="none"
                  stroke="#FF4D4D"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                />
              </svg>
            </span>{" "}
            — temukan partner untuk project, lomba, riset, hingga bisnis kreatif.
            Apapun idemu, bangun bersama di ekosistem yang transparan & terpercaya.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ 
              display: "flex", 
              gap: "16px", 
              flexDirection: "row",
              flexWrap: "wrap",
              width: "100%",
              maxWidth: "600px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link href="/register" className="btn-primary btn-lg" id="hero-cta-register" style={{ minWidth: "200px", textAlign: "center" }}>
              🚀 Mulai Gratis
            </Link>
            <Link href="#explore-preview" className="btn-secondary btn-lg" id="hero-cta-explore" style={{ minWidth: "200px", textAlign: "center" }}>
              Lihat Project →
            </Link>
          </motion.div>

          {/* Social proof & SDG */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              {/* Avatar stack */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {["Felix", "Aneka", "Adrian", "Bernard"].map((seed, i) => (
                  <div
                    key={i}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #000",
                      background: ["#FFE500", "#00D37F", "#0047FF", "#FF4D4D"][i],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: i === 0 ? 0 : "-12px",
                      zIndex: 4 - i,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                  Ribuan Gen-Z sudah kolaborasi
                </p>
                <p style={{ fontSize: "12px", color: "#3D3D3D", margin: 0 }}>
                  dari berbagai universitas Indonesia
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Colorful Zig-Zag Divider */}
      <div
        style={{
          position: "absolute",
          bottom: "-2px",
          left: 0,
          width: "100%",
          height: "40px",
          background: "repeating-linear-gradient(to right, rgba(255, 229, 0, 0.7) 0%, rgba(255, 229, 0, 0.7) 10%, rgba(0, 211, 127, 0.7) 10%, rgba(0, 211, 127, 0.7) 20%, rgba(255, 77, 77, 0.7) 20%, rgba(255, 77, 77, 0.7) 30%, rgba(0, 71, 255, 0.7) 30%, rgba(0, 71, 255, 0.7) 40%)",
          clipPath: "polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)",
          zIndex: 10,
        }}
      />
    </section>
  );
}
