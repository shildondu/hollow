import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const slogans = await prisma.slogan.findMany({
    where: { isActive: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  // Return random slogan
  const randomSlogan = slogans.length > 0
    ? slogans[Math.floor(Math.random() * slogans.length)]
    : null;

  return NextResponse.json({
    text: randomSlogan?.text || "人活着不是为了一辈子，而是为了几个瞬间",
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  if (!data.text || typeof data.text !== "string" || data.text.trim().length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (data.text.length > 200) {
    return NextResponse.json({ error: "Text too long" }, { status: 400 });
  }

  const slogan = await prisma.slogan.create({
    data: {
      text: data.text.trim(),
      isActive: data.isActive ?? true,
      sort: typeof data.sort === "number" ? data.sort : 0,
    },
  });

  return NextResponse.json(slogan);
}
