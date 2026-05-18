import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { z } from "zod";

type Params = { params: Promise<{ projectId: string; taskId: string }> };

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REVISE"]),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const { projectId, taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Verify user is admin/owner
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return NextResponse.json({ error: "Hanya Admin atau Owner yang bisa me-review task." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { action, note } = parsed.data;

  // 2. Find task
  const task = await prisma.hubTask.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: "Task tidak ditemukan." }, { status: 404 });
  if (task.status !== "DONE") return NextResponse.json({ error: "Task harus berstatus DONE untuk di-review." }, { status: 400 });
  if (task.isApproved) return NextResponse.json({ error: "Task ini sudah di-approve." }, { status: 400 });

  try {
    let updatedTask;

    if (action === "APPROVE") {
      // --- APPROVE LOGIC ---
      updatedTask = await prisma.hubTask.update({
        where: { id: taskId },
        data: {
          isApproved: true,
          revisionNote: null,
        }
      });

      // Tambahkan poin ke Assignee jika ada
      if (task.assigneeId) {
        await prisma.user.update({
          where: { id: task.assigneeId },
          data: {
            trustScore: { increment: 2 }, // Poin kecil untuk penyelesaian task
            eventScore: { increment: 2 }
          }
        });

        // Notifikasi ke user bahwa tasknya di-approve
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            title: "✅ Task Approved!",
            message: `Task "${task.title}" di project ${project?.title} telah di-approve. Kamu mendapat +2 Poin!`,
            type: "SYSTEM",
            link: `/project/${projectId}/hub`,
          }
        });
        await pusherServer.trigger(CHANNELS.user(task.assigneeId), EVENTS.NEW_NOTIFICATION, {});
      }

    } else {
      // --- REVISE LOGIC ---
      if (!note) return NextResponse.json({ error: "Catatan revisi wajib diisi." }, { status: 400 });

      updatedTask = await prisma.hubTask.update({
        where: { id: taskId },
        data: {
          status: "IN_PROGRESS", // Kembalikan ke in progress
          completedAt: null,
          revisionNote: note,
          isApproved: false,
        }
      });

      // Notifikasi revisi
      if (task.assigneeId) {
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            title: "⚠️ Task Perlu Revisi",
            message: `Task "${task.title}" perlu direvisi. Catatan: ${note}`,
            type: "SYSTEM",
            link: `/project/${projectId}/hub`,
          }
        });
        await pusherServer.trigger(CHANNELS.user(task.assigneeId), EVENTS.NEW_NOTIFICATION, {});
      }
    }

    // Broadcast ke Hub
    await pusherServer.trigger(CHANNELS.hub(projectId), EVENTS.HUB_TASK_UPDATED, updatedTask);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_REVIEW]", error);
    return NextResponse.json({ error: "Gagal memproses review task." }, { status: 500 });
  }
}
