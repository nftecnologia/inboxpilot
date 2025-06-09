"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Mail, CheckCircle, AlertTriangle, User } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "email",
      title: "Novo e-mail recebido",
      description: "De: cliente@empresa.com",
      time: "há 2 min",
      status: "new",
    },
    {
      id: 2,
      type: "response",
      title: "Resposta automática enviada",
      description: "Para: maria@cliente.com",
      time: "há 5 min",
      status: "success",
    },
    {
      id: 3,
      type: "escalation",
      title: "E-mail escalado para humano",
      description: "Caso complexo detectado",
      time: "há 12 min",
      status: "warning",
    },
    {
      id: 4,
      type: "knowledge",
      title: "Conhecimento atualizado",
      description: "Base de conhecimento expandida",
      time: "há 1 hora",
      status: "info",
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail
      case "response":
        return CheckCircle
      case "escalation":
        return AlertTriangle
      case "knowledge":
        return User
      default:
        return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-100 text-blue-600"
      case "response":
        return "bg-green-100 text-green-600"
      case "escalation":
        return "bg-yellow-100 text-yellow-600"
      case "knowledge":
        return "bg-purple-100 text-purple-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      <CardHeader className="pb-4 border-b border-purple-100/50 relative">
        <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
          <div className="p-1.5 rounded-full bg-purple-100 mr-2">
            <Activity className="h-4 w-4 text-purple-600" />
          </div>
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 relative">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getIcon(activity.type)
            const iconBg = getIconBg(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-300 animate-in slide-in-from-right border border-transparent hover:border-gray-100 hover:shadow-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-full ${iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">{activity.title}</p>
                    <Badge className={`text-xs ${getStatusColor(activity.status)} border`}>{activity.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
