-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "area" TEXT,
    "recipient" TEXT,
    "inspector" TEXT,
    "generalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Defect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" INTEGER NOT NULL,
    "defectNumber" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "requiredSolution" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contractor" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'רגיל',
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'פתוח',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Defect_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Defect_reportId_idx" ON "Defect"("reportId");
