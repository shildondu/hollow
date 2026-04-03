import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { photos: { where: { isPublic: true } } },
      },
    },
    orderBy: { sort: "asc" },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <h1 className="text-3xl font-medium mb-10">Collections</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: typeof categories[number]) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block"
            >
              <div className="rounded-xl border border-border/50 bg-card/50 p-8 transition-all duration-300 hover:border-border hover:bg-card">
                <h2 className="text-xl font-medium">{category.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {category._count.photos} {category._count.photos === 1 ? 'photo' : 'photos'}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {categories.length === 0 && (
          <div className="text-center py-32 text-muted-foreground">
            <p className="text-lg">No collections yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
