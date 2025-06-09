"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { X, Reply, Archive, CheckCircle, Send, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/status-badge"
import type { Email } from "@/types/email"
import { useState } from "react"

interface EmailDetailProps {
  email: Email
  onClose: () => void
}

export function EmailDetail({ email, onClose }: EmailDetailProps) {
  const [response, setResponse] = useState(email.suggestedResponse || "")
  const [isResponding, setIsResponding] = useState(false)

  const getActionIcon = (type: string) => {
    switch (type) {
      case "received":
        return <Archive className="h-4 w-4 text-[#2A65F9]" />
      case "ai_suggested":
        return <AlertTriangle className="h-4 w-4 text-[#E67E22]" />
      case "ai_responded":
        return <Send className="h-4 w-4 text-[#F4C145]" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-[#27AE60]" />
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-[#E74C3C]" />
      default:
        return <Archive className="h-4 w-4 text-gray-400" />
    }
  }

  const getActionDescription = (type: string) => {
    switch (type) {
      case "received":
        return "E-mail recebido"
      case "ai_suggested":
        return "IA sugeriu resposta"
      case "ai_responded":
        return "IA respondeu automaticamente"
      case "resolved":
        return "Marcado como resolvido"
      case "escalated":
        return "Encaminhado para especialista"
      default:
        return "Ação desconhecida"
    }
  }

  return (
    <Card className="h-fit border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#2E2E2E]">Detalhes do E-mail</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[#2E2E2E] text-base">{email.subject}</h3>
            <StatusBadge status={email.status} />
          </div>
          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-2 rounded-md">
            <p>
              <strong>De:</strong> {email.senderName} ({email.sender})
            </p>
            <p>
              <strong>Data:</strong> {formatDistanceToNow(email.date, { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        <div>
          <h4 className="font-medium text-[#2E2E2E] mb-2 flex items-center">
            <span className="inline-block w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
            Conteúdo
          </h4>
          <div className="bg-[#F9FAFB] p-4 rounded-md text-sm border border-gray-100 shadow-inner">{email.body}</div>
        </div>

        {email.suggestedResponse && (
          <>
            <Separator className="bg-gray-200" />
            <div>
              <h4 className="font-medium text-[#2E2E2E] mb-2 flex items-center">
                <span className="inline-block w-1 h-4 bg-amber-500 rounded-full mr-2"></span>
                Resposta Sugerida pela IA
              </h4>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[100px] border-gray-200 focus:border-blue-300 transition-colors"
                placeholder="Resposta sugerida pela IA..."
              />
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#27AE60] to-[#219A52] hover:from-[#219A52] hover:to-[#1A8047] text-white shadow-md hover:shadow transition-all"
                  onClick={() => {
                    setIsResponding(true)
                    // Simular envio
                    setTimeout(() => setIsResponding(false), 1000)
                  }}
                  disabled={isResponding}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isResponding ? "Enviando..." : "Aprovar e Enviar"}
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50 transition-colors">
                  Editar Resposta
                </Button>
              </div>
            </div>
          </>
        )}

        {email.aiResponse && (
          <>
            <Separator className="bg-gray-200" />
            <div>
              <h4 className="font-medium text-[#2E2E2E] mb-2 flex items-center">
                <span className="inline-block w-1 h-4 bg-green-500 rounded-full mr-2"></span>
                Resposta Enviada
              </h4>
              <div className="bg-[#E8F5E8] p-4 rounded-md text-sm border border-[#27AE60]/30 shadow-inner">
                {email.aiResponse}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-gray-200" />

        <div>
          <h4 className="font-medium text-[#2E2E2E] mb-3 flex items-center">
            <span className="inline-block w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
            Histórico de Ações
          </h4>
          <div className="space-y-3 bg-gray-50 p-3 rounded-md">
            {email.actions.map((action, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-white rounded-md transition-colors">
                <div className="p-1.5 rounded-full bg-gray-100">{getActionIcon(action.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-[#2E2E2E] font-medium">{getActionDescription(action.type)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(action.timestamp, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors">
            <Reply className="h-4 w-4 mr-1" />
            Responder
          </Button>
          <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors">
            <Archive className="h-4 w-4 mr-1" />
            Arquivar
          </Button>
          <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors">
            <CheckCircle className="h-4 w-4 mr-1" />
            Resolver
          </Button>
        </div>

        {email.status === "pendentes" && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[#E74C3C] border-[#E74C3C]/30 hover:bg-red-50 hover:border-[#E74C3C] transition-colors"
            >
              <Send className="h-4 w-4 mr-1" />
              Reenviar ao Humano
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
