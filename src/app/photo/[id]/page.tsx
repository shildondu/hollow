import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!photo || !photo.isPublic) {
    notFound();
  }

  // Get previous and next photos
  const [prevPhoto, nextPhoto] = await Promise.all([
    prisma.photo.findFirst({
      where: {
        isPublic: true,
        OR: [
          { sort: { lt: photo.sort } },
          { sort: photo.sort, createdAt: { gt: photo.createdAt } },
        ],
      },
      orderBy: [{ sort: "desc" }, { createdAt: "asc" }],
      select: { id: true, title: true },
    }),
    prisma.photo.findFirst({
      where: {
        isPublic: true,
        OR: [
          { sort: { gt: photo.sort } },
          { sort: photo.sort, createdAt: { lt: photo.createdAt } },
        ],
      },
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      select: { id: true, title: true },
    }),
  ]);

  const tags = photo.tags ? JSON.parse(photo.tags) : [];
  const exifInfo = [
    photo.camera && { label: "Camera", value: photo.camera },
    photo.lens && { label: "Lens", value: photo.lens },
    photo.aperture && { label: "Aperture", value: `f/${photo.aperture}` },
    photo.shutter && { label: "Shutter", value: photo.shutter },
    photo.iso && { label: "ISO", value: photo.iso },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex min-h-0">
        {/* Image area - fills available space */}
        <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
          {/* Navigation arrows */}
          {prevPhoto && (
            <Link
              href={`/photo/${prevPhoto.id}`}
              className="absolute left-4 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
              title={prevPhoto.title}
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
          )}
          {nextPhoto && (
            <Link
              href={`/photo/${nextPhoto.id}`}
              className="absolute right-4 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
              title={nextPhoto.title}
            >
              <ChevronRight className="h-6 w-6" />
            </Link>
          )}

          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Info panel - scrollable on the right */}
        <aside className="w-full lg:w-80 xl:w-96 border-l border-border/50 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-medium">{photo.title}</h1>
            {photo.category && (
              <Link
                href={`/category/${photo.category.slug}`}
                className="text-muted-foreground hover:text-foreground transition-colors mt-2 block"
              >
                {photo.category.name}
              </Link>
            )}
          </div>

          {photo.description && (
            <p className="text-muted-foreground leading-relaxed">{photo.description}</p>
          )}

          {exifInfo.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Technical Details</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {exifInfo.map((item, index) => (
                  <div key={index}>
                    <span className="text-muted-foreground text-xs block mb-1">
                      {item.label}
                    </span>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full border border-border/50 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
