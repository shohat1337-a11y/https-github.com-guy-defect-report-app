"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

export default function FinishReportButton({
  reportId,
  status,
}: {
  reportId: number;
  status: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleFinish() {
    setBusy(true);
    try {
      if (status !== "completed") {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });
        if (!res.ok) throw new Error();
        router.refresh();
      }
      showToast("מפיק את קובץ ה-PDF...", "success");
      // Trigger download / open PDF in a new tab
      window.open(`/api/reports/${reportId}/pdf`, "_blank");
    } catch {
      showToast("סיום הדוח נכשל", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleFinish}
      disabled={busy}
      className="w-full rounded-2xl border border-brand-600 bg-white py-3.5 text-base font-bold text-brand-700 active:bg-brand-50 disabled:opacity-60"
    >
      {busy ? "מפיק PDF..." : "סיום והפקת דוח PDF"}
    </button>
  );
}
