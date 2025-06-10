import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { 
  TicketStatus, 
  Priority, 
  type CreateTicketData,
  type TicketFilters 
} from "@/types/crm"

// GET /api/tickets - Listar tickets com filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Extrair filtros da query string
    const status = searchParams.get('status')?.split(',') as TicketStatus[] | undefined
    const priority = searchParams.get('priority')?.split(',') as Priority[] | undefined
    const assigneeId = searchParams.get('assigneeId') || undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir where clause
    const where: any = {}
    
    if (status && status.length > 0) {
      where.status = { in: status }
    }
    
    if (priority && priority.length > 0) {
      where.priority = { in: priority }
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { client: { company: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Buscar tickets com paginação
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          client: true,
          assignee: {
            select: { id: true, name: true, email: true, image: true }
          },
          creator: {
            select: { id: true, name: true, email: true, image: true }
          },
          tags: true,
          interactions: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true }
              }
            }
          },
          emails: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.ticket.count({ where })
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Erro ao buscar tickets:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Criar novo ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data: CreateTicketData = await request.json()

    // Validação básica
    if (!data.subject || !data.clientEmail) {
      return NextResponse.json(
        { error: "Assunto e email do cliente são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar ou criar cliente
    let client = await prisma.client.findUnique({
      where: { email: data.clientEmail }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          email: data.clientEmail,
          name: data.clientName,
          phone: data.clientPhone,
          company: data.clientCompany
        }
      })
    } else if (data.clientName && !client.name) {
      // Atualizar informações do cliente se não existirem
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: data.clientName || client.name,
          phone: data.clientPhone || client.phone,
          company: data.clientCompany || client.company
        }
      })
    }

    // Calcular SLA deadline se especificado
    let slaDeadline: Date | undefined
    if (data.slaHours) {
      slaDeadline = new Date()
      slaDeadline.setHours(slaDeadline.getHours() + data.slaHours)
    }

    // Criar ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
        clientId: client.id,
        assigneeId: data.assigneeId,
        createdBy: session.user.id,
        slaDeadline
      },
      include: {
        client: true,
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        },
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        tags: true,
        interactions: true
      }
    })

    // Incrementar contador de tickets do cliente
    await prisma.client.update({
      where: { id: client.id },
      data: { totalTickets: { increment: 1 } }
    })

    // Criar interação inicial
    await prisma.interaction.create({
      data: {
        ticketId: ticket.id,
        userId: session.user.id,
        type: 'NOTE',
        content: `Ticket #${ticket.number} criado`,
        isPublic: false,
        isInternal: true
      }
    })

    return NextResponse.json(ticket, { status: 201 })

  } catch (error) {
    console.error("Erro ao criar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
