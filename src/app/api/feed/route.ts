import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { FeedPostType, ProjectTopic } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const type = searchParams.get("type") as FeedPostType | null;
  const topic = searchParams.get("topic") as ProjectTopic | null;
  const tag = searchParams.get("tag");
  const limit = 10;

  try {
    const posts = await prisma.feedPost.findMany({
      where: {
        isArchived: false,
        ...(type ? { type } : {}),
        ...(topic ? { projectTopic: topic } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
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
    const { type, mentions = [] } = body;
    
    // Extract hashtags from content
    const tags = body.content ? (body.content.match(/#\w+/g)?.map((t: string) => t.slice(1)) || []) : [];

    // Helper: send mention notifications
    const sendMentionNotifications = async (postId: string, authorName: string, postType: string) => {
      for (const userId of mentions as string[]) {
        if (userId === session.user.id) continue;
        try {
          await prisma.notification.create({
            data: {
              userId,
              title: "🏷️ Kamu di-mention",
              message: `${authorName} menyebutmu dalam sebuah ${postType === "EVENT" ? "info event" : "post kontribusi"}.`,
              type: "MENTION",
              link: `/feed?post=${postId}`,
            },
          });
          await pusherServer.trigger(
            CHANNELS.user(userId),
            EVENTS.NEW_NOTIFICATION,
            { type: "MENTION" }
          );
        } catch (err) {
          console.error("Mention notify error", err);
        }
      }
    };

    if (type === "CONTRIBUTION") {
      const { content, mediaUrl, projectTopic, impactTag, projectId } = body;

      // projectId is now optional (General Post)
      if (projectId) {
        // Check membership if projectId is provided
        const member = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: { projectId, userId: session.user.id },
          },
        });
        // We don't strictly block if they aren't a member, but it's good for tagging.
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
          projectTopic,
          impactTag,
          projectId,
          tags,
        },
      });

      await sendMentionNotifications(post.id, session.user.name || "Someone", "CONTRIBUTION");

      return NextResponse.json(post);
    } 
    
    if (type === "EVENT") {
      if (user.trustScore < 31) {
        return NextResponse.json(
          { error: "Butuh Trust Score 31+ (Level Member) untuk memposting event" },
          { status: 403 }
        );
      }

      const { eventName, eventCategory, eventDeadline, eventLink, eventSkills, projectTopic, content } = body;

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
          projectTopic,
          tags,
        },
      });

      await sendMentionNotifications(post.id, session.user.name || "Someone", "EVENT");

      return NextResponse.json(post);
    }

    return NextResponse.json({ error: "Tipe post tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("[FEED_POST]", error);
    return NextResponse.json({ error: "Gagal membuat post" }, { status: 500 });
  }
}
