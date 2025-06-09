"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Download,
  Mail,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  ArrowRight,
  ExternalLink,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [progressValues, setProgressValues] = useState({ automation: 78, response: 85, satisfaction: 94 })
  const [showAlertDetails, setShowAlertDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Detectar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Simular mudanças aleatórias nos valores de progresso a cada 10 segundos
    const interval = setInterval(() => {
      setProgressValues({
        automation: Math.min(100, Math.max(70, progressValues.automation + (Math.random() * 6 - 3))),
        response: Math.min(100, Math.max(75, progressValues.response + (Math.random() * 6 - 3))),
        satisfaction: Math.min(100, Math.max(85, progressValues.satisfaction + (Math.random() * 4 - 2))),
      })
    }, 10000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", checkMobile)
    }
  }, [progressValues])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      // Simular atualização de dados
      setProgressValues({
        automation: Math.min(100, Math.max(70, progressValues.automation + (Math.random() * 10 - 5))),
        response: Math.min(100, Math.max(75, progressValues.response + (Math.random() * 10 - 5))),
        satisfaction: Math.min(100, Math.max(85, progressValues.satisfaction + (Math.random() * 8 - 4))),
      })
    }, 2000)
  }

  const handleViewAlertDetails = () => {
    setShowAlertDetails(true)
  }

  const handleCloseAlert = () => {
    setShowAlertDetails(false)
  }

  const navigateToBaseConhecimento = () => {
    window.location.href = "/base-conhecimento"
  }

  const navigateToConfiguracoes = () => {
    window.location.href = "/configuracoes"
  }

  const navigateToRelatorios = () => {
    window.location.href = "/relatorios"
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2A65F9]"></div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "E-mails",
      icon: Mail,
      href: "/emails",
      color: "blue",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-blue-200",
      iconColor: "text-blue-500",
    },
    {
      title: "Conhecimento",
      icon: Plus,
      href: "/base-conhecimento",
      color: "green",
      bgColor: "bg-green-50",
      hoverBorder: "hover:border-green-200",
      iconColor: "text-green-500",
    },
    {
      title: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      color: "purple",
      bgColor: "bg-purple-50",
      hoverBorder: "hover:border-purple-200",
      iconColor: "text-purple-500",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      color: "orange",
      bgColor: "bg-orange-50",
      hoverBorder: "hover:border-orange-200",
      iconColor: "text-orange-500",
    },
  ]

  const metrics = [
    {
      id: "emails",
      title: "Total de E-mails",
      value: "1,248",
      icon: Mail,
      trend: 12,
      trendUp: true,
      color: "blue",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: "automation",
      title: "Taxa de Automação",
      value: "78%",
      icon: Zap,
      trend: 5,
      trendUp: true,
      color: "green",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: "time",
      title: "Tempo Médio",
      value: "1.8h",
      icon: Clock,
      trend: 15,
      trendUp: false,
      color: "orange",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      id: "satisfaction",
      title: "Satisfação",
      value: "4.7/5",
      icon: TrendingUp,
      trend: 6,
      trendUp: true,
      color: "purple",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ]

  const activities = [
    {
      icon: Mail,
      color: "text-blue-500",
      title: "Novo e-mail recebido",
      time: "há 2 min",
    },
    {
      icon: CheckCircle,
      color: "text-green-500",
      title: "Resposta automática enviada",
      time: "há 5 min",
    },
    {
      icon: AlertTriangle,
      color: "text-yellow-500",
      title: "E-mail escalado para humano",
      time: "há 12 min",
    },
  ]

  const systemStatus = [
    {
      title: "IMAP/SMTP",
      status: "online",
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-800",
      iconColor: "text-green-600",
    },
    {
      title: "API de IA",
      status: "online",
      icon: CheckCircle,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
    {
      title: "Webhooks",
      status: "warning",
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header compacto com nova cor de título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-[#0088FF] mb-1">Dashboard</h1>
            <p className="text-sm text-gray-500">Visão geral do seu suporte por e-mail</p>
          </div>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-[#D1D5DB] text-[#2E2E2E] hover:border-[#0088FF] hover:text-[#0088FF] transition-colors"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Atualizar dados do dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-gradient-to-r from-[#0088FF] to-[#0066CC] hover:from-[#0066CC] hover:to-[#0044AA] shadow-sm hover:shadow transition-all duration-200"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Exportar relatório em CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Alertas compactos com animação */}
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-l-2 border-l-[#0088FF] shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mr-1.5 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 line-clamp-1">Taxa de resposta baixa (65%)</span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 border-yellow-200 text-yellow-700 bg-yellow-50 whitespace-nowrap ml-2 flex-shrink-0"
                >
                  há 15 min
                </Badge>
              </div>
              <div className="flex justify-end">
                <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-5 p-0 text-[10px] text-[#0088FF] hover:text-[#0066CC]"
                      onClick={handleViewAlertDetails}
                    >
                      Ver detalhes <ArrowRight className="h-2.5 w-2.5 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden shadow-lg border border-gray-100 rounded-lg max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-auto">
                    <div className="bg-yellow-50 p-4 border-b border-yellow-200 flex justify-between items-center">
                      <div className="flex items-center text-yellow-700 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">Alerta: Taxa de Resposta Baixa</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full ml-2 flex-shrink-0"
                        onClick={handleCloseAlert}
                      >
                        <X className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Detalhes do Problema - Versão Compacta e Alinhada */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                          Detalhes do Problema
                        </h4>
                        <p className="text-xs text-gray-600">
                          A taxa de resposta atual está em 65%, abaixo do limite recomendado de 80%.
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-2 bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Taxa atual:</span>
                            <span className="font-medium text-yellow-700">65%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Meta:</span>
                            <span className="font-medium text-gray-700">80%</span>
                          </div>
                          <div className="flex justify-between items-center col-span-2 pt-1 border-t border-gray-200 mt-1">
                            <span className="text-gray-500">Detectado:</span>
                            <span className="font-medium text-gray-700">há 15 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Possíveis Causas - Versão Compacta */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <Search className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          Possíveis Causas
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-md">
                          <li className="flex items-start">
                            <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 mt-0.5 flex-shrink-0">
                              <span className="text-[8px] font-bold">1</span>
                            </div>
                            <span>Volume alto de e-mails recebidos</span>
                          </li>
                          <li className="flex items-start">
                            <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 mt-0.5 flex-shrink-0">
                              <span className="text-[8px] font-bold">2</span>
                            </div>
                            <span>Problemas na conexão com a API de IA</span>
                          </li>
                          <li className="flex items-start">
                            <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 mt-0.5 flex-shrink-0">
                              <span className="text-[8px] font-bold">3</span>
                            </div>
                            <span>Base de conhecimento desatualizada</span>
                          </li>
                        </ul>
                      </div>

                      {/* Ações Recomendadas - Versão Compacta */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          Ações Recomendadas
                        </h4>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-8 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                            onClick={navigateToBaseConhecimento}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span className="line-clamp-1">Atualizar Base de Conhecimento</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-8 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                            onClick={navigateToConfiguracoes}
                          >
                            <Settings className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span className="line-clamp-1">Verificar Configurações da IA</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-8 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                            onClick={navigateToRelatorios}
                          >
                            <BarChart3 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span className="line-clamp-1">Ver Relatório Detalhado</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Métricas em grid compacto com interações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onHoverStart={() => setHoveredCard(metric.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className="shadow-sm border border-gray-100 hover:border-[#0088FF]/20 hover:shadow-md transition-all duration-200">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 line-clamp-1">{metric.title}</span>
                    <motion.div
                      className={`${metric.bgColor} p-1.5 rounded-full flex-shrink-0`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <metric.icon className={`h-3 w-3 ${metric.iconColor}`} />
                    </motion.div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-lg font-semibold text-gray-800">{metric.value}</span>
                    <span
                      className={`ml-1.5 text-[10px] ${metric.trendUp ? "text-green-600" : "text-red-600"} flex items-center`}
                    >
                      {metric.trendUp ? (
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                      )}
                      {metric.trend}%
                    </span>
                  </div>

                  {/* Barra de progresso que aparece no hover */}
                  {(hoveredCard === metric.id || isMobile) && (
                    <motion.div
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Progress
                        value={metric.trendUp ? 70 : 30}
                        className="h-1 bg-gray-100"
                        indicatorClassName={
                          metric.trendUp
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gradient-to-r from-red-400 to-red-500"
                        }
                      />
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Ações rápidas com links corretos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link href={action.href} key={action.title}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card
                  className={`shadow-sm border border-gray-100 ${action.hoverBorder} transition-all duration-200 cursor-pointer hover:shadow-md`}
                >
                  <CardContent className="p-2 flex flex-col items-center justify-center">
                    <motion.div
                      className={`w-7 h-7 rounded-full ${action.bgColor} flex items-center justify-center mb-1`}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      <action.icon className={`h-3.5 w-3.5 ${action.iconColor}`} />
                    </motion.div>
                    <span className="text-xs font-medium text-gray-700">{action.title}</span>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Performance e atividades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Performance */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-[#0088FF] flex-shrink-0" />
                  <span className="line-clamp-1">Performance do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="space-y-3">
                  {/* Métrica 1 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 line-clamp-1">Taxa de Automação</span>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-700">
                          {Math.round(progressValues.automation)}%
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">/ 85%</span>
                      </div>
                    </div>
                    <motion.div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" whileHover={{ scale: 1.01 }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#0088FF] to-[#0066CC]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValues.automation}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>
                  {/* Métrica 2 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 line-clamp-1">Tempo de Resposta</span>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-700">
                          {Math.round(progressValues.response)}%
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">/ 90%</span>
                      </div>
                    </div>
                    <motion.div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" whileHover={{ scale: 1.01 }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValues.response}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>
                  {/* Métrica 3 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 line-clamp-1">Satisfação do Cliente</span>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-700">
                          {Math.round(progressValues.satisfaction)}%
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">/ 95%</span>
                      </div>
                    </div>
                    <motion.div className="h-1.5 bg-gray-100 rounded-full overflow-hidden" whileHover={{ scale: 1.01 }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressValues.satisfaction}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href="/relatorios">
                    <Button variant="link" size="sm" className="h-5 p-0 text-[10px] text-[#0088FF]">
                      Ver relatório completo <ExternalLink className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Atividades */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 mr-1.5 text-[#0088FF] flex-shrink-0" />
                  <span className="line-clamp-1">Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-2 text-xs"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      whileHover={{ x: 2 }}
                    >
                      <activity.icon className={`h-3 w-3 ${activity.color} mt-0.5 flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-700 line-clamp-1">{activity.title}</p>
                        <p className="text-[10px] text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href="/emails">
                    <Button variant="link" size="sm" className="h-5 p-0 text-[10px] text-[#0088FF]">
                      Ver todos <ArrowRight className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status do sistema */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-3.5 w-3.5 mr-1.5 text-[#0088FF] flex-shrink-0" />
                <span className="line-clamp-1">Status do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {systemStatus.map((item, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center justify-between p-2 ${item.bgColor} rounded border ${item.borderColor} hover:shadow-sm transition-shadow duration-200`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className={`text-xs font-medium ${item.textColor} line-clamp-1`}>{item.title}</span>
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="flex-shrink-0"
                    >
                      <item.icon className={`h-3 w-3 ${item.iconColor}`} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <Link href="/configuracoes">
                  <Button variant="link" size="sm" className="h-5 p-0 text-[10px] text-[#0088FF]">
                    Ver detalhes <ExternalLink className="h-2.5 w-2.5 ml-1 flex-shrink-0" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  )
}

// Componente Activity importado localmente para evitar importações desnecessárias
function Activity(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

// Componente Search importado localmente para evitar importações desnecessárias
function Search(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
