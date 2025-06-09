"use client"

import { useState } from "react"
import {
  Download,
  Calendar,
  RefreshCw,
  TrendingUp,
  Mail,
  Clock,
  Users,
  CheckCircle,
  CalendarDays,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AppLayout } from "@/components/app-layout"
import { EmailsVolumeChart } from "@/components/charts/emails-volume-chart"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { CategoriesChart } from "@/components/charts/categories-chart"
import { TrendsChart } from "@/components/charts/trends-chart"
import { MetricsOverview } from "@/components/metrics-overview"
import { InsightsPanel } from "@/components/insights-panel"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("30dias")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCustomPeriod, setShowCustomPeriod] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [customPeriodText, setCustomPeriodText] = useState("")

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const handleDownload = (format: "csv" | "pdf" | "excel") => {
    alert(`Relatório sendo baixado em formato ${format.toUpperCase()}`)
  }

  const handlePeriodChange = (value: string) => {
    if (value === "personalizado") {
      setShowCustomPeriod(true)
      setPeriodo(value)
    } else {
      setShowCustomPeriod(false)
      setPeriodo(value)
      setCustomPeriodText("")
      setStartDate(undefined)
      setEndDate(undefined)
    }
  }

  const applyCustomPeriod = () => {
    if (startDate && endDate) {
      if (startDate <= endDate) {
        const formattedStart = format(startDate, "dd/MM/yyyy", { locale: ptBR })
        const formattedEnd = format(endDate, "dd/MM/yyyy", { locale: ptBR })
        setCustomPeriodText(`${formattedStart} - ${formattedEnd}`)
        setShowCustomPeriod(false)
      } else {
        alert("A data inicial deve ser anterior à data final")
      }
    } else {
      alert("Por favor, selecione ambas as datas")
    }
  }

  const cancelCustomPeriod = () => {
    setShowCustomPeriod(false)
    if (!customPeriodText) {
      setPeriodo("30dias")
    }
  }

  const getCurrentPeriodText = () => {
    if (periodo === "personalizado" && customPeriodText) {
      return customPeriodText
    }

    const periodMap: Record<string, string> = {
      "7dias": "Últimos 7 dias",
      "15dias": "Últimos 15 dias",
      "30dias": "Últimos 30 dias",
      "60dias": "Últimos 60 dias",
    }

    return periodMap[periodo] || "Selecione o período"
  }

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  const handleDateInputChange = (value: string, type: "start" | "end") => {
    if (value) {
      const date = new Date(value)
      if (type === "start") {
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    } else {
      if (type === "start") {
        setStartDate(undefined)
      } else {
        setEndDate(undefined)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Relatórios</h1>
            <p className="text-sm text-gray-500">Análise detalhada do desempenho do InboxPilot</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex flex-col gap-2">
              <Select value={periodo} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[200px]">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue>{getCurrentPeriodText()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="15dias">Últimos 15 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="60dias">Últimos 60 dias</SelectItem>
                  <SelectItem value="personalizado">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {/* Período Personalizado */}
              {showCustomPeriod && (
                <Card className="w-[400px] shadow-lg border-[#0088FF]/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#0088FF]" />
                      Período Personalizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Data Inicial */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Data Inicial</label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent"
                            value={formatDateForInput(startDate)}
                            onChange={(e) => handleDateInputChange(e.target.value, "start")}
                            placeholder="dd/mm/aaaa"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Data Final */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Data Final</label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent"
                            value={formatDateForInput(endDate)}
                            onChange={(e) => handleDateInputChange(e.target.value, "end")}
                            placeholder="dd/mm/aaaa"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={applyCustomPeriod}
                        className="flex-1 bg-[#0088FF] hover:bg-[#0066CC]"
                        disabled={!startDate || !endDate}
                      >
                        Aplicar
                      </Button>
                      <Button variant="outline" onClick={cancelCustomPeriod} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-[#D1D5DB] text-[#2E2E2E]"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-[#0088FF] hover:bg-[#0066CC]">
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleDownload("pdf")} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("excel")} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("csv")} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Métricas Overview */}
        <MetricsOverview periodo={periodo} />

        {/* Tabs com Gráficos */}
        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="volume" className="flex items-center gap-1 text-xs sm:text-sm">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Volume</span>
              <span className="sm:hidden">Vol</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-1 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Categorias</span>
              <span className="sm:hidden">Cat</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="flex items-center gap-1 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tendências</span>
              <span className="sm:hidden">Tend</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs sm:text-sm">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Insights</span>
              <span className="sm:hidden">Ins</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#0088FF]" />
                    Volume de E-mails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmailsVolumeChart periodo={periodo} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#27AE60]" />
                    Resolução por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoriesChart tipo="resolucao" periodo={periodo} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#0088FF]" />
                    Performance da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart periodo={periodo} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#E67E22]" />
                    Categorias da Base de Conhecimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoriesChart tipo="conhecimento" periodo={periodo} />
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#E74C3C]" />
                    Horários de Pico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoriesChart tipo="horarios" periodo={periodo} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0088FF]" />
                    Análise de Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendsChart periodo={periodo} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <InsightsPanel periodo={periodo} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
