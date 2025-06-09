"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, User } from "lucide-react"

export function RecentEmailsWidget() {
  const emails = [
    {
      id: 1,
      subject: "Problema com login",
      sender: "João Silva",
      time: "há 5 min",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      subject: "Solicitação de reembolso",
      sender: "Maria Santos",
      time: "há 12 min",
      status: "responded",
      priority: "medium",
    },
    {
      id: 3,
      subject: "Dúvida sobre funcionalidades",
      sender: "Pedro Costa",
      time: "há 25 min",
      status: "resolved",
      priority: "low",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "responded":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-gradient-to-r from-red-50 to-transparent"
      case "medium":
        return "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent"
      case "low":
        return "border-l-green-500 bg-gradient-to-r from-green-50 to-transparent"
      default:
        return "border-l-gray-500 bg-gradient-to-r from-gray-50 to-transparent"
    }
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      <CardHeader className="pb-4 border-b border-green-100/50 relative">
        <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
          <div className="p-1.5 rounded-full bg-green-100 mr-2">
            <Mail className="h-4 w-4 text-green-600" />
          </div>
          E-mails Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 relative">
        <div className="space-y-3">
          {emails.map((email, index) => (
            <div
              key={email.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(email.priority)} bg-white hover:shadow-md transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom border border-gray-100`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-800 truncate">{email.subject}</h4>
                    <Badge className={`text-xs ${getStatusColor(email.status)} border`}>{email.status}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="p-1 rounded-full bg-gray-100 mr-1">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="truncate">{email.sender}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="p-1 rounded-full bg-gray-100 mr-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                    </div>
                    <span>{email.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
