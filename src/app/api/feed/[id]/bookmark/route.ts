import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.feedBookmark.findUnique({
      where: {
        postId_userId: { postId, userId: session.user.id },
      },
    });

    if (existing) {
      await prisma.feedBookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.feedBookmark.create({
        data: { postId, userId: session.user.id },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses bookmark" }, { status: 500 });
  }
}
