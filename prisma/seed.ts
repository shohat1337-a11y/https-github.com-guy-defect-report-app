import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Valid SVG placeholders so sample defects show a real image in the app and PDF.
// (Real usage uploads photos as jpg/png/webp; SVG is only used for seed demo data.)
function placeholderSvg(label: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${color}"/>
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="16 12"/>
  <text x="400" y="290" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">תמונת ליקוי לדוגמה</text>
  <text x="400" y="360" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle">${label}</text>
</svg>`;
}

async function ensurePlaceholderImage(
  reportId: number,
  filename: string,
  label: string,
  color: string
) {
  const dir = path.join(process.cwd(), "public", "uploads", String(reportId));
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await writeFile(filePath, placeholderSvg(label, color), "utf-8");
  return `/uploads/${reportId}/${filename}`;
}

async function main() {
  const existing = await prisma.report.count();
  if (existing > 0) {
    console.log("Database already has reports - skipping seed.");
    return;
  }

  const report = await prisma.report.create({
    data: {
      projectName: "כלמוביל נשר",
      title: "דוח ליקויים - סיור דוגמה",
      date: new Date(),
      area: "קומה 3 - אגף צפוני",
      recipient: "חברת הבינוי בע\"מ",
      inspector: "ישראל ישראלי",
      generalNotes: "סיור לדוגמה שנוצר אוטומטית כדי להדגים את המערכת.",
      status: "draft",
    },
  });

  const defectsData = [
    {
      location: "מסדרון מזרחי, ליד חדר מדרגות",
      description: "סדק אורכי בקיר הגבס, לאורך כ-40 ס\"מ, סמוך לפינת התקרה.",
      requiredSolution: "תיקון הסדק, שפכטל, ליטוש וצביעה מחדש של האזור.",
      category: "גבס",
      contractor: "קבלן גבס - דוד כהן",
      priority: "רגיל",
      status: "פתוח",
      notes: "לתאם גישה עם השוכר בקומה.",
    },
    {
      location: "חדר מדרגות B, קומת קרקע",
      description: "אריח ריצוף סדוק וקצת שקוע ליד הכניסה לחדר המדרגות.",
      requiredSolution: "החלפת האריח הסדוק והידוק תשתית הריצוף מתחתיו.",
      category: "ריצוף",
      contractor: "קבלן ריצוף - א. לוי",
      priority: "דחוף",
      status: "בטיפול",
      notes: "",
    },
    {
      location: "לוח חשמל ראשי, קומה 3",
      description: "דלת לוח החשמל אינה נסגרת כראוי ואינה ננעלת.",
      requiredSolution: "החלפת צירי הדלת ומנגנון הנעילה של לוח החשמל.",
      category: "חשמל",
      contractor: "חשמלאי - מוטי גל",
      priority: "קריטי",
      status: "פתוח",
      notes: "סוגיית בטיחות - יש לטפל בהקדם האפשרי.",
    },
  ];

  const colors = ["#b45309", "#0f766e", "#b91c1c"];
  let defectNumber = 1;
  for (const d of defectsData) {
    const imagePath = await ensurePlaceholderImage(
      report.id,
      `seed-${defectNumber}.svg`,
      `${d.category} · ליקוי ${defectNumber}`,
      colors[(defectNumber - 1) % colors.length]
    );
    await prisma.defect.create({
      data: {
        reportId: report.id,
        defectNumber,
        imagePath,
        location: d.location,
        description: d.description,
        requiredSolution: d.requiredSolution,
        category: d.category,
        contractor: d.contractor,
        priority: d.priority,
        status: d.status,
        notes: d.notes,
      },
    });
    defectNumber++;
  }

  console.log(`Seed complete: report #${report.id} with ${defectsData.length} defects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
