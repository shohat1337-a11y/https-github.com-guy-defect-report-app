import { NextResponse } from "next/server";
import { downloadFromDrive } from "@/lib/google-drive";

/**
 * Streams a Google Drive image back to the browser through our own origin.
 * Defect cards store the path `/api/images/{fileId}`; this route resolves it
 * so the client never talks to Drive directly and no Drive URL is exposed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  try {
    const { buffer, mimeType } = await downloadFromDrive(fileId);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        // Drive file ids are immutable, so the bytes can be cached hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Image not found", { status: 404 });
  }
}
