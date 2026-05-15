'use client'

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast';

type User = {
  id: string;
  name: string;
  email: string | null;
  trustScore: number;
  trustLevel: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
};

export function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        toast.error("Error", data.error || "Gagal mengambil data user");
        setUsers([]);
      }
    } catch (err) {
      toast.error("Error", "Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  }

  async function executeDelete() {
    if (!isConfirmingDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${isConfirmingDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Success", "User beserta aktivitasnya berhasil dihapus");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error("Error", data.error || "Gagal menghapus user");
      }
    } catch (err) {
      toast.error("Error", "Gagal menghapus user");
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(null);
    }
  }

  async function updateTrustScore(userId: string, score: string) {
    if (isNaN(parseInt(score))) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, trustScore: score })
      });
      if (res.ok) {
        toast.success("Success", "Trust score diperbarui");
        fetchUsers();
      }
    } catch (err) {
      toast.error("Error", "Gagal update trust score");
    }
  }

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#000", fontFamily: "JetBrains Mono, monospace", fontWeight: 800 }}>
      {">"} INITIALIZING_USER_DATABASE...
    </div>
  );

  return (
    <div style={{ 
      background: "#FFFFFF", 
      border: "3px solid #000", 
      borderRadius: "12px", 
      boxShadow: "10px 10px 0px #000", 
      overflow: "hidden",
      color: "#000" 
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#000", borderBottom: "3px solid #000", color: "#FFE500", fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" }}>
              <th style={{ padding: "20px" }}>Identification</th>
              <th style={{ padding: "20px" }}>Trust Parameters</th>
              <th style={{ padding: "20px" }}>Access Level</th>
              <th style={{ padding: "20px" }}>Directives</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "2px solid #f0f0f0", transition: "background 0.1s ease" }}>
                <td style={{ padding: "20px" }}>
                  <div style={{ fontWeight: 800, color: "#000", fontSize: "16px" }}>{user.name}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontFamily: "JetBrains Mono, monospace" }}>{user.email}</div>
                </td>
                <td style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                      <input 
                        type="number" 
                        defaultValue={user.trustScore}
                        onBlur={(e) => updateTrustScore(user.id, e.target.value)}
                        style={{ 
                          width: "70px", 
                          padding: "6px 10px", 
                          background: "#fff",
                          color: "#000",
                          border: "2px solid #000", 
                          borderRadius: "4px", 
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 800,
                          outline: "none",
                          boxShadow: "2px 2px 0px #000"
                        }}
                      />
                    </div>
                    <span style={{ 
                      fontSize: "11px", 
                      fontWeight: 800, 
                      color: "#000",
                      background: "#f0f0f0",
                      padding: "2px 8px",
                      borderRadius: "2px",
                      border: "1px solid #000"
                    }}>
                      {user.trustLevel}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "20px" }}>
                   <div style={{ 
                     display: "inline-block",
                     padding: "4px 10px",
                     background: user.role === "ADMIN" ? "#FFE500" : "#fff",
                     color: "#000",
                     borderRadius: "2px",
                     border: "2px solid #000",
                     fontSize: "11px",
                     fontWeight: 900,
                     boxShadow: "2px 2px 0px #000"
                   }}>
                     {user.role}
                   </div>
                </td>
                <td style={{ padding: "20px" }}>
                  <button
                    onClick={() => setIsConfirmingDelete(user.id)}
                    style={{
                      padding: "8px 16px",
                      background: "#FF4D4D",
                      color: "#fff",
                      border: "2px solid #000",
                      borderRadius: "4px",
                      fontWeight: 900,
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                      textTransform: "uppercase",
                      boxShadow: "4px 4px 0px #000"
                    }}
                    onMouseDown={(e) => {
                      (e.currentTarget as any).style.transform = "translate(2px, 2px)";
                      (e.currentTarget as any).style.boxShadow = "2px 2px 0px #000";
                    }}
                    onMouseUp={(e) => {
                      (e.currentTarget as any).style.transform = "none";
                      (e.currentTarget as any).style.boxShadow = "4px 4px 0px #000";
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Custom Confirm Modal */}
      {isConfirmingDelete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#FFFFFF",
            border: "3px solid #000",
            borderRadius: "8px",
            boxShadow: "8px 8px 0px #000",
            padding: "32px",
            maxWidth: "400px",
            width: "100%",
            color: "#000",
            fontFamily: "Space Grotesk, sans-serif"
          }}>
            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "16px", lineHeight: 1.2 }}>
              Peringatan Destruktif!
            </h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, marginBottom: "24px", lineHeight: 1.5, color: "#3D3D3D" }}>
              Yakin ingin menghapus user ini beserta <strong>seluruh aktivitasnya</strong> (Project, Post, Laporan, dll)? Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsConfirmingDelete(null)}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#000",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  transition: "all 0.1s ease",
                  boxShadow: "3px 3px 0px #000"
                }}
                onMouseDown={(e) => {
                  if (isDeleting) return;
                  (e.currentTarget as any).style.transform = "translate(2px, 2px)";
                  (e.currentTarget as any).style.boxShadow = "1px 1px 0px #000";
                }}
                onMouseUp={(e) => {
                  if (isDeleting) return;
                  (e.currentTarget as any).style.transform = "none";
                  (e.currentTarget as any).style.boxShadow = "3px 3px 0px #000";
                }}
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                style={{
                  padding: "10px 20px",
                  background: "#FF4D4D",
                  color: "#fff",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  transition: "all 0.1s ease",
                  boxShadow: "3px 3px 0px #000",
                  opacity: isDeleting ? 0.7 : 1
                }}
                onMouseDown={(e) => {
                  if (isDeleting) return;
                  (e.currentTarget as any).style.transform = "translate(2px, 2px)";
                  (e.currentTarget as any).style.boxShadow = "1px 1px 0px #000";
                }}
                onMouseUp={(e) => {
                  if (isDeleting) return;
                  (e.currentTarget as any).style.transform = "none";
                  (e.currentTarget as any).style.boxShadow = "3px 3px 0px #000";
                }}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
