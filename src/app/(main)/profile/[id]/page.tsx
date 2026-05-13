import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTrustLevelEmoji, getTrustLevelColor, getTrustLevelLabel } from "@/lib/trust-score";
import { ExternalLinksSection } from "@/components/profile/ExternalLinksSection";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileLogoutButton } from "@/components/profile/ProfileLogoutButton";
import { User } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, username: true } });
  return { title: user ? `${user.name} (@${user.username}) | Profil` : "Profil Tidak Ditemukan" };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const isOwner = session?.user?.id === id;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
      trustScore: true,
      trustLevel: true,
      createdAt: true,
      skills: true,
      endorsementsReceived: true,
      reviewsReceived: true,
      externalLinks: { where: { status: "VERIFIED" } },
      memberships: {
        where: { project: { status: "COMPLETED" } },
        include: { project: { select: { id: true, title: true, category: true } } },
      },
    }
  });

  if (!user) notFound();

  // Check for Identity Linked Badge
  const linkedIn = user.externalLinks.find(l => l.platform === "LINKEDIN");
  const isIdentityLinked = linkedIn && (
    user.name.toLowerCase().replace(/\s+/g, "").includes(linkedIn.username?.toLowerCase() || "") ||
    linkedIn.username?.toLowerCase().includes(user.name.toLowerCase().replace(/\s+/g, ""))
  );

  // Aggregate endorsements
  const endorsementsCount = user.endorsementsReceived.reduce((acc, curr) => {
    acc[curr.skillName] = (acc[curr.skillName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ 
      background: "#F5F0E8", 
      minHeight: "calc(100vh - 64px)", 
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
          100% { transform: translate(0, 0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .profile-root {
          padding: 48px 24px !important;
        }
        .nb-card {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nb-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 16px 16px 0px #000 !important;
        }
        .profile-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .profile-btn:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0px #000 !important;
          filter: brightness(1.05);
        }
        .profile-btn:active {
          transform: translateY(0);
          box-shadow: 2px 2px 0px #000 !important;
        }
        .logout-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logout-btn:hover {
          background: #FF4D4D !important;
          color: #fff !important;
          transform: translateY(-2px);
          box-shadow: 8px 8px 0px #000 !important;
        }
        .skill-chip-nb {
          transition: all 0.15s ease;
        }
        .skill-chip-nb:hover {
          transform: translate(2px, 2px) rotate(2deg);
          box-shadow: 2px 2px 0px #000 !important;
        }
        .project-card-nb {
          transition: all 0.2s ease;
        }
        .project-card-nb:hover {
          transform: translateX(8px);
          background: #fff !important;
        }
        @media (max-width: 640px) {
          .profile-root {
            padding: 24px 16px !important;
          }
          .profile-main-container {
            gap: 20px !important;
          }
          .profile-header-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
          .profile-info-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
            width: 100% !important;
          }
          .info-header-row {
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 16px !important;
            width: 100% !important;
          }
          .profile-badges {
            justify-content: center !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .profile-sidebar {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            margin-bottom: 12px !important;
          }
          .profile-btn {
            width: 100% !important;
            max-width: 280px;
          }
          .profile-card-nb {
            padding: 20px !important;
          }
          .bio-section {
             padding: 16px !important;
             text-align: center !important;
          }
          .bio-label {
             left: 50% !important;
             transform: translateX(-50%) !important;
          }
          .card-header-nb {
             justify-content: center !important;
          }
          .skills-container-nb {
             justify-content: center !important;
          }
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div style={{
        position: "absolute",
        top: "5%",
        left: "-2%",
        width: "350px",
        height: "350px",
        background: "#FFE500",
        opacity: 0.15,
        borderRadius: "50%",
        zIndex: 0,
        filter: "blur(100px)",
        animation: "float 10s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        bottom: "5%",
        right: "-2%",
        width: "450px",
        height: "450px",
        background: "#0047FF",
        opacity: 0.1,
        borderRadius: "50%",
        zIndex: 0,
        filter: "blur(120px)",
        animation: "float 12s ease-in-out infinite reverse"
      }} />

      <div className="animate-slide-up profile-main-container" style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px", position: "relative", zIndex: 1 }}>
        
        {/* Profile Card */}
        <div 
          className="nb-card profile-card-nb"
          style={{ 
            background: "#fff", 
            border: "4px solid #000", 
            borderRadius: "20px", 
            boxShadow: "12px 12px 0px #000", 
            padding: "clamp(24px, 5vw, 48px)", 
            display: "flex", 
            flexDirection: "column",
            gap: "24px", 
            position: "relative"
          }}
        >
          {/* Header Section (Photo + Info) */}
          <div className="profile-header-container" style={{ display: "flex", gap: "32px", alignItems: "flex-start", width: "100%" }}>
            <div className="profile-sidebar" style={{ width: "160px", flexShrink: 0 }}>
              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "-12px",
                  right: "-12px",
                  bottom: "-12px",
                  border: "3px dashed #000",
                  borderRadius: "36px",
                  zIndex: 1,
                  opacity: 0.4
                }} />
                <div 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    borderRadius: "24px", 
                    border: "4px solid #000", 
                    background: "#FFE500", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "72px", 
                    fontWeight: 900, 
                    boxShadow: "6px 6px 0px #000",
                    zIndex: 2,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={80} strokeWidth={2.5} />
                  )}
                </div>
              </div>
            </div>

            <div className="profile-info-content" style={{ flex: 1 }}>
              <div className="info-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "clamp(32px, 5vw, 44px)", margin: "0 0 4px", lineHeight: 1 }}>
                    {user.name}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.7, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "14px" }}>
                    <span>@{user.username}</span>
                    <span>•</span>
                    <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                  </div>
                </div>
                
                {isOwner && (
                  <Link
                    href="/settings/profile"
                    className="profile-btn"
                    style={{
                      background: "#FFE500",
                      border: "3px solid #000",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontWeight: 900,
                      fontSize: "14px",
                      textDecoration: "none",
                      color: "#000",
                      boxShadow: "4px 4px 0px #000",
                      textAlign: "center"
                    }}
                  >
                    ⚙️ Edit Profil
                  </Link>
                )}
              </div>

              <div className="profile-badges" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#F5F0E8",
                    border: "3px solid #000",
                    borderRadius: "12px",
                    padding: "8px 16px",
                    boxShadow: "3px 3px 0px #000",
                    cursor: "default"
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{getTrustLevelEmoji(user.trustLevel)}</span>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "12px", color: "#3D3D3D", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {getTrustLevelLabel(user.trustLevel)}
                    </span>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px" }}>
                      Score: {user.trustScore}
                    </span>
                  </div>
                </div>
                
                {isIdentityLinked && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    background: "#0047FF", 
                    color: "#fff", 
                    padding: "8px 16px", 
                    borderRadius: "12px", 
                    fontSize: "13px", 
                    fontWeight: 900,
                    border: "3px solid #000",
                    boxShadow: "3px 3px 0px #000",
                    fontFamily: "Space Grotesk, sans-serif"
                  }}>
                    👤 Identity Linked
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* External Links Full Width */}
          <div style={{ width: "100%", marginTop: "8px" }}>
            <ExternalLinksSection username={user.name} />
          </div>

          {/* Bio Full Width */}
          <div style={{ width: "100%", marginTop: "8px" }}>
            {user.bio ? (
              <p style={{ 
                color: "#3D3D3D", 
                fontSize: "17px", 
                lineHeight: 1.6, 
                margin: 0, 
                padding: "20px 24px", 
                background: "#F5F0E8", 
                borderRadius: "16px",
                border: "3px solid #000",
                position: "relative",
                boxShadow: "inner 2px 2px 0px rgba(0,0,0,0.1)"
              }}>
                <span style={{ position: "absolute", top: "-14px", left: "24px", background: "#fff", padding: "2px 12px", fontSize: "12px", fontWeight: 900, border: "3px solid #000", borderRadius: "6px" }}>BIOGRAFI</span>
                {user.bio}
              </p>
            ) : (
              <p style={{ color: "#999", fontStyle: "italic", margin: 0, padding: "20px", border: "2px dashed #ccc", borderRadius: "12px", textAlign: "center" }}>Belum ada bio...</p>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
          
          {/* Skills */}
          <div className="nb-card" style={{ background: "#fff", border: "4px solid #000", borderRadius: "16px", boxShadow: "8px 8px 0px #000", padding: "32px", animationDelay: "0.1s" }}>
            <h2 className="card-header-nb" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ background: "#FFE500", padding: "4px", borderRadius: "6px", border: "2px solid #000" }}>💡</span> Skills
            </h2>
            <div className="skills-container-nb" style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
              {user.skills.length > 0 ? user.skills.map((s) => (
                <div 
                  key={s.id}
                  className="skill-chip-nb"
                  style={{ display: "flex", alignItems: "stretch", border: "3px solid #000", borderRadius: "10px", overflow: "hidden", boxShadow: "3px 3px 0px #000" }}
                >
                  <div style={{ background: "#F5F0E8", padding: "8px 14px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>
                    {s.skillName}
                  </div>
                  {endorsementsCount[s.skillName] > 0 && (
                    <div style={{ background: "#FFE500", padding: "8px 12px", fontWeight: 900, fontSize: "14px", borderLeft: "3px solid #000", color: "#000" }}>
                      +{endorsementsCount[s.skillName]}
                    </div>
                  )}
                </div>
              )) : (
                <p style={{ color: "#999", fontSize: "14px" }}>Belum ada skill yang ditambahkan.</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="nb-card" style={{ background: "#fff", border: "4px solid #000", borderRadius: "16px", boxShadow: "8px 8px 0px #000", padding: "32px", animationDelay: "0.2s" }}>
            <h2 className="card-header-nb" style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ background: "#00D37F", padding: "4px", borderRadius: "6px", border: "2px solid #000" }}>🏆</span> Project Selesai
            </h2>
            {user.memberships.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", border: "2px dashed #ccc", borderRadius: "12px" }}>
                <p style={{ color: "#999", fontSize: "14px" }}>Belum ada project yang diselesaikan.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {user.memberships.map((m, idx) => (
                  <div 
                    key={m.id}
                    className="project-card-nb"
                    style={{ 
                      padding: "16px", 
                      background: "#F5F0E8", 
                      border: "3px solid #000", 
                      borderRadius: "12px",
                      boxShadow: "4px 4px 0px #000",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      width: "6px", 
                      height: "100%", 
                      background: idx % 3 === 0 ? "#FFE500" : idx % 3 === 1 ? "#0047FF" : "#00D37F" 
                    }} />
                    <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "16px", marginBottom: "4px" }}>{m.project.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: "12px", color: "#3D3D3D", fontWeight: 700, fontFamily: "Space Grotesk, sans-serif", textTransform: "uppercase" }}>
                          {m.project.category}
                       </span>
                       <Link href={`/project/${m.project.id}`} style={{ fontSize: "12px", color: "#0047FF", fontWeight: 800, textDecoration: "none" }}>
                          Detail →
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button at the bottom (Owner only) */}
        {isOwner && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ProfileLogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}
