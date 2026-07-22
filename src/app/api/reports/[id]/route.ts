import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/storage";

function parseId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const report = await prisma.report.findUnique({
    where: { id },
    include: { defects: { orderBy: { defectNumber: "asc" } } },
  });

  if (!report) return NextResponse.json({ error: "הדוח לא נמצא" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.projectName !== undefined) {
    if (!body.projectName.trim())
      return NextResponse.json({ error: "שם הפרויקט הוא שדה חובה" }, { status: 400 });
    data.projectName = body.projectName.trim();
  }
  if (body.title !== undefined) {
    if (!body.title.trim())
      return NextResponse.json({ error: "כותרת הדוח היא שדה חובה" }, { status: 400 });
    data.title = body.title.trim();
  }
  if (body.date !== undefined) {
    if (!body.date) return NextResponse.json({ error: "תאריך הוא שדה חובה" }, { status: 400 });
    data.date = new Date(body.date);
  }
  if (body.area !== undefined) data.area = body.area?.trim() || null;
  if (body.recipient !== undefined) data.recipient = body.recipient?.trim() || null;
  if (body.inspector !== undefined) data.inspector = body.inspector?.trim() || null;
  if (body.generalNotes !== undefined) data.generalNotes = body.generalNotes?.trim() || null;
  if (body.status !== undefined) data.status = body.status;

  try {
    const report = await prisma.report.update({ where: { id }, data });
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "הדוח לא נמצא" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (id === null) return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });

  const report = await prisma.report.findUnique({
    where: { id },
    include: { defects: true },
  });
  if (!report) return NextResponse.json({ error: "הדוח לא נמצא" }, { status: 404 });

  for (const defect of report.defects) {
    await deleteImage(defect.imagePath);
  }
  await prisma.report.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
