export type FieldErrors = Record<string, string>;

export interface ReportFormData {
  projectName: string;
  title: string;
  date: string;
  area?: string;
  recipient?: string;
  inspector?: string;
  generalNotes?: string;
}

export function validateReport(data: ReportFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.projectName?.trim()) errors.projectName = "שם הפרויקט הוא שדה חובה";
  if (!data.title?.trim()) errors.title = "כותרת הדוח היא שדה חובה";
  if (!data.date?.trim()) errors.date = "תאריך הוא שדה חובה";
  return errors;
}

export interface DefectFormData {
  description: string;
  requiredSolution: string;
  category: string;
  hasImage: boolean;
}

export function validateDefect(data: DefectFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.hasImage) errors.image = "יש לצלם או לבחור תמונה של הליקוי";
  if (!data.description?.trim()) errors.description = "תיאור הליקוי הוא שדה חובה";
  if (!data.requiredSolution?.trim()) errors.requiredSolution = "הפתרון הנדרש הוא שדה חובה";
  return errors;
}
