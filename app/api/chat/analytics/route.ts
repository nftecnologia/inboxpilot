import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar analytics do dia atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const analytics = await prisma.chatAnalytics.findFirst({
      where: {
        date: {
          gte: today,
        },
      },
    })

    // Se não houver analytics, criar um mock temporário
    if (!analytics) {
      // Contar sessões totais
      const totalSessions = await prisma.chatSession.count()
      
      // Contar sessões escaladas
      const escalatedToHuman = await prisma.chatSession.count({
        where: { status: "ESCALATED" },
      })

      // Contar sessões resolvidas (não escaladas e fechadas)
      const resolvedByAI = await prisma.chatSession.count({
        where: {
          status: "CLOSED",
          NOT: {
            messages: {
              some: {
                metadata: {
                  path: ['shouldEscalate'],
                  equals: true,
                },
              },
            },
          },
        },
      })

      // Calcular confiança média
      const messagesWithConfidence = await prisma.chatMessage.findMany({
        where: {
          role: "ASSISTANT",
          confidence: {
            not: null,
          },
        },
        select: {
          confidence: true,
        },
      })

      const avgConfidence = messagesWithConfidence.length > 0
        ? messagesWithConfidence.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / messagesWithConfidence.length
        : null

      return NextResponse.json({
        totalSessions,
        totalMessages: await prisma.chatMessage.count(),
        avgConfidence,
        avgSessionDuration: null,
        resolvedByAI,
        escalatedToHuman,
        topQuestions: [],
        lowConfidenceTopics: [],
      })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("❌ Erro ao buscar analytics:", error)
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    )
  }
}
