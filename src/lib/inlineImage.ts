import { readFile } from "fs/promises";
import path from "path";
import { downloadFromDrive } from "./google-drive";
import { driveFileIdFromPath, uploadsDiskPath } from "./storage";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Turns a stored image path into a base64 data URI for the print page, so the
 * PDF renderer never depends on network image loads. Handles all backends:
 * Google Drive files are downloaded; file-backed images (current uploads under
 * UPLOADS_DIR, or legacy public/ files) are read from disk.
 */
export async function inlineImage(imagePath: string): Promise<string> {
  const driveId = driveFileIdFromPath(imagePath);
  if (driveId) {
    try {
      const { buffer, mimeType } = await downloadFromDrive(driveId);
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    } catch {
      return "";
    }
  }

  const disk = uploadsDiskPath(imagePath);
  if (!disk) return "";
  try {
    const buffer = await readFile(disk);
    const ext = path.extname(disk).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return "";
  }
}
