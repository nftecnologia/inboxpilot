import { logger, schedules } from "@trigger.dev/sdk/v3"
import { prisma } from "@/lib/prisma"

export const checkSLAJob = schedules.task({
  id: "check-sla",
  // Executar a cada 15 minutos
  cron: "*/15 * * * *",
  run: async () => {
    logger.info("Iniciando verificação de SLA")

    // Buscar tickets com SLA vencido
    const overdueTickets = await prisma.ticket.findMany({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        slaDeadline: { 
          not: null,
          lt: new Date() 
        }
      },
      include: {
        client: true,
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    logger.info(`Encontrados ${overdueTickets.length} tickets com SLA vencido`)

    // Processar cada ticket atrasado
    for (const ticket of overdueTickets) {
      logger.warn(`Ticket #${ticket.number} está atrasado`, {
        ticketId: ticket.id,
        subject: ticket.subject,
        client: ticket.client.email,
        assignee: ticket.assignee?.email || "Não atribuído",
        slaDeadline: ticket.slaDeadline
      })

      // Criar interação de alerta
      await prisma.interaction.create({
        data: {
          ticketId: ticket.id,
          userId: ticket.assigneeId || ticket.createdBy,
          type: "NOTE",
          content: `⚠️ ALERTA SLA: Este ticket está atrasado! Prazo original: ${ticket.slaDeadline?.toLocaleString('pt-BR')}`,
          isInternal: true,
          isPublic: false
        }
      })

      // Atualizar prioridade se ainda não for URGENT
      if (ticket.priority !== "URGENT") {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { priority: "URGENT" }
        })
        
        logger.info(`Prioridade do ticket #${ticket.number} atualizada para URGENT`)
      }
    }

    return {
      checked: overdueTickets.length,
      ticketsProcessed: overdueTickets.map(t => ({
        id: t.id,
        number: t.number,
        subject: t.subject
      }))
    }
  },
})
