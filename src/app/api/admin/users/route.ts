import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Middleware check for admin is handled in the route or a wrapper
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Using raw query to bypass any stale Prisma client issues
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, name, email, "trustScore", "trustLevel", role, "isBlocked", "createdAt" 
       FROM "User" 
       ORDER BY "createdAt" DESC`
    );
    return NextResponse.json(users || []);
  } catch (err) {
    console.error("Admin user list fetch error:", err);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, trustScore, isBlocked, role } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(trustScore !== undefined && { trustScore: parseInt(trustScore) }),
        ...(isBlocked !== undefined && { isBlocked }),
        ...(role !== undefined && { role }),
      }
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: "Gagal mengupdate user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Find projects owned by user to delete related entities missing cascade
      const projects = await tx.project.findMany({ where: { ownerId: userId }, select: { id: true } });
      const projectIds = projects.map((p: any) => p.id);

      if (projectIds.length > 0) {
         await tx.feedPost.deleteMany({ where: { projectId: { in: projectIds } } });
      }

      await tx.application.deleteMany({ where: { applicantId: userId } });
      await tx.aIToolResult.deleteMany({ where: { userId } });
      await tx.aIToolUsage.deleteMany({ where: { userId } });
      await tx.feedPost.deleteMany({ where: { authorId: userId } });
      await tx.hubMessage.deleteMany({ where: { senderId: userId } });
      await tx.report.deleteMany({ where: { reporterId: userId } });
      await tx.peerReview.deleteMany({
        where: { OR: [{ reviewerId: userId }, { reviewedId: userId }] }
      });
      await tx.project.deleteMany({ where: { ownerId: userId } });
      
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    }, {
      maxWait: 10000, // 10 seconds
      timeout: 30000, // 30 seconds
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete user:", err);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
