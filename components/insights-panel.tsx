"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Lightbulb, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InsightsPanelProps {
  periodo: string
}

export function InsightsPanel({ periodo }: InsightsPanelProps) {
  const getInsights = (periodo: string) => {
    const insights = {
      "7dias": {
        pontosAtencao: [
          {
            titulo: "Aumento de e-mails sobre Produtos",
            descricao: "28% dos e-mails são sobre produtos, indicando possível necessidade de melhorar documentação",
            severidade: "media",
            categoria: "Produtos",
          },
          {
            titulo: "Tempo de resolução acima da média",
            descricao: "Tempo médio de resolução de 2.8h está 15% acima do ideal",
            severidade: "alta",
            categoria: "Performance",
          },
        ],
        melhorias: [
          {
            titulo: "Expandir Base de Conhecimento - Produtos",
            descricao: "Adicionar mais artigos sobre funcionalidades de produtos para reduzir intervenção humana",
            impacto: "Alto",
            esforco: "Médio",
          },
          {
            titulo: "Otimizar Respostas Automáticas",
            descricao: "Revisar templates de resposta para categorias mais frequentes",
            impacto: "Médio",
            esforco: "Baixo",
          },
          {
            titulo: "Treinamento da IA para Checkout",
            descricao: "Melhorar precisão da IA em questões de checkout e conversão",
            impacto: "Alto",
            esforco: "Alto",
          },
        ],
        tendencias: [
          {
            titulo: "Crescimento de 12% em automação",
            descricao: "IA está resolvendo mais casos sem intervenção humana",
            tipo: "positiva",
          },
          {
            titulo: "Redução de 15% no tempo de resposta",
            descricao: "Melhorias na velocidade de processamento da IA",
            tipo: "positiva",
          },
        ],
      },
      "30dias": {
        pontosAtencao: [
          {
            titulo: "Pico de e-mails às 11h",
            descricao: "52 e-mails em média às 11h, considerar reforço de equipe",
            severidade: "media",
            categoria: "Operacional",
          },
          {
            titulo: "Categoria 'Integrações' com baixa automação",
            descricao: "Apenas 45% dos e-mails sobre integrações são resolvidos automaticamente",
            severidade: "alta",
            categoria: "Integrações",
          },
        ],
        melhorias: [
          {
            titulo: "Criar FAQ Específico para Integrações",
            descricao: "Desenvolver base de conhecimento detalhada sobre integrações comuns",
            impacto: "Alto",
            esforco: "Alto",
          },
          {
            titulo: "Implementar Chatbot Proativo",
            descricao: "Chatbot que antecipa dúvidas baseado no comportamento do usuário",
            impacto: "Alto",
            esforco: "Alto",
          },
          {
            titulo: "Otimizar Horários de Atendimento",
            descricao: "Ajustar equipe para cobrir melhor os horários de pico",
            impacto: "Médio",
            esforco: "Baixo",
          },
        ],
        tendencias: [
          {
            titulo: "Aumento de 18% em resoluções 100% IA",
            descricao: "IA está se tornando mais eficiente em resolver casos complexos",
            tipo: "positiva",
          },
          {
            titulo: "Satisfação cresceu 6%",
            descricao: "Usuários estão mais satisfeitos com as respostas automáticas",
            tipo: "positiva",
          },
        ],
      },
    }
    return insights[periodo as keyof typeof insights] || insights["30dias"]
  }

  const data = getInsights(periodo)

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "alta":
        return "bg-red-100 text-red-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baixa":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case "Alto":
        return "bg-blue-100 text-blue-800"
      case "Médio":
        return "bg-purple-100 text-purple-800"
      case "Baixo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Pontos de Atenção */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#E74C3C]" />
            Pontos de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.pontosAtencao.map((ponto, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-800">{ponto.titulo}</h4>
                  <Badge className={getSeveridadeColor(ponto.severidade)}>{ponto.severidade}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{ponto.descricao}</p>
                <Badge variant="outline" className="text-xs">
                  {ponto.categoria}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sugestões de Melhoria */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#E67E22]" />
            Sugestões de Melhoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.melhorias.map((melhoria, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-800">{melhoria.titulo}</h4>
                  <div className="flex gap-1">
                    <Badge className={getImpactoColor(melhoria.impacto)}>{melhoria.impacto}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {melhoria.esforco}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{melhoria.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendências Positivas */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#27AE60]" />
            Tendências Positivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.tendencias.map((tendencia, index) => (
              <div key={index} className="p-3 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">{tendencia.titulo}</h4>
                    <p className="text-xs text-gray-600">{tendencia.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
