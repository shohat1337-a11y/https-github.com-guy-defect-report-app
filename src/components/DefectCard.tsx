import Link from "next/link";
import { formatDate } from "@/lib/format";
import { DefectStatusBadge, PriorityBadge } from "./StatusBadge";

interface DefectCardData {
  id: string;
  reportId: number;
  defectNumber: number;
  imagePath: string;
  location: string | null;
  description: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
}

export default function DefectCard({ defect }: { defect: DefectCardData }) {
  return (
    <Link
      href={`/reports/${defect.reportId}/defects/${defect.id}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={defect.imagePath}
        alt={`ליקוי ${defect.defectNumber}`}
        className="h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-500">ליקוי {defect.defectNumber}</span>
          <DefectStatusBadge status={defect.status} />
        </div>
        <p className="line-clamp-2 text-base font-semibold text-slate-900">{defect.description}</p>
        {defect.location && (
          <p className="truncate text-sm text-slate-500">{defect.location}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            {defect.category}
          </span>
          <PriorityBadge priority={defect.priority} />
          {defect.dueDate && (
            <span className="text-xs text-slate-500">יעד: {formatDate(defect.dueDate)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
