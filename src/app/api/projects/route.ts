import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { canCreateProject, getMaxActiveProjects } from "@/lib/trust-score";

const createProjectSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(2000),
  category: z.enum(["LOMBA", "STARTUP", "KREATIF", "BELAJAR", "SOSIAL"]),
  commitmentLevel: z.enum(["CASUAL", "SERIUS", "KOMPETISI"]),
  sdgTag: z.enum(["SDG8", "SDG9", "SDG12"]),
  maxMembers: z.number().int().min(2).max(20),
  requiredSkills: z.array(z.string().min(1)).min(1).max(10),
  deadline: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const commitment = searchParams.get("commitment");
    const status = searchParams.get("status") || "OPEN";
    const skill = searchParams.get("skill");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category && category !== "ALL") where.category = category;
    if (commitment && commitment !== "ALL") where.commitmentLevel = commitment;
    if (status !== "ALL") where.status = status;
    if (skill) {
      where.requiredSkills = { some: { skillName: { contains: skill, mode: "insensitive" } } };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          requiredSkills: { select: { skillName: true } },
          members: { select: { id: true } },
          owner: {
            select: { 
              id: true, 
              name: true, 
              image: true, 
              trustScore: true, 
              trustLevel: true,
              externalLinks: {
                where: { status: "VERIFIED", platform: { in: ["LINKEDIN", "GITHUB"] } },
                select: { platform: true, url: true }
              }
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({ projects, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[projects GET]", err);
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
    const maxActive = getMaxActiveProjects(session.user.trustLevel);
    if (maxActive !== Infinity) {
      const activeCount = await prisma.project.count({
        where: { ownerId: session.user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
      });
      if (activeCount >= maxActive) {
        return NextResponse.json({ error: `Kamu sudah memiliki ${activeCount} project aktif. Maksimal ${maxActive} untuk levelmu.` }, { status: 403 });
      }
    }

    const { requiredSkills, deadline, ...projectData } = parsed.data;

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

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("[projects POST]", err);
    return NextResponse.json({ error: "Gagal membuat project." }, { status: 500 });
  }
}
