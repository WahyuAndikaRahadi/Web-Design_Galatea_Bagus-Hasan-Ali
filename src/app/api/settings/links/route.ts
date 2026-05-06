
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyExternalLink } from "@/lib/link-verifier";
import { ExternalPlatform } from "@prisma/client";
import { refreshUserTrustScore } from "@/lib/trust-score";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const links = await prisma.externalLink.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url, visibility, label } = await req.json();

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Check for custom link limit (max 2)
    const platform = require("@/lib/link-verifier").detectPlatform(url);
    if (platform === "CUSTOM") {
      const customCount = await prisma.externalLink.count({
        where: { userId: session.user.id, platform: "CUSTOM" }
      });
      if (customCount >= 2) {
        return NextResponse.json({ error: "Maksimal 2 custom link yang diperbolehkan" }, { status: 400 });
      }
    }

    // Verify link and fetch metadata
    const verification = await verifyExternalLink(url);
    
    if (!verification.isValid) {
      return NextResponse.json({ error: "Could not reach the provided URL" }, { status: 400 });
    }

    const link = await prisma.externalLink.create({
      data: {
        userId: session.user.id,
        url,
        platform: verification.platform as ExternalPlatform,
        username: verification.username,
        previewTitle: verification.previewTitle,
        previewImage: verification.previewImage,
        visibility: visibility || "MEMBERS_ONLY",
        label: label,
        status: "VERIFIED",
        verifiedAt: new Date(),
        lastCheckedAt: new Date(),
      },
    });

    // Update Trust Score
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { externalLinks: true }
    });

    if (updatedUser) {
      const { score, level } = refreshUserTrustScore(updatedUser);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { trustScore: score, trustLevel: level }
      });
    }
    
    return NextResponse.json(link);
  } catch (error) {
    console.error("POST /api/settings/links error:", error);
    return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  }
}
