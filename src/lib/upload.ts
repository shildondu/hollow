import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

const THUMBNAIL_WIDTH = 800;
const THUMBNAIL_QUALITY = 80;

// Calculate SHA256 hash from file
export async function calculateFileHash(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

interface UploadResult {
  url: string;
  thumbnailUrl: string;
  fileHash: string;
}

export async function saveFile(file: File, skipHashCalculation = false): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Validate extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
    throw new Error("File extension is not allowed");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Calculate file hash for deduplication
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).slice(2);
  const filename = `${timestamp}-${randomStr}.${ext}`;
  const thumbFilename = `${timestamp}-${randomStr}-thumb.${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  const thumbFilepath = path.join(uploadDir, thumbFilename);

  // Save original file (no processing - preserve exact bytes)
  await writeFile(filepath, buffer);

  // Generate thumbnail (skip for SVG - vector graphics don't need resizing)
  if (ext !== "svg") {
    await sharp(buffer)
      .rotate()
      .resize(THUMBNAIL_WIDTH, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .png({ quality: THUMBNAIL_QUALITY })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(thumbFilepath);
  } else {
    // For SVG, just copy the file as thumbnail
    await writeFile(thumbFilepath, buffer);
  }

  return {
    url: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/${thumbFilename}`,
    fileHash,
  };
}
