import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

const updateMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional(),
  roleTitle: z.string().max(50).nullable().optional(),
});

type Params = { params: Promise<{ id: string; memberId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: projectId, memberId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if current user is owner or admin of the project
  const currentUserMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: session.user.id,
      },
    },
  });

  if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // If trying to change role to OWNER, only current OWNER can do it
  if (parsed.data.role === "OWNER" && currentUserMember.role !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can transfer ownership" }, { status: 403 });
  }

  try {
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: parsed.data,
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[MEMBER_PATCH]", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { id: projectId, memberId } = await params;
    const { searchParams } = new URL(req.url);
    const isBan = searchParams.get("ban") === "true";
    const reason = searchParams.get("reason") || "Melanggar aturan kolaborasi.";
    
    const session = await auth();
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const currentUserMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });
  
    if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetMember = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // Admin cannot kick Owner or other Admins (unless they are Owner)
    if (currentUserMember.role === "ADMIN" && (targetMember.role === "OWNER" || targetMember.role === "ADMIN")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    try {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });
      const projectName = project?.title || "Project";

      const txOps: any[] = [
        prisma.projectMember.delete({
          where: { id: memberId },
        }),
        prisma.user.update({
          where: { id: targetMember.userId },
          data: { trustScore: { decrement: 8 } },
        }),
        prisma.notification.create({
          data: {
            userId: targetMember.userId,
            title: isBan ? "🚫 Banned dari Project" : "👢 Dikeluarkan dari Project",
            message: `Kamu telah ${isBan ? "di-ban" : "dikeluarkan"} dari "${projectName}". Alasan: ${reason}`,
            type: "SYSTEM",
          }
        })
      ];

      if (isBan) {
        txOps.push(
          prisma.projectBan.create({
            data: {
              projectId,
              userId: targetMember.userId,
              reason,
            }
          })
        );
      }

      await prisma.$transaction(txOps);
  
      await pusherServer.trigger(CHANNELS.project(projectId), EVENTS.MEMBER_KICKED, {
        memberId,
        userId: targetMember.userId,
      });

      return NextResponse.json({ message: "Member removed" });
    } catch (error) {
      console.error("[MEMBER_DELETE]", error);
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
  }
