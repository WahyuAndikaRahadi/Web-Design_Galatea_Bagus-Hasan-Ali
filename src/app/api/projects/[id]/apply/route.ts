import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";
import { z } from "zod";

const applySchema = z.object({
  message: z.string().min(10).max(500),
  commitmentLevel: z.enum(["CASUAL", "SERIUS", "KOMPETISI"]),
  isAnonymous: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = applySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

    const project = await prisma.project.findUnique({ where: { id }, include: { members: true, owner: { select: { id: true } } } });
    if (!project) return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
    if (project.status !== "OPEN") return NextResponse.json({ error: "Project tidak menerima anggota baru." }, { status: 400 });

    const isAlreadyMember = project.members.some((m) => m.userId === session.user.id);
    if (isAlreadyMember) return NextResponse.json({ error: "Kamu sudah menjadi anggota project ini." }, { status: 400 });

    const existing = await prisma.application.findFirst({ where: { projectId: id, applicantId: session.user.id, status: "PENDING" } });
    if (existing) return NextResponse.json({ error: "Kamu sudah melamar project ini." }, { status: 400 });

    const application = await prisma.application.create({
      data: { 
        projectId: id, 
        applicantId: session.user.id, 
        message: parsed.data.message,
        commitmentLevel: parsed.data.commitmentLevel,
        isAnonymous: parsed.data.isAnonymous
      },
    });

    // Create DB Notification
    await prisma.notification.create({
      data: {
        userId: project.owner.id,
        title: "📬 Lamaran Baru",
        message: `Ada pelamar baru untuk project "${project.title}"`,
        type: "APPLICATION",
        link: `/project/${id}`,
      }
    });

    // Notify owner via Pusher
    await pusherServer.trigger(CHANNELS.user(project.owner.id), EVENTS.NEW_APPLICATION, {
      projectId: id,
      projectTitle: project.title,
      applicantId: session.user.id,
    });
    
    // Also trigger NEW_NOTIFICATION for the bell icon
    await pusherServer.trigger(CHANNELS.user(project.owner.id), EVENTS.NEW_NOTIFICATION, {});

    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    console.error("[apply POST]", err);
    return NextResponse.json({ error: "Gagal melamar project." }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const applications = await prisma.application.findMany({
      where: { projectId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    // Get applicant details
    const applicantsData = await Promise.all(
      applications.map(async (app) => {
        const user = await prisma.user.findUnique({
          where: { id: app.applicantId },
          select: { 
            id: true, 
            name: true, 
            image: true, 
            bio: true, 
            trustScore: true, 
            trustLevel: true, 
            skills: { select: { skillName: true } },
            externalLinks: {
              where: { status: "VERIFIED" },
              select: { platform: true, url: true, status: true, username: true, label: true }
            }
          },
        });
        return { ...app, applicant: user };
      })
    );

    return NextResponse.json(applicantsData);
  } catch (err) {
    console.error("[apply GET]", err);
    return NextResponse.json({ error: "Gagal memuat aplikasi." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { applicationId, decision } = await req.json();
    if (!applicationId || !["APPROVED", "REJECTED"].includes(decision)) {
      return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });

    await prisma.application.update({ where: { id: applicationId }, data: { status: decision } });

    if (decision === "APPROVED") {
      // Add member
      await prisma.projectMember.create({
        data: { 
          projectId: id, 
          userId: application.applicantId, 
          role: "MEMBER",
          isAnonymous: application.isAnonymous,
          anonymousTag: application.isAnonymous ? Math.floor(1000 + Math.random() * 9000).toString() : null
        },
      });

      // Create DB Notification
      await prisma.notification.create({
        data: {
          userId: application.applicantId,
          title: "🎉 Lamaran Diterima",
          message: `Selamat! Kamu diterima di project "${project.title}"`,
          type: "APPLICATION",
          link: `/project/${id}/hub`,
        }
      });

      // Notify via Pusher
      await pusherServer.trigger(CHANNELS.user(application.applicantId), EVENTS.APPLICATION_DECISION, {
        decision: "APPROVED",
        projectId: id,
        projectTitle: project.title,
      });
      await pusherServer.trigger(CHANNELS.user(application.applicantId), EVENTS.NEW_NOTIFICATION, {});

      // Send email
      const applicant = await prisma.user.findUnique({ where: { id: application.applicantId }, select: { name: true, email: true } });
      if (applicant) await sendApprovalEmail(applicant.email, applicant.name, project.title);
    } else {
      // Create DB Notification
      await prisma.notification.create({
        data: {
          userId: application.applicantId,
          title: "😔 Lamaran Ditolak",
          message: `Mohon maaf, lamaranmu untuk "${project.title}" belum diterima.`,
          type: "APPLICATION",
          link: `/explore`,
        }
      });

      // Notify rejection via Pusher
      await pusherServer.trigger(CHANNELS.user(application.applicantId), EVENTS.APPLICATION_DECISION, {
        decision: "REJECTED",
        projectId: id,
        projectTitle: project.title,
      });
      await pusherServer.trigger(CHANNELS.user(application.applicantId), EVENTS.NEW_NOTIFICATION, {});

      // Send email
      const applicant = await prisma.user.findUnique({ where: { id: application.applicantId }, select: { name: true, email: true } });
      if (applicant) await sendRejectionEmail(applicant.email, applicant.name, project.title);
    }

    return NextResponse.json({ message: `Aplikasi ${decision === "APPROVED" ? "disetujui" : "ditolak"}.` });
  } catch (err) {
    console.error("[apply PATCH]", err);
    return NextResponse.json({ error: "Gagal memproses keputusan." }, { status: 500 });
  }
}
