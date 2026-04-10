import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await request.json();

  // Input validation
  if (data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (data.title.length > 200) {
      return NextResponse.json({ error: "Title too long" }, { status: 400 });
    }
  }

  if (data.description !== undefined && data.description && data.description.length > 2000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  const photo = await prisma.photo.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      description: data.description?.trim(),
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl,
      camera: data.camera?.slice(0, 100),
      lens: data.lens?.slice(0, 100),
      aperture: data.aperture?.slice(0, 20),
      shutter: data.shutter?.slice(0, 50),
      iso: data.iso?.slice(0, 20),
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      categoryId: data.categoryId,
      sort: typeof data.sort === "number" ? data.sort : undefined,
      isPublic: typeof data.isPublic === "boolean" ? data.isPublic : undefined,
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get photo before deletion to access file paths
  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { imageUrl: true, thumbnailUrl: true },
  });

  // Delete database record
  await prisma.photo.delete({
    where: { id },
  });

  // Delete physical files
  if (photo) {
    const filesToDelete = [photo.imageUrl, photo.thumbnailUrl].filter(Boolean);
    for (const fileUrl of filesToDelete) {
      if (fileUrl && fileUrl.startsWith("/uploads/")) {
        const filepath = path.join(process.cwd(), "public", fileUrl);
        try {
          await unlink(filepath);
        } catch {
          // File may not exist, ignore
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
