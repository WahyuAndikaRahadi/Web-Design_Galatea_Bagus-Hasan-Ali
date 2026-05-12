"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { getTrustLevelEmoji, getTrustLevelColor, getTrustLevelLabel } from "@/lib/trust-score";
import type { CommitmentLevel, TrustLevel } from "@prisma/client";
import { COMMITMENT_META } from "@/types";
import Link from "next/link";
import { User } from "lucide-react";

type Applicant = {
  id: string;
  message: string;
  commitmentLevel: CommitmentLevel;
  isAnonymous: boolean;
  createdAt: string;
  applicant: {
    id: string;
    name: string;
    image: string | null;
    trustScore: number;
    trustLevel: TrustLevel;
    skills: { skillName: string }[];
    externalLinks: { platform: any, url: string, status: string, username?: string, label?: string }[];
  };
};

import { ExternalLinkChip } from "@/components/profile/ExternalLinkChip";

export function ProjectApplicantsClient({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/projects/${projectId}/apply`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setApplicants(data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, projectId]);

  async function handleDecision(applicationId: string, decision: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/projects/${projectId}/apply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, decision }),
      });
      if (res.ok) {
        setApplicants((prev) => prev.filter((a) => a.id !== applicationId));
      }
    } catch {}
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: "#FFE500", border: "2px solid #000", borderRadius: "6px",
          padding: "12px", width: "100%", fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 800, fontSize: "15px", cursor: "pointer", boxShadow: "3px 3px 0px #000",
          marginTop: "16px", transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(2px, 2px)"; e.currentTarget.style.boxShadow = "1px 1px 0px #000"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0px #000"; }}
      >
        📬 Cek Lamaran Masuk {applicants.length > 0 ? `(${applicants.length})` : ""}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Lamaran Masuk" size="md">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}>Memuat...</div>
        ) : applicants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📪</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "16px" }}>Belum ada lamaran</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
            {applicants.map((app) => (
              <div key={app.id} style={{ border: "2px solid #000", borderRadius: "8px", padding: "16px", background: "#F5F0E8", boxShadow: "3px 3px 0px #000" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fff", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800, flexShrink: 0, overflow: "hidden" }}>
                    {app.isAnonymous ? (
                      <div style={{ fontSize: "24px" }}>🕵️</div>
                    ) : app.applicant.image ? (
                      <img src={app.applicant.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={24} strokeWidth={2.5} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>
                      {app.isAnonymous ? "Kandidat Anonim" : app.applicant.name}
                    </div>
                    <div 
                      title={`${getTrustLevelLabel(app.applicant.trustLevel)}: ${app.applicant.trustScore} points`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#fff",
                        border: "1.5px solid #000",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        boxShadow: "1.5px 1.5px 0px #000",
                        cursor: "help"
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>{getTrustLevelEmoji(app.applicant.trustLevel)}</span>
                      <span style={{ 
                        fontFamily: "Space Grotesk, sans-serif", 
                        fontWeight: 800, 
                        fontSize: "12px",
                        color: "#000"
                      }}>
                        {app.applicant.trustScore}
                      </span>
                    </div>
                    
                    {!app.isAnonymous && app.applicant.externalLinks?.length > 0 && (
                      <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap", width: "100%" }}>
                        {app.applicant.externalLinks.map((link, idx) => (
                          <ExternalLinkChip 
                            key={idx}
                            platform={link.platform}
                            url={link.url}
                            status={link.status}
                            username={link.username}
                            label={link.label}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {app.applicant.skills.map((s) => (
                        <span key={s.skillName} style={{ background: "#000", color: "#FFE500", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", fontFamily: "Space Grotesk, sans-serif" }}>
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: "#fff", border: "1.5px solid #000", borderRadius: "6px", padding: "12px", fontSize: "13px", color: "#3D3D3D", marginBottom: "16px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {app.message}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif" }}>
                    Commitment: <span style={{ color: "#0047FF", background: "#0047FF22", padding: "2px 6px", borderRadius: "4px" }}>{COMMITMENT_META[app.commitmentLevel].label}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {!app.isAnonymous && (
                      <Link href={`/profile/${app.applicant.id}`} target="_blank" style={{ background: "#EAEAEA", border: "2px solid #000", borderRadius: "4px", padding: "6px 12px", fontWeight: 800, fontSize: "12px", fontFamily: "Space Grotesk, sans-serif", textDecoration: "none", color: "#000", display: "flex", alignItems: "center" }}>
                        Profil ↗
                      </Link>
                    )}
                    <button 
                      onClick={() => handleDecision(app.id, "REJECTED")} 
                      style={{ background: "#fff", border: "2px solid #000", borderRadius: "4px", padding: "6px 16px", fontWeight: 800, cursor: "pointer", fontSize: "13px", fontFamily: "Space Grotesk, sans-serif", transition: "all 0.1s" }}
                    >
                      Tolak
                    </button>
                    <button 
                      onClick={() => handleDecision(app.id, "APPROVED")} 
                      style={{ background: "#00D37F", border: "2px solid #000", borderRadius: "4px", padding: "6px 16px", fontWeight: 800, cursor: "pointer", fontSize: "13px", boxShadow: "2px 2px 0px #000", fontFamily: "Space Grotesk, sans-serif", transition: "all 0.1s" }}
                    >
                      Terima
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
