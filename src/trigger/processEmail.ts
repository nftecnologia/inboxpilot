import { logger, task } from "@trigger.dev/sdk/v3"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema de entrada para o job
const ProcessEmailSchema = z.object({
  emailId: z.string(),
  userId: z.string(),
})

export const processEmailJob = task({
  id: "process-email",
  // Retry configuration
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload: z.infer<typeof ProcessEmailSchema>) => {
    logger.info("Iniciando processamento de email", { emailId: payload.emailId })

    // 1. Buscar email
    const email = await prisma.email.findUnique({
      where: { id: payload.emailId }
    })

    if (!email) {
      throw new Error(`Email não encontrado: ${payload.emailId}`)
    }

    logger.info("Email encontrado", { 
      subject: email.subject, 
      from: email.from 
    })

    // 2. Analisar com IA (simulado por enquanto)
    const analysis = {
      sentiment: "neutral",
      category: "suporte",
      keywords: ["ajuda", "problema", "sistema"],
      complexity: 3,
      urgency: "medium",
      suggestedResponse: "Olá! Recebi sua mensagem e vou analisá-la para ajudá-lo da melhor forma possível.",
      confidence: 0.85
    }

    // 3. Atualizar email com análise
    const updatedEmail = await prisma.email.update({
      where: { id: email.id },
      data: {
        sentiment: analysis.sentiment,
        category: analysis.category,
        aiKeywords: analysis.keywords,
        aiComplexity: analysis.complexity,
        aiResponse: analysis.suggestedResponse,
        aiAnalyzed: true,
        processedAt: new Date(),
        status: "processed"
      } as any
    })

    logger.info("Email atualizado com análise", { 
      emailId: email.id,
      sentiment: analysis.sentiment,
      category: analysis.category 
    })

    // 4. Criar ticket se necessário
    const shouldCreateTicket = analysis.urgency === "high" || analysis.sentiment === "negative"
    
    if (shouldCreateTicket) {
      // Buscar ou criar cliente
      let client = await prisma.client.findUnique({
        where: { email: email.from }
      })

      if (!client) {
        client = await prisma.client.create({
          data: {
            email: email.from,
            name: email.from.split('@')[0],
          }
        })
      }

      const ticket = await prisma.ticket.create({
        data: {
          subject: `[Auto] ${email.subject}`,
          description: email.content,
          priority: "HIGH",
          category: analysis.category,
          clientId: client.id,
          source: "email",
          createdBy: payload.userId
        }
      })

      logger.info("Ticket criado automaticamente", { 
        ticketId: ticket.id,
        ticketNumber: ticket.number 
      })

      // Vincular email ao ticket
      await prisma.email.update({
        where: { id: email.id },
        data: { ticketId: ticket.id } as any
      })
    }

    return {
      emailId: email.id,
      processed: true,
      analysis,
      ticketCreated: shouldCreateTicket
    }
  },
})
