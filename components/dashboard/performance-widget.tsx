"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Zap, Clock } from "lucide-react"
import { useState, useEffect } from "react"

export function PerformanceWidget() {
  const [mounted, setMounted] = useState(false)

  const metrics = [
    {
      label: "Taxa de Automação",
      value: 78,
      target: 85,
      icon: Zap,
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Tempo de Resposta",
      value: 85,
      target: 90,
      icon: Clock,
      color: "from-green-500 to-emerald-600",
      lightColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Satisfação do Cliente",
      value: 94,
      target: 95,
      icon: Target,
      color: "from-purple-500 to-violet-600",
      lightColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      <CardHeader className="pb-4 border-b border-blue-100/50 relative">
        <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
          <div className="p-1.5 rounded-full bg-blue-100 mr-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          Performance do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 relative">
        <div className="space-y-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="animate-in slide-in-from-left"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} mr-3 shadow-md`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">{metric.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#2E2E2E]">{mounted ? metric.value : 0}%</span>
                  <span className="text-sm text-gray-500 ml-1">/ {metric.target}%</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={mounted ? metric.value : 0} className="h-3 bg-gray-100 shadow-inner" />
                <div
                  className="absolute top-0 h-3 bg-gradient-to-r from-gray-300/30 to-gray-400/30 rounded-full"
                  style={{ width: `${metric.target}%` }}
                />
                {/* Brilho na barra de progresso */}
                <div
                  className="absolute top-0 h-1 bg-white/50 rounded-full transition-all duration-500"
                  style={{ width: mounted ? `${metric.value}%` : "0%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span className={metric.textColor}>Atual: {mounted ? metric.value : 0}%</span>
                <span>Meta: {metric.target}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
