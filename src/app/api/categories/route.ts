import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { sort: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Input validation
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (data.name.length > 100) {
    return NextResponse.json({ error: "Name too long" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug: (data.slug || data.name).toLowerCase().replace(/\s+/g, "-").slice(0, 100),
      sort: typeof data.sort === "number" ? data.sort : 0,
    },
  });

  return NextResponse.json(category);
}
