"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TiltWrapper } from "./TiltWrapper";
import type { ProjectCategory, CommitmentLevel, TrustLevel } from "@prisma/client";
import { CATEGORY_META } from "@/types";

interface ProjectPreview {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  commitmentLevel: CommitmentLevel;
  requiredSkills: string[];
  maxMembers: number;
  memberCount: number;
  owner: { name: string; trustScore: number; trustLevel: TrustLevel };
}

interface ExplorePreviewProps {
  projects: ProjectPreview[];
  isAuthenticated: boolean;
}

function getTrustEmoji(level: TrustLevel) {
  const map: Record<TrustLevel, string> = {
    NEWCOMER: "🔴",
    MEMBER: "🟡",
    TRUSTED: "🟢",
    VERIFIED: "🔵",
  };
  return map[level];
}

function CommitmentBadge({ level }: { level: CommitmentLevel }) {
  const map: Record<CommitmentLevel, { label: string; bg: string }> = {
    CASUAL: { label: "Casual", bg: "#00D37F" },
    SERIUS: { label: "Serius", bg: "#0047FF" },
    KOMPETISI: { label: "Kompetisi", bg: "#FF4D4D" },
  };
  const { label, bg } = map[level];
  return (
    <span
      style={{
        background: bg,
        color: level === "SERIUS" || level === "KOMPETISI" ? "#fff" : "#000",
        border: "1.5px solid #000",
        borderRadius: "4px",
        padding: "2px 8px",
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: 700,
        fontSize: "11px",
      }}
    >
      {label}
    </span>
  );
}

export function ExplorePreview({ projects, isAuthenticated }: ExplorePreviewProps) {
  // If no projects, we could show a fallback or nothing. 
  // For landing page, showing at least the section is good.
  const displayProjects = projects.length > 0 ? projects.slice(0, 3) : [];

  return (
    <section
      id="explore-preview"
      style={{
        background: "#FFFFFF",
        padding: "clamp(60px, 10vh, 100px) 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Geometric decorations */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Yellow Circle top-left */}
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "5%",
            left: "2%",
            width: "80px",
            height: "80px",
            background: "#FFE500",
            border: "2px solid #000",
            borderRadius: "50%",
            boxShadow: "4px 4px 0px #000",
            opacity: 0.5,
          }}
        />

        {/* Blue Dashed Square bottom-right */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            bottom: "5%",
            right: "3%",
            width: "140px",
            height: "140px",
            border: "3px dashed #0047FF",
            opacity: 0.2,
          }}
        />

        {/* Coral Square top-right */}
        <motion.div
          animate={{ rotate: [45, 60, 45], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: "40px",
            height: "40px",
            background: "#FF4D4D",
            border: "2px solid #000",
            boxShadow: "3px 3px 0px #000",
            opacity: 0.4,
          }}
        />

        {/* NEW: Green Outline Triangle bottom-left */}
        <motion.div
          animate={{ rotate: [10, -10, 10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "15%",
            left: "5%",
            width: "60px",
            height: "60px",
            opacity: 0.15,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="none" stroke="#00D37F" strokeWidth="4" />
          </svg>
        </motion.div>

        {/* NEW: Small Coral dots floating */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "20%",
            right: "20%",
            width: "10px",
            height: "10px",
            background: "#FF4D4D",
            borderRadius: "50%",
            border: "1.5px solid #000",
            opacity: 0.4,
          }}
        />

        {/* NEW: Floating Symbols */}
        <div style={{ position: "absolute", top: "10%", left: "30%", fontSize: "32px", fontWeight: 900, opacity: 0.05 }}>+</div>
        <div style={{ position: "absolute", bottom: "40%", right: "2%", fontSize: "28px", fontWeight: 900, opacity: 0.08 }}>×</div>
        <div style={{ position: "absolute", bottom: "10%", left: "45%", fontSize: "24px", fontWeight: 900, opacity: 0.06 }}>O</div>

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
            top: "50%",
            right: "5%",
            width: "60px",
            height: "60px",
            opacity: 0.2,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
            <path d="M50 5 L95 85 L5 85 Z" fill="none" stroke="#FF4D4D" strokeWidth="6" strokeDasharray="10 5" />
          </svg>
        </motion.div>

        {/* NEW: Floating Symbols - MOAR */}
        <div style={{ position: "absolute", top: "25%", left: "5%", fontSize: "24px", fontWeight: 900, opacity: 0.08 }}>O</div>
        <div style={{ position: "absolute", bottom: "30%", left: "20%", fontSize: "32px", fontWeight: 900, opacity: 0.05, transform: "rotate(45deg)" }}>+</div>
        <div style={{ position: "absolute", top: "15%", right: "8%", fontSize: "28px", fontWeight: 900, opacity: 0.06 }}>×</div>
        <div style={{ position: "absolute", bottom: "15%", right: "30%", fontSize: "22px", fontWeight: 900, opacity: 0.04 }}>×</div>

        {/* Dot patterns scattered - EVEN MOAR */}
        <div style={{ position: "absolute", top: "20%", left: "40%", display: "grid", gridTemplateColumns: "repeat(6, 6px)", gap: "6px", opacity: 0.1 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", bottom: "25%", right: "15%", display: "grid", gridTemplateColumns: "repeat(4, 10px)", gap: "8px", opacity: 0.1 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: "5px", height: "5px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: "10%", left: "10%", display: "grid", gridTemplateColumns: "repeat(5, 5px)", gap: "5px", opacity: 0.05 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ width: "3px", height: "3px", background: "#000", borderRadius: "50%" }} />
          ))}
        </div>

        {/* NEW: Horizontal Dashed Line middle */}
        <div 
          style={{ 
            position: "absolute", 
            top: "50%", 
            left: "0", 
            width: "100%", 
            height: "2px", 
            borderTop: "2px dashed #000", 
            opacity: 0.03 
          }} 
        />
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="section-label">🔍 EXPLORE PREVIEW</span>
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 56px)",
              marginTop: "8px",
              lineHeight: 1.1,
            }}
          >
            Project yang lagi{" "}
            <span
              style={{
                background: "#FF4D4D",
                color: "#fff",
                padding: "0 12px",
                transform: "rotate(-1deg)",
                display: "inline-block",
                border: "3px solid #000",
              }}
            >
              hot
            </span>{" "}
            cari anggota.
          </h2>
          <p style={{ color: "#3D3D3D", fontSize: "18px", marginTop: "16px", maxWidth: "700px", margin: "16px auto 0" }}>
            Ini baru sebagian kecil. Login untuk melihat persentase <strong>Skill Match</strong> kamu dan mulai apply.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
            marginBottom: "40px",
            padding: "10px",
          }}
        >
          {displayProjects.map((project, index) => {
            const cat = CATEGORY_META[project.category];
            const spotsLeft = project.maxMembers - project.memberCount;
            const projectLink = isAuthenticated ? `/project/${project.id}` : "/login";

            return (
              <TiltWrapper
                key={project.id}
                index={index}
                style={{ perspective: "1000px" }}
              >
                <Link
                  href={projectLink}
                  id={`preview-card-${index + 1}`}
                  style={{
                    background: "#fff",
                    border: "3px solid #000",
                    borderRadius: "8px",
                    boxShadow: "6px 6px 0px #000",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    minHeight: "320px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "2px 2px 0px #000";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 6px 0px #000";
                  }}
                >
                {index === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-16px",
                      left: "-12px",
                      background: "#FFE500",
                      border: "2px solid #000",
                      padding: "6px 12px",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 900,
                      fontSize: "14px",
                      transform: "rotate(-8deg)",
                      boxShadow: "4px 4px 0px #000",
                      zIndex: 10,
                    }}
                  >
                    🔥 TOP RESULT
                  </div>
                )}

                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span
                    style={{
                      background: cat.color,
                      border: "1.5px solid #000",
                      borderRadius: "4px",
                      padding: "3px 10px",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </span>
                  <CommitmentBadge level={project.commitmentLevel} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 800,
                    fontSize: "20px",
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {project.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: "#3D3D3D",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description}
                </p>

                {/* Skills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {project.requiredSkills.map((skill) => (
                    <span key={skill} className="skill-chip" style={{ cursor: "default", fontSize: "11px" }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "2px solid #000",
                    marginTop: "auto",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>
                        {getTrustEmoji(project.owner.trustLevel)}
                      </span>
                      <span 
                        style={{ 
                          fontSize: "14px", 
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {project.owner.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#666", fontWeight: 600 }}>Trust Score:</span>
                      <span
                        style={{
                          background: "#F5F0E8",
                          border: "1.5px solid #000",
                          borderRadius: "4px",
                          padding: "1px 8px",
                          fontSize: "11px",
                          fontWeight: 800,
                          fontFamily: "Space Grotesk, sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.owner.trustScore}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: spotsLeft <= 1 ? "#FF4D4D" : "#00D37F",
                      color: spotsLeft <= 1 ? "#fff" : "#000",
                      border: "2px solid #000",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 800,
                      fontFamily: "Space Grotesk, sans-serif",
                      whiteSpace: "nowrap",
                      boxShadow: "2px 2px 0px #000",
                    }}
                  >
                    {spotsLeft} slot tersisa
                  </span>
                </div>
              </Link>
            </TiltWrapper>
          );
        })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link
            href={isAuthenticated ? "/explore" : "/login"}
            className="btn-secondary"
            id="explore-preview-see-all"
            style={{ fontSize: "16px" }}
          >
            Lihat Semua Project →
          </Link>
          <p style={{ marginTop: "12px", fontSize: "13px", color: "#3D3D3D" }}>
            Login untuk melihat persentase Skill Match dan fitur apply
          </p>
        </div>
      </div>
    </section>
  );
}
