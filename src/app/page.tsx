import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;

  const photos = await prisma.photo.findMany({
    where: { isPublic: true },
    include: { category: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  // Filter by search query (title, description, tags)
  let result = photos;
  if (q && q.trim()) {
    const searchLower = q.trim().toLowerCase();
    result = photos.filter((photo) => {
      if (photo.title.toLowerCase().includes(searchLower)) return true;
      if (photo.description?.toLowerCase().includes(searchLower)) return true;
      if (photo.tags) {
        try {
          const tags: string[] = JSON.parse(photo.tags);
          if (tags.some((tag) => tag.toLowerCase().includes(searchLower))) return true;
        } catch {
          // ignore
        }
      }
      return false;
    });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        {q && (
          <p className="text-muted-foreground mb-6">
            {result.length} result{result.length !== 1 ? "s" : ""} for "{q}"
          </p>
        )}
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {result.map((photo) => (
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
                    {photo.category && (
                      <span className="text-sm text-white/60 mt-1 block">
                        {photo.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {result.length === 0 && (
          <div className="text-center py-32 text-muted-foreground">
            <p className="text-lg">
              {q ? `No photos found for "${q}"` : "No photos yet"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
