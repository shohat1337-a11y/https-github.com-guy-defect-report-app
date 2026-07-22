import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import DefectCard from "@/components/DefectCard";
import FinishReportButton from "@/components/FinishReportButton";
import { ReportStatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 font-semibold text-slate-500">{label}:</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const reportId = Number(idParam);
  if (!Number.isInteger(reportId)) notFound();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { defects: { orderBy: { defectNumber: "asc" } } },
  });
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-6">
      <PageHeader title={`דוח מספר ${report.id}`} backHref="/" />

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
            <p className="text-base text-slate-700">{report.projectName}</p>
          </div>
          <ReportStatusBadge status={report.status} />
        </div>
        <div className="space-y-1">
          <DetailRow label="תאריך" value={formatDate(report.date)} />
          <DetailRow label="אזור / קומה" value={report.area} />
          <DetailRow label="קבלן / נמען" value={report.recipient} />
          <DetailRow label="מבצע הסיור" value={report.inspector} />
          <DetailRow label="הערות כלליות" value={report.generalNotes} />
        </div>
        <Link
          href={`/reports/${report.id}/edit`}
          className="mt-3 inline-block text-sm font-semibold text-brand-700 underline"
        >
          עריכת פרטי הדוח
        </Link>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          ליקויים ({report.defects.length})
        </h3>
      </div>

      {report.defects.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          עדיין לא נוספו ליקויים. לחצו על &quot;הוספת ליקוי&quot; כדי להתחיל.
        </div>
      ) : (
        <div className="space-y-3">
          {report.defects.map((d) => (
            <DefectCard
              key={d.id}
              defect={{
                id: d.id,
                reportId: report.id,
                defectNumber: d.defectNumber,
                imagePath: d.imagePath,
                location: d.location,
                description: d.description,
                category: d.category,
                priority: d.priority,
                status: d.status,
                dueDate: d.dueDate ? d.dueDate.toISOString() : null,
              }}
            />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          <Link
            href={`/reports/${report.id}/defects/new`}
            className="block rounded-2xl bg-brand-600 py-4 text-center text-lg font-bold text-white shadow-md active:bg-brand-700"
          >
            + הוספת ליקוי
          </Link>
          <FinishReportButton reportId={report.id} status={report.status} />
        </div>
      </div>
    </div>
  );
}
