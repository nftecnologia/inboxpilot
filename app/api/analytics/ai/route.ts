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

    // Buscar métricas gerais de IA
    const [
      totalEmails,
      processedEmails,
      autoRespondedEmails,
      complexityStats,
      categoryStats,
      processingTrends
    ] = await Promise.all([
      // Total de emails
      prisma.email.count({
        where: { userId: session.user.id }
      }),

      // Emails processados pela IA
      prisma.email.count({
        where: { 
          userId: session.user.id,
          aiAnalyzed: true 
        }
      }),

      // Emails respondidos automaticamente
      prisma.email.count({
        where: { 
          userId: session.user.id,
          aiAnalyzed: true,
          aiResponse: { not: null },
          status: "respondidos"
        }
      }),

      // Estatísticas de complexidade
      prisma.email.groupBy({
        by: ['aiComplexity'],
        where: {
          userId: session.user.id,
          aiAnalyzed: true,
          aiComplexity: { not: null }
        },
        _count: {
          aiComplexity: true
        }
      }),

      // Estatísticas de categoria
      prisma.email.groupBy({
        by: ['category'],
        where: {
          userId: session.user.id,
          aiAnalyzed: true,
          category: { not: null }
        },
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: 10
      }),

      // Tendências de processamento (últimos 30 dias)
      prisma.email.findMany({
        where: {
          userId: session.user.id,
          aiAnalyzed: true,
          processedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
          }
        },
        select: {
          processedAt: true,
          aiComplexity: true,
          aiResponse: true
        },
        orderBy: {
          processedAt: 'desc'
        }
      })
    ])

    // Calcular métricas
    const aiAdoptionRate = totalEmails > 0 ? (processedEmails / totalEmails) * 100 : 0
    const autoResponseRate = processedEmails > 0 ? (autoRespondedEmails / processedEmails) * 100 : 0

    // Processar dados de complexidade
    const complexityBreakdown = {
      simple: complexityStats.filter(s => s.aiComplexity && s.aiComplexity <= 2).reduce((sum, s) => sum + s._count.aiComplexity, 0),
      moderate: complexityStats.filter(s => s.aiComplexity === 3).reduce((sum, s) => sum + s._count.aiComplexity, 0),
      complex: complexityStats.filter(s => s.aiComplexity && s.aiComplexity >= 4).reduce((sum, s) => sum + s._count.aiComplexity, 0)
    }

    // Processar tendências diárias
    const dailyTrends = processingTrends.reduce((acc: any, email) => {
      if (!email.processedAt) return acc
      
      const date = email.processedAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { total: 0, autoResponded: 0 }
      }
      acc[date].total++
      if (email.aiResponse) {
        acc[date].autoResponded++
      }
      return acc
    }, {})

    const trendsArray = Object.entries(dailyTrends).map(([date, data]: [string, any]) => ({
      date,
      total: data.total,
      autoResponded: data.autoResponded,
      rate: data.total > 0 ? (data.autoResponded / data.total) * 100 : 0
    })).slice(-7) // Últimos 7 dias

    // Palavras-chave mais comuns
    const keywordsData = await prisma.email.findMany({
      where: {
        userId: session.user.id,
        aiAnalyzed: true,
        aiKeywords: { not: { equals: [] } }
      },
      select: {
        aiKeywords: true
      }
    })

    const keywordCounts = keywordsData.reduce((acc: any, email) => {
      email.aiKeywords.forEach(keyword => {
        acc[keyword] = (acc[keyword] || 0) + 1
      })
      return acc
    }, {})

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    const analytics = {
      overview: {
        totalEmails,
        processedEmails,
        autoRespondedEmails,
        aiAdoptionRate: Math.round(aiAdoptionRate * 100) / 100,
        autoResponseRate: Math.round(autoResponseRate * 100) / 100
      },
      complexityBreakdown,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.category
      })),
      trends: trendsArray,
      topKeywords,
      insights: [
        {
          type: 'success',
          title: 'Performance da IA',
          description: `${Math.round(autoResponseRate)}% dos emails processados foram respondidos automaticamente`,
          value: autoResponseRate
        },
        {
          type: 'info',
          title: 'Adoção da IA',
          description: `${Math.round(aiAdoptionRate)}% dos emails foram analisados pela IA`,
          value: aiAdoptionRate
        },
        {
          type: complexityBreakdown.complex > complexityBreakdown.simple ? 'warning' : 'success',
          title: 'Complexidade dos casos',
          description: complexityBreakdown.complex > complexityBreakdown.simple 
            ? 'Muitos casos complexos detectados - considere expandir a base de conhecimento'
            : 'Boa distribuição de complexidade - sistema funcionando eficientemente',
          value: complexityBreakdown.complex
        }
      ]
    }

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    })

  } catch (error) {
    console.error("Erro ao buscar analytics de IA:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erro interno do servidor" 
    }, { status: 500 })
  }
}
