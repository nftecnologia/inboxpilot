"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X, Bell, CheckCircle, RefreshCw, Clock, Target, TrendingDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function AlertsWidget() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "warning",
      title: "Taxa de resposta baixa",
      message: "A taxa de resposta automática caiu para 65% nas últimas 2 horas",
      time: "há 15 min",
    },
    {
      id: 2,
      type: "success",
      title: "Meta de satisfação atingida",
      message: "Satisfação do cliente atingiu 4.8/5 este mês",
      time: "há 1 hora",
    },
  ])

  const [showResponseRateAlert, setShowResponseRateAlert] = useState(false)

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const handleViewDetails = (alertId: number) => {
    if (alertId === 1) {
      setShowResponseRateAlert(true)
    }
  }

  const handleUpdateKnowledgeBase = () => {
    console.log("Atualizar base de conhecimento")
    setShowResponseRateAlert(false)
    // Aqui você pode adicionar a lógica para atualizar a base de conhecimento
  }

  if (alerts.length === 0) return null

  return (
    <>
      <Card className="border-l-4 border-l-[#2A65F9] shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-top duration-500 bg-gradient-to-r from-white to-blue-50/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="p-1.5 rounded-full bg-blue-100 mr-2">
                <Bell className="h-4 w-4 text-[#2A65F9]" />
              </div>
              <h3 className="font-semibold text-[#2E2E2E]">Alertas Importantes</h3>
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {alerts.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                  alert.type === "warning"
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100/30 border-yellow-200"
                    : "bg-gradient-to-r from-green-50 to-green-100/30 border-green-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {alert.type === "warning" ? (
                      <div className="p-1.5 rounded-full bg-yellow-100 mt-0.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-full bg-green-100 mt-0.5">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-800">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">{alert.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => handleViewDetails(alert.id)}
                    >
                      Ver detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-gray-200 rounded-full"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Alerta de Taxa de Resposta */}
      {showResponseRateAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border-0 animate-in zoom-in-95 duration-300">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Taxa de Resposta Baixa</h2>
                  <p className="text-sm text-gray-500">Alerta de Performance</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={() => setShowResponseRateAlert(false)}
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Status Overview */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Status Atual</span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                    Atenção Necessária
                  </Badge>
                </div>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  A taxa de resposta automática está em <strong>65%</strong>, ficando{" "}
                  <strong>15 pontos percentuais</strong> abaixo da meta estabelecida.
                </p>
              </div>

              {/* Métricas */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Métricas de Performance
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Taxa Atual</span>
                      <span className="text-lg font-semibold text-yellow-600">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Meta</span>
                      <span className="text-lg font-semibold text-green-600">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Detectado há 15 min</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Possíveis Causas */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Possíveis Causas</h3>
                <div className="space-y-3">
                  {[
                    "Volume alto de e-mails recebidos",
                    "Problemas na conexão com a API de IA",
                    "Base de conhecimento desatualizada",
                  ].map((cause, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{cause}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ações Recomendadas */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Ações Recomendadas</h3>
                <Button
                  onClick={handleUpdateKnowledgeBase}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Base de Conhecimento
                </Button>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Esta ação pode resolver a maioria dos problemas de taxa de resposta baixa
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
