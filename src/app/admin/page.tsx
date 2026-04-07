import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images, FolderOpen } from "lucide-react";

export default async function AdminDashboard() {
  const [photoCount, categoryCount] = await Promise.all([
    prisma.photo.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );
}
