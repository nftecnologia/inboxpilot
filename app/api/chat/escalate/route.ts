import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

// POST - Escalar chat para atendimento humano
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar a sessão
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
        ticket: true
      }
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Atualizar status da sessão para ESCALATED
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "ESCALATED",
        metadata: {
          ...(chatSession.metadata as any || {}),
          escalatedAt: new Date().toISOString(),
          escalatedReason: "user_request"
        }
      }
    })

    // Adicionar mensagem de sistema
    const systemMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "SYSTEM",
        content: "Você solicitou falar com um atendente. Aguarde um momento enquanto transferimos você para nosso time de suporte.",
        metadata: {
          event: "escalated_to_human",
          reason: "user_request"
        }
      }
    })

    // Atualizar ticket se existir
    if (chatSession.ticketId) {
      await prisma.ticket.update({
        where: { id: chatSession.ticketId },
        data: {
          priority: "HIGH",
          status: "WAITING_CLIENT"
        }
      })

      // Adicionar interação no ticket
      await prisma.interaction.create({
        data: {
          ticketId: chatSession.ticketId,
          type: "NOTE",
          content: "Cliente solicitou atendimento humano",
          isInternal: true
        }
      })
    }

    // Notificar via WebSocket
    const io = getIO()
    if (io) {
      // Notificar todos os atendentes
      io.emit("chat:escalated", {
        sessionId,
        userName: chatSession.userName,
        userEmail: chatSession.userEmail,
        userPhone: chatSession.userPhone,
        clientId: chatSession.clientId,
        ticketNumber: chatSession.ticket?.number,
        escalatedAt: new Date()
      })

      // Notificar o cliente
      io.to(`chat:${sessionId}`).emit("chat:escalated_confirmed", {
        message: "Você está na fila de atendimento. Um atendente irá lhe atender em breve."
      })
    }

    return NextResponse.json({
      success: true,
      message: "Chat escalado para atendimento humano",
      systemMessage
    })
  } catch (error) {
    console.error("Erro ao escalar chat:", error)
    return NextResponse.json(
      { error: "Erro ao escalar chat" },
      { status: 500 }
    )
  }
}
