-- AlterTable
ALTER TABLE "Playthrough"
ADD COLUMN IF NOT EXISTS "includedInPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "planId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Playthrough_planId_fkey'
    ) THEN
        ALTER TABLE "Playthrough"
        ADD CONSTRAINT "Playthrough_planId_fkey"
        FOREIGN KEY ("planId") REFERENCES "Plan"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Plan_userId_fkey'
    ) THEN
        ALTER TABLE "Plan"
        ADD CONSTRAINT "Plan_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
