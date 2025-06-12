-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('ACTIVE', 'IDLE', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "status" "ChatStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'widget',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "sources" JSONB,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAnalytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION,
    "avgSessionDuration" DOUBLE PRECISION,
    "resolvedByAI" INTEGER NOT NULL DEFAULT 0,
    "escalatedToHuman" INTEGER NOT NULL DEFAULT 0,
    "topQuestions" JSONB,
    "lowConfidenceTopics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_status_idx" ON "ChatSession"("status");

-- CreateIndex
CREATE INDEX "ChatSession_createdAt_idx" ON "ChatSession"("createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatAnalytics_date_key" ON "ChatAnalytics"("date");

-- CreateIndex
CREATE INDEX "ChatAnalytics_date_idx" ON "ChatAnalytics"("date");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
