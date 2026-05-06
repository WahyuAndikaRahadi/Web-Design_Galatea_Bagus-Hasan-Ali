import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.feedLike.findUnique({
      where: {
        postId_userId: { postId, userId: session.user.id },
      },
    });

    if (existing) {
      await prisma.feedLike.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.feedLike.create({
        data: { postId, userId: session.user.id },
      });

      // Optional: Logic for +3 Trust Score if event post gets high engagement
      // For now, just return success
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses like" }, { status: 500 });
  }
}
