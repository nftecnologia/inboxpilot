import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Assumir ticket
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

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        assignee: true
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já está atribuído
    if (ticket.assignee && ticket.assignee.id !== user.id) {
      return NextResponse.json(
        { error: `Ticket já atribuído a ${ticket.assignee.name || ticket.assignee.email}` },
        { status: 400 }
      )
    }

    // Atribuir ticket ao usuário
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        assigneeId: user.id,
        status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
        updatedAt: new Date()
      },
      include: {
        assignee: true,
        client: true
      }
    })

    // Criar interação de atribuição
    await prisma.interaction.create({
      data: {
        ticketId: params.id,
        type: "NOTE",
        content: `Ticket assumido por ${user.name || user.email}`,
        userId: user.id,
        isInternal: true
      }
    })

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    })
  } catch (error) {
    console.error("Erro ao assumir ticket:", error)
    return NextResponse.json(
      { error: "Erro ao assumir ticket" },
      { status: 500 }
    )
  }
}

// DELETE - Desatribuir ticket
export async function DELETE(
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

    // Verificar se o ticket existe e está atribuído ao usuário
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    if (ticket.assigneeId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Você não tem permissão para desatribuir este ticket" },
        { status: 403 }
      )
    }

    // Desatribuir ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        assigneeId: null,
        updatedAt: new Date()
      }
    })

    // Criar interação de desatribuição
    await prisma.interaction.create({
      data: {
        ticketId: params.id,
        type: "NOTE",
        content: `Ticket desatribuído por ${user.name || user.email}`,
        userId: user.id,
        isInternal: true
      }
    })

    return NextResponse.json({
      success: true,
      ticket: updatedTicket
    })
  } catch (error) {
    console.error("Erro ao desatribuir ticket:", error)
    return NextResponse.json(
      { error: "Erro ao desatribuir ticket" },
      { status: 500 }
    )
  }
}
