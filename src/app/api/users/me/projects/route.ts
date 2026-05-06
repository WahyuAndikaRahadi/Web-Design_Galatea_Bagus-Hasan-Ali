import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const memberships = await prisma.projectMember.findMany({
      where: {
        userId: session.user.id,
        project: {
          ...(status ? { status: status as any } : {}),
        }
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          }
        }
      }
    });

    const projects = memberships.map(m => m.project);

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[USER_PROJECTS_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil data project" }, { status: 500 });
  }
}
