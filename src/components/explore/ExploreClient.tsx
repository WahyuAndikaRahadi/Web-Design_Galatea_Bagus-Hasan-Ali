"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CATEGORY_META, COMMITMENT_META } from "@/types";
import { calculateSkillMatch } from "@/lib/skill-match";
import type { ProjectCategory, CommitmentLevel, TrustLevel } from "@prisma/client";

type Project = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  commitmentLevel: CommitmentLevel;
  maxMembers: number;
  deadline: string | null;
  createdAt: string;
  requiredSkills: { skillName: string }[];
  members: { id: string }[];
  owner: { 
    id: string; 
    name: string; 
    image: string | null; 
    trustScore: number; 
    trustLevel: TrustLevel;
    externalLinks?: { platform: string; url: string }[];
  };
};

const TRUST_EMOJI: Record<TrustLevel, string> = {
  NEWCOMER: "🔴",
  MEMBER: "🟡",
  TRUSTED: "🟢",
  VERIFIED: "🔵",
};

export function ProjectCard({ project, userSkills }: { project: Project; userSkills: string[] }) {
  const spotsLeft = project.maxMembers - project.members.length;
  const cat = CATEGORY_META[project.category];
  const commit = COMMITMENT_META[project.commitmentLevel];
  const matchPct = userSkills.length > 0
    ? calculateSkillMatch(userSkills, project.requiredSkills.map((s) => s.skillName))
    : null;

  return (
    <div
      id={`project-card-${project.id}`}
      style={{
        background: "#fff",
        border: "2px solid #000",
        borderRadius: "8px",
        boxShadow: "4px 4px 0px #000",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "all 0.15s ease",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "2px 2px 0px #000";
        (e.currentTarget as HTMLDivElement).style.transform = "translate(2px, 2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "4px 4px 0px #000";
        (e.currentTarget as HTMLDivElement).style.transform = "translate(0, 0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ background: cat.color, border: "1.5px solid #000", borderRadius: "4px", padding: "3px 10px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "12px" }}>
          {cat.emoji} {cat.label}
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{
            background: project.commitmentLevel === "KOMPETISI" ? "#FF4D4D" : project.commitmentLevel === "SERIUS" ? "#0047FF" : "#00D37F",
            color: project.commitmentLevel === "CASUAL" ? "#000" : "#fff",
            border: "1.5px solid #000",
            borderRadius: "4px",
            padding: "2px 8px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "11px",
          }}>
            {commit.label}
          </span>
        </div>
      </div>

      {/* Skill match bar */}
      {matchPct !== null && (
        <div style={{ background: "#F5F0E8", border: "1.5px solid #000", borderRadius: "6px", padding: "8px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "12px" }}>Skill Match</span>
            <span style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: "14px",
              color: matchPct >= 80 ? "#00D37F" : matchPct >= 60 ? "#FF8C00" : "#FF4D4D",
            }}>
              {matchPct}%
            </span>
          </div>
          <div style={{ height: "6px", background: "#fff", border: "1px solid #000", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              width: `${matchPct}%`,
              height: "100%",
              background: matchPct >= 80 ? "#00D37F" : matchPct >= 60 ? "#FFE500" : "#FF4D4D",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Title */}
      <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "17px", margin: 0, lineHeight: 1.3 }}>
        {project.title}
      </h3>

      {/* Description */}
      <p style={{
        color: "#3D3D3D",
        fontSize: "14px",
        lineHeight: 1.5,
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        flex: 1,
      }}>
        {project.description}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {project.requiredSkills.slice(0, 4).map((s) => (
          <span key={s.skillName} className="skill-chip" style={{ cursor: "default" }}>{s.skillName}</span>
        ))}
        {project.requiredSkills.length > 4 && (
          <span className="skill-chip" style={{ cursor: "default" }}>+{project.requiredSkills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1.5px solid #e0e0e0", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px" }}>{TRUST_EMOJI[project.owner.trustLevel]}</span>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{project.owner.name}</span>
          
          <div style={{ display: "flex", gap: "4px", marginLeft: "4px" }}>
            {project.owner.externalLinks?.map(l => (
              <a 
                key={l.platform} 
                href={l.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={l.platform}
                style={{ textDecoration: "none", fontSize: "12px" }}
              >
                {l.platform === "LINKEDIN" ? "🔵" : "⚫"}
              </a>
            ))}
          </div>

          <span style={{ background: "#F5F0E8", border: "1.5px solid #000", borderRadius: "4px", padding: "1px 6px", fontSize: "11px", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", marginLeft: "4px" }}>
            {project.owner.trustScore}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            background: spotsLeft === 0 ? "#FF4D4D" : spotsLeft <= 1 ? "#FF8C00" : "#00D37F",
            color: spotsLeft === 0 || spotsLeft <= 1 ? "#fff" : "#000",
            border: "1.5px solid #000",
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 700,
            fontFamily: "Space Grotesk, sans-serif",
          }}>
            {spotsLeft === 0 ? "Penuh" : `${spotsLeft} slot`}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/project/${project.id}`}
        className="btn-primary btn-sm"
        id={`project-card-link-${project.id}`}
        style={{ textAlign: "center", width: "100%" }}
      >
        Lihat Detail →
      </Link>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface Filters {
  category: string;
  commitment: string;
  skill: string;
}

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div style={{
      background: "#F5F0E8",
      border: "2px solid #000",
      borderRadius: "8px",
      padding: "16px 20px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: "24px",
    }}>
      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
        🔍 Filter:
      </span>

      <select
        id="filter-category"
        className="nb-select"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        style={{ width: "auto", minWidth: "140px" }}
      >
        <option value="ALL">Semua Kategori</option>
        {Object.entries(CATEGORY_META).map(([key, val]) => (
          <option key={key} value={key}>{val.emoji} {val.label}</option>
        ))}
      </select>

      <select
        id="filter-commitment"
        className="nb-select"
        value={filters.commitment}
        onChange={(e) => onChange({ ...filters, commitment: e.target.value })}
        style={{ width: "auto", minWidth: "140px" }}
      >
        <option value="ALL">Semua Komitmen</option>
        {Object.entries(COMMITMENT_META).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <input
        id="filter-skill"
        type="text"
        className="nb-input"
        placeholder="Cari skill..."
        value={filters.skill}
        onChange={(e) => onChange({ ...filters, skill: e.target.value })}
        style={{ width: "auto", minWidth: "160px" }}
      />

      {(filters.category !== "ALL" || filters.commitment !== "ALL" || filters.skill) && (
        <button
          onClick={() => onChange({ category: "ALL", commitment: "ALL", skill: "" })}
          id="filter-reset-btn"
          className="btn-secondary btn-sm"
        >
          Reset ✕
        </button>
      )}
    </div>
  );
}

// ─── Explore Page Client Component ───────────────────────────────────────────

export function ExploreClient({ initialProjects }: { initialProjects: Project[] }) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<Filters>({ category: "ALL", commitment: "ALL", skill: "" });
  const [isLoading, setIsLoading] = useState(false);
  const userSkills = (session?.user as { skills?: string[] })?.skills ?? [];

  const fetchProjects = useCallback(async (f: Filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.category !== "ALL") params.set("category", f.category);
      if (f.commitment !== "ALL") params.set("commitment", f.commitment);
      if (f.skill) params.set("skill", f.skill);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProjects(filters), 300);
    return () => clearTimeout(t);
  }, [filters, fetchProjects]);

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3D3D3D" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p>Memuat project...</p>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>😕</div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "18px" }}>
            Tidak ada project yang cocok.
          </p>
          <p style={{ color: "#3D3D3D" }}>Coba ubah filter atau buat project baru!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} userSkills={userSkills} />
          ))}
        </div>
      )}
    </>
  );
}
