import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        requiredSkills: true,
        owner: { select: { id: true, name: true, image: true, trustScore: true, trustLevel: true, skills: { select: { skillName: true } } } },
        members: {
          include: { user: { select: { id: true, name: true, image: true, trustScore: true, trustLevel: true, skills: { select: { skillName: true } } } } },
        },
        tasks: { orderBy: [{ status: "asc" }, { position: "asc" }] },
        polls: { include: { options: { include: { votes: true } } } },
      },
    });

    if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    return NextResponse.json(project);
  } catch (err) {
    console.error("[project GET]", err);
    return NextResponse.json({ error: "Gagal memuat project." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    if (project.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updated = await prisma.project.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[project PATCH]", err);
    return NextResponse.json({ error: "Gagal mengupdate project." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    if (project.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Cascade delete is handled by Prisma schema (hopefully, I should verify)
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project berhasil dihapus." });
  } catch (err) {
    console.error("[project DELETE]", err);
    return NextResponse.json({ error: "Gagal menghapus project." }, { status: 500 });
  }
}
