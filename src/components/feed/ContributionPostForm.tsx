"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContributionPostForm({ isOpen, onClose, onSuccess }: Props) {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sdgTag, setSdgTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/users/me/projects?status=IN_PROGRESS")
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setProjects(data);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return setError("Pilih project terlebih dahulu.");
    if (!content.trim()) return setError("Deskripsi wajib diisi.");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CONTRIBUTION",
          projectId: selectedProjectId,
          content,
          mediaUrl,
          sdgTag: sdgTag || null,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setContent("");
        setMediaUrl("");
        setSelectedProjectId("");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal membuat postingan.");
      }
    } catch {
      setError("Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📢 Bagikan Progress Project">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && <div style={{ color: "red", fontSize: "14px", fontWeight: 700 }}>⚠️ {error}</div>}
        
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>Project Terkait *</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px", background: "#F5F0E8", fontWeight: 700 }}
          >
            <option value="">-- Pilih Project --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {projects.length === 0 && (
            <p style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>Kamu harus bergabung dalam project yang sedang berjalan.</p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>Apa yang kamu kerjakan hari ini? (Maks 500 karakter) *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Contoh: Menyelesaikan desain UI untuk CollaboLab..."
            style={{ width: "100%", padding: "12px", border: "2px solid #000", borderRadius: "4px", background: "#F5F0E8", fontFamily: "inherit" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 800, marginBottom: "6px" }}>SDG Tag (Opsional)</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["SDG8", "SDG9", "SDG12"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSdgTag(sdgTag === tag ? "" : tag)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  background: sdgTag === tag ? "#000" : "#fff",
                  color: sdgTag === tag ? "#FFE500" : "#000",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#FFE500",
            border: "2px solid #000",
            padding: "14px",
            borderRadius: "4px",
            fontWeight: 900,
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "4px 4px 0px #000",
            marginTop: "8px"
          }}
        >
          {loading ? "Memposting..." : "🚀 Publish ke Feed"}
        </button>
      </form>
    </Modal>
  );
}
