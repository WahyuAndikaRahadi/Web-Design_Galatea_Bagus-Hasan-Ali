import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: invitationId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action } = await req.json(); // "ACCEPT" | "DECLINE"
    if (!["ACCEPT", "DECLINE"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { project: true },
    });

    if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    if (invitation.inviteeId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (invitation.status !== "PENDING") return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });

    if (action === "ACCEPT") {
      // Add user to project members
      await prisma.$transaction([
        prisma.projectMember.create({
          data: {
            projectId: invitation.projectId,
            userId: session.user.id,
            role: "MEMBER",
          },
        }),
        prisma.invitation.update({
          where: { id: invitationId },
          data: { status: "ACCEPTED" },
        }),
        // Optionally notify the inviter
        prisma.notification.create({
          data: {
            userId: invitation.inviterId,
            title: "✅ Undangan Diterima",
            message: `${session.user.name} telah menerima undangan untuk bergabung ke project "${invitation.project.title}"`,
            type: "SYSTEM",
            link: `/project/${invitation.projectId}`,
          },
        }),
      ]);
    } else {
      // DECLINE
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "DECLINED" },
      });
    }

    // Mark corresponding notification as read if it exists
    await prisma.notification.updateMany({
      where: { invitationId: invitationId, userId: session.user.id },
      data: { isRead: true },
    });

    return NextResponse.json({ message: `Invitation ${action.toLowerCase()}ed successfully.` });
  } catch (err) {
    console.error("[invitation response POST]", err);
    return NextResponse.json({ error: "Failed to process invitation." }, { status: 500 });
  }
}
