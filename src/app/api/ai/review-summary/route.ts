
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAIGate } from "@/lib/ai/gate";
import { AI_TOOL_CONFIG } from "@/lib/ai/config";
import { summarizeReviews } from "@/lib/ai/review-summarizer";
import { prisma } from "@/lib/prisma";
import { addHours } from "date-fns";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await checkAIGate(session.user.id, "REVIEW_SUMMARIZER");
  if (!gate.allowed) return NextResponse.json(gate, { status: 403 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        reviewsReceived: {
          include: { project: { select: { title: true, category: true } } }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Minimum requirement check
    if (user.reviewsReceived.length < 3) {
      return NextResponse.json({ 
        error: "Minimal butuh 3 review untuk membuat ringkasan yang bermakna. Kamu baru punya " + user.reviewsReceived.length + "." 
      }, { status: 400 });
    }

    const reviews = user.reviewsReceived.map(r => ({
      projectTitle: r.project.title,
      projectCategory: r.project.category,
      rating: r.rating,
      behaviorTags: r.behaviorTags,
      note: r.comment
    }));

    const result = await summarizeReviews(user.name || "User", "BUILDER", reviews);

    await prisma.aIToolUsage.create({
      data: {
        userId: session.user.id,
        toolType: "REVIEW_SUMMARIZER",
        expiresAt: addHours(new Date(), AI_TOOL_CONFIG.REVIEW_SUMMARIZER.cooldownHours),
        result: {
          create: {
            userId: session.user.id,
            toolType: "REVIEW_SUMMARIZER",
            input: {},
            output: result,
          }
        }
      }
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[AI Review Summary Error]", err);
    return NextResponse.json({ error: err.message || "Gagal ringkasan review." }, { status: 500 });
  }
}
