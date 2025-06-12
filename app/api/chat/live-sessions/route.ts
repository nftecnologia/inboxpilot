import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Buscar sessões de chat ao vivo (em espera ou ativas)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Buscar sessões que estão escaladas ou ativas
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        status: {
          in: ["ESCALATED", "ACTIVE"]
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true
          }
        },
        ticket: {
          select: {
            id: true,
            number: true,
            priority: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: "asc" // Mais antigos primeiro (FIFO)
      }
    })

    // Adicionar metadados adicionais
    const sessionsWithMetadata = chatSessions.map((session: any) => {
      // Calcular tempo de espera
      const waitingTime = session.status === "ESCALATED" 
        ? Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
        : 0

      // Pegar última confiança da IA
      const lastAIMessage = session.messages
        .filter((m: any) => m.role === "ASSISTANT" && m.confidence)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

      return {
        ...session,
        metadata: {
          waitingTime,
          lastAIConfidence: lastAIMessage?.confidence || null,
          totalMessages: session.messages.length
        }
      }
    })

    return NextResponse.json(sessionsWithMetadata)
  } catch (error) {
    console.error("Erro ao buscar sessões ao vivo:", error)
    return NextResponse.json(
      { error: "Erro ao buscar sessões" },
      { status: 500 }
    )
  }
}
