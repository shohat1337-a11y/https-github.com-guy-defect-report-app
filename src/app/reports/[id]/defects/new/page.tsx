import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import DefectForm from "@/components/DefectForm";

export const dynamic = "force-dynamic";

export default async function NewDefectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const reportId = Number(idParam);
  if (!Number.isInteger(reportId)) notFound();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { _count: { select: { defects: true } } },
  });
  if (!report) notFound();

  const nextNumber = report._count.defects + 1;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <PageHeader title={`ליקוי מספר ${nextNumber}`} subtitle={report.title} backHref={`/reports/${reportId}`} />
      <DefectForm mode="create" reportId={reportId} defectNumber={nextNumber} />
    </div>
  );
}
