import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;

  try {
    const comments = await prisma.feedComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            trustScore: true,
          },
        },
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil komentar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content, mentions = [] } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Komentar tidak boleh kosong" }, { status: 400 });
    }

    const comment = await prisma.feedComment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: content.slice(0, 200),
        mentions,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            trustScore: true,
          },
        },
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    // Notify post author
    if (comment.post.authorId !== session.user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: comment.post.authorId,
            title: "💬 Komentar Baru",
            message: `${session.user.name} mengomentari postinganmu: "${content.slice(0, 50)}..."`,
            type: "SYSTEM",
            link: `/feed?post=${postId}`,
          },
        });

        await pusherServer.trigger(
          CHANNELS.user(comment.post.authorId),
          EVENTS.NEW_NOTIFICATION,
          { type: "COMMENT" }
        );
      } catch (err) {
        console.error("Notify error", err);
      }
    }

    // Notify mentions
    for (const userId of mentions) {
      if (userId === session.user.id) continue;
      try {
        await prisma.notification.create({
          data: {
            userId,
            title: "🏷️ Kamu di-mention",
            message: `${session.user.name} menyebutmu di komentar.`,
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return NextResponse.json({ error: "Gagal memposting komentar" }, { status: 500 });
  }
}
