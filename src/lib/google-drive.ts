import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Google Drive integration for image storage.
 *
 * Auth model: a single Google account (personal Gmail) connected once via OAuth.
 * The one-time consent flow (see /api/google/connect + /api/google/callback)
 * produces a long-lived refresh token that we store in the environment. From
 * then on the app mints short-lived access tokens silently — the user never
 * has to log in again.
 *
 * Scope: drive.file — the app can only see and manage files it created itself,
 * not the user's whole Drive. Least privilege.
 */

export const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * Redirect URI must exactly match one registered on the OAuth client in the
 * Google Cloud Console. We use the local dev origin for the one-time connect.
 */
export function getRedirectUri(): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return `${base}/api/google/callback`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `חסר משתנה סביבה ${name}. יש להשלים את חיבור Google Drive (ראו README).`,
    );
  }
  return value;
}

/**
 * Builds an OAuth2 client from the configured client id/secret. When a refresh
 * token is present it is attached, so callers get authenticated Drive access.
 * Used both for the initial consent flow and for every upload/download after.
 */
export function getOAuthClient() {
  const client = new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
    getRedirectUri(),
  );

  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken });
  }
  return client;
}

/** True once the app has been connected to a Google account (refresh token present). */
export function isDriveConnected(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
}

function getDrive() {
  return google.drive({ version: "v3", auth: getOAuthClient() });
}

/**
 * Uploads a buffer to the configured Drive folder and returns the new file id.
 * The folder is set via GOOGLE_DRIVE_FOLDER_ID; when absent the file lands in
 * the account's Drive root.
 */
export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const id = res.data.id;
  if (!id) {
    throw new Error("Google Drive לא החזיר מזהה קובץ לאחר ההעלאה");
  }
  return id;
}

/** Streams a Drive file's bytes back as a Buffer, plus its mime type. */
export async function downloadFromDrive(
  fileId: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const drive = getDrive();

  const meta = await drive.files.get({ fileId, fields: "mimeType" });
  const mimeType = meta.data.mimeType ?? "image/jpeg";

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );

  return { buffer: Buffer.from(res.data as ArrayBuffer), mimeType };
}

/** Permanently deletes a Drive file. Missing files are treated as success. */
export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getDrive();
  try {
    await drive.files.delete({ fileId });
  } catch {
    // already gone, or no longer accessible - not fatal
  }
}
