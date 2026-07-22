import type { Report, Defect } from "@prisma/client";

export type { Report, Defect };

export type ReportWithDefects = Report & { defects: Defect[] };
