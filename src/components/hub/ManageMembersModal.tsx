"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

type Member = {
  id: string; // ProjectMember.id
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  role: string;
  user: { id: string; name: string; image: string | null; trustScore: number; trustLevel: string };
};

type Props = {
  projectId: string;
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  isOwner: boolean;
  onClose: () => void;
};

export function ManageMembersModal({ projectId, members, currentUserId, isAdmin, isOwner, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"members" | "reports">("members");
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionState, setActionState] = useState<{ id: string; type: "KICK" | "BAN" } | null>(null);
  const [reason, setReason] = useState("");
  const toast = useToast();
  const router = useRouter();

  async function fetchReports() {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      toast.error("Error", "Gagal memuat laporan.");
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleDismissReport(reportId: string) {
    try {
      await fetch(`/api/projects/${projectId}/reports`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status: "DISMISSED" })
      });
      setReports((prev) => prev.filter(r => r.id !== reportId));
      toast.success("Abaikan", "Laporan telah diabaikan.");
    } catch {}
  }

  async function executeAction(member: Member) {
    if (!actionState || !reason.trim()) {
      toast.error("Error", "Alasan harus diisi.");
      return;
    }

    setLoadingId(member.id);
    try {
      const isBan = actionState.type === "BAN";
      const res = await fetch(`/api/projects/${projectId}/members/${member.id}?ban=${isBan}&reason=${encodeURIComponent(reason.trim())}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Gagal melakukan ${actionState.type.toLowerCase()}`);
      }

      toast.success("Berhasil", `${getDisplayName(member)} telah di-${isBan ? "ban" : "kick"} dari project.`);
      setActionState(null);
      setReason("");
      router.refresh();
      // Don't close modal immediately so they can manage other members
    } catch (error: any) {
      toast.error("Error", error.message);
    } finally {
      setLoadingId(null);
    }
  }

  const getDisplayName = (m: Member) => {
    if (m.isAnonymous && !m.revealedAt) return `Anon#${m.anonymousTag || "0000"}`;
    return m.user.name;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="👥 Kelola Anggota" size="md">
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
        <button
          onClick={() => setActiveTab("members")}
          style={{
            background: activeTab === "members" ? "#FFE500" : "transparent",
            border: activeTab === "members" ? "2px solid #000" : "2px solid transparent",
            borderRadius: "4px", padding: "6px 12px", fontWeight: 800,
            fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", cursor: "pointer",
            boxShadow: activeTab === "members" ? "2px 2px 0px #000" : "none"
          }}
        >
          Daftar Anggota
        </button>
        <button
          onClick={() => { setActiveTab("reports"); fetchReports(); }}
          style={{
            background: activeTab === "reports" ? "#FFE500" : "transparent",
            border: activeTab === "reports" ? "2px solid #000" : "2px solid transparent",
            borderRadius: "4px", padding: "6px 12px", fontWeight: 800,
            fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", cursor: "pointer",
            boxShadow: activeTab === "reports" ? "2px 2px 0px #000" : "none"
          }}
        >
          Laporan Masuk {reports.length > 0 && `(${reports.length})`}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
        {activeTab === "members" ? (
          members.map((m) => {
            const isMe = m.userId === currentUserId;
            // Admin cannot kick Owner or other Admins (unless they are Owner themselves)
            const canKick = !isMe && (isOwner || (isAdmin && m.role !== "OWNER" && m.role !== "ADMIN"));

            return (
            <div key={m.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px",
              background: "#F5F0E8",
              border: "2px solid #000",
              borderRadius: "8px",
              boxShadow: "2px 2px 0px #000"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "#fff", border: "2px solid #000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {m.isAnonymous && !m.revealedAt ? (
                    <User size={20} />
                  ) : m.user.image ? (
                    <img src={m.user.image} alt={getDisplayName(m)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={20} strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>
                    {getDisplayName(m)} {isMe && <span style={{ color: "#666", fontWeight: 600, fontSize: "12px" }}>(Kamu)</span>}
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: m.role === "OWNER" ? "#0047FF" : m.role === "ADMIN" ? "#FF4D4D" : "#3D3D3D" }}>
                    {m.role}
                  </div>
                </div>
              </div>

              {canKick && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", minWidth: "200px" }}>
                  {actionState?.id === m.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                      <input 
                        placeholder="Alasan (contoh: Tidak aktif, Toxic)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{
                          padding: "6px 8px", fontSize: "12px", border: "2px solid #000",
                          borderRadius: "4px", outline: "none", width: "100%"
                        }}
                      />
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => { setActionState(null); setReason(""); }}
                          disabled={loadingId !== null}
                          style={{
                            background: "#ccc", color: "#000", border: "2px solid #000",
                            borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer"
                          }}
                        >
                          Batal
                        </button>
                        <button 
                          onClick={() => executeAction(m)}
                          disabled={loadingId !== null}
                          style={{
                            background: actionState.type === "BAN" ? "#FF0000" : "#FF4D4D", 
                            color: "#fff", border: "2px solid #000",
                            borderRadius: "4px", padding: "4px 8px", fontSize: "11px", fontWeight: 800, cursor: "pointer"
                          }}
                        >
                          {loadingId === m.id ? "Proses..." : `Konfirmasi ${actionState.type}`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => setActionState({ id: m.id, type: "KICK" })}
                        style={{
                          background: "#FF4D4D", color: "#fff", border: "2px solid #000",
                          borderRadius: "4px", padding: "6px 12px", fontWeight: 800,
                          fontFamily: "Space Grotesk, sans-serif", fontSize: "12px",
                          cursor: "pointer", boxShadow: "2px 2px 0px #000",
                        }}
                        title="Dikeluarkan sementara, bisa lamar lagi nanti"
                      >
                        Kick
                      </button>
                      <button
                        onClick={() => setActionState({ id: m.id, type: "BAN" })}
                        style={{
                          background: "#FF0000", color: "#fff", border: "2px solid #000",
                          borderRadius: "4px", padding: "6px 12px", fontWeight: 800,
                          fontFamily: "Space Grotesk, sans-serif", fontSize: "12px",
                          cursor: "pointer", boxShadow: "2px 2px 0px #000",
                        }}
                        title="Blokir permanen dari project ini"
                      >
                        Ban
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
        ) : (
          loadingReports ? (
            <div style={{ padding: "20px", textAlign: "center", fontWeight: 800 }}>Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666", fontWeight: 600 }}>Tidak ada laporan yang masuk.</div>
          ) : (
            reports.map((r) => {
              const targetMember = members.find(m => m.userId === r.reportedId);
              return (
                <div key={r.id} style={{ padding: "12px", background: "#F5F0E8", border: "2px solid #000", borderRadius: "8px", boxShadow: "2px 2px 0px #000" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800 }}>🚩 Dari: {r.reporter.name}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#FF4D4D" }}>
                    Target: {r.reported.name}
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "13px", fontWeight: 700 }}>Alasan: {r.reason}</div>
                  {r.description && <div style={{ fontSize: "12px", marginTop: "4px", background: "#fff", padding: "6px", border: "1px dashed #000" }}>{r.description}</div>}
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                    <button onClick={() => handleDismissReport(r.id)} style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 800, background: "#ccc", border: "2px solid #000", borderRadius: "4px", cursor: "pointer" }}>Abaikan</button>
                    {targetMember && (
                      <button 
                        onClick={() => { setActiveTab("members"); setActionState({ id: targetMember.id, type: "KICK" }); setReason(r.reason); }} 
                        style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 800, background: "#FFE500", border: "2px solid #000", borderRadius: "4px", cursor: "pointer", boxShadow: "2px 2px 0px #000" }}
                      >
                        Tindak Anggota
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
      {activeTab === "members" && (
        <div style={{ marginTop: "16px", fontSize: "12px", color: "#666", fontWeight: 600, background: "#fff", padding: "8px", border: "1.5px dashed #000", borderRadius: "4px" }}>
          ⚠️ <b>Kick</b>: Dikeluarkan, namun bisa melamar ulang di masa depan.<br />
          🚫 <b>Ban</b>: Dikeluarkan permanen & tidak bisa masuk ke project ini lagi.<br />
          <i>Keduanya akan memberikan penalti <strong style={{color:"#000"}}>-8 Trust Score</strong> dan notifikasi alasan ke user terkait.</i>
        </div>
      )}
    </Modal>
  );
}
