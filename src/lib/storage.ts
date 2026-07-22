import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/svg+xml") return "svg";
  return "jpg";
}

/**
 * Local filesystem storage driver for MVP. To move to Supabase Storage later,
 * replace the body of saveImage/deleteImage with Supabase Storage calls and
 * keep returning/consuming a public URL string - callers don't need to change.
 */
export async function saveImage(reportId: number, file: File): Promise<string> {
  const dir = path.join(UPLOADS_ROOT, String(reportId));
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${extensionFromMimeType(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${reportId}/${filename}`;
}

export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", imagePath);
  try {
    await unlink(filePath);
  } catch {
    // file may already be gone - not fatal
  }
}
