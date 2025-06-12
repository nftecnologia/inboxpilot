import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type UpdateTicketData } from "@/types/crm"

// GET /api/tickets/[id] - Buscar ticket específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: id },
      include: {
        client: true,
        assignee: {
          select: { id: true, name: true, email: true, image: true, role: true }
        },
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true }
        },
        tags: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, role: true }
            }
          }
        },
        emails: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    // Buscar sessão de chat relacionada (se houver)
    const chatSession = await prisma.chatSession.findFirst({
      where: { ticketId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    // Incluir chatSession no response
    const response = {
      ...ticket,
      chatSession
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error("Erro ao buscar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/tickets/[id] - Atualizar ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data: UpdateTicketData = await request.json()

    // Verificar se ticket existe
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: id },
      include: { client: true }
    })

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (data.subject !== undefined) updateData.subject = data.subject
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.category !== undefined) updateData.category = data.category
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId
    if (data.slaDeadline !== undefined) updateData.slaDeadline = data.slaDeadline

    // Controlar mudanças de status e timestamps
    if (data.status !== undefined && data.status !== existingTicket.status) {
      updateData.status = data.status
      
      // Atualizar timestamps baseado no novo status
      if (data.status === 'RESOLVED' && !existingTicket.resolvedAt) {
        updateData.resolvedAt = new Date()
      }
      
      if (data.status === 'CLOSED' && !existingTicket.closedAt) {
        updateData.closedAt = new Date()
      }
      
      // Se reabrindo ticket, limpar timestamps
      if ((data.status === 'OPEN' || data.status === 'IN_PROGRESS') && existingTicket.resolvedAt) {
        updateData.resolvedAt = null
        updateData.closedAt = null
      }
    }

    // Atualizar ticket
    const ticket = await prisma.ticket.update({
      where: { id: id },
      data: updateData,
      include: {
        client: true,
        assignee: {
          select: { id: true, name: true, email: true, image: true, role: true }
        },
        creator: {
          select: { id: true, name: true, email: true, image: true, role: true }
        },
        tags: true,
        interactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        }
      }
    })

    // Criar interação de atualização
    const changes = []
    if (data.status && data.status !== existingTicket.status) {
      changes.push(`Status alterado para ${data.status}`)
    }
    if (data.assigneeId !== undefined && data.assigneeId !== existingTicket.assigneeId) {
      changes.push(`Ticket atribuído a outro agente`)
    }
    if (data.priority && data.priority !== existingTicket.priority) {
      changes.push(`Prioridade alterada para ${data.priority}`)
    }

    if (changes.length > 0) {
      await prisma.interaction.create({
        data: {
          ticketId: ticket.id,
          userId: session.user.id,
          type: 'NOTE',
          content: changes.join('; '),
          isPublic: false,
          isInternal: true
        }
      })
    }

    return NextResponse.json(ticket)

  } catch (error) {
    console.error("Erro ao atualizar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/tickets/[id] - Deletar ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se usuário tem permissão (admin ou manager)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Verificar se ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: id },
      include: { client: true }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    // Deletar ticket (cascata deleta interações e tags)
    await prisma.ticket.delete({
      where: { id: id }
    })

    // Decrementar contador de tickets do cliente
    await prisma.client.update({
      where: { id: ticket.clientId },
      data: { totalTickets: { decrement: 1 } }
    })

    return NextResponse.json({ message: "Ticket deletado com sucesso" })

  } catch (error) {
    console.error("Erro ao deletar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
