import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

// POST - Enviar mensagem do atendente
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json()
    const { content, role = "ASSISTANT", isHuman = true } = body

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo da mensagem é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se a sessão existe
    const chatSession = await prisma.chatSession.findUnique({
      where: { id }
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      )
    }

    // Criar mensagem
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        role,
        content,
        metadata: {
          isHuman,
          sentBy: user.id,
          sentByName: user.name
        }
      },
      include: {
        session: {
          include: {
            client: true
          }
        }
      }
    })

    // Atualizar última atividade da sessão
    await prisma.chatSession.update({
      where: { id },
      data: {
        updatedAt: new Date()
      }
    })

    // Notificar via WebSocket
    const io = getIO()
    if (io) {
      // Notificar o cliente que recebeu mensagem
      io.to(`chat:${id}`).emit("new-message", {
        message,
        from: "agent"
      })

      // Notificar outros atendentes sobre nova mensagem
      io.emit("chat:new_message", {
        sessionId: id,
        message
      })
    }

    // Retornar a mensagem completa com todos os campos
    const completeMessage = await prisma.chatMessage.findUnique({
      where: { id: message.id },
      include: {
        session: true
      }
    })

    return NextResponse.json({
      success: true,
      message: completeMessage
    })
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    )
  }
}

// GET - Buscar mensagens da sessão (permite acesso público para o widget)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Permitir acesso público às mensagens da própria sessão
    // O widget precisa acessar sem autenticação
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error)
    return NextResponse.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 }
    )
  }
}
