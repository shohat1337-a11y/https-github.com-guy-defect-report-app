# פריסה לענן (Railway) — מדריך

מטרה: להעלות את האפליקציה לאוויר כך שתהיה נגישה מהאייפון מכל מקום, עם סיסמה,
מסד נתונים קבוע, תמונות ב-Google Drive והפקת PDF תקינה.

התשתית כבר מוכנה בקוד:
- `Dockerfile` — מתקין Chromium + גופנים עבריים להפקת PDF.
- הגנת סיסמה (`proxy.ts` + מסך `/login`).
- SQLite נשמר על **Volume** קבוע (לא נמחק בין פריסות).
- תמונות עולות ל-Google Drive.

---

## שלב 1 — העלאת הקוד ל-GitHub

Railway מתחבר למאגר GitHub. (אם אין לך חשבון GitHub, פותחים ב-github.com — חינם.)

1. צור מאגר (repository) חדש **פרטי** ב-GitHub, למשל `defect-report-app`.
2. בתיקיית הפרויקט, דחוף את הקוד:
   ```bash
   git add .
   git commit -m "Deploy: auth + Google Drive + Railway config"
   git branch -M main
   git remote add origin https://github.com/<המשתמש-שלך>/defect-report-app.git
   git push -u origin main
   ```

> ה-`.env` **לא** נדחף (הוא ב-.gitignore) — הסודות נכניס ישירות ב-Railway.

## שלב 2 — יצירת פרויקט ב-Railway

1. היכנס ל-[railway.app](https://railway.app) והתחבר עם GitHub.
2. **New Project → Deploy from GitHub repo** → בחר את המאגר.
3. Railway יזהה את ה-`Dockerfile` אוטומטית ויתחיל לבנות.

## שלב 3 — הוספת Volume (מסד הנתונים הקבוע)

1. בפרויקט: **New → Volume** (או בהגדרות השירות → Volumes).
2. **Mount path:** `/data`
3. זה המקום שבו יישמר קובץ מסד הנתונים, כך שהדוחות נשמרים בין פריסות.

## שלב 4 — הגדרת משתני סביבה (Variables)

בשירות → לשונית **Variables**, הוסף:

| משתנה | ערך |
|-------|-----|
| `DATABASE_URL` | `file:/data/prod.db` |
| `APP_PASSWORD` | הסיסמה שתבחר לכניסה לאפליקציה |
| `AUTH_SECRET` | `5fb690b0aaf5d5e94e4b7a8a1507bc2ee9f83e4373149eb2bdac2837ccb5554a` |
| `GOOGLE_CLIENT_ID` | מתוך Google Cloud (כמו מקומית) |
| `GOOGLE_CLIENT_SECRET` | מתוך Google Cloud |
| `GOOGLE_DRIVE_FOLDER_ID` | (רשות) תיקיית היעד בדרייב |
| `APP_BASE_URL` | כתובת האפליקציה בענן (שלב 5) |

> את `GOOGLE_REFRESH_TOKEN` נוסיף בשלב 6, אחרי החיבור מהכתובת בענן.

## שלב 5 — כתובת ציבורית

1. בשירות → **Settings → Networking → Generate Domain**.
2. תקבל כתובת כמו `https://defect-report-app-production.up.railway.app`.
3. הכנס אותה למשתנה `APP_BASE_URL` (שלב 4).

## שלב 6 — חיבור Google Drive מהכתובת בענן

1. ב-[Google Cloud Console](https://console.cloud.google.com) → Credentials → ה-OAuth client →
   תחת **Authorized redirect URIs** הוסף:
   `https://<הכתובת-שלך>.up.railway.app/api/google/callback`
2. גש בדפדפן אל `https://<הכתובת-שלך>.up.railway.app/api/google/connect`,
   אשר את הגישה, והעתק את ה-`GOOGLE_REFRESH_TOKEN` שיוצג.
3. הוסף אותו כמשתנה סביבה ב-Railway. Railway יפרוס מחדש אוטומטית.

## שלב 7 — הוספה למסך הבית באייפון

1. פתח בספארי את כתובת האפליקציה, התחבר עם הסיסמה.
2. כפתור שיתוף → **הוספה למסך הבית** — יופיע אייקון כמו אפליקציה.

---

## סיכום משתני הסביבה בענן

```
DATABASE_URL=file:/data/prod.db
APP_PASSWORD=<סיסמה חזקה שתבחר>
AUTH_SECRET=5fb690b0aaf5d5e94e4b7a8a1507bc2ee9f83e4373149eb2bdac2837ccb5554a
GOOGLE_CLIENT_ID=<...>
GOOGLE_CLIENT_SECRET=<...>
GOOGLE_REFRESH_TOKEN=<מתקבל בשלב 6>
GOOGLE_DRIVE_FOLDER_ID=<רשות>
APP_BASE_URL=https://<הכתובת-שלך>.up.railway.app
```

> `PUPPETEER_EXECUTABLE_PATH` כבר מוגדר בתוך ה-Dockerfile — אין צורך להוסיף ידנית.
