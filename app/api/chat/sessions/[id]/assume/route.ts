import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

// POST - Assumir um chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verificar se a sessão existe e está escalada
    const chatSession = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: true,
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

    if (chatSession.status !== "ESCALATED") {
      return NextResponse.json(
        { error: "Sessão não está disponível para atendimento" },
        { status: 400 }
      )
    }

    // Atualizar status da sessão para ACTIVE
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: {
        status: "ACTIVE",
        metadata: {
          ...(chatSession.metadata as any || {}),
          assumedBy: user.id,
          assumedByName: user.name,
          assumedAt: new Date().toISOString()
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        },
        client: true,
        ticket: true
      }
    })

    // Adicionar mensagem de sistema informando que atendente assumiu
    await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role: "SYSTEM",
        content: `${user.name || "Atendente"} assumiu o chat`,
        metadata: {
          event: "chat_assumed",
          userId: user.id
        }
      }
    })

    // Atualizar ticket se existir
    if (chatSession.ticketId) {
      await prisma.ticket.update({
        where: { id: chatSession.ticketId },
        data: {
          assigneeId: user.id,
          status: "IN_PROGRESS"
        }
      })

      // Adicionar interação no ticket
      await prisma.interaction.create({
        data: {
          ticketId: chatSession.ticketId,
          userId: user.id,
          type: "NOTE",
          content: "Assumiu o chat ao vivo",
          isInternal: true
        }
      })
    }

    // Notificar via WebSocket
    const io = getIO()
    if (io) {
      // Notificar o cliente que o atendente assumiu
      io.to(`chat:${id}`).emit("chat:assumed", {
        sessionId: id,
        agent: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })

      // Notificar outros atendentes que o chat foi assumido
      io.emit("chat:status_changed", {
        sessionId: id,
        status: "ACTIVE",
        assumedBy: user.id
      })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("Erro ao assumir chat:", error)
    return NextResponse.json(
      { error: "Erro ao assumir chat" },
      { status: 500 }
    )
  }
}
