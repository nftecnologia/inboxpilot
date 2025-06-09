"use client"

import { X, AlertTriangle, RefreshCw, TrendingDown, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ResponseRateAlertProps {
  currentRate: number
  targetRate: number
  detectedTime: string
  onClose: () => void
  onUpdateKnowledgeBase: () => void
}

export function ResponseRateAlert({
  currentRate = 65,
  targetRate = 80,
  detectedTime = "há 15 min",
  onClose = () => {},
  onUpdateKnowledgeBase = () => {},
}: ResponseRateAlertProps) {
  const difference = targetRate - currentRate

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-0 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Taxa de Resposta Baixa</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Alerta de Performance</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
              A taxa de resposta automática está em <strong>{currentRate}%</strong>, ficando{" "}
              <strong>{difference} pontos percentuais</strong> abaixo da meta estabelecida.
            </p>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Métricas de Performance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Taxa Atual</span>
                  <span className="text-lg font-semibold text-yellow-600">{currentRate}%</span>
                </div>
                <Progress value={currentRate} className="h-2" indicatorClassName="bg-yellow-500" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Meta</span>
                  <span className="text-lg font-semibold text-green-600">{targetRate}%</span>
                </div>
                <Progress value={targetRate} className="h-2" indicatorClassName="bg-green-500" />
              </div>
            </div>

            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Detectado {detectedTime}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Possible Causes */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Possíveis Causas</h3>
            <div className="space-y-2">
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

          {/* Actions */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Ação Recomendada</h3>
            <Button
              onClick={onUpdateKnowledgeBase}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Base de Conhecimento
            </Button>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Esta ação pode resolver a maioria dos problemas de taxa de resposta baixa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
