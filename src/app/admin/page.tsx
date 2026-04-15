import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, FolderOpen, Eye, Users } from "lucide-react";

export default async function AdminDashboard() {
  const [photoCount, categoryCount] = await Promise.all([
    prisma.photo.count(),
    prisma.category.count(),
  ]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayPv, todayUvRows, sevenDaysPv, sevenDaysUvRows, totalPv, totalUvRows, topPhotos] =
    await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: todayStart }, ip: { not: null } },
        select: { ip: true },
        distinct: ["ip"],
      }),
      prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, ip: { not: null } },
        select: { ip: true },
        distinct: ["ip"],
      }),
      prisma.pageView.count(),
      prisma.pageView.findMany({
        where: { ip: { not: null } },
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

  const todayUv = todayUvRows.length;
  const sevenDaysUv = sevenDaysUvRows.length;
  const totalUv = totalUvRows.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/photos">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{photoCount}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryCount}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today PV / UV</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayPv} <span className="text-base font-normal text-muted-foreground">/</span> {todayUv}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="transition-colors hover:bg-accent cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">7d PV / UV</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sevenDaysPv} <span className="text-base font-normal text-muted-foreground">/</span> {sevenDaysUv}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {totalPv} / {totalUv}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {topPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Photos by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPhotos.map((photo, i) => (
                <div key={photo.id} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                  {photo.thumbnailUrl && (
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <span className="flex-1 text-sm truncate">{photo.title}</span>
                  <span className="text-sm text-muted-foreground">{photo.viewCount} views</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
