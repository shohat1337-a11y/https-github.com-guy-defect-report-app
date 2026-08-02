import { NextResponse } from "next/server";
import { AUTH_COOKIE, computeAuthToken } from "@/lib/auth";

/** Verifies the submitted password and, on success, sets the auth cookie. */
export async function POST(request: Request) {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) {
    return NextResponse.json(
      { error: "הגנת סיסמה אינה מוגדרת בשרת" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || body.password !== password) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  const token = await computeAuthToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
