"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput, TextArea, Select } from "./FormField";
import ImagePicker from "./ImagePicker";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "./Toast";
import { validateDefect, FieldErrors } from "@/lib/validation";
import { useUnsavedChanges, confirmDiscardIfDirty } from "@/lib/useUnsavedChanges";
import { DEFECT_CATEGORIES, DEFECT_PRIORITIES, DEFECT_STATUSES } from "@/lib/constants";

export interface DefectInitialValues {
  id?: string;
  imageUrl?: string;
  location: string;
  description: string;
  requiredSolution: string;
  category: string;
  contractor: string;
  priority: string;
  dueDate: string; // yyyy-mm-dd or ""
  status: string;
  notes: string;
}

function emptyValues(): DefectInitialValues {
  return {
    location: "",
    description: "",
    requiredSolution: "",
    category: DEFECT_CATEGORIES[0],
    contractor: "",
    priority: "רגיל",
    dueDate: "",
    status: "פתוח",
    notes: "",
  };
}

interface DefectFormProps {
  mode: "create" | "edit";
  reportId: number;
  defectNumber: number;
  initial?: DefectInitialValues;
}

export default function DefectForm({ mode, reportId, defectNumber, initial }: DefectFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [values, setValues] = useState<DefectInitialValues>(initial ?? emptyValues());
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formKey, setFormKey] = useState(0); // to reset ImagePicker after "save and add another"

  useUnsavedChanges(dirty);

  const hasExistingImage = Boolean(initial?.imageUrl);

  function update<K extends keyof DefectInitialValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.append("location", values.location);
    fd.append("description", values.description);
    fd.append("requiredSolution", values.requiredSolution);
    fd.append("category", values.category);
    fd.append("contractor", values.contractor);
    fd.append("priority", values.priority);
    fd.append("dueDate", values.dueDate);
    fd.append("status", values.status);
    fd.append("notes", values.notes);
    if (file) fd.append("image", file);
    return fd;
  }

  async function save(): Promise<boolean> {
    const errs = validateDefect({
      description: values.description,
      requiredSolution: values.requiredSolution,
      category: values.category,
      hasImage: hasExistingImage || file !== null,
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast("יש למלא את כל שדות החובה", "error");
      return false;
    }

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? `/api/reports/${reportId}/defects`
          : `/api/reports/${reportId}/defects/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, body: buildFormData() });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "שמירה נכשלה");
      }
      setDirty(false);
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "שמירה נכשלה", "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveAndBack(e: React.FormEvent) {
    e.preventDefault();
    const ok = await save();
    if (!ok) return;
    showToast("הליקוי נשמר בהצלחה", "success");
    router.push(`/reports/${reportId}`);
  }

  async function handleSaveAndAddAnother() {
    const ok = await save();
    if (!ok) return;
    showToast("הליקוי נשמר. אפשר להוסיף ליקוי נוסף", "success");
    setValues(emptyValues());
    setFile(null);
    setErrors({});
    setDirty(false);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/defects/${initial?.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      showToast("הליקוי נמחק", "success");
      router.push(`/reports/${reportId}`);
    } catch {
      showToast("מחיקת הליקוי נכשלה", "error");
      setSubmitting(false);
      setConfirmDeleteOpen(false);
    }
  }

  function handleCancel() {
    if (!confirmDiscardIfDirty(dirty)) return;
    router.push(`/reports/${reportId}`);
  }

  return (
    <form onSubmit={handleSaveAndBack} className="pb-6">
      <div className="mb-4">
        <ImagePicker
          key={formKey}
          initialUrl={initial?.imageUrl}
          error={errors.image}
          onFileSelected={(f) => {
            setFile(f);
            setDirty(true);
            if (f) setErrors((e) => ({ ...e, image: "" }));
          }}
        />
      </div>

      <Field label="מיקום הליקוי" htmlFor="location">
        <TextInput
          id="location"
          value={values.location}
          onChange={(v) => update("location", v)}
          placeholder="לדוגמה: מסדרון מזרחי, קומה 3"
        />
      </Field>

      <Field label="תיאור הליקוי" htmlFor="description" required error={errors.description}>
        <TextArea
          id="description"
          value={values.description}
          onChange={(v) => update("description", v)}
          placeholder="תיאור מפורט של הליקוי"
          rows={3}
          error={errors.description}
        />
      </Field>

      <Field label="הפתרון הנדרש" htmlFor="requiredSolution" required error={errors.requiredSolution}>
        <TextArea
          id="requiredSolution"
          value={values.requiredSolution}
          onChange={(v) => update("requiredSolution", v)}
          placeholder="מה נדרש לתקן"
          rows={3}
          error={errors.requiredSolution}
        />
      </Field>

      <Field label="תחום עבודה" htmlFor="category" required>
        <Select
          id="category"
          value={values.category}
          onChange={(v) => update("category", v)}
          options={DEFECT_CATEGORIES}
        />
      </Field>

      <Field label="קבלן אחראי" htmlFor="contractor">
        <TextInput
          id="contractor"
          value={values.contractor}
          onChange={(v) => update("contractor", v)}
          placeholder="שם הקבלן האחראי"
        />
      </Field>

      <Field label="רמת דחיפות" htmlFor="priority">
        <Select
          id="priority"
          value={values.priority}
          onChange={(v) => update("priority", v)}
          options={DEFECT_PRIORITIES}
        />
      </Field>

      <Field label="תאריך יעד" htmlFor="dueDate">
        <TextInput
          id="dueDate"
          type="date"
          value={values.dueDate}
          onChange={(v) => update("dueDate", v)}
        />
      </Field>

      <Field label="סטטוס" htmlFor="status">
        <Select
          id="status"
          value={values.status}
          onChange={(v) => update("status", v)}
          options={DEFECT_STATUSES}
        />
      </Field>

      <Field label="הערות" htmlFor="notes">
        <TextArea
          id="notes"
          value={values.notes}
          onChange={(v) => update("notes", v)}
          placeholder="הערות נוספות"
          rows={2}
        />
      </Field>

      <div className="mt-4 flex flex-col gap-3">
        {mode === "create" ? (
          <>
            <button
              type="button"
              onClick={handleSaveAndAddAnother}
              disabled={submitting}
              className="rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-md active:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "שומר..." : "שמור והוסף ליקוי נוסף"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-200 py-3 text-base font-semibold text-slate-800 active:bg-slate-300 disabled:opacity-60"
            >
              שמור וחזור לדוח
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-brand-600 py-4 text-lg font-bold text-white shadow-md active:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "שומר..." : "שמירת שינויים"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl bg-slate-200 py-3 text-base font-semibold text-slate-800 active:bg-slate-300"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="rounded-2xl bg-red-50 py-3 text-base font-semibold text-red-700 active:bg-red-100"
            >
              מחיקת הליקוי
            </button>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="מחיקת ליקוי"
        message={`למחוק את ליקוי מספר ${defectNumber}? פעולה זו אינה הפיכה.`}
        confirmLabel={submitting ? "מוחק..." : "מחק"}
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </form>
  );
}
