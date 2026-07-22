import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { inlineImage } from "@/lib/inlineImage";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr>
      <td className="pdf-label">{label}</td>
      <td className="pdf-value">{value}</td>
    </tr>
  );
}

export default async function PrintReportPage({
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

  const defectsWithImages = await Promise.all(
    report.defects.map(async (d) => ({
      ...d,
      imageData: await inlineImage(d.imagePath),
    }))
  );

  return (
    <div className="pdf-root" dir="rtl">
      {/* Cover */}
      <section className="pdf-cover">
        <h1 className="pdf-title">דוח ליקויים</h1>
        <div className="pdf-cover-meta">
          <table className="pdf-table">
            <tbody>
              <Row label="מספר דוח" value={String(report.id)} />
              <Row label="שם הפרויקט" value={report.projectName} />
              <Row label="כותרת הדוח" value={report.title} />
              <Row label="אזור / קומה" value={report.area} />
              <Row label="תאריך" value={formatDate(report.date)} />
              <Row label="קבלן / נמען" value={report.recipient} />
              <Row label="מבצע הסיור" value={report.inspector} />
              <Row label="מספר ליקויים" value={String(report.defects.length)} />
              <Row label="הערות כלליות" value={report.generalNotes} />
            </tbody>
          </table>
        </div>
      </section>

      {/* Defects */}
      {defectsWithImages.map((d) => (
        <section key={d.id} className="pdf-defect">
          <div className="pdf-defect-head">ליקוי מספר {d.defectNumber}</div>
          {d.imageData && (
            <div className="pdf-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.imageData} alt={`ליקוי ${d.defectNumber}`} className="pdf-image" />
            </div>
          )}
          <table className="pdf-table">
            <tbody>
              <Row label="מיקום" value={d.location} />
              <Row label="תחום עבודה" value={d.category} />
              <Row label="תיאור הליקוי" value={d.description} />
              <Row label="הפתרון הנדרש" value={d.requiredSolution} />
              <Row label="קבלן אחראי" value={d.contractor} />
              <Row label="רמת דחיפות" value={d.priority} />
              <Row label="תאריך יעד" value={d.dueDate ? formatDate(d.dueDate) : null} />
              <Row label="סטטוס" value={d.status} />
              <Row label="הערות" value={d.notes} />
            </tbody>
          </table>
        </section>
      ))}

      <style>{`
        @page {
          size: A4;
          margin: 22mm 12mm 16mm 12mm;
        }
        html, body {
          background: #ffffff !important;
        }
        .pdf-root {
          color: #111827;
          font-size: 13px;
          line-height: 1.6;
        }
        .pdf-cover {
          page-break-after: always;
          padding-top: 20mm;
        }
        .pdf-title {
          text-align: center;
          font-size: 30px;
          font-weight: 800;
          color: #16304f;
          margin-bottom: 14mm;
          border-bottom: 3px solid #16304f;
          padding-bottom: 6mm;
        }
        .pdf-cover-meta {
          max-width: 150mm;
          margin: 0 auto;
        }
        .pdf-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pdf-table td {
          border: 1px solid #d1d5db;
          padding: 7px 10px;
          vertical-align: top;
          text-align: right;
        }
        .pdf-label {
          background: #eef4fb;
          font-weight: 700;
          color: #16304f;
          width: 34mm;
          white-space: nowrap;
        }
        .pdf-value {
          white-space: pre-wrap;
          word-break: break-word;
        }
        .pdf-defect {
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 10mm;
          padding-top: 4mm;
        }
        .pdf-defect-head {
          background: #16304f;
          color: #ffffff;
          font-weight: 800;
          font-size: 15px;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 4mm;
        }
        .pdf-image-wrap {
          text-align: center;
          margin-bottom: 4mm;
        }
        .pdf-image {
          max-width: 100%;
          max-height: 105mm;
          object-fit: contain;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
