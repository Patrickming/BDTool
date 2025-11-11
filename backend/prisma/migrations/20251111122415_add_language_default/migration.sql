-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KOL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "twitterId" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "profileImgUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "lastTweetDate" DATETIME,
    "accountCreated" DATETIME,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "contentCategory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "customNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KOL_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KOL" ("accountCreated", "bio", "contentCategory", "createdAt", "customNotes", "displayName", "followerCount", "followingCount", "id", "language", "lastTweetDate", "profileImgUrl", "qualityScore", "status", "twitterId", "updatedAt", "userId", "username", "verified") SELECT "accountCreated", "bio", "contentCategory", "createdAt", "customNotes", "displayName", "followerCount", "followingCount", "id", coalesce("language", 'en') AS "language", "lastTweetDate", "profileImgUrl", "qualityScore", "status", "twitterId", "updatedAt", "userId", "username", "verified" FROM "KOL";
DROP TABLE "KOL";
ALTER TABLE "new_KOL" RENAME TO "KOL";
CREATE UNIQUE INDEX "KOL_twitterId_key" ON "KOL"("twitterId");
CREATE INDEX "KOL_userId_idx" ON "KOL"("userId");
CREATE INDEX "KOL_status_idx" ON "KOL"("status");
CREATE INDEX "KOL_qualityScore_idx" ON "KOL"("qualityScore");
CREATE INDEX "KOL_followerCount_idx" ON "KOL"("followerCount");
CREATE INDEX "KOL_contentCategory_idx" ON "KOL"("contentCategory");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
