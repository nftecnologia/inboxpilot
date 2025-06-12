import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Adicionar interação ao ticket
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

    const body = await request.json()
    const { type = "RESPONSE", content } = body

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Criar interação
    const interaction = await prisma.interaction.create({
      data: {
        ticketId: params.id,
        type: type === "RESPONSE" ? "NOTE" : "NOTE",
        content,
        userId: user.id,
        isPublic: true
      }
    })

    // Atualizar status do ticket se necessário
    if (ticket.status === "OPEN") {
      await prisma.ticket.update({
        where: { id: params.id },
        data: { 
          status: "IN_PROGRESS",
          updatedAt: new Date()
        }
      })
    }

    // TODO: Implementar notificação por email quando sistema de email estiver configurado

    return NextResponse.json({
      success: true,
      interaction
    })
  } catch (error) {
    console.error("Erro ao adicionar interação:", error)
    return NextResponse.json(
      { error: "Erro ao adicionar interação ao ticket" },
      { status: 500 }
    )
  }
}

// GET - Listar interações do ticket
export async function GET(
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

    const interactions = await prisma.interaction.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(interactions)
  } catch (error) {
    console.error("Erro ao buscar interações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar interações" },
      { status: 500 }
    )
  }
}
