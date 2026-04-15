import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Users, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    todayPv,
    todayUvRows,
    sevenDaysPv,
    sevenDaysUvRows,
    thirtyDaysPv,
    thirtyDaysUvRows,
    totalPv,
    totalUvRows,
    topPhotos,
    dailyViews,
  ] = await Promise.all([
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
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, ip: { not: null } },
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
    // Daily PV for the last 14 days
    getDailyViews(14),
  ]);

  const todayUv = todayUvRows.length;
  const sevenDaysUv = sevenDaysUvRows.length;
  const thirtyDaysUv = thirtyDaysUvRows.length;
  const totalUv = totalUvRows.length;

  const maxPv = Math.max(...dailyViews.map((d) => d.pv), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayPv} <span className="text-base font-normal text-muted-foreground">PV</span>
            </div>
            <p className="text-xs text-muted-foreground">{todayUv} UV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sevenDaysPv} <span className="text-base font-normal text-muted-foreground">PV</span>
            </div>
            <p className="text-xs text-muted-foreground">{sevenDaysUv} UV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thirtyDaysPv} <span className="text-base font-normal text-muted-foreground">PV</span>
            </div>
            <p className="text-xs text-muted-foreground">{thirtyDaysUv} UV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPv} <span className="text-base font-normal text-muted-foreground">PV</span>
            </div>
            <p className="text-xs text-muted-foreground">{totalUv} UV</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily PV (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-48">
            {dailyViews.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{day.pv}</span>
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(day.pv / maxPv) * 100}%`, minHeight: day.pv > 0 ? "4px" : "0" }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {dailyViews.map((day) => (
              <div key={day.date} className="flex-1 text-center">
                <span className="text-[10px] text-muted-foreground">
                  {day.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Photos */}
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

async function getDailyViews(days: number): Promise<{ date: string; pv: number }[]> {
  const now = new Date();
  const results: { date: string; pv: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    results.push({
      date: dayStart.toISOString().slice(0, 10),
      pv: count,
    });
  }

  return results;
}
