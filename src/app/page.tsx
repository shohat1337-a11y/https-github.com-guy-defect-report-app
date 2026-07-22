import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReportCard from "@/components/ReportCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { defects: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-brand-800">דוחות ליקויים</h1>
        <p className="text-slate-600">ניהול והפקת דוחות סיור באתרי בנייה</p>
      </header>

      {reports.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="mb-2 text-lg font-semibold text-slate-700">אין עדיין דוחות</p>
          <p className="text-slate-500">לחצו על הכפתור למטה כדי לפתוח את הדוח הראשון.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={{
                id: r.id,
                projectName: r.projectName,
                title: r.title,
                date: r.date.toISOString(),
                status: r.status,
                defectCount: r._count.defects,
              }}
            />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/reports/new"
            className="block rounded-2xl bg-brand-600 py-4 text-center text-lg font-bold text-white shadow-md active:bg-brand-700"
          >
            + פתיחת דוח חדש
          </Link>
        </div>
      </div>
    </div>
  );
}
