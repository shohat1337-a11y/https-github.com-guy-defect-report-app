import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, computeAuthToken } from "@/lib/auth";

/** Paths reachable without being logged in. */
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

/**
 * Gates every route behind the single app password once APP_PASSWORD and
 * AUTH_SECRET are configured. Unauthenticated page requests are redirected to
 * /login; API requests get a 401. When the env vars are absent (local dev),
 * the app is left open.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) {
    return NextResponse.next(); // protection off (e.g. local dev)
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = await computeAuthToken(secret);
  if (cookie && cookie === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except Next internals and common static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)"],
};
