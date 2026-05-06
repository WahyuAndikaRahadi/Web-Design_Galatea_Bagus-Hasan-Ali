"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trustScore: number;
}

export function EventPostForm({ isOpen, onClose, onSuccess, trustScore }: Props) {
  const [formData, setFormData] = useState({
    eventName: "",
    eventCategory: "LOMBA",
    eventDeadline: "",
    eventLink: "",
    content: "",
    sdgTag: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLowScore = trustScore < 31;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLowScore) return;
    
    if (!formData.eventName || !formData.eventLink || !formData.eventDeadline) {
      return setError("Mohon isi semua field wajib.");
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EVENT",
          ...formData,
          eventSkills: [], // Could be expanded later
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setFormData({
          eventName: "",
          eventCategory: "LOMBA",
          eventDeadline: "",
          eventLink: "",
          content: "",
          sdgTag: "",
        });
      } else {
        const data = await res.json();
        setError(data.error || "Gagal memposting event.");
      }
    } catch {
      setError("Terjadi kesalahan server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏆 Bagikan Info Event / Lomba">
      {isLowScore ? (
        <div style={{ padding: "20px", textAlign: "center", background: "#F5F0E8", border: "2px solid #000", borderRadius: "8px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "8px" }}>Fitur Terkunci</div>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>
            Butuh Trust Score minimal **31 (Level Member)** untuk membagikan event. 
            Teruslah berkolaborasi dan selesaikan project untuk meningkatkan score kamu!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ color: "red", fontSize: "14px", fontWeight: 700 }}>⚠️ {error}</div>}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Nama Event *</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="Misal: SEFEST 2026"
                style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Kategori *</label>
              <select
                value={formData.eventCategory}
                onChange={(e) => setFormData({ ...formData, eventCategory: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px", background: "#fff", fontWeight: 700 }}
              >
                <option value="LOMBA">Lomba</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Link Info/Pendaftaran *</label>
            <input
              type="url"
              value={formData.eventLink}
              onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
              placeholder="https://..."
              style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Deadline *</label>
              <input
                type="date"
                value={formData.eventDeadline}
                onChange={(e) => setFormData({ ...formData, eventDeadline: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>SDG Tag</label>
              <select
                value={formData.sdgTag}
                onChange={(e) => setFormData({ ...formData, sdgTag: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px", background: "#fff", fontWeight: 700 }}
              >
                <option value="">Tidak ada</option>
                <option value="SDG8">SDG 8</option>
                <option value="SDG9">SDG 9</option>
                <option value="SDG12">SDG 12</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Keterangan Singkat (Maks 280)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              maxLength={280}
              rows={2}
              placeholder="Tambahkan info tambahan..."
              style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px", fontFamily: "inherit" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#00D37F",
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
            {loading ? "Memproses..." : "📢 Bagikan Event"}
          </button>
        </form>
      )}
    </Modal>
  );
}
