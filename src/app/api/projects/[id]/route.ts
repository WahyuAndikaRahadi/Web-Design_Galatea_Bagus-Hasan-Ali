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
    const project = await prisma.project.findUnique({ 
      where: { id },
      include: {
        tasks: true,
      }
    });
    if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    if (project.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    // Check if status is being updated to COMPLETED and trust score hasn't been awarded
    if (body.status === "COMPLETED" && project.status !== "COMPLETED" && !project.isTrustScoreAwarded) {
      // --- ANTI-FARMING SYSTEM ---
      const now = new Date();
      const projectAgeDays = (now.getTime() - new Date(project.createdAt).getTime()) / (1000 * 3600 * 24);
      const doneTasksCount = project.tasks.filter(t => t.status === "DONE").length;

      // Syarat: Project minimal berumur 3 hari ATAU memiliki minimal 3 task yang sudah DONE
      // Kita pakai kombinasi (misal minimal 1 hari DAN 2 task DONE) agar lebih fleksibel tapi aman.
      if (projectAgeDays >= 1 && doneTasksCount >= 2) {
        // 1. Dapatkan semua member project
        const members = await prisma.projectMember.findMany({ where: { projectId: id } });
        const memberIds = members.map(m => m.userId);

      if (memberIds.length > 0) {
        // 2. Tambahkan +15 ke semua member (ini tidak mengubah trustLevel otomatis,
        // tapi poinnya sudah masuk. Idealnya kita juga update trustLevel)
        await prisma.user.updateMany({
          where: { id: { in: memberIds } },
          data: { 
            trustScore: { increment: 15 },
            eventScore: { increment: 15 }
          }
        });

        // 3. (Opsional) Update trustLevel untuk setiap member secara individual jika perlu
        // Karena updateMany tidak bisa memanggil fungsi custom, 
        // trustLevel akan terupdate ketika refreshUserTrustScore dipanggil di tempat lain,
        // atau kita bisa loop members jika datanya tidak terlalu banyak.
      }

        // 4. Set flag ke true agar tidak diberikan lagi di kemudian hari
        body.isTrustScoreAwarded = true;
      } else {
        // Jika tidak memenuhi syarat, project tetap bisa COMPLETED, 
        // tapi kembalikan pesan atau jangan set flag award-nya (opsional)
        // Disini kita biarkan user mark as completed, tapi jangan kasih skor.
        console.log(`[Anti-Farming] Project ${id} ditandai COMPLETED tapi tidak memenuhi syarat (Age: ${projectAgeDays.toFixed(1)} days, Tasks: ${doneTasksCount})`);
      }
    }

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
