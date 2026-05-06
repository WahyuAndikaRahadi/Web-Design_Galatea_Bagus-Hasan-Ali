
"use client";

import { useState, useEffect } from "react";
import { ExternalPlatform, LinkVisibility } from "@prisma/client";

export function ExternalLinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/settings/links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    setAdding(true);
    setError("");
    
    try {
      const res = await fetch("/api/settings/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });
      
      if (res.ok) {
        setNewUrl("");
        await fetchLinks();
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menambahkan link");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateVisibility = async (id: string, visibility: LinkVisibility) => {
    try {
      const res = await fetch(`/api/settings/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      if (res.ok) await fetchLinks();
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus link ini?")) return;
    try {
      const res = await fetch(`/api/settings/links/${id}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchLinks();
    } catch (err) {}
  };

  const totalPoints = links.reduce((acc, l) => {
    if (l.status !== "VERIFIED") return acc;
    const points: Record<string, number> = {
      LINKEDIN: 8, GITHUB: 8, PORTFOLIO: 6, BEHANCE: 5, DRIBBBLE: 5, INSTAGRAM: 3, YOUTUBE: 3, CUSTOM: 2
    };
    return acc + (points[l.platform] || 0);
  }, 0);

  const cappedPoints = Math.min(totalPoints, 20);

  return (
    <div style={{ fontFamily: "Space Grotesk, sans-serif" }}>
      <h3 style={{ fontWeight: 900, fontSize: "18px", marginBottom: "8px" }}>EXTERNAL PROFILES & LINKS</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
        Hubungkan akun eksternal untuk membangun kredibilitas dan menaikkan Trust Score.
      </p>

      {error && (
        <div style={{ background: "#FF4D4D", color: "#fff", padding: "10px", borderRadius: "4px", border: "2px solid #000", marginBottom: "16px", fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          style={{ 
            flex: 1, 
            padding: "12px", 
            border: "2px solid #000", 
            borderRadius: "4px", 
            background: "#F5F0E8",
            fontFamily: "inherit"
          }}
          disabled={adding}
        />
        <button
          type="submit"
          disabled={adding || !newUrl}
          style={{
            background: "#FFE500",
            border: "2px solid #000",
            borderRadius: "4px",
            padding: "0 24px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "2px 2px 0px #000"
          }}
        >
          {adding ? "..." : "+ Tambah"}
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Memuat...</div>
        ) : links.length === 0 ? (
          <div style={{ border: "2px dashed #ccc", padding: "30px", textAlign: "center", color: "#999", borderRadius: "8px" }}>
            Belum ada link profil eksternal.
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} style={{ 
              background: "#FFFFFF", 
              border: "2px solid #000", 
              padding: "16px", 
              borderRadius: "8px", 
              display: "flex", 
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800 }}>
                  <span style={{ fontSize: "18px" }}>
                    {link.platform === "LINKEDIN" ? "🔵" : link.platform === "GITHUB" ? "⚫" : "🔗"}
                  </span>
                  {link.platform}
                  {link.status === "VERIFIED" ? (
                    <span style={{ color: "#00D37F", fontSize: "12px" }}>✅ Verified</span>
                  ) : (
                    <span style={{ color: "#FF4D4D", fontSize: "12px" }}>⚠️ Unverified</span>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(link.id)}
                  style={{ background: "none", border: "none", color: "#FF4D4D", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                >
                  Hapus
                </button>
              </div>

              <div style={{ fontSize: "13px", color: "#666", wordBreak: "break-all" }}>{link.url}</div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800 }}>Visibility:</label>
                <select 
                  value={link.visibility}
                  onChange={(e) => handleUpdateVisibility(link.id, e.target.value as LinkVisibility)}
                  style={{ 
                    padding: "4px 8px", 
                    border: "2px solid #000", 
                    borderRadius: "4px", 
                    background: "#fff", 
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="MEMBERS_ONLY">Members Only</option>
                  <option value="COLLABORATORS_ONLY">Collaborators Only</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {links.length > 0 && (
        <div style={{ 
          marginTop: "32px", 
          padding: "16px", 
          background: "#E8F0FE", 
          border: "2px solid #000", 
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{ fontSize: "24px" }}>💡</span>
          <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
            Link yang terverifikasi berkontribusi ke Trust Score kamu.
            <br />
            Saat ini kamu mendapat <strong>+{cappedPoints} poin</strong> dari external links.
          </div>
        </div>
      )}
    </div>
  );
}
