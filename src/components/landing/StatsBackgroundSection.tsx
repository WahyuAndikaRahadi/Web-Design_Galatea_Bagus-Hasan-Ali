"use client";

import { motion } from "framer-motion";

export function StatsBackgroundSection() {
  const stats = [
    {
      value: "68%",
      label: "Inginkan Feedback Mingguan",
      source: "Officevibe, 2024",
      color: "#FFE500", // Yellow
      desc: "Gen-Z tidak menunggu evaluasi tahunan; mereka butuh validasi instan untuk berkembang."
    },
    {
      value: "72%",
      label: "Transparansi Goal (OKR)",
      source: "Betterworks, 2024",
      color: "#00D37F", // Green
      desc: "Mereka ingin melihat bagaimana kontribusi mereka terhubung langsung dengan visi besar."
    },
    {
      value: "81%",
      label: "Ekspektasi Dashboard Real-time",
      source: "PwC, 2024",
      color: "#0047FF", // Blue
      textColor: "#FFFFFF",
      desc: "Digital natives menghindari sistem kuno; mereka butuh data performa yang bisa diakses 24/7."
    },
    {
      value: "83%",
      label: "Metrik Kesejahteraan Mental",
      source: "APA, 2024",
      color: "#FF4D4D", // Coral
      desc: "Bukan hanya output, mereka ingin kesehatan mental & work-life balance masuk dalam hitungan."
    }
  ];

  const impacts = [
    {
      label: "Turnover Karyawan",
      change: "-30%",
      detail: "Hasil transisi Adobe ke sistem feedback berkelanjutan.",
      source: "Adobe Case Study"
    },
    {
      label: "Partisipasi Komunitas",
      change: "+65%",
      detail: "Melalui implementasi sistem peer-recognition yang tepat.",
      source: "TalentLMS"
    },
    {
      label: "User Engagement",
      change: "+51%",
      detail: "Rata-rata kenaikan keterlibatan dengan transparansi OKR.",
      source: "Betterworks"
    }
  ];

  return (
    <section
      id="background-stats"
      style={{
        background: "#F5F0E8", // Creamy background to distinguish from About
        padding: "100px 24px",
        borderTop: "3px solid #000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", fontSize: "40px", fontWeight: 900, opacity: 0.05 }}>DATA</div>
        <div style={{ position: "absolute", bottom: "10%", right: "5%", fontSize: "40px", fontWeight: 900, opacity: 0.05 }}>INSIGHT</div>
        
        {/* Floating grid pattern */}
        <div style={{ position: "absolute", top: "20%", right: "10%", display: "grid", gridTemplateColumns: "repeat(5, 10px)", gap: "10px", opacity: 0.1 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{ width: "5px", height: "5px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: "#fff",
            border: "3px solid #000",
            boxShadow: "8px 8px 0px #000",
            padding: "40px",
            marginBottom: "80px",
            textAlign: "center",
            position: "relative"
          }}
        >
          <div style={{ 
            position: "absolute", 
            top: "-20px", 
            left: "50%", 
            transform: "translateX(-50%)",
            background: "#FFE500",
            border: "2px solid #000",
            padding: "4px 16px",
            fontWeight: 800,
            fontSize: "14px",
            boxShadow: "4px 4px 0px #000"
          }}>
            PERSPECTIVE
          </div>
          <h3 style={{ 
            fontFamily: "Space Grotesk, sans-serif", 
            fontWeight: 800, 
            fontSize: "clamp(20px, 3vw, 28px)",
            lineHeight: 1.4,
            fontStyle: "italic",
            color: "#000"
          }}>
            "Gen Z doesn't just want to earn a paycheck at work. Instant development, transparent communication, and purpose-driven work are their core expectations. Performance management must adapt to this reality."
          </h3>
          <p style={{ marginTop: "20px", fontWeight: 700, fontSize: "16px" }}>
            — Harvard Business Review, 2024
          </p>
        </motion.div>

        {/* Introduction Text */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span className="section-label">KENAPA COLLABOLAB?</span>
          <h2 style={{ 
            fontFamily: "Space Grotesk, sans-serif", 
            fontWeight: 900, 
            fontSize: "clamp(28px, 4vw, 42px)",
            marginTop: "12px",
            lineHeight: 1.1
          }}>
            Dibuat Berdasarkan <span style={{ color: "#0047FF" }}>Ekspektasi Nyata</span> Generasi Baru.
          </h2>
          <p style={{ maxWidth: "800px", margin: "20px auto 0", fontSize: "18px", color: "#3D3D3D", lineHeight: 1.6 }}>
            Bukan sekadar platform cari tim, CollaboLab adalah jawaban atas pergeseran cara kerja masa kini. 
            Data menunjukkan bahwa Gen-Z membutuhkan sistem yang transparan, instan, dan manusiawi.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "24px",
          marginBottom: "80px"
        }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ translate: "4px 4px", boxShadow: "2px 2px 0px #000" }}
              style={{
                background: stat.color,
                color: stat.textColor || "#000",
                border: "3px solid #000",
                boxShadow: "6px 6px 0px #000",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ fontSize: "42px", fontWeight: 900, marginBottom: "8px" }}>{stat.value}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "12px", lineHeight: 1.2 }}>{stat.label}</div>
              <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: 1.5, marginBottom: "16px", flexGrow: 1 }}>{stat.desc}</p>
              <div style={{ 
                fontSize: "11px", 
                fontWeight: 700, 
                background: "rgba(0,0,0,0.1)", 
                padding: "4px 8px", 
                alignSelf: "flex-start",
                borderRadius: "4px"
              }}>
                Source: {stat.source}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact Section */}
        <div style={{ 
          background: "#000", 
          color: "#fff", 
          padding: "40px", 
          border: "3px solid #000", 
          boxShadow: "8px 8px 0px #FFE500" 
        }}>
          <h4 style={{ 
            fontFamily: "Space Grotesk, sans-serif", 
            fontWeight: 800, 
            fontSize: "24px", 
            marginBottom: "32px",
            textAlign: "center"
          }}>
            Estimasi Dampak Implementasi CollaboLab
          </h4>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "40px" 
          }}>
            {impacts.map((impact, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", fontWeight: 900, color: "#FFE500", marginBottom: "8px" }}>{impact.change}</div>
                <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>{impact.label}</div>
                <p style={{ fontSize: "13px", color: "#AAA", lineHeight: 1.4 }}>{impact.detail}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px", fontSize: "12px", color: "#666" }}>
            *Berdasarkan studi komparasi dari Harvard Business Review, Gallup, dan TalentLMS 2024.
          </div>
        </div>
      </div>
    </section>
  );
}
