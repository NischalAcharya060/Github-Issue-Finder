-- AlterTable
ALTER TABLE "SavedIssue" ADD COLUMN     "prUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'BACKLOG';
