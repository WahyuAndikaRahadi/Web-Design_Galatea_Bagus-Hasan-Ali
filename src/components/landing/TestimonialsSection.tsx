"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Adit",
    role: "Fullstack Dev",
    avatar: "🧑‍💻",
    text: "Akhirnya dapet tim hackathon yang beneran komit lewat CollaboLab!",
    color: "#FFE500",
  },
  {
    name: "Siska",
    role: "UI Designer",
    avatar: "🎨",
    text: "Sistem Trust Score-nya ngebantu banget buat filter partner yang ghosting.",
    color: "#00D37F",
  },
  {
    name: "Budi",
    role: "Product Manager",
    avatar: "📊",
    text: "Dapet partner project startup cuma dalam hitungan hari. Gila sih!",
    color: "#0047FF",
    textColor: "#fff",
  },
  {
    name: "Rina",
    role: "Frontend Dev",
    avatar: "👩‍💻",
    text: "Fitur Anonymous-nya ngebantu banget buat aku yang introvert pas awal kenalan.",
    color: "#FF4D4D",
    textColor: "#fff",
  },
  {
    name: "Farhan",
    role: "Back-end",
    avatar: "⚙️",
    text: "Kanban board-nya simpel dan real-time. Kerja jadi lebih sat-set!",
    color: "#FFFFFF",
  },
  {
    name: "Lia",
    role: "Content Creator",
    avatar: "📸",
    text: "Nemu komunitas buat collab konten kreatif jadi gampang banget di sini.",
    color: "#FFE500",
  },
];

const row1 = [...testimonials, ...testimonials];
const row2 = [...testimonials.reverse(), ...testimonials];

export function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ background: "#FFFFFF", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Yellow dashed block top-left */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "-50px",
            left: "-50px",
            width: "250px",
            height: "250px",
            border: "4px dashed #FFE500",
            borderRadius: "40px",
            opacity: 0.15,
          }}
        />

        {/* Coral Square floating right */}
        <motion.div
          animate={{ x: [0, -30, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "20%",
            right: "5%",
            width: "60px",
            height: "60px",
            background: "#FF4D4D",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.4,
          }}
        />

        {/* Blue Circle bottom-center */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            width: "120px",
            height: "120px",
            background: "#0047FF",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.3,
            zIndex: -1,
          }}
        />

        {/* NEW: Mint Circle top-right */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "5%",
            right: "10%",
            width: "100px",
            height: "100px",
            background: "#00D37F",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.15,
          }}
        />

        {/* NEW: Yellow Outline Square middle-left */}
        <motion.div
          animate={{ rotate: [-15, 15, -15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "40%",
            left: "3%",
            width: "80px",
            height: "80px",
            border: "3px solid #FFE500",
            opacity: 0.2,
          }}
        />

        {/* NEW: Floating Symbols - MOAR */}
        <div style={{ position: "absolute", top: "15%", left: "25%", fontSize: "32px", fontWeight: 900, opacity: 0.05 }}>+</div>
        <div style={{ position: "absolute", bottom: "10%", right: "5%", fontSize: "28px", fontWeight: 900, opacity: 0.08 }}>×</div>
        <div style={{ position: "absolute", top: "45%", right: "12%", fontSize: "24px", fontWeight: 900, opacity: 0.06 }}>O</div>
        <div style={{ position: "absolute", bottom: "30%", left: "8%", fontSize: "20px", fontWeight: 900, opacity: 0.04 }}>×</div>

        {/* Dot patterns scattered - MOAR MOAR */}
        <div style={{ position: "absolute", top: "10%", left: "45%", display: "grid", gridTemplateColumns: "repeat(5, 10px)", gap: "8px", opacity: 0.08 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ width: "5px", height: "5px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "20%", left: "15%", display: "grid", gridTemplateColumns: "repeat(4, 12px)", gap: "10px", opacity: 0.05 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: "60%", right: "3%", display: "grid", gridTemplateColumns: "repeat(6, 6px)", gap: "6px", opacity: 0.06 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* NEW: Horizontal Dashed Line */}
        <div 
          style={{ 
            position: "absolute", 
            bottom: "15%", 
            left: "0", 
            width: "100%", 
            height: "2px", 
            borderTop: "3px dashed #000", 
            opacity: 0.03 
          }} 
        />
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center", marginBottom: "60px" }}>
        <span className="section-label">💬 TESTIMONI</span>
        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 48px)",
            marginTop: "8px",
          }}
        >
          Kata mereka yang sudah kolaborasi.
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Row 1: Right to Left (Wait, user said Top to Right, Bottom to Left) */}
        {/* Actually usually marquee is right-to-left. But user said "atas ke kanan" (top to right) */}
        <div style={{ display: "flex", width: "fit-content" }}>
          <motion.div
            animate={{ x: [ -2000, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: "24px", paddingRight: "24px" }}
          >
            {row1.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: Left to Right (Wait, user said "bawah ke kiri" -> bottom to left) */}
        <div style={{ display: "flex", width: "fit-content" }}>
          <motion.div
            animate={{ x: [ 0, -2000] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: "24px", paddingRight: "24px" }}
          >
            {row2.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, text, color, textColor = "#000" }: any) {
  return (
    <div
      style={{
        background: color,
        border: "3px solid #000",
        borderRadius: "12px",
        padding: "24px",
        width: "320px",
        boxShadow: "6px 6px 0px #000",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <p style={{ color: textColor, fontSize: "15px", fontWeight: 500, lineHeight: 1.6, flex: 1 }}>
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: `1px solid ${textColor}44`, paddingTop: "16px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            background: "#fff",
            border: "2px solid #000",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <h4 style={{ color: textColor, fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", margin: 0 }}>
            {name}
          </h4>
          <p style={{ color: textColor, fontSize: "12px", opacity: 0.8, margin: 0 }}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}
