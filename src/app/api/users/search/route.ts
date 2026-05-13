import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 1) return NextResponse.json([]);

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
        id: { not: session.user.id }, // exclude self
      },
      select: { id: true, name: true, username: true, image: true, trustLevel: true },
      take: 8,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
