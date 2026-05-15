"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";

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
    projectTopic: "",
  });
  const [loading, setLoading] = useState(false);
  const isLowScore = trustScore < 31;
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLowScore) return;
    
    if (!formData.eventName || !formData.eventLink || !formData.eventDeadline) {
      return toast.error("Data tidak lengkap", "Mohon isi semua field wajib.");
    }

    setLoading(true);
    const toastId = toast.loading("Membagikan event...", "Info event sedang diproses");
    
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EVENT",
          ...formData,
          eventSkills: [],
        }),
      });

      if (res.ok) {
        toast.update(toastId, {
          type: "success",
          title: "Event berhasil dibagikan!",
          description: `"${formData.eventName}" sudah muncul di feed.`
        });
        onSuccess();
        onClose();
        setFormData({
          eventName: "",
          eventCategory: "LOMBA",
          eventDeadline: "",
          eventLink: "",
          content: "",
          projectTopic: "",
        });
      } else {
        const data = await res.json();
        toast.update(toastId, {
          type: "error",
          title: "Gagal memposting event",
          description: data.error || "Terjadi kesalahan saat memproses data."
        });
      }
    } catch {
      toast.update(toastId, {
        type: "error",
        title: "Koneksi Bermasalah",
        description: "Terjadi kesalahan server. Coba lagi nanti."
      });
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
                <option value="ESSAY_AKADEMIK">Esai / Akademik</option>
                <option value="BISNIS_UMKM">Bisnis / UMKM</option>
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
              <label style={{ display: "block", fontSize: "13px", fontWeight: 800, marginBottom: "4px" }}>Topik Utama</label>
              <select
                value={formData.projectTopic}
                onChange={(e) => setFormData({ ...formData, projectTopic: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "2px solid #000", borderRadius: "4px", background: "#fff", fontWeight: 700 }}
              >
                <option value="">🔖 Pilih Topik</option>
                <option value="TEKNOLOGI">💻 Teknologi</option>
                <option value="PERTANIAN">🚜 Pertanian</option>
                <option value="PENDIDIKAN">📚 Pendidikan</option>
                <option value="EKONOMI">📈 Ekonomi</option>
                <option value="KARYA_TULIS">✍️ Karya Tulis</option>
                <option value="RESEARCH">🔬 Research</option>
                <option value="SENI_BUDAYA">🎨 Seni Budaya</option>
                <option value="HUKUM_POLITIK">⚖️ Hukum & Politik</option>
                <option value="MANUFAKTUR">⚙️ Manufaktur</option>
                <option value="KULINER_PARIWISATA">🍳 Kuliner & Tour</option>
                <option value="OLAHRAGA_KEBUGARAN">⚽ Olahraga</option>
                <option value="MARITIM_DIRGANTARA">🚀 Maritim & Udara</option>
                <option value="SAINS_MURNI">🧪 Sains Murni</option>
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
