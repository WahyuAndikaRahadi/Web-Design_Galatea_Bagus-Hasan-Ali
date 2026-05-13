"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SKILL_SUGGESTIONS, SKILL_GROUPS, CATEGORY_META, COMMITMENT_META, TOPIC_META } from "@/types";

interface SearchUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  trustLevel: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "LOMBA",
    commitmentLevel: "SERIUS",
    projectTopic: "TEKNOLOGI",
    maxMembers: 4,
    deadline: "",
  });

  // Invitation State
  const [invitedUsers, setInvitedUsers] = useState<SearchUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load AI draft if present
  useEffect(() => {
    const draftJson = searchParams.get("ai_draft");
    if (draftJson) {
      try {
        const draft = JSON.parse(decodeURIComponent(draftJson));
        setForm(prev => ({
          ...prev,
          title: draft.title || prev.title,
          description: draft.description || prev.description,
          category: draft.category || prev.category,
          commitmentLevel: draft.commitmentLevel || prev.commitmentLevel,
          projectTopic: draft.projectTopic || prev.projectTopic,
        }));
        if (Array.isArray(draft.requiredSkills)) {
          setSelectedSkills(draft.requiredSkills);
        }
      } catch (e) {
        console.error("Failed to parse AI draft", e);
      }
    }
  }, [searchParams]);

  // Debounced User Search
  useEffect(() => {
    if (userSearch.length < 2) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}`);
        const data = await res.json();
        if (res.ok) {
          // Filter out already invited users
          const filtered = (data as SearchUser[]).filter(
            u => !invitedUsers.some(invited => invited.id === u.id)
          );
          setUserResults(filtered);
          setShowUserDropdown(filtered.length > 0);
        }
      } catch (err) {
        console.error("User search failed", err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, invitedUsers]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }

  function addCustomSkill() {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) setSelectedSkills((prev) => [...prev, trimmed]);
    setCustomSkill("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.title || form.title.length < 5) return setError("Judul minimal 5 karakter.");
    if (!form.description || form.description.length < 20) return setError("Deskripsi minimal 20 karakter agar calon anggota paham tujuan projectmu.");
    if (selectedSkills.length === 0) return setError("Pilih minimal 1 skill yang dibutuhkan.");

    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxMembers: Number(form.maxMembers),
          requiredSkills: selectedSkills,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          invitedUserIds: invitedUsers.map(u => u.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat project.");
      router.push(`/project/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 64px)", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <span className="section-label">🚀 BUAT PROJECT</span>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", margin: "8px 0 8px" }}>
            Mulai sesuatu yang keren
          </h1>
          <p style={{ color: "#3D3D3D", fontSize: "16px" }}>
            Ceritakan projectmu dan temukan tim yang tepat.
          </p>
        </div>

        {error && (
          <div style={{ background: "#FFF0F0", border: "2px solid #FF4D4D", borderRadius: "6px", padding: "14px 20px", marginBottom: "24px", color: "#FF4D4D", fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(300px, 340px)", gap: "32px", alignItems: "start" }} className="mobile-stack">
          <style jsx>{`
            @media (max-width: 900px) {
              .mobile-stack {
                grid-template-columns: 1fr !important;
              }
              .invite-sidebar {
                order: -1;
              }
            }
          `}</style>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "#fff", border: "3px solid #000", borderRadius: "8px", boxShadow: "8px 8px 0px #000", padding: "40px", display: "flex", flexDirection: "column", gap: "28px" }}>

            {/* Title */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Judul Project (min. 5 karakter) *
              </label>
              <input
                id="create-project-title"
                type="text"
                className="nb-input"
                placeholder="Contoh: App Wisata Lokal dengan AR"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            {/* Category + Commitment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Kategori *
                </label>
                <select
                  id="create-project-category"
                  className="nb-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.entries(CATEGORY_META).map(([key, val]) => (
                    <option key={key} value={key}>{val.emoji} {val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Commitment Level *
                </label>
                <select
                  id="create-project-commitment"
                  className="nb-select"
                  value={form.commitmentLevel}
                  onChange={(e) => setForm({ ...form, commitmentLevel: e.target.value })}
                >
                  {Object.entries(COMMITMENT_META).map(([key, val]) => (
                    <option key={key} value={key}>{val.label} — {val.description}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Topic + Max Members */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Topik Utama *
                </label>
                <select
                  id="create-project-topic"
                  className="nb-select"
                  value={form.projectTopic}
                  onChange={(e) => setForm({ ...form, projectTopic: e.target.value })}
                >
                  {Object.entries(TOPIC_META).map(([key, val]) => (
                    <option key={key} value={key}>{val.label} — {val.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                  Maks. Anggota
                </label>
                <input
                  id="create-project-max-members"
                  type="number"
                  className="nb-input"
                  min={2}
                  max={20}
                  value={form.maxMembers}
                  onChange={(e) => setForm({ ...form, maxMembers: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Deadline (opsional)
              </label>
              <input
                id="create-project-deadline"
                type="datetime-local"
                className="nb-input"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Deskripsi Project (min. 20 karakter) *
              </label>
              <textarea
                id="create-project-description"
                className="nb-textarea"
                placeholder="Ceritakan secara detail: apa projectnya, tujuannya, apa yang akan dikerjakan, dan kenapa orang harus join..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                style={{ minHeight: "140px" }}
              />
              <span style={{ fontSize: "12px", color: form.description.length < 20 ? "#FF4D4D" : "#999" }}>
                {form.description.length}/2000 {form.description.length < 20 && "(min. 20)"}
              </span>
            </div>

            {/* Required Skills */}
            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Skill yang Dibutuhkan *
              </label>

              {selectedSkills.length > 0 && (
                <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedSkills.map((skill) => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)} className="skill-chip selected" id={`project-skill-${skill.replace(/\s+/g, "-").toLowerCase()}`}>
                      {skill} ✕
                    </button>
                  ))}
                </div>
              )}

              <div style={{ background: "#F5F0E8", border: "2px solid #000", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <input
                    id="create-project-skill-search"
                    type="text"
                    className="nb-input"
                    placeholder="Cari skill (misal: Frontend, Riset, Masak)..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    style={{ flex: 1, background: "#fff" }}
                  />
                </div>

                {customSkill ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(customSkill.toLowerCase()) && !selectedSkills.includes(s)).slice(0, 15).map(skill => (
                      <button key={skill} type="button" onClick={() => { toggleSkill(skill); setCustomSkill(""); }} className="skill-chip" style={{ background: "#fff" }}>
                        + {skill}
                      </button>
                    ))}
                    {customSkill.trim() && !SKILL_SUGGESTIONS.some(s => s.toLowerCase() === customSkill.toLowerCase()) && (
                      <button type="button" onClick={addCustomSkill} className="skill-chip" style={{ background: "#00D37F", color: "#fff" }}>
                        + Tambah "{customSkill}"
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {SKILL_GROUPS.slice(0, 4).map(group => (
                      <div key={group.name}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{group.name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {group.skills.filter(s => !selectedSkills.includes(s)).slice(0, 8).map(skill => (
                            <button key={skill} type="button" onClick={() => toggleSkill(skill)} className="skill-chip" style={{ background: "#fff", fontSize: "12px" }}>
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#3D3D3D", fontStyle: "italic" }}>Gunakan kolom pencarian di atas untuk melihat lebih banyak bidang...</div>
                  </div>
                )}
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              id="create-project-submit-btn"
              disabled={isLoading}
              style={{ fontSize: "17px", padding: "16px", marginTop: "8px" }}
            >
              {isLoading ? "Membuat project..." : "🚀 Buat Project & Cari Tim"}
            </button>
          </div>
        </form>

        {/* Invite Sidebar */}
        <div className="invite-sidebar" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "#FFE500", border: "3px solid #000", borderRadius: "8px", boxShadow: "6px 6px 0px #000", padding: "24px" }}>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              👤 Undang Teman
            </h3>
            <p style={{ fontSize: "13px", color: "#000", marginBottom: "16px", lineHeight: "1.4" }}>
              Cari teman berdasarkan username untuk diundang langsung ke projectmu.
            </p>

            <div style={{ position: "relative" }} ref={searchRef}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="nb-input"
                  placeholder="Cari @username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onFocus={() => userResults.length > 0 && setShowUserDropdown(true)}
                  style={{ background: "#fff", paddingLeft: "36px" }}
                />
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>🔍</span>
                {isSearchingUsers && (
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "12px" }}>...</span>
                )}
              </div>

              {showUserDropdown && (
                <div style={{ 
                  position: "absolute", 
                  top: "calc(100% + 8px)", 
                  left: 0, 
                  right: 0, 
                  background: "#fff", 
                  border: "2px solid #000", 
                  borderRadius: "6px", 
                  boxShadow: "4px 4px 0px #000", 
                  zIndex: 50,
                  maxHeight: "300px",
                  overflowY: "auto"
                }}>
                  {userResults.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setInvitedUsers(prev => [...prev, user]);
                        setUserSearch("");
                        setShowUserDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: "none",
                        borderBottom: "1px solid #eee",
                        background: "none",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                      className="user-result-item"
                    >
                      <img 
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt={user.name}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #000" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                        <div style={{ fontSize: "11px", color: "#666" }}>@{user.username || "user"}</div>
                      </div>
                      <div style={{ fontSize: "10px", padding: "2px 6px", background: "#000", color: "#FFE500", borderRadius: "4px", fontWeight: 800 }}>
                        {user.trustLevel}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invited List */}
            {invitedUsers.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#000", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Daftar Undangan ({invitedUsers.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {invitedUsers.map(user => (
                    <div 
                      key={user.id}
                      style={{ 
                        background: "#fff", 
                        border: "2px solid #000", 
                        borderRadius: "6px", 
                        padding: "10px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px",
                        boxShadow: "2px 2px 0px #000"
                      }}
                    >
                      <img 
                        src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt={user.name}
                        style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #000" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                        <div style={{ fontSize: "10px", color: "#666" }}>@{user.username || "user"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link 
                          href={`/profile/${user.id}`} 
                          target="_blank"
                          style={{ 
                            padding: "4px", 
                            background: "#00D37F", 
                            border: "1.5px solid #000", 
                            borderRadius: "4px",
                            fontSize: "10px",
                            color: "#000",
                            textDecoration: "none",
                            fontWeight: 800
                          }}
                          title="Lihat Profil"
                        >
                          👁️
                        </Link>
                        <button
                          type="button"
                          onClick={() => setInvitedUsers(prev => prev.filter(u => u.id !== user.id))}
                          style={{ 
                            padding: "4px", 
                            background: "#FF4D4D", 
                            border: "1.5px solid #000", 
                            borderRadius: "4px",
                            fontSize: "10px",
                            color: "#fff",
                            cursor: "pointer"
                          }}
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "#fff", border: "2px solid #000", borderRadius: "8px", boxShadow: "4px 4px 0px #000", padding: "20px" }}>
            <h4 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>💡 Tips Mengundang</h4>
            <ul style={{ paddingLeft: "20px", fontSize: "12px", color: "#3D3D3D", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Undang teman yang memiliki skill yang sesuai.</li>
              <li>Pastikan mereka aktif dan memiliki Trust Score yang baik.</li>
              <li>Pesan undangan formal akan dikirim setelah project dibuat.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
