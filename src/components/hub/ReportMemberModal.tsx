"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";

type Props = {
  projectId: string;
  reportedId: string;
  reportedName: string;
  onClose: () => void;
};

export function ReportMemberModal({ projectId, reportedId, reportedName, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const reasons = [
    "Spam / Promosi",
    "Kata-kata kasar / Toxic",
    "Ghosting / Tidak aktif",
    "Melanggar aturan project",
    "Lainnya"
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      toast.error("Error", "Pilih alasan laporan.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedId, reason, description }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim laporan");
      }

      toast.success("Terkirim", "Laporanmu akan ditinjau oleh Admin project.");
      onClose();
    } catch (error: any) {
      toast.error("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="🚩 Laporkan Anggota" size="md">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "14px", color: "#3D3D3D" }}>
          Kamu sedang melaporkan <b>{reportedName}</b>. Admin project akan meninjau laporan ini.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>
            Alasan
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                style={{
                  padding: "8px 12px",
                  background: reason === r ? "#FFE500" : "#fff",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: reason === r ? "none" : "2px 2px 0px #000",
                  transform: reason === r ? "translate(2px, 2px)" : "none",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>
            Detail Tambahan (Opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan lebih detail tentang masalah ini..."
            rows={4}
            style={{
              padding: "12px", border: "2px solid #000", borderRadius: "6px",
              fontFamily: "inherit", fontSize: "14px", outline: "none", resize: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
          <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
