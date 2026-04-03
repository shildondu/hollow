import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      photos: {
        where: { isPublic: true },
        orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="mb-10">
          <Link
            href="/categories"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Collections
          </Link>
          <h1 className="text-4xl font-medium mt-4">{category.name}</h1>
          <p className="text-muted-foreground mt-2">
            {category.photos.length} {category.photos.length === 1 ? 'photo' : 'photos'}
          </p>
        </div>
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {category.photos.map((photo: typeof category.photos[number]) => (
            <Link
              key={photo.id}
              href={`/photo/${photo.id}`}
              className="group mb-6 block break-inside-avoid"
            >
              <div className="photo-card rounded-xl overflow-hidden bg-card">
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="font-medium text-white text-lg">{photo.title}</h2>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {category.photos.length === 0 && (
          <div className="text-center py-32 text-muted-foreground">
            <p className="text-lg">No photos in this collection</p>
          </div>
        )}
      </main>
    </div>
  );
}
