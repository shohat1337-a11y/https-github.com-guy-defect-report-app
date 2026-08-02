import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  deleteFromDrive,
  isDriveConnected,
  uploadToDrive,
} from "./google-drive";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Only raster image types are accepted for user uploads. SVG is intentionally
 * excluded: an SVG can contain <script> and, when served from our own origin,
 * would run as a stored-XSS payload. (Seed demo images write SVG directly to
 * disk without going through this upload path, so they are trusted content.)
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB

/** Prefix marking an imagePath that lives in Google Drive (served via the proxy route). */
export const DRIVE_PATH_PREFIX = "/api/images/";

/**
 * Validates an uploaded file. Returns a Hebrew error message when invalid,
 * or null when the file is acceptable.
 */
export function validateUploadedImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "יש להעלות תמונה מסוג JPG, PNG או WEBP בלבד";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "התמונה גדולה מדי (מקסימום 15MB)";
  }
  return null;
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

/** Extracts the Drive file id from a stored imagePath, or null if it isn't a Drive path. */
export function driveFileIdFromPath(imagePath: string): string | null {
  if (!imagePath.startsWith(DRIVE_PATH_PREFIX)) return null;
  const id = imagePath.slice(DRIVE_PATH_PREFIX.length).split(/[/?#]/)[0];
  return id || null;
}

/**
 * Saves an uploaded image and returns a path stored on the defect record.
 *
 * When Google Drive is connected the bytes go to Drive and we return a proxy
 * path (`/api/images/{fileId}`) so the rest of the app - cards, print page,
 * PDF - keeps working through same-origin URLs. Without Drive configured we
 * fall back to local disk under public/uploads (the original MVP behavior),
 * so the app still runs before the one-time Google connection is done.
 */
export async function saveImage(reportId: number, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isDriveConnected()) {
    const filename = `report-${reportId}-${randomUUID()}.${extensionFromMimeType(file.type)}`;
    const fileId = await uploadToDrive(buffer, filename, file.type);
    return `${DRIVE_PATH_PREFIX}${fileId}`;
  }

  const dir = path.join(UPLOADS_ROOT, String(reportId));
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${extensionFromMimeType(file.type)}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${reportId}/${filename}`;
}

/**
 * Deletes a previously saved image. Handles both storage backends by inspecting
 * the stored path, so old local images and new Drive images both clean up
 * correctly (e.g. when a defect or report is deleted).
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const driveId = driveFileIdFromPath(imagePath);
  if (driveId) {
    await deleteFromDrive(driveId);
    return;
  }

  if (!imagePath.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", imagePath);
  try {
    await unlink(filePath);
  } catch {
    // file may already be gone - not fatal
  }
}
