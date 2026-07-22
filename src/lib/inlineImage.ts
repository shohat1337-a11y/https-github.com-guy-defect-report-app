import { readFile } from "fs/promises";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Reads an uploaded image from public/ and returns it as a base64 data URI.
 * Used by the print page so the PDF renderer never depends on network image loads.
 */
export async function inlineImage(imagePath: string): Promise<string> {
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
