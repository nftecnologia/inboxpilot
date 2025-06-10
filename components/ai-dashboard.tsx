"use client"

import { Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle, BarChart3, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGetAIAnalytics } from "@/hooks/useQueries/useGetAIAnalytics"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AIDashboard() {
  const { data: analytics, isLoading, isError } = useGetAIAnalytics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError || !analytics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar analytics</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados de analytics de IA. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    )
  }

  const { overview, complexityBreakdown, categoryStats, trends, topKeywords, insights } = analytics

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'info': return TrendingUp
      default: return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Processados</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.processedEmails}</div>
            <p className="text-xs text-muted-foreground">
              {overview.aiAdoptionRate.toFixed(1)}% do total
            </p>
            <Progress value={overview.aiAdoptionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Automáticas</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.autoRespondedEmails}</div>
            <p className="text-xs text-muted-foreground">
              {overview.autoResponseRate.toFixed(1)}% de sucesso
            </p>
            <Progress value={overview.autoResponseRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Simples</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complexityBreakdown.simple}</div>
            <p className="text-xs text-muted-foreground">
              {overview.processedEmails > 0 ? ((complexityBreakdown.simple / overview.processedEmails) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Complexos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complexityBreakdown.complex}</div>
            <p className="text-xs text-muted-foreground">
              {overview.processedEmails > 0 ? ((complexityBreakdown.complex / overview.processedEmails) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type)
          return (
            <Card key={index} className={`border ${getInsightColor(insight.type)}`}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Icon className="h-5 w-5 mr-2" />
                <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{insight.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos e Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Complexidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Complexidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Simples (1-2)</span>
                </div>
                <span className="text-sm font-medium">{complexityBreakdown.simple}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Moderado (3)</span>
                </div>
                <span className="text-sm font-medium">{complexityBreakdown.moderate}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Complexo (4-5)</span>
                </div>
                <span className="text-sm font-medium">{complexityBreakdown.complex}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorias Mais Comuns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Categorias Mais Comuns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ 
                          width: `${(category.count / Math.max(...categoryStats.map(c => c.count))) * 100}%` 
                        }} 
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Palavras-chave e Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Palavras-chave Principais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Palavras-chave Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topKeywords.slice(0, 10).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword.keyword} ({keyword.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendência Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.slice(-7).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {new Date(trend.date).toLocaleDateString('pt-BR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{trend.total} emails</span>
                    <Badge 
                      variant={trend.rate > 70 ? "default" : trend.rate > 40 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {trend.rate.toFixed(0)}% auto
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
