"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mb-6 text-slate-600">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-base font-semibold text-white ${
              danger ? "bg-red-600 active:bg-red-700" : "bg-brand-600 active:bg-brand-700"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-200 py-3 text-base font-semibold text-slate-800 active:bg-slate-300"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
