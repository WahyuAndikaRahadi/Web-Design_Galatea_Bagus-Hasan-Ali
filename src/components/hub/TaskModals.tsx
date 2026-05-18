"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

type HubTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigneeId: string | null;
  labelTag: string | null;
  deadline: string | null;
  position: number;
  isGlobal: boolean;
  isApproved: boolean;
  revisionNote: string | null;
};

type Member = {
  userId: string;
  role: string;
  roleTitle: string | null;
  user: { id: string; name: string; username: string; image: string | null };
};

interface CreateProps {
  isOpen: boolean;
  onClose: () => void;
  status: HubTask["status"];
  members: Member[];
  onCreated: (task: HubTask) => void;
  projectId: string;
  roomId?: string;
  currentUserId: string;
  canAssign: boolean;
}

export function TaskCreateModal({ isOpen, onClose, status, members, onCreated, projectId, roomId, currentUserId, canAssign }: CreateProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/hub/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          assigneeId: assigneeId || null,
          projectId,
          roomId,
          isGlobal: !roomId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data);
      onClose();
      setTitle("");
      setDescription("");
      setAssigneeId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Task Baru" size="sm">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && <div style={{ color: "#FF4D4D", fontWeight: 700, fontSize: "14px" }}>⚠️ {error}</div>}
        
        <div>
          <label style={{ display: "block", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, marginBottom: "6px" }}>Judul Task</label>
          <input
            type="text"
            className="nb-textarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Apa yang perlu dikerjakan?"
            required
            autoFocus
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, marginBottom: "6px" }}>Deskripsi</label>
          <textarea
            className="nb-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail pengerjaan..."
            style={{ width: "100%", padding: "10px", minHeight: "80px" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, marginBottom: "6px" }}>Tugaskan Ke (Opsional)</label>
          <select
            className="nb-textarea"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            style={{ width: "100%", padding: "10px" }}
            disabled={!canAssign}
          >
            <option value="">Belum ditugaskan (Free for all)</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
          {!canAssign && <p style={{fontSize:'11px', color:'#666', marginTop:'4px'}}>Hanya Admin/Role yang bisa menugaskan saat membuat task.</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", marginTop: "8px" }}>
          {loading ? "Memproses..." : "Buat Task 🚀"}
        </button>
      </form>
    </Modal>
  );
}

interface DetailProps {
  isOpen: boolean;
  onClose: () => void;
  task: HubTask;
  members: Member[];
  currentUserId: string;
  projectId: string;
  canAssign: boolean;
  onUpdate: (task: HubTask) => void;
}

export function TaskDetailModal({ isOpen, onClose, task, members, currentUserId, projectId, canAssign, onUpdate }: DetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  const isAssignedToMe = task.assigneeId === currentUserId;
  const isUnassigned = !task.assigneeId;

  async function handleReview(action: "APPROVE" | "REVISE") {
    if (action === "REVISE" && !revisionNote.trim()) {
      setError("Catatan revisi wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/hub/${projectId}/tasks/${task.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: action === "REVISE" ? revisionNote : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data);
      if (action === "APPROVE") {
        onClose(); // Auto close on approve
      } else {
        setIsRevising(false);
        setRevisionNote("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses review");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/hub/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, assigneeId: currentUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengklaim task");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnclaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/hub/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, assigneeId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melepas task");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(uid: string | null) {
      setLoading(true);
      try {
        const res = await fetch(`/api/hub/${projectId}/tasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: task.id, assigneeId: uid }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onUpdate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menugaskan task");
      } finally {
        setLoading(false);
      }
  }

  const assigneeName = members.find(m => m.userId === task.assigneeId)?.user.name || "Belum ada";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Task" size="sm">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && <div style={{ color: "#FF4D4D", fontWeight: 700, fontSize: "14px" }}>⚠️ {error}</div>}

        <div>
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            {task.title}
            {task.isApproved && <span style={{ background: "#00D37F", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", border: "1.5px solid #000" }}>✅ Approved</span>}
          </h3>
          <p style={{ color: "#3D3D3D", fontSize: "15px", whiteSpace: "pre-wrap", background: "#F5F0E8", padding: "12px", border: "2px solid #000", borderRadius: "6px" }}>
            {task.description || "Tidak ada deskripsi."}
          </p>

          {task.revisionNote && (
            <div style={{ marginTop: "12px", background: "#FFF0F0", border: "2px solid #FF4D4D", padding: "12px", borderRadius: "6px" }}>
              <div style={{ fontWeight: 800, color: "#FF4D4D", fontSize: "12px", marginBottom: "4px" }}>⚠️ CATATAN REVISI DARI ADMIN:</div>
              <div style={{ fontSize: "14px", color: "#000" }}>{task.revisionNote}</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #000", paddingTop: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#3D3D3D" }}>PENANGGUNG JAWAB</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "16px", color: task.assigneeId ? "#0047FF" : "#666" }}>
              👤 {assigneeName}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {!task.isApproved && isUnassigned ? (
              <button onClick={handleClaim} className="btn-primary btn-sm" disabled={loading}>🙋 Klaim Task</button>
            ) : !task.isApproved && isAssignedToMe ? (
              <button onClick={handleUnclaim} className="btn-secondary btn-sm" style={{borderColor:'#FF4D4D', color:'#FF4D4D'}} disabled={loading}>Melepas Task</button>
            ) : null}
          </div>
        </div>

        {canAssign && !task.isApproved && (
            <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#3D3D3D", marginBottom: "6px" }}>GANTI PENANGGUNG JAWAB</label>
                <select 
                    value={task.assigneeId || ""} 
                    onChange={(e) => handleAssign(e.target.value || null)}
                    className="nb-textarea"
                    style={{ width: "100%", padding: "8px", fontSize: "13px" }}
                    disabled={loading}
                >
                    <option value="">Kosongkan</option>
                    {members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                </select>
            </div>
        )}

        {/* REVIEW SECTION */}
        {task.status === "DONE" && !task.isApproved && canAssign && (
          <div style={{ borderTop: "2px dashed #000", paddingTop: "16px", marginTop: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 900, color: "#000", marginBottom: "8px" }}>✅ REVIEW ADMIN</label>
            {!isRevising ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleReview("APPROVE")} disabled={loading} style={{ flex: 1, background: "#00D37F", color: "#000", border: "2px solid #000", padding: "8px", fontWeight: 800, cursor: "pointer", boxShadow: "2px 2px 0px #000" }}>
                  Approve (+2 Poin)
                </button>
                <button onClick={() => setIsRevising(true)} disabled={loading} style={{ flex: 1, background: "#FF4D4D", color: "#000", border: "2px solid #000", padding: "8px", fontWeight: 800, cursor: "pointer", boxShadow: "2px 2px 0px #000" }}>
                  Perlu Revisi
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <textarea 
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Tuliskan bagian mana yang perlu diperbaiki..."
                  className="nb-textarea"
                  style={{ width: "100%", padding: "8px", minHeight: "60px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleReview("REVISE")} disabled={loading} style={{ flex: 1, background: "#000", color: "#FFF", border: "2px solid #000", padding: "8px", fontWeight: 800, cursor: "pointer" }}>
                    Kirim Revisi
                  </button>
                  <button onClick={() => setIsRevising(false)} disabled={loading} style={{ flex: 1, background: "#FFF", color: "#000", border: "2px solid #000", padding: "8px", fontWeight: 800, cursor: "pointer" }}>
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button onClick={onClose} className="btn-secondary btn-sm">Tutup</button>
        </div>
      </div>
    </Modal>
  );
}
