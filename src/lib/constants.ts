export const DEFECT_CATEGORIES = [
  "גבס",
  "צבע",
  "ריצוף",
  "חיפוי",
  "אלומיניום",
  "חשמל",
  "אינסטלציה",
  "מיזוג אוויר",
  "נגרות",
  "איטום",
  "בטיחות",
  "פיתוח",
  "אחר",
] as const;

export const DEFECT_PRIORITIES = ["רגיל", "דחוף", "קריטי"] as const;

export const DEFECT_STATUSES = ["פתוח", "בטיפול", "סגור"] as const;

export const REPORT_STATUSES = {
  draft: "טיוטה",
  completed: "הושלם",
} as const;

export type ReportStatus = keyof typeof REPORT_STATUSES;
export type DefectCategory = (typeof DEFECT_CATEGORIES)[number];
export type DefectPriority = (typeof DEFECT_PRIORITIES)[number];
export type DefectStatus = (typeof DEFECT_STATUSES)[number];
