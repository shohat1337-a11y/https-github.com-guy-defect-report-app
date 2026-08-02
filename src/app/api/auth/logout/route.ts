import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/** Clears the auth cookie and returns to the login screen. */
export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
