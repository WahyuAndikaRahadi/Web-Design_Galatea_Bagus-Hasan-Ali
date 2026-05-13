import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { canCreateProject, getMaxActiveProjects } from "@/lib/trust-score";

const createProjectSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(2000),
  category: z.enum(["LOMBA", "STARTUP", "KREATIF", "BELAJAR", "SOSIAL", "AKADEMIK", "BISNIS", "PERTANIAN", "TEKNOLOGI", "PERKANTORAN"]),
  commitmentLevel: z.enum(["CASUAL", "SERIUS", "KOMPETISI"]),
  projectTopic: z.enum(["TEKNOLOGI", "PERTANIAN", "PENDIDIKAN", "LINGKUNGAN", "EKONOMI", "KARYA_TULIS", "RESEARCH", "PENGABDIAN", "KESEHATAN", "SENI_BUDAYA"]),
  maxMembers: z.number().int().min(2).max(20),
  requiredSkills: z.array(z.string().min(1)).min(1).max(10),
  deadline: z.string().datetime().nullable().optional(),
  invitedUserIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const commitment = searchParams.get("commitment");
    const status = searchParams.get("status") || "OPEN";
    const skill = searchParams.get("skill");
    
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "12");
    
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 50) limit = 50; // Cap limit for safety

    const skip = (page - 1) * limit;

    const where: any = {};

    // Only add to where if they are not "ALL" and exist
    if (category && category !== "ALL") {
      where.category = category;
    }
    
    if (commitment && commitment !== "ALL") {
      where.commitmentLevel = commitment;
    }
    
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (skill && skill.trim() !== "") {
      where.requiredSkills = {
        some: {
          skillName: {
            contains: skill,
            mode: "insensitive"
          }
        }
      };
    }

    // Use try-catch specifically for the database query to isolate connection issues
    try {
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            requiredSkills: { select: { skillName: true } },
            members: { select: { id: true } },
            hubTasks: { where: { isGlobal: true }, select: { id: true, status: true } },
            owner: {
              select: { 
                id: true, 
                name: true, 
                image: true, 
                trustScore: true, 
                trustLevel: true,
                linkedinUrl: true,
                githubUrl: true
              },
            },
          },
        }),
        prisma.project.count({ where }),
      ]);

      return NextResponse.json({ 
        projects: projects || [], 
        total: total || 0, 
        page, 
        limit, 
        totalPages: Math.ceil((total || 0) / limit) 
      });
    } catch (dbErr: any) {
      console.error("[projects GET DB Error]:", {
        message: dbErr.message,
        stack: dbErr.stack,
        code: dbErr.code,
        name: dbErr.name
      });
      return NextResponse.json({ error: "Database connection error." }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[projects GET General Error]:", err);
    return NextResponse.json({ error: "Gagal memuat project." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid: " + parsed.error.issues[0].message }, { status: 400 });
    }

    // Check trust level
    if (!canCreateProject(session.user.trustLevel)) {
      return NextResponse.json({ error: "Trust Level kamu belum cukup untuk membuat project. Minimal Member (31+ pts)." }, { status: 403 });
    }

    // Check active project limit
    const maxActive = getMaxActiveProjects(session.user.trustLevel as any, (session.user as any).trustScore || 0);
    if (maxActive !== Infinity) {
      const activeCount = await prisma.project.count({
        where: { ownerId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
      });
      if (activeCount >= maxActive) {
        return NextResponse.json({ 
          error: `Kamu sudah memiliki ${activeCount} project aktif. Maksimal ${maxActive} project untuk level kamu. Selesaikan salah satu project untuk membuka slot baru.` 
        }, { status: 403 });
      }
    }

    const { requiredSkills, deadline, invitedUserIds, ...projectData } = parsed.data;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        ownerId: session.user.id,
        deadline: deadline ? new Date(deadline) : null,
        requiredSkills: {
          create: requiredSkills.map((skillName) => ({ skillName })),
        },
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
        hubRooms: {
          create: [
            { name: "announcement", type: "ANNOUNCEMENT", description: "Pengumuman resmi dari owner & admin project." },
            { name: "general", type: "GENERAL", description: "Room utama untuk semua anggota." },
            { name: "kanban", type: "KANBAN", description: "Workspace kanban board project." },
          ],
        },
      },
      include: {
        requiredSkills: true,
        members: true,
        owner: { select: { id: true, name: true, image: true, trustScore: true, trustLevel: true } },
      },
    });

    // Handle Invitations
    if (invitedUserIds && invitedUserIds.length > 0) {
      try {
        for (const userId of invitedUserIds) {
          // Create formal Invitation record
          const invitation = await prisma.invitation.create({
            data: {
              projectId: project.id,
              inviterId: session.user.id,
              inviteeId: userId,
              status: "PENDING",
            },
          });

          // Create Notification linked to the invitation
          await prisma.notification.create({
            data: {
              userId,
              title: "📩 Undangan Project",
              message: `Kamu diundang oleh ${session.user.name} untuk bergabung ke project "${project.title}"`,
              type: "INVITATION",
              link: `/project/${project.id}`,
              invitationId: invitation.id,
            },
          });

          // Trigger Pusher for each invited user
          await pusherServer.trigger(CHANNELS.user(userId), EVENTS.NEW_NOTIFICATION, {});
        }
      } catch (invError) {
        console.error("[projects POST Invitations Error]:", invError);
      }
    }

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("[projects POST]", err);
    return NextResponse.json({ error: "Gagal membuat project." }, { status: 500 });
  }
}
