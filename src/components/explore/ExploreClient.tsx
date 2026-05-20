"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_META, COMMITMENT_META } from "@/types";
import { User } from "lucide-react";
import { calculateSkillMatch } from "@/lib/skill-match";
import { containerVariants, itemVariants } from "../ui/DecorativeElements";
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
  hubTasks: { id: string; status: string }[];
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
  const matchPct =
    userSkills.length > 0
      ? calculateSkillMatch(userSkills, project.requiredSkills.map((s) => s.skillName))
      : null;

  const totalTasks = project.hubTasks?.length || 0;
  const doneTasks = project.hubTasks?.filter((t) => t.status === "DONE").length || 0;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        y: -10, 
        x: -4,
        boxShadow: "12px 12px 0px #000",
        rotate: 0.5,
        transition: { type: "spring", stiffness: 300, damping: 10 } 
      }}
      id={`project-card-${project.id}`}
      style={{
        background: "#fff",
        border: "3px solid #000",
        borderRadius: "12px",
        boxShadow: "6px 6px 0px #000",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "6px", background: cat.color }} />

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ background: cat.color, border: "1.5px solid #000", borderRadius: "4px", padding: "3px 10px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "12px" }}>
          {cat.emoji} {cat.label}
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span
            style={{
              background:
                project.commitmentLevel === "KOMPETISI"
                  ? "#FF4D4D"
                  : project.commitmentLevel === "SERIUS"
                  ? "#0047FF"
                  : "#00D37F",
              color: project.commitmentLevel === "CASUAL" ? "#000" : "#fff",
              border: "1.5px solid #000",
              borderRadius: "4px",
              padding: "2px 8px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "11px",
            }}
          >
            {commit.label}
          </span>
        </div>
      </div>

      {/* Progress & Match bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Project Progress */}
        <div style={{ background: "#F5F0E8", border: "2px solid #000", borderRadius: "8px", padding: "10px 14px", boxShadow: "2px 2px 0px #000" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 Progres Project</span>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "16px" }}>{progressPct}%</span>
          </div>
          <div style={{ height: "10px", background: "#fff", border: "2px solid #000", borderRadius: "5px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "circOut" }}
              style={{ height: "100%", background: "#00D37F" }}
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "18px", margin: 0, lineHeight: 1.3 }}>
        {project.title}
      </h3>

      {/* Description */}
      <p
        style={{
          color: "#3D3D3D",
          fontSize: "15px",
          lineHeight: 1.5,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
          fontWeight: 500
        }}
      >
        {project.description}
      </p>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {project.requiredSkills.slice(0, 4).map((s) => (
          <span
            key={s.skillName}
            className="skill-chip"
            style={{
              cursor: "default",
              background:
                userSkills.map((u) => u.toLowerCase()).includes(s.skillName.toLowerCase())
                  ? "#FFE500"
                  : undefined,
              fontWeight: userSkills.map((u) => u.toLowerCase()).includes(s.skillName.toLowerCase())
                ? 700
                : undefined,
            }}
          >
            {s.skillName}
          </span>
        ))}
        {project.requiredSkills.length > 4 && (
          <span className="skill-chip" style={{ cursor: "default" }}>
            +{project.requiredSkills.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
                {project.owner.image ? (
                  <img 
                      src={project.owner.image} 
                      alt={project.owner.name}
                      style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1.5px solid #000" }}
                  />
                ) : (
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1.5px solid #000", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                    <User size={14} strokeWidth={3} />
                  </div>
                )}
                <div style={{ position: "absolute", bottom: -2, right: -2, width: "10px", height: "10px", background: "#00D37F", border: "1.5px solid #000", borderRadius: "50%" }} />
            </div>
          <span style={{ fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.owner.name}</span>
          <span style={{ background: "#F5F0E8", border: "1.5px solid #000", borderRadius: "4px", padding: "1px 6px", fontSize: "11px", fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", flexShrink: 0 }}>
            {project.owner.trustScore}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span
            style={{
              background: spotsLeft === 0 ? "#FF4D4D" : spotsLeft <= 1 ? "#FF8C00" : "#00D37F",
              color: spotsLeft === 0 || spotsLeft <= 1 ? "#fff" : "#000",
              border: "1.5px solid #000",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            {spotsLeft === 0 ? "Penuh" : `${spotsLeft} slot`}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/project/${project.id}`}
        className="btn-primary btn-sm"
        id={`project-card-link-${project.id}`}
        style={{ textAlign: "center", width: "100%", marginTop: "4px" }}
      >
        Lihat Detail →
      </Link>
    </motion.div>
  );
}



interface Filters {
  category: string;
  commitment: string;
  skill: string;
}

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "3px solid #000",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: "40px",
        boxShadow: "8px 8px 0px #000",
        position: "relative",
        zIndex: 5
      }}
    >
      <div style={{ background: "#000", color: "#FFE500", padding: "6px 12px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🔍</span>
        <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Filter Area
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select
            id="filter-category"
            className="nb-select"
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            style={{ width: "auto", minWidth: "160px", boxShadow: "4px 4px 0px #000" }}
          >
            <option value="ALL">Semua Kategori</option>
            {Object.entries(CATEGORY_META).map(([key, val]) => (
              <option key={key} value={key}>
                {val.emoji} {val.label}
              </option>
            ))}
          </select>

          <select
            id="filter-commitment"
            className="nb-select"
            value={filters.commitment}
            onChange={(e) => onChange({ ...filters, commitment: e.target.value })}
            style={{ width: "auto", minWidth: "160px", boxShadow: "4px 4px 0px #000" }}
          >
            <option value="ALL">Semua Komitmen</option>
            {Object.entries(COMMITMENT_META).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <input
            id="filter-skill"
            type="text"
            className="nb-input"
            placeholder="Cari skill spesifik..."
            value={filters.skill}
            onChange={(e) => onChange({ ...filters, skill: e.target.value })}
            style={{ width: "auto", minWidth: "200px", boxShadow: "4px 4px 0px #000" }}
          />
      </div>

      {(filters.category !== "ALL" || filters.commitment !== "ALL" || filters.skill) && (
        <button
          onClick={() => onChange({ category: "ALL", commitment: "ALL", skill: "" })}
          id="filter-reset-btn"
          className="btn-danger btn-sm"
          style={{ padding: "12px 20px" }}
        >
          Reset ✕
        </button>
      )}
    </div>
  );
}


type Tab = "semua" | "untuk-kamu";

function TabBar({
  activeTab,
  onTabChange,
  untukKamuCount,
  hasSkills,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  untukKamuCount: number;
  hasSkills: boolean;
}) {
  const tabs: { id: Tab; label: string; emoji: string; desc: string }[] = [
    { id: "semua", label: "Semua", emoji: "🌐", desc: "Semua project aktif" },
    {
      id: "untuk-kamu",
      label: "Untuk Kamu",
      emoji: "✨",
      desc: hasSkills ? `${untukKamuCount} project cocok skill-mu` : "Lengkapi skill di profil dulu",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.id === "untuk-kamu" && !hasSkills;

        return (
          <button
            key={tab.id}
            id={`explore-tab-${tab.id}`}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 22px",
              background: isActive ? "#FFE500" : "#fff",
              border: "2px solid #000",
              borderRadius: "8px",
              boxShadow: isActive ? "4px 4px 0px #000" : "2px 2px 0px #000",
              transform: isActive ? "translate(-2px, -2px)" : "none",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: isDisabled ? 0.5 : 1,
              fontFamily: "Space Grotesk, sans-serif",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (!isActive && !isDisabled) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0px #000";
                (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px, -1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !isDisabled) {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px #000";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }
            }}
          >
            <span style={{ fontSize: "22px", lineHeight: 1 }}>{tab.emoji}</span>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {tab.label}
                {tab.id === "untuk-kamu" && hasSkills && untukKamuCount > 0 && (
                  <span
                    style={{
                      background: isActive ? "#000" : "#FFE500",
                      color: isActive ? "#FFE500" : "#000",
                      border: "1.5px solid #000",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "1px 8px",
                    }}
                  >
                    {untukKamuCount}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#3D3D3D", marginTop: "2px" }}>
                {tab.desc}
              </div>
            </div>
          </button>
        );
      })}

      {/* Thin divider */}
      <div
        style={{
          flex: 1,
          borderBottom: "2px solid #000",
          alignSelf: "flex-end",
          marginBottom: "0px",
          minWidth: "24px",
        }}
      />
    </div>
  );
}


export function ExploreClient({
  initialProjects,
  userSkills = [],
}: {
  initialProjects: Project[];
  userSkills?: string[];
}) {
  const [allProjects, setAllProjects] = useState<Project[]>(initialProjects);
  const [filters, setFilters] = useState<Filters>({ category: "ALL", commitment: "ALL", skill: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("semua");

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const hasSkills = userSkillsLower.length > 0;

  const fetchProjects = useCallback(async (f: Filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.category !== "ALL") params.set("category", f.category);
      if (f.commitment !== "ALL") params.set("commitment", f.commitment);
      if (f.skill) params.set("skill", f.skill);
      const res = await fetch(`/api/projects?${params}`);
      
      if (!res.ok) {
        throw new Error("Gagal memuat data dari server.");
      }
      
      const data = await res.json();
      setAllProjects(data.projects || []);
    } catch (err: any) {
      console.error("Fetch projects error:", err);
      setError("Terjadi kesalahan saat memuat project. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchProjects(filters), 300);
    return () => clearTimeout(t);
  }, [filters, fetchProjects]);

  const untukKamuProjects = allProjects.filter((p) =>
    p.requiredSkills.some((s) => userSkillsLower.includes(s.skillName.toLowerCase()))
  );

  const displayedProjects = activeTab === "untuk-kamu" ? untukKamuProjects : allProjects;

  return (
    <>
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        untukKamuCount={untukKamuProjects.length}
        hasSkills={hasSkills}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3D3D3D" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}>Memuat project...</p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            background: "#FFF5F5",
            border: "2px solid #FF4D4D",
            borderRadius: "12px",
            boxShadow: "6px 6px 0px #000",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "20px", color: "#FF4D4D", marginBottom: "8px" }}>
            Ups! Terjadi Masalah
          </p>
          <p style={{ color: "#3D3D3D", fontSize: "16px", marginBottom: "20px" }}>
            {error}
          </p>
          <button
            onClick={() => fetchProjects(filters)}
            className="btn-primary"
            style={{ padding: "12px 24px" }}
          >
            Coba Lagi 🔄
          </button>
        </div>
      ) : displayedProjects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            background: "#fff",
            border: "2px dashed #000",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>
            {activeTab === "untuk-kamu" ? "🎯" : "😕"}
          </div>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>
            {activeTab === "untuk-kamu"
              ? "Belum ada project yang cocok skill-mu."
              : "Tidak ada project yang cocok."}
          </p>
          <p style={{ color: "#3D3D3D", fontSize: "14px" }}>
            {activeTab === "untuk-kamu"
              ? "Tambah lebih banyak skill di profil kamu, atau lihat semua project."
              : "Coba ubah filter atau buat project baru!"}
          </p>
          {activeTab === "untuk-kamu" && (
            <button
              onClick={() => setActiveTab("semua")}
              className="btn-secondary btn-sm"
              style={{ marginTop: "16px" }}
            >
              Lihat Semua Project →
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Result count */}
          <p
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              color: "#3D3D3D",
              marginBottom: "16px",
            }}
          >
            Menampilkan <strong>{displayedProjects.length}</strong> project
            {activeTab === "untuk-kamu" && " yang cocok dengan skill kamu"}
          </p>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}
          >
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} userSkills={userSkills} />
            ))}
          </motion.div>
        </>
      )}
    </>
  );
}
