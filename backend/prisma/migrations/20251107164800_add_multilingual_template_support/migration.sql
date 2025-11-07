-- CreateTable: TemplateVersion (多语言版本表)
CREATE TABLE "TemplateVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 迁移现有模板数据到 TemplateVersion 表
INSERT INTO "TemplateVersion" ("templateId", "language", "content", "createdAt", "updatedAt")
SELECT "id", "language", "content", "createdAt", "updatedAt"
FROM "Template"
WHERE "content" IS NOT NULL AND "language" IS NOT NULL;

-- 移除 Template 表的旧字段
PRAGMA foreign_keys=off;

CREATE TABLE "new_Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Template" ("id", "userId", "name", "category", "createdAt", "updatedAt")
SELECT "id", "userId", "name", "category", "createdAt", "updatedAt"
FROM "Template";

DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE INDEX "Template_userId_idx" ON "Template"("userId");
CREATE INDEX "Template_category_idx" ON "Template"("category");
CREATE UNIQUE INDEX "TemplateVersion_templateId_language_key" ON "TemplateVersion"("templateId", "language");
CREATE INDEX "TemplateVersion_templateId_idx" ON "TemplateVersion"("templateId");
CREATE INDEX "TemplateVersion_language_idx" ON "TemplateVersion"("language");
