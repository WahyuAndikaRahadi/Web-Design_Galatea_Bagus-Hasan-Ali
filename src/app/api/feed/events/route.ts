import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.feedPost.findMany({
      where: {
        type: "EVENT",
        isArchived: false,
        eventDeadline: { gte: new Date() }, // Only upcoming events
      },
      orderBy: { eventDeadline: "asc" }, // Closest deadline first
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            trustScore: true,
            trustLevel: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("[FEED_EVENTS_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil daftar event" }, { status: 500 });
  }
}
