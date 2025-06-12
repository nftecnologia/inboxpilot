-- AlterTable
ALTER TABLE "WidgetConfig" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "collectEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collectName" BOOLEAN NOT NULL DEFAULT true;
