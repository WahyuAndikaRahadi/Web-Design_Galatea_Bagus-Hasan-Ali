"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section
      id="about"
      style={{
        background: "#FFFFFF",
        padding: "100px 24px",
        borderTop: "3px solid #000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Yellow Circle top-right */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "8%",
            right: "4%",
            width: "120px",
            height: "120px",
            background: "#FFE500",
            border: "3px solid #000",
            borderRadius: "50%",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.7,
          }}
        />

        {/* Blue Square bottom-left */}
        <motion.div
          animate={{ rotate: [-5, 5, -5], x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "12%",
            left: "2%",
            width: "90px",
            height: "90px",
            background: "#0047FF",
            border: "3px solid #000",
            boxShadow: "6px 6px 0px #000",
            opacity: 0.7,
          }}
        />

        {/* Green Triangle middle-left */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            top: "45%",
            left: "5%",
            width: "70px",
            height: "70px",
            opacity: 0.6,
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
          animate={{ y: [0, -20, 0], rotate: [45, 60, 45] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "40px",
            height: "40px",
            background: "#FF4D4D",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.5,
          }}
        />

        {/* NEW: Dashed Square middle-right */}
        <motion.div
          animate={{ rotate: [12, -8, 12], y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "35%",
            right: "8%",
            width: "100px",
            height: "100px",
            border: "3px dashed #000",
            opacity: 0.3,
            borderRadius: "8px",
          }}
        />

        {/* NEW: Small Mint circle floating */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "30%",
            right: "15%",
            width: "30px",
            height: "30px",
            background: "#00D37F",
            border: "2px solid #000",
            borderRadius: "50%",
            opacity: 0.4,
          }}
        />


        {/* NEW: Blue Outline Square middle-left */}
        <motion.div
          animate={{ x: [0, 20, 0], rotate: [-15, 15, -15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "60%",
            left: "8%",
            width: "50px",
            height: "50px",
            border: "2px solid #0047FF",
            opacity: 0.2,
          }}
        />

        {/* NEW: Small Yellow dots floating */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], y: [0, -40, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: "12px",
            height: "12px",
            background: "#FFE500",
            borderRadius: "50%",
            border: "1.5px solid #000",
            opacity: 0.5,
          }}
        />

        {/* NEW: Floating "X" and "+" shapes */}
        <div style={{ position: "absolute", top: "10%", left: "30%", fontSize: "28px", fontWeight: 900, opacity: 0.1, transform: "rotate(20deg)" }}>+</div>
        <div style={{ position: "absolute", bottom: "35%", right: "5%", fontSize: "24px", fontWeight: 900, opacity: 0.05, transform: "rotate(-10deg)" }}>×</div>

        {/* Dot patterns scattered - MOAR */}
        <div style={{ position: "absolute", bottom: "5%", right: "2%", display: "grid", gridTemplateColumns: "repeat(4, 10px)", gap: "8px", opacity: 0.15 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
        
        <div style={{ position: "absolute", top: "15%", left: "5%", display: "grid", gridTemplateColumns: "repeat(3, 8px)", gap: "6px", opacity: 0.1 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: "60%", right: "5%", display: "grid", gridTemplateColumns: "repeat(5, 6px)", gap: "5px", opacity: 0.08 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-center"
        >
          {/* 1. Label - Always at the top */}
          <div className="order-1">
            <span className="section-label">TENTANG KAMI</span>
          </div>

          {/* 2. Image - Order 2 on mobile, Order 2 on Desktop (right column) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2"
            style={{
              background: "transparent",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <img 
              src="/images/foto1.png" 
              alt="CollaboLab" 
              style={{ 
                maxWidth: "100%", 
                height: "auto", 
                maxHeight: "450px",
                objectFit: "contain",
                filter: "drop-shadow(10px 10px 0px rgba(0,0,0,0.05))",
                zIndex: 2,
              }} 
            />
          </motion.div>

          {/* 3. Text Content - Order 3 on mobile, Order 2 on Desktop (below label) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-3 lg:order-2 lg:col-start-1"
          >
            <div style={{ position: "relative" }}>
              {/* Heading Dot Pattern */}
              <div style={{ 
                position: "absolute", 
                top: "-30px", 
                left: "-20px", 
                display: "grid", 
                gridTemplateColumns: "repeat(8, 8px)", 
                gap: "6px", 
                opacity: 0.2,
                zIndex: -1 
              }}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} style={{ width: "4px", height: "4px", background: "#000", borderRadius: "50%" }} />
                ))}
              </div>

              <h2
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(32px, 5vw, 48px)",
                  lineHeight: 1.1,
                  marginBottom: "24px",
                  marginTop: "0",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Kenalan Lebih Dekat <br />
                dengan <span style={{ color: "#FFE500", textShadow: "1px 1px 0px #000" }}>CollaboLab.</span>
              </h2>
            </div>
            
            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#3D3D3D",
                marginBottom: "24px",
              }}
            >
              CollaboLab adalah platform kolaborasi inovatif yang dirancang khusus untuk memfasilitasi kreativitas Gen-Z. 
              Dengan mengintegrasikan sistem reputasi yang transparan dan ruang kerja real-time, kami menciptakan 
              ekosistem di mana setiap ide memiliki kesempatan untuk tumbuh menjadi project nyata yang berdampak luas.
            </p>

            <p style={{ fontStyle: "italic", color: "#666", fontSize: "15px", borderLeft: "4px solid #FFE500", paddingLeft: "16px", marginTop: "32px" }}>
              "Kami percaya bahwa inovasi terbaik lahir dari kolaborasi, bukan kompetisi yang menjatuhkan." 
              <br />
              <span style={{ fontWeight: 700, color: "#000", marginTop: "8px", display: "inline-block" }}>— CollaboLab Team</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
