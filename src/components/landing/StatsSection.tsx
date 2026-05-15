"use client";

import { motion } from "framer-motion";
import { TiltWrapper } from "./TiltWrapper";
import CountUp from "./CountUp";

export function StatsSection() {
  const stats = [
    {
      value: 68,
      label: "Feedback Mingguan",
      desc: "Gen-Z menginginkan umpan balik setidaknya sekali seminggu (Officevibe, 2024).",
      color: "#FFE500",
      delay: 0.1,
      icon: "💬",
    },
    {
      value: 72,
      label: "Transparansi",
      desc: "Ingin melihat bagaimana peran mereka berkontribusi pada visi besar (Betterworks, 2024).",
      color: "#0047FF",
      textColor: "#fff",
      delay: 0.2,
      icon: "🎯",
    },
    {
      value: 81,
      label: "Akses Real-Time",
      desc: "Mengharapkan dashboard real-time dan akses mobile (PwC, 2024).",
      color: "#00D37F",
      delay: 0.3,
      icon: "📱",
    },
    {
      value: 83,
      label: "Kesehatan Mental",
      desc: "Menginginkan metrik burnout & work-life balance dipertimbangkan (APA, 2024).",
      color: "#FF4D4D",
      textColor: "#fff",
      delay: 0.4,
      icon: "🧠",
    },
  ];

  const impacts = [
    {
      title: "Reduksi Turnover",
      value: 30,
      desc: "Pengurangan perputaran karyawan dengan model check-in berkelanjutan.",
      icon: "📉",
      bg: "#FFFFFF",
    },
    {
      title: "Keterlibatan Tim",
      value: 51,
      desc: "Engagement lebih tinggi melalui sistem target OKR yang transparan.",
      icon: "🤝",
      bg: "#FFE500",
    },
    {
      title: "Partisipasi Aktif",
      value: 65,
      desc: "Peningkatan partisipasi berkat sistem pengakuan rekan sejawat.",
      icon: "✨",
      bg: "#00D37F",
    },
    {
      title: "Motivasi Belajar",
      value: 94,
      desc: "Preferensi terhadap micro-learning untuk pengembangan skill instan.",
      icon: "🚀",
      bg: "#0047FF",
      textColor: "#fff",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section
      id="stats"
      style={{
        background: "#FFFFFF",
        padding: "80px 24px",
        borderTop: "3px solid #000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Elements - Fun & Alive */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Geometric Decorations (Consistency with AboutSection) */}

        {/* Yellow Circle top-right */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "5%",
            right: "3%",
            width: "120px",
            height: "120px",
            background: "#FFE500",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.4,
          }}
        />

        {/* Blue Square bottom-left */}
        <motion.div
          animate={{ rotate: [-5, 5, -5], x: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "8%",
            left: "2%",
            width: "80px",
            height: "80px",
            background: "#0047FF",
            border: "3px solid #000",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.3,
          }}
        />

        {/* Green Triangle middle-right */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "40%",
            right: "2%",
            width: "60px",
            height: "60px",
            opacity: 0.3,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <path
              d="M50 5 L95 85 L5 85 Z"
              fill="#00D37F"
              stroke="#000"
              strokeWidth="6"
              style={{ filter: "drop-shadow(4px 4px 0px #000)" }}
            />
          </svg>
        </motion.div>

        {/* Coral Square floating */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [45, 60, 45] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "15%",
            left: "12%",
            width: "40px",
            height: "40px",
            background: "#FF4D4D",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.2,
          }}
        />

        {/* Floating Plus & Cross signs */}
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "50%", left: "8%", fontSize: "32px", fontWeight: 900, opacity: 0.1 }}>+</motion.div>
        <motion.div
          animate={{ rotate: [360, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "18%", left: "45%", fontSize: "28px", fontWeight: 900, opacity: 0.1 }}>×</motion.div>

        {/* Scattered Dot Grids */}
        <div style={{ position: "absolute", top: "15%", right: "20%", display: "grid", gridTemplateColumns: "repeat(6, 10px)", gap: "8px", opacity: 0.1 }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* Giant Background Text */}
        <div style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "clamp(100px, 15vw, 180px)",
          fontWeight: 900,
          color: "#000",
          opacity: 0.012,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: -1
        }}>
          INSIGHTS
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="section-label"
            style={{ background: "#FFE500", boxShadow: "4px 4px 0px #000", color: "#000" }}
          >
            URGENSI & RISET 2024
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 48px)",
              marginTop: "16px",
              lineHeight: 1,
            }}
          >
            Mengapa CollaboLab <br />
            <span style={{ color: "#FFE500", textShadow: "1.5px 1.5px 0px #000" }}>Dirancang Seperti Ini?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ maxWidth: "800px", margin: "24px auto 0", fontSize: "18px", color: "#3D3D3D", lineHeight: 1.5, fontWeight: 500 }}
          >
            Kami mengintegrasikan riset Gallup & HBR untuk menciptakan ekosistem yang relevan bagi masa depan Gen-Z.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            marginBottom: "80px",
          }}
        >
          {stats.map((stat, i) => (
            <TiltWrapper key={i} index={i}>
              <motion.div
                variants={itemVariants}
                style={{
                  background: stat.color,
                  color: stat.textColor || "#000",
                  border: "3px solid #000",
                  padding: "32px 24px",
                  boxShadow: "6px 6px 0px #000",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  minHeight: "220px",
                }}
              >
                {/* Card Icon Floating */}
                <div style={{ position: "absolute", top: "15px", right: "15px", fontSize: "28px", opacity: 0.25 }}>
                  {stat.icon}
                </div>

                <div style={{ fontSize: "52px", fontWeight: 900, fontFamily: "Space Grotesk, sans-serif", lineHeight: 1, letterSpacing: "-0.04em" }}>
                  <CountUp
                    from={0}
                    to={stat.value}
                    separator=","
                    direction="up"
                    duration={2}
                    className="count-up-text"
                    delay={0}
                  />%
                </div>
                <div style={{ fontWeight: 800, fontSize: "18px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {stat.label}
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.5, fontWeight: 500 }}>
                  {stat.desc}
                </p>

                <div style={{ position: "absolute", bottom: "-10px", right: "-10px", width: "30px", height: "30px", background: "rgba(0,0,0,0.05)", borderRadius: "50%" }}></div>
              </motion.div>
            </TiltWrapper>
          ))}
        </motion.div>

        {/* Impact Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{
            background: "#F5F0E8",
            padding: "60px 32px",
            border: "3px solid #000",
            boxShadow: "12px 12px 0px #FFE500",
            position: "relative",
            overflow: "hidden",
            marginBottom: "80px",
          }}
        >
          {/* Subtle Noise Texture Overlay */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none", backgroundImage: "url('https://www.transparenttextures.com/patterns/p6-mini.png')" }}></div>

          <div style={{ marginBottom: "40px", position: "relative", zIndex: 1 }}>
            <h3
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 900,
                color: "#000",
                lineHeight: 1,
              }}
            >
              Proyeksi Dampak <span style={{ background: "#FFE500", padding: "0 8px", boxShadow: "4px 4px 0px #000", border: "2px solid #000" }}>CollaboLab</span>
            </h3>
            <p style={{ color: "#3D3D3D", marginTop: "16px", fontSize: "17px", maxWidth: "600px", fontWeight: 500 }}>
              Menerapkan Trust Score dan OKR Transparan untuk kolaborasi yang lebih terukur.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
              position: "relative",
              zIndex: 1
            }}
          >
            {impacts.map((impact, i) => (
              <TiltWrapper key={i} index={i}>
                <motion.div
                  style={{
                    background: impact.bg,
                    color: impact.textColor || "#000",
                    padding: "28px 24px",
                    border: "3px solid #000",
                    boxShadow: "6px 6px 0px #000",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: "36px" }}>{impact.icon}</div>
                  <div style={{ fontSize: "48px", fontWeight: 900, fontFamily: "Space Grotesk, sans-serif", lineHeight: 1 }}>
                    <CountUp
                    from={0}
                    to={impact.value}
                    separator=","
                    direction="up"
                    duration={2}
                    className="count-up-text"
                    delay={0}
                  />%
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "16px", textTransform: "uppercase" }}>{impact.title}</div>
                  <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: 1.4, fontWeight: 500 }}>
                    {impact.desc}
                  </p>
                </motion.div>
              </TiltWrapper>
            ))}
          </div>
        </motion.div>

        {/* Quote Section */}
        <TiltWrapper>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: "#fff",
              border: "3px solid #000",
              padding: "60px 32px",
              boxShadow: "12px 12px 0px #0047FF",
              position: "relative",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "#FFE500",
                border: "2px solid #000",
                padding: "6px 20px",
                fontWeight: 900,
                fontSize: "14px",
                boxShadow: "4px 4px 0px #000",
                marginBottom: "32px",
                textTransform: "uppercase"
              }}
            >
              Harvard Business Review, 2024
            </motion.div>

            <div style={{ position: "relative" }}>
              <span style={{ fontSize: "80px", position: "absolute", top: "-40px", left: "-15px", fontFamily: "serif", opacity: 0.1 }}>“</span>
              <p
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "clamp(20px, 3.5vw, 28px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color: "#000",
                  position: "relative",
                  zIndex: 1,
                  maxWidth: "800px"
                }}
              >
                Gen Z tidak hanya ingin mendapatkan gaji di tempat kerja. Pengembangan instan, komunikasi transparan, dan pekerjaan yang didorong oleh tujuan adalah ekspektasi inti mereka. <span style={{ color: "#0047FF" }}>Manajemen kinerja harus beradaptasi.</span>
              </p>
              <span style={{ fontSize: "80px", position: "absolute", bottom: "-60px", right: "-15px", fontFamily: "serif", opacity: 0.1 }}>”</span>
            </div>
          </motion.div>
        </TiltWrapper>
      </div>
    </section>
  );
}
