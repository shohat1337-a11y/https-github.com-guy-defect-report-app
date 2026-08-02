/**
 * Minimal single-password auth for the app.
 *
 * There are no user accounts: one shared password (APP_PASSWORD) gates the
 * whole app. On login we set an httpOnly cookie whose value is an HMAC of a
 * fixed string keyed by AUTH_SECRET - so the cookie can be verified without a
 * session store, and can't be forged without the secret. The plaintext
 * password is never stored in the cookie.
 *
 * Implemented with Web Crypto (crypto.subtle) so the exact same code runs in
 * the Edge middleware and in Node route handlers.
 */

export const AUTH_COOKIE = "dr_auth";

const encoder = new TextEncoder();

/** Derives the deterministic cookie token from the secret. */
export async function computeAuthToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("defect-report-authorized-v1"),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * True when password protection is switched on (both env vars set). When off -
 * e.g. local development - the middleware lets everything through so the app
 * stays convenient to run locally.
 */
export function isAuthEnabled(): boolean {
  return Boolean(process.env.APP_PASSWORD && process.env.AUTH_SECRET);
}
