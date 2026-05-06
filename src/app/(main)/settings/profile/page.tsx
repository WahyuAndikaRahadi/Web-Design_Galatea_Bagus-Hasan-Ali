
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExternalLinksManager } from "@/components/settings/ExternalLinksManager";

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={{ background: "#F5F0E8", minHeight: "calc(100vh - 64px)", padding: "32px 24px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "3px solid #000", borderRadius: "8px", boxShadow: "6px 6px 0px #000", padding: "32px" }}>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "28px", margin: "0 0 32px" }}>
            Profile Settings
          </h1>
          
          <ExternalLinksManager />
          
          <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "2px solid #eee" }}>
            <a 
              href={`/profile/${session.user.id}`}
              style={{
                color: "#000",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              ← Kembali ke Profil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
