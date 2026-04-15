import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, photoId } = body as {
      path?: string;
      referrer?: string;
      photoId?: string;
    };

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
    const ua = request.headers.get("user-agent") || null;

    await prisma.pageView.create({
      data: { path, referrer: referrer || null, ua, ip },
    });

    if (photoId && typeof photoId === "string") {
      await prisma.photo.update({
        where: { id: photoId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
