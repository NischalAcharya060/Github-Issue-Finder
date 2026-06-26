-- CreateTable
CREATE TABLE "SavedRepo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stargazersCount" INTEGER NOT NULL,
    "forksCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedRepo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedRepo_userId_idx" ON "SavedRepo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedRepo_userId_repoFullName_key" ON "SavedRepo"("userId", "repoFullName");

-- AddForeignKey
ALTER TABLE "SavedRepo" ADD CONSTRAINT "SavedRepo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
