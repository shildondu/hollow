import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

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

  const slogan = await prisma.slogan.update({
    where: { id },
    data: {
      text: data.text?.trim(),
      isActive: data.isActive,
      sort: typeof data.sort === "number" ? data.sort : undefined,
    },
  });

  return NextResponse.json(slogan);
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
  await prisma.slogan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
