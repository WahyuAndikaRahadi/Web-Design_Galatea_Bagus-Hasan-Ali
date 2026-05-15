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

  const isAssignedToMe = task.assigneeId === currentUserId;
  const isUnassigned = !task.assigneeId;

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
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", marginBottom: "8px" }}>{task.title}</h3>
          <p style={{ color: "#3D3D3D", fontSize: "15px", whiteSpace: "pre-wrap", background: "#F5F0E8", padding: "12px", border: "2px solid #000", borderRadius: "6px" }}>
            {task.description || "Tidak ada deskripsi."}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #000", paddingTop: "16px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#3D3D3D" }}>PENANGGUNG JAWAB</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "16px", color: task.assigneeId ? "#0047FF" : "#666" }}>
              👤 {assigneeName}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {isUnassigned ? (
              <button onClick={handleClaim} className="btn-primary btn-sm" disabled={loading}>🙋 Klaim Task</button>
            ) : isAssignedToMe ? (
              <button onClick={handleUnclaim} className="btn-secondary btn-sm" style={{borderColor:'#FF4D4D', color:'#FF4D4D'}} disabled={loading}>Melepas Task</button>
            ) : null}
          </div>
        </div>

        {canAssign && (
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

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button onClick={onClose} className="btn-secondary btn-sm">Tutup</button>
        </div>
      </div>
    </Modal>
  );
}
