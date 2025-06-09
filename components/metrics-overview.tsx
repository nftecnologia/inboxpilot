"use client"

import { TrendingUp, TrendingDown, Mail, Clock, CheckCircle, Bot, User, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MetricsOverviewProps {
  periodo: string
}

export function MetricsOverview({ periodo }: MetricsOverviewProps) {
  const getMetrics = (periodo: string) => {
    const baseMetrics = {
      "7dias": {
        totalEmails: 287,
        resolvidosIA: 195,
        resolvidosHumano: 68,
        tempoMedioResposta: 1.2,
        tempoMedioResolucao: 2.8,
        taxaAutomacao: 68,
        satisfacao: 4.6,
        trends: {
          emails: 8,
          resolvidosIA: 12,
          resolvidosHumano: -5,
          tempoResposta: -15,
          tempoResolucao: -8,
          automacao: 5,
          satisfacao: 3,
        },
      },
      "30dias": {
        totalEmails: 1248,
        resolvidosIA: 849,
        resolvidosHumano: 312,
        tempoMedioResposta: 1.8,
        tempoMedioResolucao: 4.2,
        taxaAutomacao: 68,
        satisfacao: 4.7,
        trends: {
          emails: 12,
          resolvidosIA: 18,
          resolvidosHumano: -8,
          tempoResposta: -12,
          tempoResolucao: -15,
          automacao: 3,
          satisfacao: 6,
        },
      },
      "90dias": {
        totalEmails: 3890,
        resolvidosIA: 2645,
        resolvidosHumano: 973,
        tempoMedioResposta: 2.1,
        tempoMedioResolucao: 5.1,
        taxaAutomacao: 68,
        satisfacao: 4.5,
        trends: {
          emails: 18,
          resolvidosIA: 22,
          resolvidosHumano: -12,
          tempoResposta: -8,
          tempoResolucao: -20,
          automacao: -2,
          satisfacao: 2,
        },
      },
    }
    return baseMetrics[periodo as keyof typeof baseMetrics] || baseMetrics["30dias"]
  }

  const metrics = getMetrics(periodo)

  const cards = [
    {
      title: "Total de E-mails",
      value: metrics.totalEmails.toLocaleString(),
      icon: Mail,
      trend: metrics.trends.emails,
      color: "text-[#0088FF]",
      bgColor: "bg-blue-50",
    },
    {
      title: "Resolvidos 100% IA",
      value: metrics.resolvidosIA.toLocaleString(),
      icon: Bot,
      trend: metrics.trends.resolvidosIA,
      color: "text-[#27AE60]",
      bgColor: "bg-green-50",
    },
    {
      title: "Resolvidos c/ Humano",
      value: metrics.resolvidosHumano.toLocaleString(),
      icon: User,
      trend: metrics.trends.resolvidosHumano,
      color: "text-[#E67E22]",
      bgColor: "bg-orange-50",
    },
    {
      title: "Tempo Médio Resposta",
      value: `${metrics.tempoMedioResposta}h`,
      icon: Clock,
      trend: metrics.trends.tempoResposta,
      color: "text-[#8B5CF6]",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tempo Médio Resolução",
      value: `${metrics.tempoMedioResolucao}h`,
      icon: CheckCircle,
      trend: metrics.trends.tempoResolucao,
      color: "text-[#E74C3C]",
      bgColor: "bg-red-50",
    },
    {
      title: "Taxa de Automação",
      value: `${metrics.taxaAutomacao}%`,
      icon: TrendingUp,
      trend: metrics.trends.automacao,
      color: "text-[#0088FF]",
      bgColor: "bg-blue-50",
    },
    {
      title: "Satisfação Média",
      value: `${metrics.satisfacao}/5`,
      icon: AlertTriangle,
      trend: metrics.trends.satisfacao,
      color: "text-[#27AE60]",
      bgColor: "bg-green-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">{card.title}</p>
                <p className="text-lg font-bold text-[#2E2E2E]">{card.value}</p>
                <div className="flex items-center space-x-1">
                  {card.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-[#27AE60]" />
                  ) : card.trend < 0 ? (
                    <TrendingDown className="h-3 w-3 text-[#E74C3C]" />
                  ) : (
                    <div className="h-3 w-3" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      card.trend > 0 ? "text-[#27AE60]" : card.trend < 0 ? "text-[#E74C3C]" : "text-gray-500"
                    }`}
                  >
                    {card.trend > 0 ? "+" : ""}
                    {card.trend}%
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
