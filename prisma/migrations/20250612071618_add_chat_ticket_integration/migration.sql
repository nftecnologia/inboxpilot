-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "ticketId" TEXT,
ADD COLUMN     "userPhone" TEXT;

-- CreateIndex
CREATE INDEX "ChatSession_clientId_idx" ON "ChatSession"("clientId");

-- CreateIndex
CREATE INDEX "ChatSession_ticketId_idx" ON "ChatSession"("ticketId");

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
