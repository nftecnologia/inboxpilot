-- CreateTable
CREATE TABLE "WidgetConfig" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowedDomains" TEXT[],
    "primaryColor" TEXT NOT NULL DEFAULT '#2A65F9',
    "position" TEXT NOT NULL DEFAULT 'bottom-right',
    "title" TEXT NOT NULL DEFAULT 'Suporte',
    "subtitle" TEXT NOT NULL DEFAULT 'Como podemos ajudar?',
    "welcomeMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "collectPhone" BOOLEAN NOT NULL DEFAULT true,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WidgetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WidgetConfig_appId_key" ON "WidgetConfig"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetConfig_apiKey_key" ON "WidgetConfig"("apiKey");

-- CreateIndex
CREATE INDEX "WidgetConfig_appId_idx" ON "WidgetConfig"("appId");

-- CreateIndex
CREATE INDEX "WidgetConfig_apiKey_idx" ON "WidgetConfig"("apiKey");

-- CreateIndex
CREATE INDEX "WidgetConfig_userId_idx" ON "WidgetConfig"("userId");

-- AddForeignKey
ALTER TABLE "WidgetConfig" ADD CONSTRAINT "WidgetConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
