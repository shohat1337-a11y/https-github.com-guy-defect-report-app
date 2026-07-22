"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { ReportStatusBadge } from "./StatusBadge";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toast";

interface ReportCardData {
  id: number;
  projectName: string;
  title: string;
  date: string;
  status: string;
  defectCount: number;
}

export default function ReportCard({ report }: { report: ReportCardData }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("הדוח נמחק בהצלחה", "success");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      showToast("מחיקת הדוח נכשלה", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <Link href={`/reports/${report.id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <div className="text-sm text-slate-500">דוח מספר {report.id}</div>
            <h2 className="text-lg font-bold text-slate-900">{report.title}</h2>
            <div className="text-base text-slate-700">{report.projectName}</div>
          </div>
          <ReportStatusBadge status={report.status} />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{formatDate(report.date)}</span>
          <span className="inline-flex items-center gap-1">
            <span className="font-semibold text-slate-800">{report.defectCount}</span> ליקויים
          </span>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Link
          href={`/reports/${report.id}`}
          className="rounded-lg bg-brand-600 py-2.5 text-center text-sm font-semibold text-white active:bg-brand-700"
        >
          פתיחה
        </Link>
        <Link
          href={`/reports/${report.id}/edit`}
          className="rounded-lg bg-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800 active:bg-slate-300"
        >
          עריכה
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg bg-red-50 py-2.5 text-center text-sm font-semibold text-red-700 active:bg-red-100"
        >
          מחיקה
        </button>
      </div>
      <a
        href={`/api/reports/${report.id}/pdf`}
        className="mt-2 block rounded-lg border border-brand-600 py-2.5 text-center text-sm font-semibold text-brand-700 active:bg-brand-50"
      >
        הפקת PDF
      </a>

      <ConfirmDialog
        open={confirmOpen}
        title="מחיקת דוח"
        message={`למחוק את הדוח "${report.title}" וכל הליקויים שבו? פעולה זו אינה הפיכה.`}
        confirmLabel={busy ? "מוחק..." : "מחק"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
