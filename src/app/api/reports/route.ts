import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { defects: true } } },
  });
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.projectName?.trim() || !body.title?.trim() || !body.date) {
    return NextResponse.json(
      { error: "שם הפרויקט, כותרת הדוח ותאריך הם שדות חובה" },
      { status: 400 }
    );
  }

  const report = await prisma.report.create({
    data: {
      projectName: body.projectName.trim(),
      title: body.title.trim(),
      date: new Date(body.date),
      area: body.area?.trim() || null,
      recipient: body.recipient?.trim() || null,
      inspector: body.inspector?.trim() || null,
      generalNotes: body.generalNotes?.trim() || null,
      status: "draft",
    },
  });

  return NextResponse.json(report, { status: 201 });
}
