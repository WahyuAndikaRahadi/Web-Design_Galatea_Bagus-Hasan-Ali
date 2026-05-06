
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyExternalLink } from "@/lib/link-verifier";
import { refreshUserTrustScore } from "@/lib/trust-score";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { visibility, label } = await req.json();
    
    const link = await prisma.externalLink.update({
      where: { id, userId: session.user.id },
      data: { 
        ...(visibility && { visibility }),
        ...(label !== undefined && { label }),
      },
    });
    
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.externalLink.delete({
      where: { id, userId: session.user.id },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}

// POST for manual re-verification
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const link = await prisma.externalLink.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

    const verification = await verifyExternalLink(link.url);
    
    const updated = await prisma.externalLink.update({
      where: { id },
      data: {
        status: verification.isValid ? "VERIFIED" : "UNVERIFIED",
        previewTitle: verification.previewTitle || link.previewTitle,
        previewImage: verification.previewImage || link.previewImage,
        verifiedAt: verification.isValid ? new Date() : link.verifiedAt,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify link" }, { status: 500 });
  }
}
