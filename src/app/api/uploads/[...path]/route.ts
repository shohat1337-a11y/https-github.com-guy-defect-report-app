import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOADS_PATH_PREFIX, uploadsDiskPath } from "@/lib/storage";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Serves an uploaded image from UPLOADS_DIR (the persistent volume in
 * production). Defects store the path `/api/uploads/{reportId}/{filename}`;
 * this route resolves and streams it. Path traversal is blocked.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  if (
    !segments ||
    segments.length === 0 ||
    segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))
  ) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const disk = uploadsDiskPath(`${UPLOADS_PATH_PREFIX}${segments.join("/")}`);
  if (!disk) return new NextResponse("Not found", { status: 404 });

  try {
    const buffer = await readFile(disk);
    const ext = path.extname(disk).toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_BY_EXT[ext] ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
