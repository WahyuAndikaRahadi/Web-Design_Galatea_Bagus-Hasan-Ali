import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExternalLinksManager } from "@/components/settings/ExternalLinksManager";
import { ProfileEditor } from "@/components/settings/ProfileEditor";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pengaturan Profil | Collabolab",
  description: "Kelola informasi dasar dan link eksternalmu untuk meningkatkan Trust Score.",
};

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, image: true, username: true }
  });

  if (!user) redirect("/login");

  return (
    <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 64px)", padding: "48px 24px" }}>
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nb-card {
          animation: fadeInSlide 0.4s ease forwards;
        }
      `}</style>

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "clamp(28px, 5vw, 36px)", margin: 0 }}>
              Pengaturan Profil
            </h1>
            <p style={{ color: "#3D3D3D", fontWeight: 600, marginTop: "4px" }}>Kelola informasi publik dan link eksternalmu</p>
          </div>
          <Link
            href={`/profile/${session.user.id}`}
            className="btn-secondary"
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ← Kembali ke profile
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Basic Info Editor */}
          <div
            className="nb-card"
            style={{
              background: "#fff",
              border: "4px solid #000",
              borderRadius: "16px",
              boxShadow: "8px 8px 0px #000",
              padding: "clamp(24px, 5vw, 32px)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ background: "#FFE500", color: "#000", padding: "6px", borderRadius: "8px", border: "2px solid #000", fontSize: "20px" }}>👤</span>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "22px", margin: 0 }}>Info Dasar</h2>
            </div>
            
            <ProfileEditor initialData={user} />
          </div>

          {/* External Links Section */}
          <div
            className="nb-card"
            style={{
              background: "#fff",
              border: "4px solid #000",
              borderRadius: "16px",
              boxShadow: "8px 8px 0px #000",
              padding: "clamp(24px, 5vw, 32px)",
              animationDelay: "0.1s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ background: "#0047FF", color: "#fff", padding: "6px", borderRadius: "8px", border: "2px solid #000", fontSize: "20px" }}>🔗</span>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "22px", margin: 0 }}>External Links</h2>
            </div>

            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px", lineHeight: 1.5 }}>
              Hubungkan akun profesionalmu untuk meningkatkan <strong>Trust Score</strong>. Link yang diverifikasi akan menampilkan badge khusus di profilmu.
            </p>

            <ExternalLinksManager />
          </div>

          {/* Help / Info Section */}
          <div
            className="nb-card"
            style={{
              background: "#FFE500",
              border: "3px solid #000",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "4px 4px 0px #000",
              animationDelay: "0.2s"
            }}
          >
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "18px", marginBottom: "12px" }}>💡 Tips Trust Score</h3>
            <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "14px", fontWeight: 600, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Gunakan link LinkedIn yang aktif untuk verifikasi identitas (+8 pts).</li>
              <li>Selesaikan project pertama kamu untuk mendapatkan review dari tim (+15 pts).</li>
              <li>Profil yang lengkap membantu orang lain lebih percaya untuk berkolaborasi!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
