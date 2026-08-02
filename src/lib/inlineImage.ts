import { readFile } from "fs/promises";
import path from "path";
import { downloadFromDrive } from "./google-drive";
import { driveFileIdFromPath } from "./storage";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Turns a stored image path into a base64 data URI for the print page, so the
 * PDF renderer never depends on network image loads. Handles both storage
 * backends: Google Drive files (path `/api/images/{fileId}`) are downloaded
 * from Drive; legacy local files are read from public/.
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

  try {
    const filePath = path.join(process.cwd(), "public", imagePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return "";
  }
}
