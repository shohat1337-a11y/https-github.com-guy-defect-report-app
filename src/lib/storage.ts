import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  deleteFromDrive,
  isDriveConnected,
  uploadToDrive,
} from "./google-drive";

/**
 * Only raster image types are accepted for user uploads. SVG is intentionally
 * excluded: an SVG can contain <script> and, when served from our own origin,
 * would run as a stored-XSS payload. (Seed demo images write SVG directly to
 * disk without going through this upload path, so they are trusted content.)
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB

/** Prefix for a Drive-backed image (served via /api/images). */
export const DRIVE_PATH_PREFIX = "/api/images/";
/** Prefix for a file-backed image served via /api/uploads (from UPLOADS_DIR). */
export const UPLOADS_PATH_PREFIX = "/api/uploads/";

/**
 * Where uploaded images live on disk. In production (Railway) this is set to a
 * folder on the persistent volume, e.g. UPLOADS_DIR=/data/uploads, so images
 * survive redeploys. Locally it defaults to public/uploads.
 */
export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");
}

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

/** Extracts the Drive file id from a stored imagePath, or null if not a Drive path. */
export function driveFileIdFromPath(imagePath: string): string | null {
  if (!imagePath.startsWith(DRIVE_PATH_PREFIX)) return null;
  const id = imagePath.slice(DRIVE_PATH_PREFIX.length).split(/[/?#]/)[0];
  return id || null;
}

/**
 * Resolves a stored imagePath to a disk path for file-backed images, or null
 * for Drive-backed ones. Handles both the current `/api/uploads/...` scheme
 * (served from UPLOADS_DIR) and legacy `/uploads/...` paths (under public/).
 */
export function uploadsDiskPath(imagePath: string): string | null {
  if (imagePath.startsWith(UPLOADS_PATH_PREFIX)) {
    const rel = imagePath.slice(UPLOADS_PATH_PREFIX.length);
    if (rel.includes("..")) return null;
    return path.join(getUploadsDir(), rel);
  }
  if (imagePath.startsWith("/uploads/")) {
    if (imagePath.includes("..")) return null;
    return path.join(process.cwd(), "public", imagePath);
  }
  return null;
}

/**
 * Saves an uploaded image and returns the path stored on the defect record.
 *
 * With Google Drive connected the bytes go to Drive (`/api/images/{fileId}`).
 * Otherwise they are written under UPLOADS_DIR - on Railway that's the
 * persistent volume, so images survive redeploys - and served back through the
 * `/api/uploads/...` route. Callers just store and render the returned string.
 */
export async function saveImage(reportId: number, file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isDriveConnected()) {
    const filename = `report-${reportId}-${randomUUID()}.${extensionFromMimeType(file.type)}`;
    const fileId = await uploadToDrive(buffer, filename, file.type);
    return `${DRIVE_PATH_PREFIX}${fileId}`;
  }

  const dir = path.join(getUploadsDir(), String(reportId));
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${extensionFromMimeType(file.type)}`;
  await writeFile(path.join(dir, filename), buffer);
  return `${UPLOADS_PATH_PREFIX}${reportId}/${filename}`;
}

/**
 * Deletes a previously saved image, handling all storage backends by inspecting
 * the stored path: Drive files, current file uploads, and legacy public/ files.
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const driveId = driveFileIdFromPath(imagePath);
  if (driveId) {
    await deleteFromDrive(driveId);
    return;
  }

  const disk = uploadsDiskPath(imagePath);
  if (!disk) return;
  try {
    await unlink(disk);
  } catch {
    // file may already be gone - not fatal
  }
}
