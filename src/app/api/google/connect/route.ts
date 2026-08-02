import { NextResponse } from "next/server";
import { GOOGLE_SCOPES, getOAuthClient } from "@/lib/google-drive";

/**
 * Starts the one-time Google consent flow. Visit /api/google/connect in the
 * browser once; Google asks you to approve access, then redirects back to the
 * callback which prints the refresh token to save in .env.
 *
 * access_type=offline + prompt=consent guarantees Google returns a refresh
 * token (it otherwise omits it on repeat authorizations).
 */
export async function GET() {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
  });
  return NextResponse.redirect(url);
}
