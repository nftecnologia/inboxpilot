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
        } as any
      }),

      // Emails respondidos automaticamente
      prisma.email.count({
        where: { 
          userId: session.user.id,
          aiAnalyzed: true,
          aiResponse: { not: null },
          status: "respondidos"
        } as any
      }),

      // Estatísticas de complexidade
      prisma.email.groupBy({
        by: ['aiComplexity' as any],
        where: {
          userId: session.user.id,
          aiAnalyzed: true,
          aiComplexity: { not: null }
        } as any,
        _count: {
          aiComplexity: true
        } as any
      } as any),

      // Estatísticas de categoria
      prisma.email.groupBy({
        by: ['category'],
        where: {
          userId: session.user.id,
          aiAnalyzed: true,
          category: { not: null }
        } as any,
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
        } as any,
        select: {
          processedAt: true,
          aiComplexity: true,
          aiResponse: true
        } as any,
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
      simple: (complexityStats as any[]).filter((s: any) => s.aiComplexity && s.aiComplexity <= 2).reduce((sum, s: any) => sum + s._count.aiComplexity, 0),
      moderate: (complexityStats as any[]).filter((s: any) => s.aiComplexity === 3).reduce((sum, s: any) => sum + s._count.aiComplexity, 0),
      complex: (complexityStats as any[]).filter((s: any) => s.aiComplexity && s.aiComplexity >= 4).reduce((sum, s: any) => sum + s._count.aiComplexity, 0)
    }

    // Processar tendências diárias
    const dailyTrends = (processingTrends as any[]).reduce((acc: any, email: any) => {
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
        aiKeywords: { isEmpty: false }
      } as any,
      select: {
        aiKeywords: true
      } as any
    }) as any[]

    const keywordCounts = keywordsData.reduce((acc: any, email: any) => {
      if (email.aiKeywords && Array.isArray(email.aiKeywords)) {
        email.aiKeywords.forEach((keyword: string) => {
          acc[keyword] = (acc[keyword] || 0) + 1
        })
      }
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
      categoryStats: (categoryStats as any[]).map((stat: any) => ({
        category: stat.category,
        count: stat._count?.category || 0
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
