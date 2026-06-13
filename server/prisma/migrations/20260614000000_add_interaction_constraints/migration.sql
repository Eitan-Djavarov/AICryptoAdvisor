-- Deduplicate existing feedback rows before adding the unique constraint.
DELETE FROM "Feedback"
WHERE "id" NOT IN (
  SELECT DISTINCT ON ("userId", "sectionName", "contentId") "id"
  FROM "Feedback"
  ORDER BY "userId", "sectionName", "contentId", "createdAt" DESC
);

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Feedback_userId_sectionName_contentId_key"
ON "Feedback"("userId", "sectionName", "contentId");
