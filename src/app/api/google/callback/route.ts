import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/google-drive";

/**
 * OAuth callback for the one-time connect flow. Exchanges the code Google sent
 * for tokens and shows the refresh token so it can be pasted into .env as
 * GOOGLE_REFRESH_TOKEN. After that the app is connected for good and this
 * route is never needed again.
 *
 * The token is shown only on the local machine running the dev server; it is
 * never emailed, logged remotely, or sent anywhere.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return htmlResponse(
      "שגיאה: לא התקבל קוד הרשאה מגוגל. נסו שוב מ- /api/google/connect",
      500,
    );
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return htmlResponse(
        "לא התקבל refresh token. בטלו את הגישה של האפליקציה בחשבון Google ונסו שוב דרך /api/google/connect (חובה שיופיע מסך האישור).",
        500,
      );
    }

    return htmlResponse(
      `
        <h1>Google Drive מחובר! ✅</h1>
        <p>העתיקו את השורה הבאה אל קובץ <code>.env</code> (ואז הפעילו מחדש את השרת):</p>
        <pre dir="ltr">GOOGLE_REFRESH_TOKEN="${refreshToken}"</pre>
        <p>לאחר ההפעלה מחדש, כל תמונה חדשה שתעלו תישמר ישירות ב-Google Drive.</p>
      `,
      200,
    );
  } catch {
    return htmlResponse(
      "שגיאה בהחלפת הקוד מול Google. ודאו ש-GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET נכונים ושכתובת ה-redirect רשומה במסוף Google Cloud.",
      500,
    );
  }
}

function htmlResponse(bodyHtml: string, status: number) {
  return new NextResponse(
    `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <title>חיבור Google Drive</title>
     <style>
       body{font-family:system-ui,Arial,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;line-height:1.7}
       pre{background:#f4f4f5;padding:14px;border-radius:8px;overflow:auto;user-select:all}
       code{background:#f4f4f5;padding:2px 6px;border-radius:4px}
     </style></head><body>${bodyHtml}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
