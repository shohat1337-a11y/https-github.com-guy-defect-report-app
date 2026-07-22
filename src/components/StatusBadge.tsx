const REPORT_STYLES: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
};

const REPORT_LABELS: Record<string, string> = {
  draft: "טיוטה",
  completed: "הושלם",
};

const DEFECT_STATUS_STYLES: Record<string, string> = {
  פתוח: "bg-red-100 text-red-800",
  בטיפול: "bg-amber-100 text-amber-800",
  סגור: "bg-green-100 text-green-800",
};

const PRIORITY_STYLES: Record<string, string> = {
  רגיל: "bg-slate-100 text-slate-700",
  דחוף: "bg-orange-100 text-orange-800",
  קריטי: "bg-red-600 text-white",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
        REPORT_STYLES[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {REPORT_LABELS[status] ?? status}
    </span>
  );
}

export function DefectStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        DEFECT_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {priority}
    </span>
  );
}
