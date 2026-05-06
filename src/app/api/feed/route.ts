import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FeedPostType, SDGTag } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const type = searchParams.get("type") as FeedPostType | null;
  const sdg = searchParams.get("sdg") as SDGTag | null;
  const limit = 10;

  try {
    const posts = await prisma.feedPost.findMany({
      where: {
        isArchived: false,
        ...(type ? { type } : {}),
        ...(sdg ? { sdgTag: sdg } : {}),
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            trustScore: true,
            trustLevel: true,
            availStatus: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
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

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch (error) {
    console.error("[FEED_GET]", error);
    return NextResponse.json({ error: "Gagal mengambil feed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trustScore: true, trustLevel: true },
  });

  if (!user || user.trustScore < 20) {
    return NextResponse.json(
      { error: "Trust Score kamu terlalu rendah untuk memposting (min. 20)" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { type } = body;

    if (type === "CONTRIBUTION") {
      const { content, mediaUrl, sdgTag, impactTag, projectId } = body;

      if (!projectId) {
        return NextResponse.json({ error: "Project wajib dicantumkan" }, { status: 400 });
      }

      // Check membership
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: session.user.id },
        },
        include: { project: true },
      });

      if (!member || member.project.status !== "IN_PROGRESS") {
        return NextResponse.json(
          { error: "Kamu harus menjadi anggota di project yang sedang IN PROGRESS" },
          { status: 403 }
        );
      }

      // Check daily limit (max 2)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayPosts = await prisma.feedPost.count({
        where: {
          authorId: session.user.id,
          type: "CONTRIBUTION",
          createdAt: { gte: startOfDay },
        },
      });

      if (todayPosts >= 2) {
        return NextResponse.json(
          { error: "Maksimal 2 contribution post per hari" },
          { status: 429 }
        );
      }

      const post = await prisma.feedPost.create({
        data: {
          authorId: session.user.id,
          type: "CONTRIBUTION",
          content: content.slice(0, 500),
          mediaUrl,
          sdgTag,
          impactTag,
          projectId,
        },
      });

      return NextResponse.json(post);
    } 
    
    if (type === "EVENT") {
      if (user.trustScore < 31) {
        return NextResponse.json(
          { error: "Butuh Trust Score 31+ (Level Member) untuk memposting event" },
          { status: 403 }
        );
      }

      const { eventName, eventCategory, eventDeadline, eventLink, eventSkills, sdgTag, content } = body;

      if (!eventName || !eventCategory || !eventDeadline || !eventLink) {
        return NextResponse.json({ error: "Field wajib event belum lengkap" }, { status: 400 });
      }

      // Check cooldown (24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEvent = await prisma.feedPost.findFirst({
        where: {
          authorId: session.user.id,
          type: "EVENT",
          createdAt: { gte: oneDayAgo },
        },
      });

      if (recentEvent) {
        return NextResponse.json(
          { error: "Tunggu 24 jam sebelum membuat event post lagi" },
          { status: 429 }
        );
      }

      const post = await prisma.feedPost.create({
        data: {
          authorId: session.user.id,
          type: "EVENT",
          content: content?.slice(0, 280),
          eventName,
          eventCategory,
          eventDeadline: new Date(eventDeadline),
          eventLink,
          eventSkills,
          sdgTag,
        },
      });

      return NextResponse.json(post);
    }

    return NextResponse.json({ error: "Tipe post tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("[FEED_POST]", error);
    return NextResponse.json({ error: "Gagal membuat post" }, { status: 500 });
  }
}
