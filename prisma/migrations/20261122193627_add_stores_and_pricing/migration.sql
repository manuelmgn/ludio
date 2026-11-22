-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "firstReleaseDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Playthrough" ADD COLUMN     "purchaseDate" TEXT,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION,
ADD COLUMN     "purchaseStoreId" TEXT,
ADD COLUMN     "saleDate" TEXT,
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "saleStoreId" TEXT;

-- CreateTable
CREATE TABLE "CustomPlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCanvas" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "libraryEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCanvas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "privacy" "PrivacyLevel" NOT NULL DEFAULT 'PRIVATE',
    "canvasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCanvas_libraryEntryId_key" ON "GameCanvas"("libraryEntryId");

-- AddForeignKey
ALTER TABLE "Playthrough" ADD CONSTRAINT "Playthrough_purchaseStoreId_fkey" FOREIGN KEY ("purchaseStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playthrough" ADD CONSTRAINT "Playthrough_saleStoreId_fkey" FOREIGN KEY ("saleStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlatform" ADD CONSTRAINT "CustomPlatform_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCanvas" ADD CONSTRAINT "GameCanvas_libraryEntryId_fkey" FOREIGN KEY ("libraryEntryId") REFERENCES "LibraryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasImage" ADD CONSTRAINT "CanvasImage_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "GameCanvas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
