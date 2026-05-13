import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CollabHubClient } from "@/components/hub/CollabHubClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { title: true } });
  return { title: project ? `${project.title} — Collab Hub` : "Collab Hub" };
}

export default async function CollabHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const { id } = await params;
  const { room: initialRoomId } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, username: true, image: true, trustScore: true, trustLevel: true } } },
      },
      hubRooms: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, description: true, type: true, passwordHash: true, createdAt: true },
      },
      owner: { select: { id: true, name: true } },
    },
  });

  if (!project) redirect("/explore");

  const isMember = project.members.some((m) => m.userId === session.user.id);
  if (!isMember) redirect(`/project/${id}`);

  const currentMember = project.members.find((m) => m.userId === session.user.id)!;

  // If no hubRooms yet (legacy projects), auto-create default rooms
  if (project.hubRooms.length === 0) {
    await prisma.hubRoom.createMany({
      data: [
        { projectId: id, name: "announcement", type: "ANNOUNCEMENT", description: "Pengumuman resmi dari owner & admin project." },
        { projectId: id, name: "general", type: "GENERAL", description: "Room utama untuk semua anggota." },
        { projectId: id, name: "kanban", type: "KANBAN", description: "Workspace kanban board project." },
      ],
    });
    // Re-fetch
    const newRooms = await prisma.hubRoom.findMany({ where: { projectId: id }, orderBy: { createdAt: "asc" } });
    project.hubRooms.push(...newRooms);
  }

  // Sanitize: remove passwordHash from client payload
  const hubRooms = project.hubRooms.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    type: r.type,
    isPrivate: !!r.passwordHash,
    createdAt: r.createdAt.toISOString(),
  }));

  const projectPayload = {
    id: project.id,
    title: project.title,
    description: project.description,
    members: JSON.parse(JSON.stringify(project.members)),
    hubRooms,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden", background: "#F5F0E8" }}>
      {/* Hub header */}
      <div style={{
        background: "#FFFFFF",
        borderBottom: "3px solid #000000",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 10,
        gap: "16px", // Added gap
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
          <Link
            href={`/project/${id}`}
            style={{
              color: "#000000",
              textDecoration: "none",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#F5F0E8",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "2px solid #000000",
              whiteSpace: "nowrap", // Prevent wrap
              overflow: "hidden", // Truncate
              textOverflow: "ellipsis",
              maxWidth: "180px", // Limit width
            }}
          >
            ← {project.title}
          </Link>
          <span style={{
            background: "#FFE500",
            color: "#000",
            border: "2px solid #000000",
            borderRadius: "6px",
            padding: "6px 12px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 800,
            fontSize: "12px",
            boxShadow: "2px 2px 0px #000",
            whiteSpace: "nowrap", // Prevent wrap
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            🤝 <span className="hidden sm:inline">Collab Hub</span>
          </span>
        </div>

        {/* Member avatars - hidden on very small screens to save space */}
        <div className="hidden md:flex" style={{ alignItems: "center", gap: "-4px" }}>
          {project.members.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              title={m.isAnonymous && !m.revealedAt ? `Anon#${m.anonymousTag || "0000"}` : m.user.name}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "2px solid #000000",
                background: "#FFE500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                fontSize: "13px",
                fontWeight: 800,
                color: "#000000",
                fontFamily: "Space Grotesk, sans-serif",
                marginLeft: i > 0 ? "-8px" : "0",
                zIndex: project.members.length - i,
              }}
            >
              {m.isAnonymous && !m.revealedAt ? (
                "👤"
              ) : m.user.image ? (
                <img
                  src={m.user.image}
                  alt={m.user.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                m.user.name[0]
              )}
            </div>
          ))}
          {project.members.length > 4 && (
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "2px solid #000000", background: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 800, color: "#000000",
              marginLeft: "-8px",
            }}>
              +{project.members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Main hub */}
      <CollabHubClient
        project={projectPayload}
        currentUserId={session.user.id}
        isOwner={project.owner.id === session.user.id}
        currentMember={JSON.parse(JSON.stringify(currentMember))}
        initialRoomId={initialRoomId}
      />
    </div>
  );
}
