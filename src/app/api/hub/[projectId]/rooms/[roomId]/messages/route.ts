import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

type Params = { params: Promise<{ projectId: string; roomId: string }> };

// GET /api/hub/[projectId]/rooms/[roomId]/messages
export async function GET(req: NextRequest, { params }: Params) {
  const { projectId, roomId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 50;

  const messages = await prisma.hubMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    take: limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(messages);
}

// POST /api/hub/[projectId]/rooms/[roomId]/messages
export async function POST(req: NextRequest, { params }: Params) {
  const { projectId, roomId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const room = await prisma.hubRoom.findUnique({ where: { id: roomId } });
  if (!room || room.projectId !== projectId) return NextResponse.json({ error: "Room tidak ditemukan." }, { status: 404 });

  // Announcement room: only owner can send
  if (room.type === "ANNOUNCEMENT" && member.role !== "OWNER") {
    return NextResponse.json({ error: "Hanya owner yang bisa mengirim pesan di #announcement." }, { status: 403 });
  }

  const body = await req.json();
  const { content, mentions: clientMentions = [] } = body as { content: string; mentions: string[] };

  if (!content?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Pesan terlalu panjang (maks 2000 karakter)." }, { status: 400 });

  // Robust mention detection: if user typed manually or client missed it
  let mentions = [...clientMentions];
  if (content.includes("@all") && !mentions.includes("all")) {
    mentions.push("all");
  }

  // Find project members to resolve manual @names
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, username: true } } }
  });

  const nameMatches = content.match(/@(\w+)/g);
  if (nameMatches) {
    for (const match of nameMatches) {
      const username = match.slice(1).toLowerCase();
      if (username === "all") continue;
      
      // Search for any member whose username matches exactly
      const found = projectMembers.find(m => m.user.username?.toLowerCase() === username);
      
      if (found && !mentions.includes(found.userId)) {
        console.log(`[Mention] Resolved @${username} -> ${found.user.name} (${found.userId})`);
        mentions.push(found.userId);
      }
    }
  }

  // Get sender display info (anonymous handling)
  const isAnon = member.isAnonymous && !member.revealedAt;

  const message = await prisma.hubMessage.create({
    data: {
      roomId,
      senderId: session.user.id,
      content: content.trim(),
      mentions,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  const payload = {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    mentions: message.mentions,
    sender: isAnon
      ? { id: session.user.id, name: `Anon#${member.anonymousTag || "0000"}`, image: null, isAnonymous: true }
      : { id: message.sender.id, name: message.sender.name, image: message.sender.image, isAnonymous: false },
  };

  // Broadcast to room channel
  try {
    await pusherServer.trigger(CHANNELS.hubRoom(roomId), EVENTS.HUB_MESSAGE, payload);
    
    // Also broadcast to project channel for sidebar notifications
    await pusherServer.trigger(CHANNELS.hub(projectId), "room-message", {
      roomId,
      messageId: message.id,
      mentions: payload.mentions,
    });
  } catch {}

  // Send mention notifications
  if (mentions.length > 0) {
    let targetUserIds = mentions;

    if (mentions.includes("all")) {
      const allMembers = await prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true }
      });
      targetUserIds = allMembers.map(m => m.userId);
    }

    // Filter out sender
    targetUserIds = Array.from(new Set(targetUserIds)).filter(id => id !== session.user.id);

    if (targetUserIds.length > 0) {
      try {
        console.log(`[Notification] targetUserIds:`, targetUserIds);

        // 1. Create DB Notifications
        const notifData = targetUserIds.map(userId => ({
          userId,
          title: `💬 Mention di #${room.name}`,
          message: `${payload.sender.name} menyebut Anda: "${content.trim().slice(0, 50)}..."`,
          type: "MENTION",
          link: `/project/${projectId}/hub?room=${roomId}`,
        }));

        await prisma.notification.createMany({
          data: notifData,
          skipDuplicates: true,
        });

        console.log(`[Notification] Successfully created ${notifData.length} records in DB`);

        // 2. Trigger Pusher Event
        const notificationPayload = {
          messageId: message.id,
          roomId,
          roomName: room.name,
          projectId,
          content: content.trim().slice(0, 100),
          sender: payload.sender,
        };
        
        for (const userId of targetUserIds) {
          try {
            await pusherServer.trigger(CHANNELS.user(userId), EVENTS.NEW_NOTIFICATION, notificationPayload);
          } catch (e) {
            console.error(`[Pusher] Failed to trigger notification for ${userId}`, e);
          }
        }
      } catch (e) {
        console.error("[Notification Error]", e);
      }
    }
  }

  return NextResponse.json(payload, { status: 201 });
}
