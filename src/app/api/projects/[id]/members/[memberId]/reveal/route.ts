import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: projectId, memberId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { name: true } } },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: {
        revealedAt: new Date(),
        isAnonymous: false, // Optional: but good for explicit state
      },
      include: { user: { select: { name: true } } },
    });

    await pusherServer.trigger(CHANNELS.project(projectId), EVENTS.IDENTITY_REVEALED, {
      memberId,
      userId: member.userId,
      userName: member.user.name,
      anonymousTag: member.anonymousTag,
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[REVEAL_POST]", error);
    return NextResponse.json({ error: "Failed to reveal identity" }, { status: 500 });
  }
}
