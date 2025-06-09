"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Plus, Settings, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Ver E-mails",
      description: "Gerenciar e-mails pendentes",
      icon: Mail,
      href: "/emails",
      color: "from-blue-500 to-blue-600",
      lightColor: "from-blue-50 to-blue-100/30",
      borderColor: "border-blue-100",
      shadowColor: "shadow-blue-100/40",
    },
    {
      title: "Base de Conhecimento",
      description: "Adicionar novo conhecimento",
      icon: Plus,
      href: "/base-conhecimento",
      color: "from-green-500 to-emerald-600",
      lightColor: "from-green-50 to-emerald-100/30",
      borderColor: "border-green-100",
      shadowColor: "shadow-green-100/40",
    },
    {
      title: "Relatórios",
      description: "Visualizar métricas",
      icon: BarChart3,
      href: "/relatorios",
      color: "from-purple-500 to-violet-600",
      lightColor: "from-purple-50 to-violet-100/30",
      borderColor: "border-purple-100",
      shadowColor: "shadow-purple-100/40",
    },
    {
      title: "Configurações",
      description: "Ajustar sistema",
      icon: Settings,
      href: "/configuracoes",
      color: "from-orange-500 to-amber-600",
      lightColor: "from-orange-50 to-amber-100/30",
      borderColor: "border-orange-100",
      shadowColor: "shadow-orange-100/40",
    },
  ]

  return (
    <Card className="animate-in slide-in-from-bottom duration-700 delay-300 hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
          <div className="p-1.5 rounded-full bg-blue-100 mr-2">
            <Zap className="h-4 w-4 text-[#2A65F9]" />
          </div>
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <div
                className={`group p-4 rounded-lg border ${action.borderColor} ${action.shadowColor} hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 bg-gradient-to-br ${action.lightColor} relative overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-800 group-hover:text-[#2A65F9] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
