-- CreateTable
CREATE TABLE "KOLHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kolId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KOLHistory_kolId_fkey" FOREIGN KEY ("kolId") REFERENCES "KOL" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "KOLHistory_kolId_idx" ON "KOLHistory"("kolId");

-- CreateIndex
CREATE INDEX "KOLHistory_userId_idx" ON "KOLHistory"("userId");

-- CreateIndex
CREATE INDEX "KOLHistory_createdAt_idx" ON "KOLHistory"("createdAt");

-- CreateIndex
CREATE INDEX "KOLHistory_fieldName_idx" ON "KOLHistory"("fieldName");
