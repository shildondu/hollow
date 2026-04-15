import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getSince(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
    default:
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = request.nextUrl.searchParams.get("period") || "today";
  const since = getSince(period);

  const where = since ? { createdAt: { gte: since } } : {};

  const [pv, uvRows, totalPv, totalUvRows, topPhotos] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.findMany({
      where,
      select: { ip: true },
      distinct: ["ip"],
    }),
    prisma.pageView.count(),
    prisma.pageView.findMany({
      select: { ip: true },
      distinct: ["ip"],
    }),
    prisma.photo.findMany({
      where: { viewCount: { gt: 0 } },
      select: { id: true, title: true, viewCount: true, thumbnailUrl: true },
      orderBy: { viewCount: "desc" },
      take: 10,
    }),
  ]);

  // Count unique IPs where ip is not null
  const uv = uvRows.filter((r) => r.ip !== null).length;
  const totalUv = totalUvRows.filter((r) => r.ip !== null).length;

  return NextResponse.json({
    period,
    pv,
    uv,
    totalPv,
    totalUv,
    topPhotos,
  });
}
