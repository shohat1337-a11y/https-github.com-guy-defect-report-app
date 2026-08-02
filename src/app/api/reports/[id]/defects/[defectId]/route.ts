import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveImage, deleteImage, validateUploadedImage } from "@/lib/storage";

function parseNum(v: string): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; defectId: string }> }
) {
  const { id: idParam, defectId } = await params;
  const reportId = parseNum(idParam);
  if (reportId === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const existing = await prisma.defect.findUnique({ where: { id: defectId } });
  if (!existing || existing.reportId !== reportId) {
    return NextResponse.json({ error: "הליקוי לא נמצא" }, { status: 404 });
  }

  const form = await req.formData();
  const data: Record<string, unknown> = {};

  const description = form.get("description");
  if (description !== null) {
    const v = String(description).trim();
    if (!v) return NextResponse.json({ error: "תיאור הליקוי הוא שדה חובה" }, { status: 400 });
    data.description = v;
  }
  const requiredSolution = form.get("requiredSolution");
  if (requiredSolution !== null) {
    const v = String(requiredSolution).trim();
    if (!v) return NextResponse.json({ error: "הפתרון הנדרש הוא שדה חובה" }, { status: 400 });
    data.requiredSolution = v;
  }
  const category = form.get("category");
  if (category !== null) data.category = String(category).trim();
  if (form.get("location") !== null) data.location = String(form.get("location")).trim() || null;
  if (form.get("contractor") !== null) data.contractor = String(form.get("contractor")).trim() || null;
  if (form.get("priority") !== null) data.priority = String(form.get("priority"));
  if (form.get("status") !== null) data.status = String(form.get("status"));
  if (form.get("notes") !== null) data.notes = String(form.get("notes")).trim() || null;
  if (form.get("dueDate") !== null) {
    const v = String(form.get("dueDate")).trim();
    data.dueDate = v ? new Date(v) : null;
  }

  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    const imageError = validateUploadedImage(image);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }
    const newPath = await saveImage(reportId, image);
    await deleteImage(existing.imagePath);
    data.imagePath = newPath;
  }

  const updated = await prisma.defect.update({ where: { id: defectId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; defectId: string }> }
) {
  const { id: idParam, defectId } = await params;
  const reportId = parseNum(idParam);
  if (reportId === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const existing = await prisma.defect.findUnique({ where: { id: defectId } });
  if (!existing || existing.reportId !== reportId) {
    return NextResponse.json({ error: "הליקוי לא נמצא" }, { status: 404 });
  }

  await deleteImage(existing.imagePath);
  await prisma.defect.delete({ where: { id: defectId } });
  return NextResponse.json({ ok: true });
}
