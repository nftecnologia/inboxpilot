"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Calendar, MapPin, Clock, BarChart } from "lucide-react"
import { motion } from "framer-motion"
import type { Email } from "@/types/email"

interface ClientInfoProps {
  email: Email
}

export function ClientInfo({ email }: ClientInfoProps) {
  // Dados fictícios do cliente
  const clientData = {
    name: email.senderName,
    email: email.sender,
    phone: "+55 11 98765-4321",
    firstContact: new Date("2023-10-15"),
    location: "São Paulo, SP",
    totalEmails: 8,
    avgResponseTime: "1.5h",
    tags: ["Cliente", "Plano Premium", "Suporte Prioritário"],
    lastInteraction: new Date("2024-01-10"),
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="p-4 border border-[#E0E0E0]/60 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
      <h3 className="text-sm font-medium text-[#2E2E2E] mb-3 flex items-center">
        <span className="inline-block w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
        Informações do Cliente
      </h3>

      <div className="flex items-center mb-4">
        <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-3 shadow-md">
          <AvatarFallback className="text-sm font-medium">{getInitials(clientData.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-sm text-[#2E2E2E]">{clientData.name}</h4>
          <p className="text-xs text-gray-500">{clientData.email}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {clientData.tags.map((tag, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-600 border-blue-200 font-medium px-2 py-1"
              >
                {tag}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 text-xs bg-gray-50 p-3 rounded-md border border-gray-100 mb-4">
        <div className="flex items-center text-gray-700">
          <div className="p-1.5 rounded-full bg-gray-100 mr-2">
            <Phone className="h-3 w-3 text-gray-500" />
          </div>
          <span>{clientData.phone}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <div className="p-1.5 rounded-full bg-gray-100 mr-2">
            <MapPin className="h-3 w-3 text-gray-500" />
          </div>
          <span>{clientData.location}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <div className="p-1.5 rounded-full bg-gray-100 mr-2">
            <Calendar className="h-3 w-3 text-gray-500" />
          </div>
          <span>Cliente desde {clientData.firstContact.toLocaleDateString("pt-BR")}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <div className="p-1.5 rounded-full bg-gray-100 mr-2">
            <Clock className="h-3 w-3 text-gray-500" />
          </div>
          <span>Última interação: {clientData.lastInteraction.toLocaleDateString("pt-BR")}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <h5 className="text-xs font-medium text-[#2E2E2E] mb-2 flex items-center">
          <span className="inline-block w-1 h-3 bg-blue-500 rounded-full mr-2"></span>
          Métricas
        </h5>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-2.5 rounded-md border border-blue-100 shadow-sm">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <Mail className="h-3 w-3 mr-1 text-blue-500" />
              <span>Total de E-mails</span>
            </div>
            <p className="text-sm font-medium text-[#2E2E2E]">{clientData.totalEmails}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/30 p-2.5 rounded-md border border-green-100 shadow-sm">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <BarChart className="h-3 w-3 mr-1 text-green-500" />
              <span>Tempo Médio</span>
            </div>
            <p className="text-sm font-medium text-[#2E2E2E]">{clientData.avgResponseTime}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
