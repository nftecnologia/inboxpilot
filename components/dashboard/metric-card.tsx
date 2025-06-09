"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend: number
  color: "blue" | "green" | "orange" | "purple"
  delay?: number
}

export function MetricCard({ title, value, icon: Icon, trend, color, delay = 0 }: MetricCardProps) {
  const [mounted, setMounted] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      lightBg: "from-blue-50 to-blue-100/50",
      icon: "text-blue-500",
      iconBg: "bg-blue-50",
      trend: trend > 0 ? "text-green-600" : "text-red-600",
      border: "border-blue-100",
      shadow: "shadow-blue-100/40",
    },
    green: {
      bg: "from-emerald-500 to-green-600",
      lightBg: "from-emerald-50 to-green-100/50",
      icon: "text-emerald-500",
      iconBg: "bg-emerald-50",
      trend: trend > 0 ? "text-green-600" : "text-red-600",
      border: "border-emerald-100",
      shadow: "shadow-emerald-100/40",
    },
    orange: {
      bg: "from-orange-500 to-amber-600",
      lightBg: "from-orange-50 to-amber-100/50",
      icon: "text-orange-500",
      iconBg: "bg-orange-50",
      trend: trend > 0 ? "text-green-600" : "text-red-600",
      border: "border-orange-100",
      shadow: "shadow-orange-100/40",
    },
    purple: {
      bg: "from-purple-500 to-violet-600",
      lightBg: "from-purple-50 to-violet-100/50",
      icon: "text-purple-500",
      iconBg: "bg-purple-50",
      trend: trend > 0 ? "text-green-600" : "text-red-600",
      border: "border-purple-100",
      shadow: "shadow-purple-100/40",
    },
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
      // Animar o valor numérico
      const numericValue = Number.parseInt(value.replace(/[^\d]/g, ""))
      if (numericValue) {
        let current = 0
        const increment = numericValue / 30
        const counter = setInterval(() => {
          current += increment
          if (current >= numericValue) {
            setAnimatedValue(numericValue)
            clearInterval(counter)
          } else {
            setAnimatedValue(Math.floor(current))
          }
        }, 50)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <Card
      className={`border ${colorClasses[color].border} ${colorClasses[color].shadow} shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group ${
        mounted ? "animate-in slide-in-from-bottom" : "opacity-0"
      } bg-gradient-to-br ${colorClasses[color].lightBg} overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[#2E2E2E] group-hover:scale-110 transition-transform duration-300">
                {mounted && animatedValue > 0 ? value.replace(/\d+/, animatedValue.toString()) : value}
              </p>
              <div className="flex items-center space-x-1">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${colorClasses[color].trend}`}>
                  {trend > 0 ? "+" : ""}
                  {trend}%
                </span>
                <span className="text-xs text-gray-500">vs. mês anterior</span>
              </div>
            </div>
          </div>
          <div
            className={`p-3 rounded-full ${colorClasses[color].iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md`}
          >
            <Icon className={`h-6 w-6 ${colorClasses[color].icon}`} />
          </div>
        </div>

        {/* Barra de progresso decorativa */}
        <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${colorClasses[color].bg} transition-all duration-1000 ease-out relative`}
            style={{
              width: mounted ? `${Math.min(Math.abs(trend) * 5, 100)}%` : "0%",
            }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
