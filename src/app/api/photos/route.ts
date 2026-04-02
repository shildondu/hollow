import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const photos = await prisma.photo.findMany({
    where: categoryId ? { categoryId } : undefined,
    include: { category: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(photos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Input validation
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (data.title.length > 200) {
    return NextResponse.json({ error: "Title too long" }, { status: 400 });
  }

  if (!data.imageUrl || typeof data.imageUrl !== "string") {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  // Validate imageUrl is from our domain or a safe path
  if (!data.imageUrl.startsWith("/uploads/") && !data.imageUrl.startsWith("http")) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (data.description && data.description.length > 2000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  const photo = await prisma.photo.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl || null,
      camera: data.camera?.slice(0, 100) || null,
      lens: data.lens?.slice(0, 100) || null,
      aperture: data.aperture?.slice(0, 20) || null,
      shutter: data.shutter?.slice(0, 50) || null,
      iso: data.iso?.slice(0, 20) || null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      categoryId: data.categoryId || null,
      sort: typeof data.sort === "number" ? data.sort : 0,
      isPublic: typeof data.isPublic === "boolean" ? data.isPublic : true,
    },
  });

  return NextResponse.json(photo);
}
