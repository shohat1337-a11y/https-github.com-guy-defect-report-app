import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImage, validateUploadedImage } from "@/lib/storage";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const reportId = parseId(idParam);
  if (reportId === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const defects = await prisma.defect.findMany({
    where: { reportId },
    orderBy: { defectNumber: "asc" },
  });
  return NextResponse.json(defects);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const reportId = parseId(idParam);
  if (reportId === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "הדוח לא נמצא" }, { status: 404 });

  const form = await req.formData();
  const image = form.get("image");
  const description = String(form.get("description") ?? "").trim();
  const requiredSolution = String(form.get("requiredSolution") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "יש לצרף תמונת ליקוי" }, { status: 400 });
  }
  const imageError = validateUploadedImage(image);
  if (imageError) {
    return NextResponse.json({ error: imageError }, { status: 400 });
  }
  if (!description || !requiredSolution || !category) {
    return NextResponse.json(
      { error: "תיאור, פתרון נדרש ותחום עבודה הם שדות חובה" },
      { status: 400 }
    );
  }

  const imagePath = await saveImage(reportId, image);

  const count = await prisma.defect.count({ where: { reportId } });
  const dueDateRaw = String(form.get("dueDate") ?? "").trim();

  const defect = await prisma.defect.create({
    data: {
      reportId,
      defectNumber: count + 1,
      imagePath,
      location: String(form.get("location") ?? "").trim() || null,
      description,
      requiredSolution,
      category,
      contractor: String(form.get("contractor") ?? "").trim() || null,
      priority: String(form.get("priority") ?? "רגיל"),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      status: String(form.get("status") ?? "פתוח"),
      notes: String(form.get("notes") ?? "").trim() || null,
    },
  });

  return NextResponse.json(defect, { status: 201 });
}
