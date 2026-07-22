import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) notFound();

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <PageHeader title={`עריכת דוח מספר ${report.id}`} backHref={`/reports/${report.id}`} />
      <ReportForm
        mode="edit"
        initial={{
          id: report.id,
          projectName: report.projectName,
          title: report.title,
          date: toDateInputValue(report.date),
          area: report.area ?? "",
          recipient: report.recipient ?? "",
          inspector: report.inspector ?? "",
          generalNotes: report.generalNotes ?? "",
        }}
      />
    </div>
  );
}
