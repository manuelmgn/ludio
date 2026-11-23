-- AlterTable
ALTER TABLE "Game"
ADD COLUMN IF NOT EXISTS "igdbRating" INTEGER,
ADD COLUMN IF NOT EXISTS "igdbRatingCount" INTEGER,
ADD COLUMN IF NOT EXISTS "summary" TEXT,
ADD COLUMN IF NOT EXISTS "storyline" TEXT,
ADD COLUMN IF NOT EXISTS "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "artworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "gameModes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "developers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "publishers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "detailsSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Playthrough"
ADD COLUMN IF NOT EXISTS "rating" INTEGER,
ADD COLUMN IF NOT EXISTS "review" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PlaythroughJournalEntry" (
    "id" TEXT NOT NULL,
    "playthroughId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "privacyLevel" "PrivacyLevel" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaythroughJournalEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PlaythroughJournalEntry_playthroughId_fkey'
    ) THEN
        ALTER TABLE "PlaythroughJournalEntry"
        ADD CONSTRAINT "PlaythroughJournalEntry_playthroughId_fkey"
        FOREIGN KEY ("playthroughId") REFERENCES "Playthrough"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
