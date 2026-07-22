"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput, TextArea } from "./FormField";
import { useToast } from "./Toast";
import { validateReport, FieldErrors } from "@/lib/validation";
import { useUnsavedChanges, confirmDiscardIfDirty } from "@/lib/useUnsavedChanges";
import { toDateInputValue } from "@/lib/format";

export interface ReportInitialValues {
  id?: number;
  projectName: string;
  title: string;
  date: string; // yyyy-mm-dd
  area: string;
  recipient: string;
  inspector: string;
  generalNotes: string;
}

const EMPTY: ReportInitialValues = {
  projectName: "",
  title: "",
  date: toDateInputValue(new Date()),
  area: "",
  recipient: "",
  inspector: "",
  generalNotes: "",
};

interface ReportFormProps {
  mode: "create" | "edit";
  initial?: ReportInitialValues;
}

export default function ReportForm({ mode, initial }: ReportFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [values, setValues] = useState<ReportInitialValues>(initial ?? EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useUnsavedChanges(dirty);

  function update<K extends keyof ReportInitialValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateReport(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast("יש למלא את כל שדות החובה", "error");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/reports" : `/api/reports/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "שמירה נכשלה");
      }
      const report = await res.json();
      setDirty(false);
      if (mode === "create") {
        showToast("הדוח נשמר. אפשר להתחיל להוסיף ליקויים", "success");
        router.push(`/reports/${report.id}`);
      } else {
        showToast("הדוח עודכן בהצלחה", "success");
        router.push(`/reports/${initial?.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "שמירה נכשלה", "error");
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (!confirmDiscardIfDirty(dirty)) return;
    if (mode === "edit" && initial?.id) {
      router.push(`/reports/${initial.id}`);
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      <Field label="שם הפרויקט" htmlFor="projectName" required error={errors.projectName}>
        <TextInput
          id="projectName"
          value={values.projectName}
          onChange={(v) => update("projectName", v)}
          placeholder="לדוגמה: כלמוביל נשר"
          error={errors.projectName}
        />
      </Field>

      <Field label="כותרת הדוח" htmlFor="title" required error={errors.title}>
        <TextInput
          id="title"
          value={values.title}
          onChange={(v) => update("title", v)}
          placeholder="לדוגמה: דוח ליקויים - קומה 3"
          error={errors.title}
        />
      </Field>

      <Field label="תאריך" htmlFor="date" required error={errors.date}>
        <TextInput
          id="date"
          type="date"
          value={values.date}
          onChange={(v) => update("date", v)}
          error={errors.date}
        />
      </Field>

      <Field label="אזור / קומה" htmlFor="area">
        <TextInput
          id="area"
          value={values.area}
          onChange={(v) => update("area", v)}
          placeholder="לדוגמה: קומה 3, אגף צפוני"
        />
      </Field>

      <Field label="שם הקבלן / הנמען" htmlFor="recipient">
        <TextInput
          id="recipient"
          value={values.recipient}
          onChange={(v) => update("recipient", v)}
          placeholder="לדוגמה: חברת הבינוי בע״מ"
        />
      </Field>

      <Field label="מבצע הסיור" htmlFor="inspector">
        <TextInput
          id="inspector"
          value={values.inspector}
          onChange={(v) => update("inspector", v)}
          placeholder="שם המפקח"
        />
      </Field>

      <Field label="הערות כלליות" htmlFor="generalNotes">
        <TextArea
          id="generalNotes"
          value={values.generalNotes}
          onChange={(v) => update("generalNotes", v)}
          placeholder="הערות כלליות לדוח"
          rows={3}
        />
      </Field>

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-md active:bg-brand-700 disabled:opacity-60"
        >
          {mode === "create"
            ? submitting
              ? "שומר..."
              : "שמור והתחל להוסיף ליקויים"
            : submitting
              ? "שומר..."
              : "שמירת שינויים"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-2xl bg-slate-200 py-3 text-base font-semibold text-slate-800 active:bg-slate-300"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
