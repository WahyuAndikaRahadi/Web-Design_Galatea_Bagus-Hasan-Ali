"use client";

import Link from "next/link";
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
  const displayProjects = projects.length > 0 ? projects : [];

  return (
    <section
      id="explore-preview"
      style={{
        background: "#fff",
        borderBottom: "3px solid #000",
        padding: "80px 24px",
      }}
    >
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
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {displayProjects.map((project, index) => {
            const cat = CATEGORY_META[project.category];
            const spotsLeft = project.maxMembers - project.memberCount;
            const projectLink = isAuthenticated ? `/project/${project.id}` : "/login";

            return (
              <Link
                href={projectLink}
                key={project.id}
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
                  transition: "all 0.15s ease",
                  transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`,
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  minHeight: "320px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "2px 2px 0px #000";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translate(2px, 2px) rotate(0deg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "6px 6px 0px #000";
                  (e.currentTarget as HTMLAnchorElement).style.transform = `translate(0, 0) rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)`;
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
