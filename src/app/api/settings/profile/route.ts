import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, bio, image } = body;

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { 
          username,
          id: { not: session.user.id }
        }
      });
      if (existing) {
        return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(username && { username: username.toLowerCase() }),
        ...(bio !== undefined && { bio }),
        ...(image && { image }),
      },
    });

    return NextResponse.json({ 
      message: "Profil berhasil diperbarui", 
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        image: updatedUser.image
      } 
    });
  } catch (err) {
    console.error("[profile-update]", err);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
