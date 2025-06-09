import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        message: "Não autorizado" 
      }, { status: 401 })
    }

    const userId = session.user.id

    // Buscar métricas dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Emails totais
    const totalEmails = await prisma.email.count({
      where: { userId }
    })

    // Emails não lidos
    const unreadEmails = await prisma.email.count({
      where: { 
        userId,
        isRead: false 
      }
    })

    // Emails processados (últimos 30 dias)
    const processedEmails = await prisma.email.count({
      where: {
        userId,
        status: "processed",
        processedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Emails respondidos (últimos 30 dias)
    const respondedEmails = await prisma.email.count({
      where: {
        userId,
        status: "responded",
        respondedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Emails por categoria
    const emailsByCategory = await prisma.email.groupBy({
      by: ['category'],
      where: { 
        userId,
        category: { not: null }
      },
      _count: {
        category: true
      }
    })

    // Emails por status
    const emailsByStatus = await prisma.email.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    })

    // Taxa de resposta (últimos 30 dias)
    const emailsReceived = await prisma.email.count({
      where: {
        userId,
        receivedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const responseRate = emailsReceived > 0 ? (respondedEmails / emailsReceived) * 100 : 0

    // Tempo médio de resposta (em horas)
    const emailsWithResponse = await prisma.email.findMany({
      where: {
        userId,
        respondedAt: { not: null },
        receivedAt: { not: null }
      },
      select: {
        receivedAt: true,
        respondedAt: true
      }
    })

    let averageResponseTime = 0
    if (emailsWithResponse.length > 0) {
      const totalResponseTime = emailsWithResponse.reduce((acc: number, email: { receivedAt: Date; respondedAt: Date | null }) => {
        const diff = new Date(email.respondedAt!).getTime() - new Date(email.receivedAt).getTime()
        return acc + diff
      }, 0)
      averageResponseTime = totalResponseTime / emailsWithResponse.length / (1000 * 60 * 60) // em horas
    }

    // Base de conhecimento stats
    const knowledgeStats = await prisma.knowledgeBase.count({
      where: { 
        userId,
        isActive: true 
      }
    })

    const metrics = {
      totalEmails,
      unreadEmails,
      processedEmails,
      respondedEmails,
      responseRate: Math.round(responseRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      knowledgeArticles: knowledgeStats,
      emailsByCategory: emailsByCategory.map((item: { category: string | null; _count: { category: number } }) => ({
        category: item.category || "Sem categoria",
        count: item._count.category
      })),
      emailsByStatus: emailsByStatus.map((item: { status: string; _count: { status: number } }) => ({
        status: item.status,
        count: item._count.status
      }))
    }

    return NextResponse.json({ success: true, data: metrics })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro ao buscar métricas do dashboard" 
    }, { status: 500 })
  }
}
