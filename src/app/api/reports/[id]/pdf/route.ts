import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReportPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const reportId = Number(idParam);
  if (!Number.isInteger(reportId) || reportId <= 0) {
    return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "הדוח לא נמצא" }, { status: 404 });

  const origin = req.nextUrl.origin;
  const printUrl = `${origin}/reports/${reportId}/print`;

  try {
    const pdf = await generateReportPdf({
      printUrl,
      projectName: report.projectName,
      reportId: report.id,
    });

    const filename = `defect-report-${report.id}.pdf`;
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
          `דוח-ליקויים-${report.id}.pdf`
        )}`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "הפקת ה-PDF נכשלה" }, { status: 500 });
  }
}
