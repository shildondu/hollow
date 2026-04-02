import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { photos: true },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
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
  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (data.name.length > 100) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      slug: data.slug?.toLowerCase().replace(/\s+/g, "-").slice(0, 100),
      sort: typeof data.sort === "number" ? data.sort : undefined,
    },
  });

  return NextResponse.json(category);
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

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
