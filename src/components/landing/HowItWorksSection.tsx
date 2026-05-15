"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";

const steps = [
  {
    number: 1,
    title: "Buat profil & pilih skill",
    description:
      "Daftar 30 detik. Pilih skill tags kamu — Riset, Penulisan, Akuntansi, atau apapun yang kamu jago. Trust Score dimulai.",
    icon: "🎯",
    color: "#FFE500",
    id: "step-create-profile",
  },
  {
    number: 2,
    title: "Temukan project yang cocok",
    description:
      "Explore feed project dengan Skill Match Indicator. Lihat berapa persen skillmu cocok dengan project yang ada.",
    icon: "🔍",
    color: "#00D37F",
    id: "step-find-project",
  },
  {
    number: 3,
    title: "Kolaborasi di Collab Hub",
    description:
      "Chat real-time, kanban board, dan presence indicator — semua dalam satu room. Mulai bangun sesuatu yang keren.",
    icon: "🚀",
    color: "#0047FF",
    id: "step-collaborate",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        background: "#F5F0E8",
        borderBottom: "3px solid #000",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Large Blue circle outline top-left */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            border: "4px solid #0047FF",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        {/* Coral Square bottom-left */}
        <motion.div
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "80px",
            height: "80px",
            background: "#FF4D4D",
            border: "3px solid #000",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.4,
          }}
        />

        {/* Green Triangle top-right */}
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [15, 45, 15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "70px",
            height: "70px",
            opacity: 0.4,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="#00D37F" stroke="#000" strokeWidth="6" />
          </svg>
        </motion.div>

        {/* Yellow dashed circle middle-right */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "40%",
            right: "3%",
            width: "120px",
            height: "120px",
            border: "3px dashed #FFE500",
            borderRadius: "50%",
            opacity: 0.3,
          }}
        />

        {/* NEW: Small Yellow dots floating left */}
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "12px",
            height: "12px",
            background: "#FFE500",
            borderRadius: "50%",
            border: "1.5px solid #000",
            opacity: 0.5,
          }}
        />

        {/* NEW: Blue outline square middle-right */}
        <motion.div
          animate={{ rotate: [-15, 15, -15], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "60%",
            right: "8%",
            width: "60px",
            height: "60px",
            border: "2px solid #0047FF",
            opacity: 0.15,
          }}
        />

        {/* NEW: Floating Symbols */}
        <div style={{ position: "absolute", top: "45%", left: "3%", fontSize: "32px", fontWeight: 900, opacity: 0.05, transform: "rotate(-20deg)" }}>×</div>
        <div style={{ position: "absolute", bottom: "35%", right: "12%", fontSize: "28px", fontWeight: 900, opacity: 0.07, transform: "rotate(10deg)" }}>O</div>
        <div style={{ position: "absolute", top: "15%", left: "45%", fontSize: "24px", fontWeight: 900, opacity: 0.1 }}>+</div>

        {/* NEW: Large Yellow outline circle bottom-right */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-50px",
            width: "350px",
            height: "350px",
            border: "5px solid #FFE500",
            borderRadius: "50%",
            opacity: 0.1,
          }}
        />

        {/* NEW: Mint Bar middle-right */}
        <motion.div
          animate={{ x: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "30%",
            right: "12%",
            width: "140px",
            height: "15px",
            background: "#00D37F",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.2,
          }}
        />

        {/* NEW: Floating Blue Square center */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "40%",
            width: "40px",
            height: "40px",
            background: "#0047FF",
            border: "2px solid #000",
            boxShadow: "3px 3px 0px #000",
            opacity: 0.15,
          }}
        />

        {/* Scattered dots - MOAR MOAR */}
        <div style={{ position: "absolute", top: "25%", right: "15%", display: "grid", gridTemplateColumns: "repeat(4, 8px)", gap: "6px", opacity: 0.1 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "15%", left: "20%", display: "grid", gridTemplateColumns: "repeat(6, 6px)", gap: "5px", opacity: 0.08 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: "5%", left: "35%", display: "grid", gridTemplateColumns: "repeat(5, 10px)", gap: "10px", opacity: 0.05 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ width: "5px", height: "5px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* NEW: Overlapping Coral Squares bottom-right */}
        <div style={{ position: "absolute", bottom: "5%", right: "15%", opacity: 0.2 }}>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ width: "80px", height: "80px", background: "#FF4D4D", border: "3px solid #000" }}
          />
          <motion.div
            animate={{ rotate: [10, 0, 10] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ width: "80px", height: "80px", border: "3px solid #000", position: "absolute", top: "10px", left: "10px" }}
          />
        </div>


        {/* NEW: Big Blue outline square top-center */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20px",
            left: "50%",
            width: "200px",
            height: "200px",
            border: "3px solid #0047FF",
            transform: "translateX(-50%)",
            opacity: 0.05,
          }}
        />

        <div style={{ position: "absolute", bottom: "40%", left: "5%", display: "grid", gridTemplateColumns: "repeat(8, 6px)", gap: "4px", opacity: 0.06 }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="section-label">⚡ CARA KERJA</span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 52px)",
              marginTop: "8px",
            }}
          >
            Tiga langkah. Itu saja.
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "100px",
            position: "relative",
          }}
        >
          {/* Vertical Dashed Line center (Starting from first card) */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              width: "2px",
              height: "100%",
              borderLeft: "4px dashed #000",
              opacity: 0.08,
              transform: "translateX(-50%)",
              zIndex: 0
            }}
          />
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              id={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                display: "flex",
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                alignItems: "center",
                gap: "40px",
                position: "relative",
              }}
            >
              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "3px solid #000",
                  boxShadow: "8px 8px 0px #000",
                  padding: "40px",
                  borderRadius: "12px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* Big overlapping number */}
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-30px",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 900,
                    fontSize: "120px",
                    lineHeight: 1,
                    color: step.color,
                    WebkitTextStroke: "3px #000",
                    opacity: 0.8,
                    zIndex: -1,
                  }}
                >
                  0<CountUp
                    from={0}
                    to={step.number}
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                    delay={0}
                  />

                </div>

                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: step.color,
                    border: "3px solid #000",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    marginBottom: "24px",
                    boxShadow: "4px 4px 0px #000",
                  }}
                >
                  {step.icon}
                </div>

                <h3
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 900,
                    fontSize: "28px",
                    marginBottom: "16px",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: "#3D3D3D",
                    fontSize: "17px",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Spacer */}
              <div className="hidden md:block" style={{ flex: 1 }} />
            </motion.div>
          ))}
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
