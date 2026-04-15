-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "ua" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileHash" TEXT,
    "camera" TEXT,
    "lens" TEXT,
    "aperture" TEXT,
    "shutter" TEXT,
    "iso" TEXT,
    "tags" TEXT,
    "categoryId" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "photos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_photos" ("aperture", "camera", "categoryId", "createdAt", "description", "fileHash", "id", "imageUrl", "isPublic", "iso", "lens", "shutter", "sort", "tags", "thumbnailUrl", "title", "updatedAt") SELECT "aperture", "camera", "categoryId", "createdAt", "description", "fileHash", "id", "imageUrl", "isPublic", "iso", "lens", "shutter", "sort", "tags", "thumbnailUrl", "title", "updatedAt" FROM "photos";
DROP TABLE "photos";
ALTER TABLE "new_photos" RENAME TO "photos";
CREATE UNIQUE INDEX "photos_fileHash_key" ON "photos"("fileHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
