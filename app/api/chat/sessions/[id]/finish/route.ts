import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

// POST - Finalizar um chat
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se a sessão existe
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: params.id },
      include: {
        ticket: true
      }
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Atualizar status da sessão para CLOSED
    const updatedSession = await prisma.chatSession.update({
      where: { id: params.id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        metadata: {
          ...(chatSession.metadata as any || {}),
          closedBy: user.id,
          closedByName: user.name,
          closedAt: new Date().toISOString()
        }
      },
      include: {
        messages: true,
        client: true,
        ticket: true
      }
    })

    // Adicionar mensagem de sistema informando que o chat foi finalizado
    await prisma.chatMessage.create({
      data: {
        sessionId: params.id,
        role: "SYSTEM",
        content: "Chat finalizado pelo atendente",
        metadata: {
          event: "chat_finished",
          userId: user.id
        }
      }
    })

    // Atualizar ticket se existir
    if (chatSession.ticketId) {
      await prisma.ticket.update({
        where: { id: chatSession.ticketId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date()
        }
      })

      // Adicionar interação no ticket
      await prisma.interaction.create({
        data: {
          ticketId: chatSession.ticketId,
          userId: user.id,
          type: "NOTE",
          content: "Chat finalizado",
          isInternal: true
        }
      })
    }

    // Notificar via WebSocket
    const io = getIO()
    if (io) {
      // Notificar o cliente que o chat foi finalizado
      io.to(`chat:${params.id}`).emit("chat:finished", {
        sessionId: params.id,
        agent: {
          id: user.id,
          name: user.name
        }
      })

      // Notificar outros atendentes
      io.emit("chat:status_changed", {
        sessionId: params.id,
        status: "CLOSED",
        closedBy: user.id
      })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("Erro ao finalizar chat:", error)
    return NextResponse.json(
      { error: "Erro ao finalizar chat" },
      { status: 500 }
    )
  }
}
