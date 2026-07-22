import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import DefectForm from "@/components/DefectForm";
import { toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EditDefectPage({
  params,
}: {
  params: Promise<{ id: string; defectId: string }>;
}) {
  const { id: idParam, defectId } = await params;
  const reportId = Number(idParam);
  if (!Number.isInteger(reportId)) notFound();

  const defect = await prisma.defect.findUnique({ where: { id: defectId } });
  if (!defect || defect.reportId !== reportId) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <PageHeader title={`עריכת ליקוי מספר ${defect.defectNumber}`} backHref={`/reports/${reportId}`} />
      <DefectForm
        mode="edit"
        reportId={reportId}
        defectNumber={defect.defectNumber}
        initial={{
          id: defect.id,
          imageUrl: defect.imagePath,
          location: defect.location ?? "",
          description: defect.description,
          requiredSolution: defect.requiredSolution,
          category: defect.category,
          contractor: defect.contractor ?? "",
          priority: defect.priority,
          dueDate: defect.dueDate ? toDateInputValue(defect.dueDate) : "",
          status: defect.status,
          notes: defect.notes ?? "",
        }}
      />
    </div>
  );
}
