import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportedId, reason, description } = await req.json();

  if (!reportedId || !reason) {
    return NextResponse.json({ error: "Data laporan tidak lengkap" }, { status: 400 });
  }

  // Verify reporter is in project
  const reporterMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });

  if (!reporterMember) {
    return NextResponse.json({ error: "Kamu bukan anggota project ini" }, { status: 403 });
  }

  // Create report
  try {
    const report = await prisma.projectReport.create({
      data: {
        projectId,
        reporterId: session.user.id,
        reportedId,
        reason,
        description,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("[REPORT_POST]", error);
    return NextResponse.json({ error: "Gagal mengirim laporan" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();

  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });

  if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const reports = await prisma.projectReport.findMany({
      where: { projectId, status: "PENDING" },
      include: {
        reporter: { select: { name: true, image: true } },
        reported: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[REPORT_GET]", error);
    return NextResponse.json({ error: "Gagal memuat laporan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const session = await auth();

  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUserMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });

  if (!currentUserMember || (currentUserMember.role !== "OWNER" && currentUserMember.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, status } = await req.json(); // status: "DISMISSED", "KICKED", "BANNED"

  try {
    const report = await prisma.projectReport.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update laporan" }, { status: 500 });
  }
}
