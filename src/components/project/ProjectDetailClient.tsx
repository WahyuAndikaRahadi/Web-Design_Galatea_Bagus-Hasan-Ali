"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import type { CommitmentLevel } from "@prisma/client";
import { COMMITMENT_META } from "@/types";
import { ProjectApplicantsClient } from "./ProjectApplicantsClient";

interface Props {
  projectId: string;
  isLoggedIn: boolean;
  isMember: boolean;
  isOwner: boolean;
  status: string;
  spotsLeft: number;
  commitmentLevel: CommitmentLevel;
}

export function ProjectDetailClient({ projectId, isLoggedIn, isMember, isOwner, status, spotsLeft, commitmentLevel }: Props) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCommit, setSelectedCommit] = useState<CommitmentLevel>(commitmentLevel);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (message.trim().length < 10) { setError("Pesan minimal 10 karakter."); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, commitmentLevel: selectedCommit, isAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplySuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melamar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isMember || isOwner) {
    return (
      <div style={{ background: "#fff", border: "3px solid #000", borderRadius: "8px", boxShadow: "6px 6px 0px #000", padding: "24px" }}>
        <div style={{ background: "#00D37F", border: "2px solid #000", borderRadius: "6px", padding: "12px", marginBottom: "16px", textAlign: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "15px" }}>
          ✅ {isOwner ? "Kamu Owner project ini" : "Kamu sudah bergabung"}
        </div>
        <Link href={`/project/${projectId}/hub`} className="btn-primary" id="project-enter-room-btn" style={{ display: "block", textAlign: "center", fontSize: "16px", padding: "14px" }}>
          🤝 Masuk Collab Hub
        </Link>
        {isOwner && <ProjectApplicantsClient projectId={projectId} />}
      </div>
    );
  }

  if (status !== "OPEN" || spotsLeft === 0) {
    return (
      <div style={{ background: "#fff", border: "2px solid #000", borderRadius: "8px", boxShadow: "4px 4px 0px #000", padding: "24px" }}>
        <div style={{ background: "#FF4D4D", border: "2px solid #000", borderRadius: "6px", padding: "12px", textAlign: "center", color: "#fff", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "15px" }}>
          {spotsLeft === 0 ? "Project sudah penuh" : `Status: ${status}`}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ background: "#fff", border: "3px solid #000", borderRadius: "8px", boxShadow: "6px 6px 0px #000", padding: "24px" }}>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "15px", marginBottom: "16px", textAlign: "center" }}>
          Login untuk melamar project ini!
        </p>
        <Link href={`/login?callbackUrl=/project/${projectId}`} className="btn-primary" style={{ display: "block", textAlign: "center", fontSize: "16px", padding: "14px" }}>
          Masuk & Lamar →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: "#fff", border: "3px solid #000", borderRadius: "8px", boxShadow: "6px 6px 0px #000", padding: "24px" }}>
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <span style={{ background: spotsLeft <= 1 ? "#FF4D4D" : "#00D37F", color: spotsLeft <= 1 ? "#fff" : "#000", border: "2px solid #000", borderRadius: "4px", padding: "4px 12px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px" }}>
            {spotsLeft} slot tersisa
          </span>
        </div>
        <button
          onClick={() => setIsApplyOpen(true)}
          className="btn-primary"
          id="project-apply-btn"
          style={{ width: "100%", fontSize: "17px", padding: "16px" }}
        >
          🚀 Lamar Project Ini
        </button>
      </div>

      <Modal isOpen={isApplyOpen} onClose={() => { setIsApplyOpen(false); setApplySuccess(false); setError(""); }} title="Lamar Project" size="sm">
        {applySuccess ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "20px", marginBottom: "8px" }}>Lamaran Terkirim!</h3>
            <p style={{ color: "#3D3D3D", marginBottom: "20px" }}>Owner akan memeriksanya segera. Pantau notifikasi kamu.</p>
            <button onClick={() => setIsApplyOpen(false)} className="btn-primary btn-sm" id="apply-success-close-btn">Tutup</button>
          </div>
        ) : (
          <form onSubmit={handleApply} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && <div style={{ background: "#FFF0F0", border: "2px solid #FF4D4D", borderRadius: "6px", padding: "12px", color: "#FF4D4D", fontWeight: 600, fontSize: "14px" }}>⚠ {error}</div>}

            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "6px" }}>
                Kenapa kamu cocok untuk project ini?
              </label>
              <textarea
                id="apply-message"
                className="nb-textarea"
                placeholder="Ceritakan skill kamu, pengalaman relevan, dan kenapa kamu tertarik..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ minHeight: "100px" }}
                required
              />
              <span style={{ fontSize: "12px", color: "#999" }}>{message.length} / 500 karakter</span>
            </div>

            <div>
              <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Commitment Level kamu
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(["CASUAL", "SERIUS", "KOMPETISI"] as CommitmentLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    id={`apply-commit-${level.toLowerCase()}`}
                    onClick={() => setSelectedCommit(level)}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      border: selectedCommit === level ? "2px solid #000" : "2px solid #ccc",
                      borderRadius: "6px",
                      background: selectedCommit === level ? "#FFE500" : "#fff",
                      boxShadow: selectedCommit === level ? "2px 2px 0px #000" : "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px" }}>{COMMITMENT_META[level].label}</div>
                    <div style={{ fontSize: "12px", color: "#3D3D3D" }}>{COMMITMENT_META[level].description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#F5F0E8", border: "2px solid #000", borderRadius: "8px" }}>
              <input 
                type="checkbox" 
                id="apply-anonymous" 
                checked={isAnonymous} 
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="apply-anonymous" style={{ fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                🕶️ Gabung sebagai Anonim (Mode Ice-Breaker)
                <span style={{ display: "block", fontSize: "11px", fontWeight: 400, color: "#666" }}>
                  Mulai dengan nama samaran (misal: Anon#1234). Kamu bisa buka identitasmu nanti.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" id="apply-submit-btn" disabled={isLoading} style={{ fontSize: "16px", padding: "14px" }}>
              {isLoading ? "Mengirim..." : "Kirim Lamaran 🚀"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
