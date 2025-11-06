-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KOL" (
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
    "language" TEXT,
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

-- CreateTable
CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kolId" INTEGER NOT NULL,
    "templateId" INTEGER,
    "userId" INTEGER NOT NULL,
    "messageContent" TEXT NOT NULL,
    "contactType" TEXT NOT NULL DEFAULT 'dm',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repliedAt" DATETIME,
    "responseContent" TEXT,
    "sentiment" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactLog_kolId_fkey" FOREIGN KEY ("kolId") REFERENCES "KOL" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContactLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kolId" INTEGER NOT NULL,
    "tweetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "retweets" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "postedAt" DATETIME NOT NULL,
    "cryptoKeywords" TEXT,
    "relevanceScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tweet_kolId_fkey" FOREIGN KEY ("kolId") REFERENCES "KOL" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#1890ff',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KOLTag" (
    "kolId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("kolId", "tagId"),
    CONSTRAINT "KOLTag_kolId_fkey" FOREIGN KEY ("kolId") REFERENCES "KOL" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KOLTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KOL_twitterId_key" ON "KOL"("twitterId");

-- CreateIndex
CREATE INDEX "KOL_userId_idx" ON "KOL"("userId");

-- CreateIndex
CREATE INDEX "KOL_status_idx" ON "KOL"("status");

-- CreateIndex
CREATE INDEX "KOL_qualityScore_idx" ON "KOL"("qualityScore");

-- CreateIndex
CREATE INDEX "KOL_followerCount_idx" ON "KOL"("followerCount");

-- CreateIndex
CREATE INDEX "KOL_contentCategory_idx" ON "KOL"("contentCategory");

-- CreateIndex
CREATE INDEX "Template_userId_idx" ON "Template"("userId");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "ContactLog_kolId_idx" ON "ContactLog"("kolId");

-- CreateIndex
CREATE INDEX "ContactLog_userId_idx" ON "ContactLog"("userId");

-- CreateIndex
CREATE INDEX "ContactLog_sentAt_idx" ON "ContactLog"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_tweetId_key" ON "Tweet"("tweetId");

-- CreateIndex
CREATE INDEX "Tweet_kolId_idx" ON "Tweet"("kolId");

-- CreateIndex
CREATE INDEX "Tweet_tweetId_idx" ON "Tweet"("tweetId");

-- CreateIndex
CREATE INDEX "Tweet_postedAt_idx" ON "Tweet"("postedAt");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "KOLTag_kolId_idx" ON "KOLTag"("kolId");

-- CreateIndex
CREATE INDEX "KOLTag_tagId_idx" ON "KOLTag"("tagId");
